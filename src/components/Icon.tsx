import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";
import { ComponentType } from "react";

export default function Icon({
  name,
  className,
  strokeWidth = 1.75,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const LucideIcon =
    (Icons as unknown as Record<string, ComponentType<LucideProps>>)[name] || Icons.Circle;
  return <LucideIcon className={className} aria-hidden="true" strokeWidth={strokeWidth} />;
}
