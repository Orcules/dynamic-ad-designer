
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    // Create a ref to track if the textarea is focused
    const focusRef = React.useRef<boolean>(false);

    // Handle focus events to ensure parent containers don't use aria-hidden
    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      focusRef.current = true;
      // Call the original onFocus handler if it exists
      if (props.onFocus) {
        props.onFocus(e);
      }

      // Find parent elements with aria-hidden and temporarily remove it
      let parent = e.currentTarget.parentElement;
      while (parent) {
        if (parent.getAttribute('aria-hidden') === 'true') {
          parent.setAttribute('data-previous-aria-hidden', 'true');
          parent.removeAttribute('aria-hidden');
        }
        parent = parent.parentElement;
      }
    };

    // Handle blur events to restore aria-hidden
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      focusRef.current = false;
      // Call the original onBlur handler if it exists
      if (props.onBlur) {
        props.onBlur(e);
      }

      // Restore aria-hidden to elements that had it before
      setTimeout(() => {
        let parent = e.currentTarget.parentElement;
        while (parent) {
          if (parent.getAttribute('data-previous-aria-hidden') === 'true') {
            parent.setAttribute('aria-hidden', 'true');
            parent.removeAttribute('data-previous-aria-hidden');
          }
          parent = parent.parentElement;
        }
      }, 0);
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
