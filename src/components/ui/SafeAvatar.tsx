import React, { useState } from 'react';

export interface SafeAvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  sizeClass?: string;
  shape?: 'circle' | 'rounded';
}

const GRADIENTS = [
  'from-violet-600 to-indigo-700',
  'from-emerald-600 to-teal-700',
  'from-cyan-600 to-blue-700',
  'from-fuchsia-600 to-purple-700',
  'from-rose-600 to-pink-700',
  'from-amber-600 to-orange-700',
];

const SIZE_MAP: Record<string, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-20 h-20 text-xl',
};

function getInitials(name?: string): string {
  if (!name) return 'AI';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getGradientForName(name?: string): string {
  if (!name) return GRADIENTS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

export const SafeAvatar: React.FC<SafeAvatarProps> = ({
  src,
  name = 'Creator',
  size,
  sizeClass,
  shape = 'circle',
  className = '',
  alt,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const initials = getInitials(name);
  const gradient = getGradientForName(name);

  const resolvedSizeClass = sizeClass || (size ? SIZE_MAP[size] : 'w-8 h-8');
  const roundedClass = shape === 'circle' ? 'rounded-full' : 'rounded-2xl';

  if (!src || hasError) {
    return (
      <div
        className={`inline-flex items-center justify-center bg-gradient-to-br ${gradient} text-white font-bold font-sans shadow-inner shrink-0 select-none ${roundedClass} ${resolvedSizeClass} ${className}`}
        title={name}
      >
        <span>{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || name}
      onError={() => setHasError(true)}
      className={`object-cover shrink-0 ${roundedClass} ${resolvedSizeClass} ${className}`}
      {...props}
    />
  );
};

