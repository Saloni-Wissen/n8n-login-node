export function normalizeUsername(username: string): string {
  return username.toLowerCase().replace(/[^a-z0-9]/gi, '-');
}
