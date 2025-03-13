
import { cn } from "@/lib/utils";
import React from "react";

interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {}

/**
 * Component to hide content visually while keeping it accessible to screen readers
 */
export const VisuallyHidden = React.forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "absolute w-px h-px p-0 -m-px overflow-hidden clip-rect whitespace-nowrap border-0",
          className
        )}
        style={{
          clip: "rect(0, 0, 0, 0)",
          clipPath: "inset(50%)",
          overflow: "hidden",
          whiteSpace: "nowrap"
        }}
        {...props}
      />
    );
  }
);
VisuallyHidden.displayName = "VisuallyHidden";
