/**
 * Google Drive Link Utilities
 *
 * Google Drive share links look like:
 *   https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *
 * They need to be converted:
 *   - For file downloads (APK, AAB, ZIP):
 *       https://drive.google.com/uc?export=download&id=FILE_ID
 *   - For image display (thumbnail, screenshots):
 *       https://drive.google.com/thumbnail?id=FILE_ID&sz=w600
 */

const extractGDriveId = (url) => {
  if (!url) return null;

  // Format: /file/d/FILE_ID/
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];

  // Format: id=FILE_ID
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];

  // Format: /d/FILE_ID
  const shortMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return shortMatch[1];

  return null;
};

/**
 * Convert any Google Drive link to a direct download URL
 * Used for APK, AAB, ZIP downloads
 */
export const toDownloadLink = (url) => {
  if (!url) return null;
  const id = extractGDriveId(url);
  if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
  return url; // return as-is if not a GDrive link
};

/**
 * Convert any Google Drive link to a direct image URL
 * Used for thumbnails and screenshots
 * Uses uc?export=view which returns the raw image directly
 */
export const toImageLink = (url) => {
  if (!url) return null;
  const id = extractGDriveId(url);
  if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
  return url; // return as-is if not a GDrive link
};

/**
 * Check if a URL is a Google Drive link
 */
export const isGDriveLink = (url) => {
  if (!url) return false;
  return url.includes('drive.google.com');
};
