export default function GoldFrame({ children, className = "", tone = "light" }) {
  const border = tone === "dark" ? "border-white/10 bg-navy-900" : "border-navy-950/10 bg-white";
  return <div className={`rounded-md border ${border} ${className}`}>{children}</div>;
}
