import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full overflow-x-auto rounded-lg shadow-sm shadow-gray-300/40">
            <table className={` w-full text-left text-sm text-zinc-300 ${className}`} {...props}>
                {children}
            </table>
        </div>
    );
};

export const TableHead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <thead className={`bg-zinc-700 text-xs uppercase text-zinc-300 border-b border-gray-600/50 ${className}`} {...props}>
            {children}
        </thead>
    );
};

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <tbody className={`divide-y divide-gray-200 bg-zinc-700 ${className}`} {...props}>
            {children}
        </tbody>
    );
};

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <tr className={`hover:bg-zinc-700 ${className}`} {...props}>
            {children}
        </tr>
    );
};

interface TableCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
    as?: 'th' | 'td';
}

export const TableCell: React.FC<TableCellProps> = ({
    children,
    className = '',
    as,
    ...props
}) => {
    const isHeader = props.scope === 'col' || as === 'th';
    const Component = isHeader ? 'th' : 'td';

    return (
        <Component
            className={`px-6 py-4 ${isHeader ? 'font-medium' : ''} ${className}`}
            {...props}
        >
            {children}
        </Component>
    );
};
