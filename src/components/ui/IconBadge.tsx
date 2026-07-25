import Icon from "@/components/Icon";

const SIZES = {
  md: { wrap: "h-11 w-11", icon: "h-5 w-5" },
  lg: { wrap: "h-12 w-12", icon: "h-6 w-6" },
};

export default function IconBadge({ icon, size = "md", tone = "light", className = "" }) {
  const s = SIZES[size] || SIZES.md;
  const colors =
    tone === "dark" ? "bg-gold-400/15 text-gold-300" : "bg-gold-400/12 text-gold-600";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg ${colors} ${s.wrap} ${className}`}
    >
      <Icon name={icon} className={s.icon} />
    </span>
  );
}
