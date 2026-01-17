import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    noPadding = false,
    ...props
}) => {
    return (
        <div
            className={`bg-zinc-800 rounded-2xl shadow-md  overflow-hidden ${noPadding ? '' : 'p-6'} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props}>
            {children}
        </div>
    );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <div className={`px-6 py-4 ${className}`} {...props}>
            {children}
        </div>
    );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <div className={`px-6 py-4 bg-gray-50 border-t border-gray-200 ${className}`} {...props}>
            {children}
        </div>
    );
};
