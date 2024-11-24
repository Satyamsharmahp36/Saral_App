// components/ui/sparkles.tsx
"use client";
import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container, Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

type SparklesProps = {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
};

export const SparklesCore = (props: SparklesProps) => {
  const {   
    id = "tsparticles",
    background = "transparent",
    minSize = 0.6,
    maxSize = 1.4,
    particleDensity = 100,
    className = "",
    particleColor = "#FFFFFF"
  } = props;

  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container) => {
    console.log(container);
  };

  if (init) {
    return (
      <Particles
        id={id}
        className={className}
        particlesLoaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: background,
            },
          },
          particles: {
            number: {
              density: {
                enable: true,
                area: particleDensity,
              },
            },
            color: {
              value: particleColor,
            },
            shape: {
              type: "circle",
            },
            opacity: {
              value: 1,
            },
            size: {
              value: { min: minSize, max: maxSize },
            },
            move: {
              enable: true,
              speed: 1,
              random: false,
            },
          },
        }}
      />
    );
  }

  return <></>;
};