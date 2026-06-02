import React from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const patternUrl = `${import.meta.env.BASE_URL}assets/pattern-kolka.svg`;

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <Header />
      <main className="flex-1 w-full relative z-0">
        {children}
      </main>
      <Footer />

      {/* Gold kolka pattern — fixed overlay on top of everything, pointer-events disabled */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          pointerEvents: "none",
          backgroundImage: `url(${patternUrl})`,
          backgroundRepeat: "repeat",
          backgroundSize: "140px 140px",
          opacity: 0.09,
        }}
      />
    </div>
  );
}
