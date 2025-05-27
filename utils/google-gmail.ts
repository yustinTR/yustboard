import { google } from 'googleapis';

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload: {
    partId?: string;
    mimeType?: string;
    filename?: string;
    headers: Array<{
      name: string;
      value: string;
    }>;
    body?: {
      size: number;
      data?: string;
    };
    parts?: any[];
  };
  sizeEstimate: number;
  raw?: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  from: {
    name?: string;
    email: string;
  };
  to: string[];
  subject: string;
  snippet: string;
  body?: string;
  date: Date | string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  labels: string[];
  sizeEstimate: number;
}

// Initialize Gmail API client
export async function getGmailClient(accessToken: string) {
  if (!accessToken) {
    throw new Error("Access token is required for Gmail API");
  }
  
  console.log("Initializing Gmail client with access token");
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth });
}

// Extract email from header value (e.g., "John Doe <john@example.com>" -> { name: "John Doe", email: "john@example.com" })
function parseEmailAddress(headerValue: string): { name?: string; email: string } {
  if (!headerValue) {
    return { email: 'unknown@example.com' };
  }
  
  // Check if the format is "Name <email>"
  const match = headerValue.match(/^(.*?)\s*<([^>]+)>$/);
  if (match) {
    return { 
      name: match[1].trim().replace(/["']/g, ''), 
      email: match[2].trim() 
    };
  }
  
  // If not in that format, assume it's just an email
  return { email: headerValue.trim() };
}

// Parse "To" header which may contain multiple recipients
function parseToAddresses(headerValue?: string): string[] {
  if (!headerValue) {
    return [];
  }
  
  // Split by commas, then extract email parts
  return headerValue
    .split(',')
    .map(part => {
      const parsed = parseEmailAddress(part.trim());
      return parsed.email;
    })
    .filter(Boolean);
}

// Extract a specific header value from Gmail message
function getHeader(message: GmailMessage, name: string): string | undefined {
  if (!message.payload?.headers) return undefined;
  
  const header = message.payload.headers.find(
    h => h.name.toLowerCase() === name.toLowerCase()
  );
  
  return header?.value;
}

// Decode base64 content
function decodeBase64(data: string): string {
  // Convert from URL-safe base64 to standard base64
  const base64Data = data.replace(/-/g, '+').replace(/_/g, '/');
  
  try {
    // For browser environment
    return atob(base64Data);
  } catch (e) {
    // For Node.js environment
    return Buffer.from(base64Data, 'base64').toString('utf-8');
  }
}

// Extract email body content from parts
function extractBodyContent(payload: any): string {
  // If the message is a simple text or HTML
  if (payload.body?.data) {
    return decodeBase64(payload.body.data);
  }
  
  // If the message has parts (multipart message)
  if (payload.parts && payload.parts.length) {
    // First try to find an HTML part
    const htmlPart = payload.parts.find((part: any) => 
      part.mimeType === 'text/html'
    );
    
    if (htmlPart && htmlPart.body?.data) {
      return decodeBase64(htmlPart.body.data);
    }
    
    // If no HTML part, try to find a text part
    const textPart = payload.parts.find((part: any) => 
      part.mimeType === 'text/plain'
    );
    
    if (textPart && textPart.body?.data) {
      return decodeBase64(textPart.body.data);
    }
    
    // If no HTML or text part at this level, recursively check nested parts
    for (const part of payload.parts) {
      if (part.parts) {
        const nestedContent = extractBodyContent(part);
        if (nestedContent) {
          return nestedContent;
        }
      }
    }
  }
  
  return '';
}

// Convert Gmail raw message to app email format
function convertGmailMessageToEmail(message: GmailMessage): EmailMessage {
  const fromHeader = getHeader(message, 'From') || '';
  const from = parseEmailAddress(fromHeader);
  
  const toHeader = getHeader(message, 'To');
  const to = parseToAddresses(toHeader);
  
  const subject = getHeader(message, 'Subject') || '(No Subject)';
  
  const dateHeader = getHeader(message, 'Date');
  const date = dateHeader ? new Date(dateHeader) : new Date();
  
  const isRead = !message.labelIds?.includes('UNREAD');
  const isStarred = message.labelIds?.includes('STARRED') || false;
  const hasAttachments = message.payload?.mimeType?.includes('multipart') || false;
  
  // Extract body content if payload is available
  let body = '';
  if (message.payload) {
    body = extractBodyContent(message.payload);
  }
  
  return {
    id: message.id,
    threadId: message.threadId,
    from,
    to,
    subject,
    snippet: message.snippet || '',
    body,
    date,
    isRead,
    isStarred,
    hasAttachments,
    labels: message.labelIds || [],
    sizeEstimate: message.sizeEstimate
  };
}

// Fetch user's Gmail labels
export async function fetchGmailLabels(accessToken: string) {
  try {
    const gmail = await getGmailClient(accessToken);
    const response = await gmail.users.labels.list({
      userId: 'me',
    });
    
    return response.data.labels || [];
  } catch (error) {
    console.error('Error fetching Gmail labels:', error);
    throw error;
  }
}

// Fetch emails from inbox with pagination
export async function fetchEmails(
  accessToken: string,
  maxResults: number = 10,
  query: string = 'in:inbox',
  pageToken?: string
): Promise<{ emails: EmailMessage[]; nextPageToken?: string }> {
  try {
    console.log(`Fetching emails with query: ${query}`);
    const gmail = await getGmailClient(accessToken);
    
    // First, list message IDs based on the query
    const messagesResponse = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: query,
      pageToken,
    });
    
    const messageIds = messagesResponse.data.messages || [];
    console.log(`Found ${messageIds.length} messages`);
    
    if (messageIds.length === 0) {
      return { emails: [] };
    }
    
    // Then, fetch full messages for each ID
    const emails = await Promise.all(
      messageIds.map(async ({ id, threadId }) => {
        if (!id) return null;
        
        const messageResponse = await gmail.users.messages.get({
          userId: 'me',
          id,
          format: 'metadata', // 'full' for complete message content
          metadataHeaders: ['From', 'To', 'Subject', 'Date'],
        });
        
        return convertGmailMessageToEmail(messageResponse.data as GmailMessage);
      })
    );
    
    return {
      emails: emails.filter(Boolean) as EmailMessage[],
      nextPageToken: messagesResponse.data.nextPageToken,
    };
  } catch (error) {
    console.error('Error fetching emails:', error);
    
    // Show more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Return empty array rather than failing completely
    return { emails: [] };
  }
}

