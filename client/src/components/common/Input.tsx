import { InputHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type InputProps = {
  error?: string;
  label?: string;
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className, ...props }, ref) => (
    <div>
      {label && (
        <label className="block text-sm font-medium text-black mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={twMerge(
          "w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white text-black dark:bg-white dark:text-black",
          error ? "border-error" : "border-gray-300",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-error">{error}</span>}
    </div>
  )
);

export default Input;
