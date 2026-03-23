import React from 'react';

interface ThreadsIconProps {
  size?: number;
  className?: string;
}

export const ThreadsIcon: React.FC<ThreadsIconProps> = ({ size = 20, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 12a7 7 0 1 0-1.7 4.6c-.7 1.3-1.6 2.3-3.3 2.3-2 0-3-1.8-3-4 0-2.3 1.2-4 3-4 1.5 0 2.5 1 2.5 3v1c0 1.5 1 2.5 2 2.5s2.5-1.5 2.5-3.5C21 8 17 4 12 4 7 4 3 8 3 13.5 3 19 8 22 13 22" />
  </svg>
);
