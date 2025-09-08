'use client';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import CustomEditor from '@/lib/ckeditor/custom-editor';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { FiUpload, FiX, FiImage, FiLoader, FiCheck } from 'react-icons/fi';

interface BlogEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (url: string) => void;
}

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  size: number;
  uploadedAt: Date;
}

export default function BlogEditorCK({ content, onChange, onImageUpload }: BlogEditorProps) {
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null);

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
      
      // Add to media items
      const newItem: MediaItem = {
        id: Date.now().toString(),
        url: data.url,
        filename: file.name,
        size: file.size,
        uploadedAt: new Date(),
      };
      
      setMediaItems(prev => [newItem, ...prev]);
      
      // If editor is active, insert the image
      if (editorRef.current) {
        insertImageToEditor(data.url);
      }
      
      // Call callback if provided
      if (onImageUpload) {
        onImageUpload(data.url);
      }
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

  // Insert image to editor
  const insertImageToEditor = (url: string) => {
    if (editorRef.current) {
      const viewFragment = editorRef.current.data.processor.toView(`<img src="${url}" alt="">`);
      const modelFragment = editorRef.current.data.toModel(viewFragment);
      editorRef.current.model.insertContent(modelFragment);
      setShowMediaLibrary(false);
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
    <div className="relative">
      {/* CKEditor */}
      <CKEditor
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        editor={CustomEditor as any}
        data={content}
        onReady={(editor) => {
          editorRef.current = editor;
          
          // Add custom upload adapter
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
            return {
              upload: async () => {
                const file = await loader.file;
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
                return { default: data.url };
              },
              abort: () => {
                // Handle abort
              }
            };
          };
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
        config={{}}
      />

      {/* Media Library Button */}
      <button
        type="button"
        onClick={() => {
          setShowMediaLibrary(true);
          fetchMediaItems();
        }}
        className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
      >
        <FiImage className="mr-1" />
        Open Media Library
      </button>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Media Library</h3>
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
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <FiImage size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No images uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mediaItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative group cursor-pointer rounded-lg overflow-hidden border hover:border-blue-500 transition-colors"
                      onClick={() => insertImageToEditor(item.url)}
                    >
                      <div className="aspect-square relative">
                        <Image
                          src={item.url}
                          alt={item.filename}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                          <FiCheck className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                        </div>
                      </div>
                      <div className="p-2 bg-gray-50">
                        <p className="text-xs truncate">{item.filename}</p>
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