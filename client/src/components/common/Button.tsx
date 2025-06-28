import { ButtonHTMLAttributes, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = {
  children: ReactNode;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  "w-full font-semibold py-2 rounded transition flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary";

const variants = {
  primary: "bg-primary hover:bg-black text-white",
  secondary: "bg-accent hover:bg-primary text-white",
  outline: "bg-white border border-gray-300 hover:bg-primary/10 text-black",
};

export default function Button({
  children,
  loading,
  variant = "primary",
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={twMerge(
        base,
        variants[variant],
        disabled || loading ? "opacity-60 cursor-not-allowed" : "",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></span>
      ) : null}
      {children}
    </button>
  );
}
