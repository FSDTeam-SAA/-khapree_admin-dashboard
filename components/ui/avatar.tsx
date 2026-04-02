import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

type AvatarProps = {
  src?: string | null;
  alt?: string;
  name?: string | null;
  className?: string;
  fallbackClassName?: string;
};

export function Avatar({
  src,
  alt,
  name,
  className,
  fallbackClassName,
}: AvatarProps) {
  const initials = getInitials(name);

  if (src) {
    return (
      <div className={cn("relative overflow-hidden rounded-full", className)}>
        <Image src={src} alt={alt || name || "Avatar"} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-app-primary/15 text-sm font-semibold text-app-primary",
        className,
        fallbackClassName,
      )}
    >
      {initials}
    </div>
  );
}

