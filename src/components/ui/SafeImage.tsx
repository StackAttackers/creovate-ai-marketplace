import React, { useState, useEffect } from 'react';

// Reliable, verified fallback images per creative category
const CATEGORY_FALLBACKS: Record<string, string> = {
  'AI Video Generation':
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop',
  'AI Advertising':
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=600&fit=crop',
  'AI Photography':
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&h=600&fit=crop',
  '3D Art and Animation':
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&h=600&fit=crop',
  'AI Graphic Design':
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
  'AI Avatars':
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
  'Product Visualization':
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
  default:
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop',
};

// High-tech geometric SVG data URI fallback that NEVER fails (offline & CDN independent)
const SVG_ABSTRACT_FALLBACK =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230F172A"/><stop offset="50%" stop-color="%231E1B4B"/><stop offset="100%" stop-color="%23064E3B"/></linearGradient></defs><rect width="800" height="600" fill="url(%23g)"/><circle cx="400" cy="300" r="160" fill="none" stroke="%2310B981" stroke-width="2" stroke-dasharray="8 6" opacity="0.6"/><circle cx="400" cy="300" r="90" fill="none" stroke="%238B5CF6" stroke-width="2" opacity="0.7"/><text x="400" y="305" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="%23FFFFFF" text-anchor="middle" letter-spacing="2">CREOVATE AI ARTWORK</text></svg>';

export interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  category?: string;
  containerClassName?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallbackSrc,
  category,
  alt = 'AI Artwork',
  className = '',
  containerClassName = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    setHasError(false);
    setUsedFallback(false);
    setIsLoaded(false);
  }, [src]);

  const defaultCategoryFallback = category
    ? CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.default
    : CATEGORY_FALLBACKS.default;

  // Primary image source to attempt
  const imageSource = hasError
    ? usedFallback
      ? SVG_ABSTRACT_FALLBACK
      : fallbackSrc || defaultCategoryFallback
    : src || defaultCategoryFallback;

  const handleError = () => {
    if (!hasError) {
      // First error: try verified fallback URL
      setHasError(true);
      setUsedFallback(false);
    } else if (!usedFallback) {
      // Second error: fallback to guaranteed inline SVG
      setUsedFallback(true);
    }
  };

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {/* Shimmering Skeleton Loader while loading */}
      {!isLoaded && !usedFallback && (
        <div className="absolute inset-0 bg-gradient-to-r from-midnight-950 via-white/[0.04] to-midnight-950 animate-pulse" />
      )}

      <img
        src={imageSource}
        alt={alt}
        onError={handleError}
        onLoad={() => setIsLoaded(true)}
        className={`${className} transition-opacity duration-300 ${
          isLoaded || usedFallback ? 'opacity-100' : 'opacity-0'
        }`}
        {...props}
      />
    </div>
  );
};
