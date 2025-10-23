/**
 * Utility functions for handling @mentions in comments
 */

export interface MentionUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

/**
 * Extract @mentions from text
 * Format: @[username](userId)
 */
export function extractMentions(text: string): Array<{ userId: string; username: string }> {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions: Array<{ userId: string; username: string }> = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push({
      username: match[1],
      userId: match[2],
    });
  }

  return mentions;
}

/**
 * Parse text and replace @mentions with formatted mentions
 * Input: "Hey @john, check this!"
 * Output with userId: "Hey @[John](user123), check this!"
 */
export function formatMention(username: string, userId: string): string {
  return `@[${username}](${userId})`;
}

/**
 * Check if cursor is in a mention context (@...)
 * Returns the query string after @ if true
 */
export function getMentionQuery(text: string, cursorPosition: number): string | null {
  // Find the last @ before cursor
  const textBeforeCursor = text.substring(0, cursorPosition);
  const lastAtIndex = textBeforeCursor.lastIndexOf('@');

  if (lastAtIndex === -1) return null;

  // Check if there's a space between @ and cursor (breaks mention)
  const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
  if (textAfterAt.includes(' ') || textAfterAt.includes('\n')) return null;

  // Return the query string (text after @)
  return textAfterAt;
}

/**
 * Insert mention at cursor position
 */
export function insertMention(
  text: string,
  cursorPosition: number,
  mention: { name: string; id: string }
): { newText: string; newCursorPosition: number } {
  const textBeforeCursor = text.substring(0, cursorPosition);
  const textAfterCursor = text.substring(cursorPosition);

  // Find and remove the @ and query
  const lastAtIndex = textBeforeCursor.lastIndexOf('@');
  const beforeMention = text.substring(0, lastAtIndex);
  const formattedMention = formatMention(mention.name, mention.id);
  const newText = beforeMention + formattedMention + ' ' + textAfterCursor;
  const newCursorPosition = (beforeMention + formattedMention + ' ').length;

  return { newText, newCursorPosition };
}

/**
 * Render mentions in comment text for display
 * Converts @[username](userId) to JSX-friendly format
 */
export function renderMentionText(text: string): Array<{ type: 'text' | 'mention'; content: string; userId?: string }> {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: Array<{ type: 'text' | 'mention'; content: string; userId?: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      });
    }

    // Add mention
    parts.push({
      type: 'mention',
      content: match[1], // username
      userId: match[2],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }];
}