// Fetch a specific email by ID
export async function fetchEmailById(
  accessToken: string,
  messageId: string
): Promise<EmailMessage | null> {
  try {
    console.log(`Fetching email with ID: ${messageId}`);
    const gmail = await getGmailClient(accessToken);
    
    const messageResponse = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full',
    });
    
    return convertGmailMessageToEmail(messageResponse.data as GmailMessage);
  } catch (error) {
    console.error(`Error fetching email ${messageId}:`, error);
    return null;
  }
}

// Mark an email as read
export async function markAsRead(
  accessToken: string,
  messageId: string
): Promise<boolean> {
  try {
    const gmail = await getGmailClient(accessToken);
    
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });
    
    return true;
  } catch (error) {
    console.error(`Error marking email ${messageId} as read:`, error);
    return false;
  }
}

// Toggle star status of an email
export async function toggleStar(
  accessToken: string,
  messageId: string,
  star: boolean
): Promise<boolean> {
  try {
    const gmail = await getGmailClient(accessToken);
    
    const requestBody = star
      ? { addLabelIds: ['STARRED'] }
      : { removeLabelIds: ['STARRED'] };
    
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody,
    });
    
    return true;
  } catch (error) {
    console.error(`Error toggling star for email ${messageId}:`, error);
    return false;
  }
}

// Get email counts by label/category
export async function getEmailCounts(
  accessToken: string
): Promise<{ [label: string]: number }> {
  try {
    const gmail = await getGmailClient(accessToken);
    
    // Get all user labels
    const labelsResponse = await gmail.users.labels.list({
      userId: 'me',
    });
    
    const labels = labelsResponse.data.labels || [];
    const counts: { [label: string]: number } = {};
    
    // Get counts for important system labels
    const importantLabels = ['INBOX', 'UNREAD', 'STARRED', 'IMPORTANT', 'SENT', 'DRAFT', 'SPAM', 'TRASH'];
    
    for (const labelName of importantLabels) {
      const label = labels.find(l => l.id === labelName);
      if (label) {
        counts[labelName.toLowerCase()] = label.messagesUnread || 0;
      }
    }
    
    return counts;
  } catch (error) {
    console.error('Error getting email counts:', error);
    return {};
  }
}