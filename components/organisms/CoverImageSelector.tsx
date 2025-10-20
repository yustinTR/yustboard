'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { FiUpload, FiX, FiImage, FiLoader, FiTrash2 } from 'react-icons/fi';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  size: number;
  uploadedAt: Date;
}

interface CoverImageSelectorProps {
  value: string;
  onChange: (url: string) => void;
}

export default function CoverImageSelector({ value, onChange }: CoverImageSelectorProps) {
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch media library items
  const fetchMediaItems = async () => {
    try {
      setLoadingMedia(true);
      const response = await fetch('/api/media');
      if (response.ok) {
        const data = await response.json();
        // Transform the response to match expected format
        const items = (data.files || []).map((file: { id: string; url: string; originalName: string; size: number; createdAt: string }) => ({
          id: file.id,
          url: file.url,
          filename: file.originalName,
          size: file.size,
          uploadedAt: new Date(file.createdAt)
        }));
        setMediaItems(items);
      }
    } catch (error) {
      console.error('Error fetching media items:', error);
    } finally {
      setLoadingMedia(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      // Set as cover image
      onChange(data.url);
      setShowMediaLibrary(false);
      
      // Refresh media items
      fetchMediaItems();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Delete media file
  const handleDeleteMedia = async (mediaId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the image when deleting

    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      // Refresh media items
      fetchMediaItems();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete image');
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Cover Image
      </label>
      
      {/* Current cover image preview */}
      {value && (
        <div className="mb-4 relative">
          <div className="relative h-48 w-full rounded-lg overflow-hidden border border-gray-300">
            <Image
              src={value}
              alt="Cover image"
              fill
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <FiTrash2 />
          </button>
        </div>
      )}

      {/* Select image button */}
      <button
        type="button"
        onClick={() => {
          setShowMediaLibrary(true);
          fetchMediaItems();
        }}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
      >
        <FiImage className="mr-2" />
        {value ? 'Change Cover Image' : 'Select Cover Image'}
      </button>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-5xl w-full mx-4 max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-4 duration-300">
            <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-xl mr-4">
                  <FiImage className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Cover Image Library</h3>
                  <p className="text-gray-600 dark:text-gray-400">Choose a cover image for your blog post</p>
                </div>
              </div>
              <button
                onClick={() => setShowMediaLibrary(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors group"
              >
                <FiX size={24} className="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
              </button>
            </div>

            <div className="p-4 border-b">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
              >
                {uploading ? (
                  <>
                    <FiLoader className="animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FiUpload className="mr-2" />
                    Upload New Image
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loadingMedia ? (
                <div className="flex justify-center items-center h-64">
                  <FiLoader className="animate-spin h-8 w-8 text-blue-500" />
                </div>
              ) : mediaItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <FiImage size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No images uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                        value === item.url ? 'border-blue-500' : 'border-gray-300 hover:border-blue-500'
                      }`}
                      onClick={() => {
                        onChange(item.url);
                        setShowMediaLibrary(false);
                      }}
                    >
                      <div className="aspect-square relative">
                        <Image
                          src={item.url}
                          alt={item.filename}
                          fill
                          className="object-cover"
                        />
                        {value === item.url && (
                          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                            <div className="bg-blue-500 text-white rounded-full p-2">
                              <FiImage size={24} />
                            </div>
                          </div>
                        )}
                        {/* Delete button - only show on hover */}
                        <button
                          onClick={(e) => handleDeleteMedia(item.id, e)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                          title="Delete image"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                      <div className="p-2 bg-gray-50 dark:bg-gray-800">
                        <p className="text-xs truncate text-gray-900 dark:text-gray-100">{item.filename}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(item.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}