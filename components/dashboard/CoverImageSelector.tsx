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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
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
      <label className="block text-sm font-medium text-gray-700 mb-2">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Select Cover Image</h3>
              <button
                onClick={() => setShowMediaLibrary(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <FiX size={20} />
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
                <div className="text-center py-12 text-gray-500">
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
                      </div>
                      <div className="p-2 bg-gray-50">
                        <p className="text-xs truncate">{item.filename}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(item.size)}</p>
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