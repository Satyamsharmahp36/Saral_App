// components/ui/background-gradient.tsx
"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [borderRadius, setBorderRadius] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setOpacity(1);
      setBorderRadius(16);
    }, 100);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full overflow-hidden",
        containerClassName
      )}
      onMouseMove={handleMouseMove}
    >
      <div
        className={cn(
          "group relative z-10 h-full w-full overflow-hidden bg-black/[0.96]",
          className
        )}
        style={{
          borderRadius: `${borderRadius}px`,
          opacity,
          transition: "border-radius 500ms, opacity 500ms",
        }}
      >
        {children}
      </div>
      {animate && (
        <div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,182,255,.1), transparent 40%)`,
          }}
        />
      )}
    </div>
  );
};