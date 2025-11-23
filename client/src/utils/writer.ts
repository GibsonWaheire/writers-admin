const USER_TO_WRITER_MAP: Record<string, string> = {
  '1': 'writer-1',
  '2': 'writer-2',
  '3': 'writer-1',
  'writer-1': 'writer-1',
  'writer-2': 'writer-2',
};

/**
 * Normalize any writer identifier (including auth user IDs such as user-writer-1)
 * to the canonical writer-* format used across the app.
 */
export function normalizeWriterId(writerId?: string | null): string | undefined {
  if (!writerId) return undefined;
  if (writerId.startsWith('writer-')) return writerId;
  if (writerId.startsWith('user-writer-')) {
    return writerId.replace(/^user-/, '');
  }
  return USER_TO_WRITER_MAP[writerId] || writerId;
}

/**
 * Resolve the canonical writer ID for a logged-in user (writer role).
 * Falls back to writer-1 for development accounts when no mapping exists.
 */
export function getWriterIdForUser(userId?: string | null): string {
  return normalizeWriterId(userId) || 'writer-1';
}

