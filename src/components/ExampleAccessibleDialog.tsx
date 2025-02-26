
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';

/**
 * An example of how to create accessible dialogs
 * To use this pattern:
 * 1. Create a unique ID for the description
 * 2. Add aria-describedby attribute to DialogContent
 * 3. Add DialogDescription with matching ID (can be visually hidden with sr-only)
 */
export function ExampleAccessibleDialog() {
  const [open, setOpen] = React.useState(false);
  const descriptionId = React.useId();
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">פתח דיאלוג נגיש</Button>
      </DialogTrigger>
      <DialogContent aria-describedby={descriptionId}>
        <DialogHeader>
          <DialogTitle>דיאלוג לדוגמה</DialogTitle>
        </DialogHeader>
        
        {/* This provides the description for screen readers */}
        <DialogDescription id={descriptionId} className="sr-only">
          תיאור של הדיאלוג לטכנולוגיות מסייעות
        </DialogDescription>
        
        <div className="p-4">
          תוכן הדיאלוג
        </div>
        
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>סגור</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
