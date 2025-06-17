import { cn } from '@/lib/utils';
import { MotionProps } from 'motion/react';
import React from 'react';
import Balancer from 'react-wrap-balancer';

export const Subheading = ({
    className,
    as: Tag = 'h2',
    children,
    ...props
}: {
    className?: string;
    as?: any;
    children: any;
} & MotionProps &
    React.HTMLAttributes<HTMLHeadingElement>) => {
    return (
        <Tag
            className={cn(
                'text-sm md:text-base  max-w-4xl text-left my-4 mx-auto',
                'text-muted text-center font-normal',
                className
            )}
        >
            <Balancer>{children}</Balancer>
        </Tag>
    );
};

