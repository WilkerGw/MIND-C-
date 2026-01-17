import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
    label,
    error,
    fullWidth = false,
    className = '',
    id,
    children,
    ...props
}) => {
    const selectId = id || props.name || Math.random().toString(36).substr(2, 9);
    const widthClass = fullWidth ? "w-full" : "";
    const borderClass = error
        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200";

    return (
        <div className={`${widthClass} mb-4`}>
            {label && (
                <label
                    htmlFor={selectId}
                    className="block text-sm font-medium text-zinc-300 mb-1"
                >
                    {label}
                </label>
            )}
            <select
                id={selectId}
                className={`
                    block rounded-2xl shadow-sm shadow-gray-300/40 
                    focus:ring-4 focus:ring-opacity-50 
                    disabled:bg-gray-100 disabled:text-gray-500
                    py-2 px-3 text-zinc-300 bg-zinc-800
                    transition duration-150 ease-in-out
                    ${widthClass}
                    ${borderClass}
                    ${className}
                `}
                {...props}
            >
                {children}
            </select>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};
