import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { AssistantAwareLink } from '@/features/ai-assistant/navigation';

type CategoryCardProps = {
  href: string;
  icon: LucideIcon;
  label: string;
};

export function CategoryCard({ href, icon: Icon, label }: CategoryCardProps) {
  return (
    <AssistantAwareLink
      className="group flex aspect-square h-auto w-full min-w-32 max-w-32 flex-none flex-col items-center justify-center gap-5 bg-transparent p-2 text-center text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 sm:min-w-40 sm:max-w-40 md:min-w-0 md:max-w-none md:max-h-40 hover:bg-primary focus-visible:bg-primary"
      href={href}
    >
      <Icon aria-hidden="true" className="size-14 stroke-1 text-foreground/70 sm:size-16" />
      <span className="flex items-center gap-2 pb-2 font-button text-sm font-medium text-foreground/70">
        {label}
        <ArrowUpRight aria-hidden="true" className="size-4 stroke-2 text-foreground/70" />
      </span>
    </AssistantAwareLink>
  );
}
