/**
 * Helper to extract Google Drive Folder ID from various URL formats or plain ID
 */
export function extractDriveFolderId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Case 1: Plain ID (25 to 50 alphanumeric characters with dashes or underscores)
  const plainIdRegex = /^[a-zA-Z0-9_-]{25,55}$/;
  if (plainIdRegex.test(trimmed)) {
    return trimmed;
  }

  // Case 2: standard folder URL: .../folders/1ddKeOm3m468O3aBUVGbBdZLkzhzEbnkX...
  const foldersRegex = /\/folders\/([a-zA-Z0-9_-]{25,55})/;
  const folderMatch = trimmed.match(foldersRegex);
  if (folderMatch && folderMatch[1]) {
    return folderMatch[1];
  }

  // Case 3: query parameter id: ...?id=1ddKeOm3m468O3aBUVGbBdZLkzhzEbnkX
  const idParamRegex = /[?&]id=([a-zA-Z0-9_-]{25,55})/;
  const idParamMatch = trimmed.match(idParamRegex);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  // Case 4: open?id=...
  const openRegex = /\/open\?id=([a-zA-Z0-9_-]{25,55})/;
  const openMatch = trimmed.match(openRegex);
  if (openMatch && openMatch[1]) {
    return openMatch[1];
  }

  return null;
}

export function buildDriveFolderUrl(folderId: string): string {
  if (!folderId) return '';
  return `https://drive.google.com/drive/folders/${folderId}`;
}
