import React from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ priority = false, loading, decoding, ...props }) => (
  <img
    loading={loading || (priority ? 'eager' : 'lazy')}
    decoding={decoding || 'async'}
    fetchPriority={priority ? 'high' : 'auto'}
    {...props}
  />
);
