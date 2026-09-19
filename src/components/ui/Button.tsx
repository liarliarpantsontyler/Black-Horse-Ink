import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "bg-accent text-background hover:bg-accent/90 focus-visible:ring-accent/60",
  secondary:
    "border border-border text-foreground hover:bg-surface-elevated focus-visible:ring-foreground/30",
  ghost: "text-foreground/80 hover:text-foreground hover:bg-surface-elevated",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", fullWidth, className = "", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={[
        "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50",
        styles[variant],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    />
  );
});
