
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ExampleAccessibleDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * דוגמה לדיאלוג נגיש שמיישם כראוי את תכונות ה-aria
 */
export function ExampleAccessibleDialog({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  onOpenChange
}: ExampleAccessibleDialogProps) {
  const descriptionId = React.useId();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      <DialogContent aria-describedby={descriptionId}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id={descriptionId}>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {children}
        </div>
        
        {footer && (
          <DialogFooter>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ExampleAccessibleDialog;
