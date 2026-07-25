import { forwardRef, type ReactNode } from "react";

const GoldFrame = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    className?: string;
    tone?: "light" | "dark";
    muted?: boolean;
  }
>(function GoldFrame({ children, className = "", tone = "light" }, ref) {
  const border = tone === "dark" ? "border-white/10 bg-navy-900" : "border-navy-950/10 bg-white";
  return (
    <div ref={ref} className={`rounded-md border ${border} ${className}`}>
      {children}
    </div>
  );
});

export default GoldFrame;
