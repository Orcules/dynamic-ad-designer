
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
import { VisuallyHidden } from '@/components/ui/visually-hidden';

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
  hideTitle = false,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: React.ReactNode; // Making title required
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hideTitle?: boolean;
}) {
  const descriptionId = useDialogDescriptionId();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent aria-describedby={descriptionId}>
        <DialogHeader>
          {hideTitle ? (
            <VisuallyHidden>
              <DialogTitle>{title}</DialogTitle>
            </VisuallyHidden>
          ) : (
            <DialogTitle>{title}</DialogTitle>
          )}
        </DialogHeader>
        
        {/* Always provide a description for screen readers */}
        <DialogDescription id={descriptionId} className={description ? "" : "sr-only"}>
          {description || "This dialog contains content related to the current action"}
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
