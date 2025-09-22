import { google } from 'googleapis';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
  iconLink: string;
  thumbnailLink?: string | null;
  owners: Array<{
    displayName?: string | null;
    emailAddress: string;
    photoLink?: string | null;
  }>;
  shared: boolean;
  size?: string;
}

// Initialize Google Drive API
export async function getGoogleDriveClient(accessToken: string) {
  if (!accessToken) {
    throw new Error("Access token is required for Google Drive API");
  }
  
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth });
}

// Format file size for display
function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Fetch recent files from Google Drive
export async function fetchRecentFiles(accessToken: string, maxResults: number = 10): Promise<DriveFile[]> {
  try {
    
    const drive = await getGoogleDriveClient(accessToken);
    
    const response = await drive.files.list({
      pageSize: maxResults,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime, webViewLink, iconLink, thumbnailLink, owners, shared, size)',
      orderBy: 'modifiedTime desc',
      q: 'trashed = false',
    });
    
    
    if (!response.data.files || response.data.files.length === 0) {
      return [];
    }
    
    return response.data.files.map(file => ({
      id: file.id || '',
      name: file.name || 'Untitled',
      mimeType: file.mimeType || '',
      createdTime: file.createdTime || '',
      modifiedTime: file.modifiedTime || '',
      webViewLink: file.webViewLink || '',
      iconLink: file.iconLink || '',
      thumbnailLink: file.thumbnailLink,
      owners: file.owners?.map(owner => ({
        displayName: owner.displayName,
        emailAddress: owner.emailAddress || '',
        photoLink: owner.photoLink
      })) || [],
      shared: file.shared || false,
      size: formatFileSize(Number(file.size))
    }));
  } catch (error: any) {
    // Check for specific Google API errors
    if (error?.response?.status === 401) {
      throw new Error('Invalid Credentials');
    }

    if (error?.errors?.[0]?.reason === 'authError') {
      throw new Error('Authentication failed');
    }
    
    // Re-throw the error to handle it in the API route
    throw error;
  }
}

// Fetch shared files from Google Drive
export async function fetchSharedFiles(accessToken: string, maxResults: number = 10): Promise<DriveFile[]> {
  try {
    const drive = await getGoogleDriveClient(accessToken);
    
    const response = await drive.files.list({
      pageSize: maxResults,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime, webViewLink, iconLink, thumbnailLink, owners, shared, size)',
      orderBy: 'modifiedTime desc',
      q: 'trashed = false and sharedWithMe = true',
    });
    
    
    if (!response.data.files || response.data.files.length === 0) {
      return [];
    }
    
    return response.data.files.map(file => ({
      id: file.id || '',
      name: file.name || 'Untitled',
      mimeType: file.mimeType || '',
      createdTime: file.createdTime || '',
      modifiedTime: file.modifiedTime || '',
      webViewLink: file.webViewLink || '',
      iconLink: file.iconLink || '',
      thumbnailLink: file.thumbnailLink,
      owners: file.owners?.map(owner => ({
        displayName: owner.displayName,
        emailAddress: owner.emailAddress || '',
        photoLink: owner.photoLink
      })) || [],
      shared: file.shared || false,
      size: formatFileSize(Number(file.size))
    }));
  } catch (error: any) {
    // Check for specific Google API errors
    if (error?.response?.status === 401) {
      throw new Error('Invalid Credentials');
    }

    if (error?.errors?.[0]?.reason === 'authError') {
      throw new Error('Authentication failed');
    }
    
    // Re-throw the error to handle it in the API route
    throw error;
  }
}