/**
 * Utility functions for file handling
 */

/**
 * Resolves file source paths
 * @param name - File name or URL
 * @returns Resolved file path
 */
export function resolveSrc(name?: string): string {
  if (!name) return "";
  if (/^https?:\/\//.test(name) || name.startsWith("data:")) return name;
  if (name.startsWith("/")) return name;
  // Assume files are under public/uploads
  return `/uploads/${name}`;
}

