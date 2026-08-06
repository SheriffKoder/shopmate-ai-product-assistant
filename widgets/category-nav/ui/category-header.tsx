type CategoryHeaderProps = {
  id: string;
  title: string;
};

export function CategoryHeader({ id, title }: CategoryHeaderProps) {
  return (
    <header>
      <h2 id={id} className="text-2xl leading-tight text-foreground sm:text-3xl">
        {title}
      </h2>
    </header>
  );
}
