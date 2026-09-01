export const fixUrl = (url?: string | null): string => {
  if (!url) return '';
  let newUrl = url.replace('https://https://', 'https://').replace('https://https//', 'https://');
  newUrl = newUrl.replace(
    'https://f39ec6a63ea5e47ccdd6c1d892386666.r2.cloudflarestorage.com',
    'https://pub-3b036857fdd24996b2f83a969d8b61e8.r2.dev'
  );
  return newUrl;
};

export const fixThumbnailUrl = (url?: string | null, fallback: string = '/assets/minano-nihongo.jpg'): string => {
  if (!url) return fallback;
  const cleaned = fixUrl(url);
  
  // Clean query strings/hashes for extension checking
  const cleanPath = cleaned.split('?')[0].split('#')[0].toLowerCase();
  
  // Check if it has a valid image extension or if it's explicitly a non-image file (e.g., .pdf, .mp3, .zip)
  const isImageExt = /\.(jpg|jpeg|png|webp|avif|svg|gif)$/i.test(cleanPath);
  const isNonImageExt = /\.(pdf|mp3|zip|docx|doc|rar|7z|xlsx|pptx)$/i.test(cleanPath);

  if (isNonImageExt || (!isImageExt && cleanPath.startsWith('http'))) {
    return fallback;
  }

  return cleaned;
};
