import React, { useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  useEffect(() => {
    const patternUrl = `${import.meta.env.BASE_URL}assets/pattern-kolka.svg`;
    document.documentElement.style.setProperty("--kolka-url", `url("${patternUrl}")`);
  }, []);

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <Header />
      <main className="flex-1 w-full relative z-0">
        {children}
      </main>
      <Footer />
    </div>
  );
}
