import React from 'react';
import { cn } from '../../utils/formatters';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'none' | 'primary' | 'accent';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glow = 'none',
  ...props
}) => {
  const glowStyles = {
    none: '',
    primary: 'hover:shadow-glow-primary border-emerald-500/30',
    accent: 'hover:shadow-glow-accent border-cyan-500/30',
  };

  return (
    <div
      className={cn(
        'bg-[#131B2E] border border-[#1E293B] rounded-xl transition-all duration-200',
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('p-5 pb-3 border-b border-slate-800/60 flex items-center justify-between', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => (
  <h3 className={cn('text-base font-semibold text-slate-100 flex items-center gap-2', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => (
  <p className={cn('text-xs text-slate-400 mt-0.5', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('p-5', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={cn('p-4 pt-3 border-t border-slate-800/60 flex items-center justify-between', className)} {...props}>
    {children}
  </div>
);

