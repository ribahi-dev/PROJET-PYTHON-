import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Input = forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-secondary/30 bg-primary px-3 py-2 text-sm text-secondary placeholder:text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };
