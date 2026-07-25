import Link from "next/link";
import { ComponentType, ReactNode } from "react";

const VARIANTS = {
  primary: "bg-gold-400 text-navy-950 hover:bg-gold-500 shadow-md shadow-gold-900/10",
  outline: "border border-white/30 text-white hover:bg-white/10",
  dark: "bg-navy-900 text-white border border-white/10 hover:bg-navy-800",
  ghost: "text-navy-900 hover:bg-navy-950/5 border border-navy-950/15",
};

const SIZES = {
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-[15px]",
};

export default function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  icon: IconEl,
  className = "",
  ...props
}: {
  href?: string;
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  icon?: ComponentType<{ className?: string; strokeWidth?: number }>;
  className?: string;
  [key: string]: any;
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-200 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (href) {
    const isExternal = href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:");
    if (isExternal) {
      return (
        <a href={href} className={classes} {...props}>
          {IconEl && <IconEl className="h-4 w-4" strokeWidth={2} />}
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...props}>
        {IconEl && <IconEl className="h-4 w-4" strokeWidth={2} />}
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {IconEl && <IconEl className="h-4 w-4" strokeWidth={2} />}
      {children}
    </button>
  );
}
