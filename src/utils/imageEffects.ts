// This file might have other functions, but we need to update the cleanImageUrl function
// to handle an optional second parameter that might be passed, but is not being used.

export const cleanImageUrl = (url: string, _unused?: any): string => {
  if (!url) return '';
  
  // Clean the URL by removing any metadata
  const metadataIndex = url.indexOf(';metadata=');
  if (metadataIndex !== -1) {
    return url.substring(0, metadataIndex);
  }
  
  return url;
};
