import * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "@/shared/lib/utils"

interface CheckboxProps extends React.ComponentPropsWithoutRef<"input"> {
  className?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    const [checked, setChecked] = React.useState(props.checked || false);

    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          ref={ref}
          className="sr-only peer"
          checked={checked}
          onChange={(e) => {
            setChecked(e.target.checked);
            props.onChange?.(e);
          }}
          {...props}
        />
        <div
          className={cn(
            "h-4 w-4 shrink-0 rounded-sm border border-primary shadow-sm",
            "flex items-center justify-center",
            "peer-focus-visible:outline-none peer-focus-visible:ring-1 peer-focus-visible:ring-ring",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            checked && "bg-primary text-primary-foreground",
            !checked && "bg-background",
            className
          )}
        >
          {checked && <CheckIcon className="h-3 w-3" />}
        </div>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };

