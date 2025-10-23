'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { FiArrowLeft, FiCalendar, FiUser, FiEdit2, FiLoader } from 'react-icons/fi';

interface Announcement {
  id: string;
  title: string;
  content: string;
  coverImage: string | null;
  headerImage: string | null;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function AnnouncementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const announcementId = params?.announcementId as string;

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!announcementId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/announcements/${announcementId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Announcement not found');
          }
          throw new Error('Failed to fetch announcement');
        }

        const data = await response.json();
        setAnnouncement(data.announcement);
      } catch (err) {
        console.error('Error fetching announcement:', err);
        setError(err instanceof Error ? err.message : 'Failed to load announcement');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [announcementId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-5xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FiLoader className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading announcement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-5xl">
        <div className="mb-6">
          <Link
            href="/dashboard/announcements"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Announcements
          </Link>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
          <p className="text-red-700 dark:text-red-400 text-lg">
            {error || 'Announcement not found'}
          </p>
        </div>
      </div>
    );
  }

  const canEdit = session?.user && (
    session.user.id === announcement.author.id ||
    session.user.role === 'ADMIN'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-5xl">
        {/* Header Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard/announcements"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Announcements
          </Link>
          {canEdit && (
            <Link
              href={`/dashboard/announcements/edit/${announcement.id}`}
              className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              <FiEdit2 className="mr-2" />
              Edit
            </Link>
          )}
        </div>

        {/* Main Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header Image */}
          {announcement.headerImage && (
            <div className="relative h-64 md:h-96 w-full">
              <Image
                src={announcement.headerImage}
                alt={announcement.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {announcement.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {announcement.author.image ? (
                  <Image
                    src={announcement.author.image}
                    alt={announcement.author.name || 'Author'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                    <FiUser className="text-white" />
                  </div>
                )}
                <span className="font-medium">{announcement.author.name || 'Anonymous'}</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCalendar className="h-4 w-4" />
                <span>
                  {format(new Date(announcement.publishedAt || announcement.createdAt), 'dd MMMM yyyy')}
                </span>
              </div>
              {!announcement.published && (
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-xs font-medium">
                  Draft
                </span>
              )}
            </div>

            {/* Body Content */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-strong:text-gray-900 dark:prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: announcement.content }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
