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
  
  // Debug logging with more details
  if (typeof window !== 'undefined') {
    console.log('Image path debug:', {
      imagePath,
      cleanPath,
      isProduction,
      hostname: window.location.hostname,
      pathname: window.location.pathname,
      href: window.location.href,
      envProd: import.meta.env.PROD,
      result: isProduction ? `/DilSeDaan-Block-Chain/${cleanPath}` : `/${cleanPath}`
    });
  }
  
  // For GitHub Pages, always use the full base path
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'rafi-luffy.github.io' || 
       window.location.href.includes('DilSeDaan-Block-Chain'))) {
    return `/DilSeDaan-Block-Chain/${cleanPath}`;
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
