import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    fullWidth = false,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || props.name || Math.random().toString(36).substr(2, 9);
    const widthClass = fullWidth ? "w-full" : "";
    const borderClass = error
        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200";

    return (
        <div className={`${widthClass} mb-4`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-zinc-300 mb-1"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`
                    block rounded-2xl  
                    py-2 px-3 text-zinc-300 placeholder-gray-400
                    transition duration-150 ease-in-out shadow-sm shadow-gray-300/40 
                    ${widthClass}
                    ${borderClass}
                    ${className}
                `}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};
