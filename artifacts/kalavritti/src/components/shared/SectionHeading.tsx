import React from "react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeading({ title, subtitle, className = "" }: SectionHeadingProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      <div className="flex items-center gap-4 w-full justify-center mb-4">
        <div className="h-[1px] bg-gold flex-1 max-w-[100px] opacity-50"></div>
        <h2 className="font-serif text-3xl md:text-4xl text-maroon-dark dark:text-cream">{title}</h2>
        <div className="h-[1px] bg-gold flex-1 max-w-[100px] opacity-50"></div>
      </div>
      {subtitle && <p className="text-maroon-dark/65 dark:text-cream/65 text-sm max-w-2xl">{subtitle}</p>}
    </div>
  );
}
