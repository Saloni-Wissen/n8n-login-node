export function normalizeUsername(username: string): string {
  return username
    .toLowerCase()
    .replace(/[@.]/g, '-')  // Replace @ and . with hyphens
    .replace(/[^a-z0-9-]/g, '')  // Remove any other special characters except hyphens
    .replace(/-+/g, '-')  // Replace multiple consecutive hyphens with single hyphen
    .replace(/(^-+|-+$)/g, '');  // Remove leading and trailing hyphens
}

export function createSecretKey(domain: string, username: string): string {
  const normalizedDomain = domain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const normalizedUsername = normalizeUsername(username);
  return `${normalizedDomain}-${normalizedUsername}`;
}
