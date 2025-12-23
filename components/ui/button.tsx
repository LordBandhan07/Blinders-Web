import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'danger';
    size?: 'default' | 'sm' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--primary-accent)] disabled:opacity-50 disabled:pointer-events-none';

        const variants = {
            default: 'bg-gradient-to-r from-[var(--primary-accent)] to-[var(--secondary-accent)] text-white hover:opacity-90 shadow-lg',
            outline: 'border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--card-bg)]',
            ghost: 'bg-transparent text-[var(--foreground)] hover:bg-[var(--card-bg)]',
            danger: 'bg-[var(--danger)] text-white hover:opacity-90',
        };

        const sizes = {
            default: 'h-12 px-6 py-2',
            sm: 'h-9 px-4 text-sm',
            lg: 'h-14 px-8 text-lg',
        };

        return (
            <button
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button };
