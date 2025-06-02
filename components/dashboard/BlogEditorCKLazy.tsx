'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { FiLoader } from 'react-icons/fi';

const BlogEditorCK = dynamic(() => import('./BlogEditorCK'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <div className="text-center">
        <FiLoader className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading editor...</p>
      </div>
    </div>
  )
});

interface BlogEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (url: string) => void;
}

export default function BlogEditorCKLazy(props: BlogEditorProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center">
          <FiLoader className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    }>
      <BlogEditorCK {...props} />
    </Suspense>
  );
}