import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-primary text-secondary-foreground hover:bg-primary/90 cursor-pointer',
                destructive:
                    'bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer',
                outline:
                    'border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer',
                secondary:
                    'bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer',
                ghost: 'hover:bg-accent hover:text-accent-foreground cursor-pointer',
                link: 'text-primary underline-offset-4 hover:underline cursor-pointer',
                muted: 'bg-neutral-800 relative z-10 hover:bg-neutral-900 border border-transparent text-white text-sm md:text-sm transition font-medium duration-200 rounded-md px-4 py-2 flex items-center justify-center shadow-[0px_1px_0px_0px_#FFFFFF20_inset] cursor-pointer',
                primary:
                    'bg-primary relative z-10 hover:bg-secondary/90 border border-secondary text-white text-sm md:text-sm transition font-medium duration-200 rounded-md px-4 py-2 flex items-center justify-center shadow-[0px_-1px_0px_0px_#113578_inset,_0px_1px_0px_0px_#113578_inset] cursor-pointer',
            },
            size: {
                default: 'h-10 px-4 py-2',
                sm: 'h-9 rounded-md px-3',
                lg: 'h-11 rounded-md px-8',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
