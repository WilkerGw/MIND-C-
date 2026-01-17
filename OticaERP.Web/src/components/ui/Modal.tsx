import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 sm:p-6" aria-modal="true" role="dialog">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Content */}
            <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8">
                {title && (
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 sm:px-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            {title}
                        </h3>
                    </div>
                )}

                <div className="px-4 py-5 sm:p-6">
                    {children}
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={onClose}
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};
