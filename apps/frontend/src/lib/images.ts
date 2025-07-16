/**
 * Utility function to get the correct image path for both development and production
 * In development: /images/image.png
 * In production (GitHub Pages): /DilSeDaan-Block-Chain/images/image.png
 */
export const getImagePath = (imagePath: string): string => {
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // Check if we're in production environment or GitHub Pages
  const isProduction = import.meta.env.PROD || 
    (typeof window !== 'undefined' && window.location.hostname === 'rafi-luffy.github.io');
  
  // Debug logging
  if (typeof window !== 'undefined' && window.location.hostname === 'rafi-luffy.github.io') {
    console.log('Image path debug:', {
      imagePath,
      cleanPath,
      isProduction,
      hostname: window.location.hostname,
      result: isProduction ? `/DilSeDaan-Block-Chain/${cleanPath}` : `/${cleanPath}`
    });
  }
  
  // In production, add the base path
  if (isProduction) {
    return `/DilSeDaan-Block-Chain/${cleanPath}`;
  }
  
  // In development, use the path as is
  return `/${cleanPath}`;
};

/**
 * Get the base URL for the application
 */
export const getBaseUrl = (): string => {
  return import.meta.env.PROD ? '/DilSeDaan-Block-Chain' : '';
};
