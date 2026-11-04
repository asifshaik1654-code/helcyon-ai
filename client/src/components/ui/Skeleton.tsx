import React from 'react';
import { cn } from '../../utils/formatters';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-lg bg-slate-800/70', className)}
      {...props}
    />
  );
};
