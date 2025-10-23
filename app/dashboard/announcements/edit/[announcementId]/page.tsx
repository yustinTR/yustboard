'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FiArrowLeft, FiSave, FiEye, FiEyeOff, FiLoader } from 'react-icons/fi';
import CoverImageSelector from '@/components/organisms/CoverImageSelector';
import { use } from 'react';

// Dynamically import the editor to avoid SSR issues
const BlogEditor = dynamic(() => import('@/components/organisms/BlogEditorCK'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <FiLoader className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    </div>
  )
});

export default function EditAnnouncementPage({
  params
}: {
  params: Promise<{ announcementId: string }>
}) {
  const { announcementId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    coverImage: '',
    headerImage: '',
    published: false,
  });

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        setFetching(true);
        const response = await fetch(`/api/announcements/${announcementId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch announcement');
        }

        const data = await response.json();
        setFormData({
          title: data.title,
          content: data.content,
          coverImage: data.coverImage || '',
          headerImage: data.headerImage || '',
          published: data.published,
        });
      } catch (err) {
        console.error('Error fetching announcement:', err);
        alert('Failed to load announcement');
        router.push('/dashboard/announcements');
      } finally {
        setFetching(false);
      }
    };

    if (announcementId) {
      fetchAnnouncement();
    }
  }, [announcementId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update announcement');
      }

      router.push('/dashboard/announcements');
    } catch (err) {
      console.error('Error updating announcement:', err);
      alert(err instanceof Error ? err.message : 'Failed to update announcement');
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-4xl">
        <div className="bg-red-50 text-red-700 rounded-lg p-8 text-center">
          <p className="text-lg">You must be logged in to edit announcements.</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (fetching) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-6xl">
        <div className="flex justify-center items-center h-64">
          <FiLoader className="animate-spin h-8 w-8 text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/dashboard/announcements"
              className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors cursor-pointer"
            >
              <FiArrowLeft className="mr-2" />
              Back to Announcements
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-2">Edit Announcement</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Update your announcement</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Draft</span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, published: !formData.published })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  formData.published ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.published ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">Published</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border-0 p-8">
          <div className="flex items-center mb-6">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg mr-4">
              <FiSave className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Announcement Details</h2>
              <p className="text-gray-600 dark:text-gray-400">Update the information for your announcement</p>
            </div>
          </div>

          {/* Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter announcement title"
              required
            />
          </div>

          {/* Cover Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cover Image (List View)
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Gebruikt in de lijst van announcements
            </p>
            <CoverImageSelector
              value={formData.coverImage}
              onChange={(url) => setFormData({ ...formData, coverImage: url })}
            />
          </div>

          {/* Header Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Header Image (Detail View)
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Gebruikt bovenaan de announcement pagina
            </p>
            <CoverImageSelector
              value={formData.headerImage}
              onChange={(url) => setFormData({ ...formData, headerImage: url })}
            />
          </div>

          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
            </label>
            <BlogEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t dark:border-gray-700">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                className="rounded text-purple-600 focus:ring-purple-500 mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center">
                {formData.published ? (
                  <>
                    <FiEye className="mr-1" />
                    Published
                  </>
                ) : (
                  <>
                    <FiEyeOff className="mr-1" />
                    Draft
                  </>
                )}
              </span>
            </label>

            <div className="flex space-x-3">
              <Link
                href="/dashboard/announcements"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    Update Announcement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
