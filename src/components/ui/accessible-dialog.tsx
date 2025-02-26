
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

type AccessibleDialogProps = {
  trigger: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/**
 * An accessible dialog component that properly implements aria attributes
 * for screen readers and other assistive technologies.
 */
export function AccessibleDialog({
  trigger,
  title,
  description,
  children,
  footer,
  open,
  onOpenChange
}: AccessibleDialogProps) {
  // Generate a unique ID for this dialog instance
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

/**
 * דוגמה לשימוש ברכיב הדיאלוג הנגיש
 */
export const ExampleAccessibleDialogUsage = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <AccessibleDialog
      trigger={<Button variant="outline">פתח דיאלוג נגיש</Button>}
      title="כותרת הדיאלוג"
      description="זהו תיאור הדיאלוג שמתאר את תוכנו והשימוש בו"
      open={open}
      onOpenChange={setOpen}
      footer={
        <Button onClick={() => setOpen(false)}>סגור</Button>
      }
    >
      <p>זהו תוכן הדיאלוג שמופיע בחלק המרכזי.</p>
      <p>ניתן להוסיף כל תוכן שהוא כאן, כולל טפסים ואלמנטים אינטראקטיביים.</p>
    </AccessibleDialog>
  );
};

export default AccessibleDialog;
