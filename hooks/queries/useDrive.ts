import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/client';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  iconUrl?: string;
  webViewLink?: string;
  modifiedTime?: string;
  size?: number;
  thumbnailLink?: string;
  shared?: boolean;
  owners?: Array<{
    displayName?: string;
    emailAddress?: string;
    photoLink?: string;
  }>;
}

interface DriveResponse {
  files: DriveFile[];
}

interface UseDriveOptions {
  type?: 'recent' | 'shared';
  max?: number;
}

async function fetchDrive(options: UseDriveOptions = {}): Promise<DriveResponse> {
  const { type = 'recent', max = 10 } = options;

  const params = new URLSearchParams();
  params.append('type', type);
  params.append('max', max.toString());

  const response = await fetch(`/api/drive?${params.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch Drive files');
  }
  return response.json();
}

export function useDrive(options: UseDriveOptions = {}) {
  const { type = 'recent', max = 10 } = options;

  return useQuery({
    queryKey: queryKeys.drive.files(type, max),
    queryFn: () => fetchDrive(options),
    staleTime: 3 * 60 * 1000, // 3 minutes (files don't change as often)
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}
