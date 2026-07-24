import * as Icons from "lucide-react";

export default function Icon({ name, className }) {
  const LucideIcon = Icons[name] || Icons.Circle;
  return <LucideIcon className={className} aria-hidden="true" strokeWidth={1.75} />;
}
