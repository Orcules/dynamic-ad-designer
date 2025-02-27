
import React, { useId } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/accessible-dialog';

/**
 * Helper function to create a dialog description ID
 */
export function useDialogDescriptionId() {
  return useId();
}

/**
 * This component provides an accessible dialog with all necessary aria attributes
 */
export function AccessibleDialog({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  footer,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const descriptionId = useDialogDescriptionId();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent aria-describedby={descriptionId}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        
        {/* Always provide a description for screen readers */}
        <DialogDescription id={descriptionId} className={description ? "" : "sr-only"}>
          {description || "Dialog content"}
        </DialogDescription>
        
        <div className="py-2">{children}</div>
        
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Re-exports the base dialog components with proper accessibility
 */
export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
};
