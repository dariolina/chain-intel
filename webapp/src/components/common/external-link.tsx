import { ExternalLink as Icon } from "lucide-react";

export function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      <Icon className="ml-1 inline h-3.5 w-3.5 align-text-bottom opacity-70" aria-hidden />
    </a>
  );
}
