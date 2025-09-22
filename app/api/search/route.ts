import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import prisma from '@/lib/database/prisma';
import { google } from 'googleapis';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const results: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        accounts: {
          where: { provider: 'google' },
          select: { 
            access_token: true, 
            refresh_token: true 
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Search blog posts
    const blogPosts = await prisma.blogPost.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { excerpt: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } }
        ],
        published: true
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    blogPosts.forEach(post => {
      results.push({
        id: post.id,
        type: 'blog',
        title: post.title,
        subtitle: post.excerpt || undefined,
        date: post.createdAt,
        url: `/blog/${post.slug}`
      });
    });

    // Search Google services if user has tokens
    const googleAccount = user.accounts[0];
    if (googleAccount?.access_token && googleAccount?.refresh_token) {
      try {
        const auth = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET,
          `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
        );

        auth.setCredentials({
          access_token: googleAccount.access_token,
          refresh_token: googleAccount.refresh_token
        });

      // Search Gmail
      try {
        const gmail = google.gmail({ version: 'v1', auth });
        const gmailResponse = await gmail.users.messages.list({
          userId: 'me',
          q: query,
          maxResults: 5
        });

        if (gmailResponse.data.messages) {
          for (const message of gmailResponse.data.messages) {
            try {
              const msg = await gmail.users.messages.get({
                userId: 'me',
                id: message.id!
              });

              const headers = msg.data.payload?.headers || [];
              const subject = headers.find(h => h.name === 'Subject')?.value || 'No subject';
              const from = headers.find(h => h.name === 'From')?.value || 'Unknown sender';
              const date = headers.find(h => h.name === 'Date')?.value;

              results.push({
                id: message.id!,
                type: 'email',
                title: subject,
                subtitle: from,
                date: date ? new Date(date) : undefined
              });
            } catch (error) {
              console.error('Error fetching message details:', error);
            }
          }
        }
      } catch (error) {
        console.error('Gmail search error:', error);
      }

      // Search Calendar
      try {
        const calendar = google.calendar({ version: 'v3', auth });
        const now = new Date();
        const calendarResponse = await calendar.events.list({
          calendarId: 'primary',
          timeMin: now.toISOString(),
          maxResults: 5,
          singleEvents: true,
          orderBy: 'startTime',
          q: query
        });

        if (calendarResponse.data.items) {
          calendarResponse.data.items.forEach(event => {
            results.push({
              id: event.id!,
              type: 'calendar',
              title: event.summary || 'Untitled event',
              subtitle: event.location || undefined,
              date: event.start?.dateTime ? new Date(event.start.dateTime) : undefined
            });
          });
        }
      } catch (error) {
        console.error('Calendar search error:', error);
      }

      // Search Drive
      try {
        const drive = google.drive({ version: 'v3', auth });
        const driveResponse = await drive.files.list({
          q: `fullText contains '${query}' and trashed = false`,
          fields: 'files(id, name, mimeType, modifiedTime, webViewLink)',
          pageSize: 5
        });

        if (driveResponse.data.files) {
          driveResponse.data.files.forEach(file => {
            results.push({
              id: file.id!,
              type: 'file',
              title: file.name || 'Untitled',
              subtitle: file.mimeType,
              date: file.modifiedTime ? new Date(file.modifiedTime) : undefined,
              url: file.webViewLink || undefined
            });
          });
        }
      } catch (error) {
        console.error('Drive search error:', error);
      }
      } catch (error) {
        console.error('Google auth error:', error);
      }
    }

    // Sort results by date (most recent first)
    results.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.getTime() - a.date.getTime();
    });

    return NextResponse.json({ results: results.slice(0, 20) });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}