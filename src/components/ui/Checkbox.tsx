import React from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            ref={ref}
            type="checkbox"
            className={cn(
              "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded",
              error && "border-red-500",
              className
            )}
            {...props}
          />
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
