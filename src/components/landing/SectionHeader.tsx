import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: React.ReactNode;
  subtitle: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, className }: SectionHeaderProps) {
  return (
    <div className={cn("text-center max-w-4xl mx-auto", className)}>
      <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
        {title}
      </h2>
      <p className="mt-4 text-lg md:text-xl text-muted-foreground">
        {subtitle}
      </p>
    </div>
  );
}
