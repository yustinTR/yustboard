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

interface MediaSelectorProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
}

export default function MediaSelector({ 
  value, 
  onChange, 
  label = 'Image',
  placeholder = 'Select Image'
}: MediaSelectorProps) {
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch media library items
  const fetchMediaItems = async () => {
    try {
      setLoadingMedia(true);
      const response = await fetch('/api/upload?type=list');
      if (response.ok) {
        const data = await response.json();
        setMediaItems(data.files || []);
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
      
      // Set as selected image
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
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      {/* Current image preview */}
      {value && (
        <div className="mb-4 relative">
          <div className="relative h-48 w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
            <Image
              src={value}
              alt={label || 'Selected image'}
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
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center"
      >
        <FiImage className="mr-2" />
        {value ? `Change ${label}` : placeholder}
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
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Media Library</h3>
                  <p className="text-gray-600 dark:text-gray-400">Choose an image or upload a new one</p>
                </div>
              </div>
              <button
                onClick={() => setShowMediaLibrary(false)}
                className="absolute top-6 right-6 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors group"
              >
                <FiX size={24} className="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
              </button>
            </div>

            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Upload New Image</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">JPG, PNG, GIF up to 50MB</p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-50 flex items-center shadow-lg"
                >
                  {uploading ? (
                    <>
                      <FiLoader className="animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FiUpload className="mr-2" />
                      Upload Image
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingMedia ? (
                <div className="flex flex-col justify-center items-center h-64">
                  <div className="relative">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                      <FiLoader className="animate-spin h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">Loading your images...</p>
                </div>
              ) : mediaItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <FiImage size={48} className="text-gray-400 dark:text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No images yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">Upload your first image to get started</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Your Images</h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{mediaItems.length} images</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {mediaItems.map((item) => (
                      <div
                        key={item.id}
                        className={`relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-200 transform hover:scale-105 ${
                          value === item.url 
                            ? 'ring-4 ring-blue-500 ring-opacity-50 shadow-lg' 
                            : 'hover:shadow-xl border border-gray-200 dark:border-gray-700'
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          {value === item.url && (
                            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                              <div className="bg-blue-500 text-white rounded-full p-3 shadow-lg">
                                <FiImage size={20} />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 bg-opacity-95 backdrop-blur-sm p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                          <p className="text-xs font-medium truncate text-gray-900 dark:text-gray-100">{item.filename}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(item.size)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}