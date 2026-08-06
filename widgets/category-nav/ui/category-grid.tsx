import type { ReactNode } from 'react';

type CategoryGridProps = {
  children: ReactNode;
};

export function CategoryGrid({ children }: CategoryGridProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-[repeat(auto-fit,minmax(0,1fr))] md:overflow-visible">
      {children}
    </div>
  );
}
