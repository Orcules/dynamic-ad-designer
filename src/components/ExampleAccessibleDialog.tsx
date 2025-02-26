
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useDialogDescriptionId, ScreenReaderDialogDescription } from './AccessibleDialog';

export function ExampleAccessibleDialog() {
  const [open, setOpen] = React.useState(false);
  const descriptionId = useDialogDescriptionId();
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent aria-describedby={descriptionId}>
        <DialogHeader>
          <DialogTitle>Example Dialog</DialogTitle>
        </DialogHeader>
        
        {/* This provides the description for screen readers */}
        <ScreenReaderDialogDescription id={descriptionId}>
          This dialog lets you configure settings.
        </ScreenReaderDialogDescription>
        
        <div className="p-4">
          Dialog content goes here
        </div>
        
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
