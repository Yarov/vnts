import React, { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
}

/**
 * Modal component built with Tailwind CSS, no dependencies needed
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  footer,
  showCloseButton = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.body.style.overflow = 'unset'; // Re-enable scrolling when modal is closed
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);
  
  // Close when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size];
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/25"
      onClick={handleBackdropClick}
      aria-labelledby={title}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div 
          ref={modalRef}
          className={`w-full ${sizeClasses} transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all`}
        >
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* Body */}
          <div className="px-6 py-4">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-2">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
