
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AccessibleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function AccessibleDialog({
  open,
  onOpenChange,
  title,
  description = "Dialog content",
  children
}: AccessibleDialogProps) {
  const descriptionId = React.useId();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={descriptionId}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        <DialogDescription id={descriptionId} className={description ? '' : 'sr-only'}>
          {description}
        </DialogDescription>
        {children}
      </DialogContent>
    </Dialog>
  );
}
