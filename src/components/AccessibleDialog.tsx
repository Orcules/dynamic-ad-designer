
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

interface AccessibleDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * קומפוננט דיאלוג נגיש שמיישם את כל תכונות ה-aria הדרושות
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
 * דוגמת שימוש בדיאלוג נגיש
 */
export function ExampleAccessibleDialog() {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <AccessibleDialog
      trigger={<Button>פתח דיאלוג נגיש</Button>}
      title="כותרת הדיאלוג"
      description="תיאור קצר של מטרת הדיאלוג. טקסט זה יקרא על ידי קוראי מסך."
      open={isOpen}
      onOpenChange={setIsOpen}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>ביטול</Button>
          <Button onClick={() => setIsOpen(false)}>אישור</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p>
          זו דוגמה לתוכן דיאלוג נגיש שמיישם בצורה נכונה את מאפייני ה-ARIA.
          הדיאלוג כולל קישור בין תיאור הדיאלוג לתוכן עצמו באמצעות aria-describedby.
        </p>
        <p>
          כל רכיבי הדיאלוג מוגדרים כראוי כדי להבטיח חוויה טובה למשתמשים עם טכנולוגיות מסייעות.
        </p>
      </div>
    </AccessibleDialog>
  );
}

export default AccessibleDialog;
