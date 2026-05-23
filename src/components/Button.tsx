import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cx } from "../utils/classNames";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "ghost"
  | "outline";

type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary/40";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
  secondary:
    "border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/85",
  success:
    "border-success bg-success text-success-foreground hover:bg-success/90",
  danger: "border-danger bg-danger text-danger-foreground hover:bg-danger/90",
  warning:
    "border-warning bg-warning text-warning-foreground hover:bg-warning/90",
  ghost:
    "border-transparent bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
  outline:
    "border-border bg-card text-card-foreground hover:bg-secondary hover:text-secondary-foreground",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3",
  md: "h-10 px-4",
  lg: "h-11 px-5",
  icon: "h-9 w-9 p-0",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon,
      className,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cx(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
