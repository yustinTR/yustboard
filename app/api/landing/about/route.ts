import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import prisma from '@/lib/database/prisma';

export async function GET() {
  try {
    const about = await prisma.landingAbout.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(about || null);
  } catch (error) {
    console.error('Error fetching about content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    // Deactivate all existing about sections
    await prisma.landingAbout.updateMany({
      where: { active: true },
      data: { active: false }
    });
    
    // Create new about section
    const about = await prisma.landingAbout.create({
      data: body
    });
    
    return NextResponse.json(about);
  } catch (error) {
    console.error('Error creating about content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    const about = await prisma.landingAbout.update({
      where: { id },
      data
    });
    
    return NextResponse.json(about);
  } catch (error) {
    console.error('Error updating about content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}