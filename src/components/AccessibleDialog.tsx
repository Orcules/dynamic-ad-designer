
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * This is a simple export that re-exports the dialog components.
 * Use this in your application code to automatically include an accessible description.
 */
export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
};

/**
 * Helper function to create a dialog description ID
 */
export function useDialogDescriptionId() {
  return React.useId();
}

/**
 * Simple component that adds a visually hidden description to dialogs
 * for accessibility purposes
 */
export function ScreenReaderDialogDescription({
  id,
  children = "Dialog content",
}: {
  id: string;
  children?: React.ReactNode;
}) {
  return (
    <DialogDescription id={id} className="sr-only">
      {children}
    </DialogDescription>
  );
}
