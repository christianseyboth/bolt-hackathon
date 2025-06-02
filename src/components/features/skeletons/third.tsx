"use client";

import React, { useEffect } from "react";
// 1) animate + Typen aus motion (nicht aus "motion/react"!)
import { animate } from "motion";
import type { SequenceDefinition } from "motion";
import { GoCopilot } from "react-icons/go";
import {
  ClaudeLogo,
  GeminiLogo,
  MetaIconOutline,
  OpenAILogo,
} from "@/components/icons/illustrations";
import { SparklesCore } from "@/components/ui/sparkles";
import { cn } from "@/lib/utils";

export const SkeletonThree = () => {
  // 2) Deklariere sequence mit dem korrekten Typ
  const sequence: SequenceDefinition[] = [
    [
      ".circle-1",
      { scale: [1, 1.1, 1], transform: ["translateY(0px)", "translateY(-4px)", "translateY(0px)"] },
      { duration: 0.8 },
    ],
    [
      ".circle-2",
      { scale: [1, 1.1, 1], transform: ["translateY(0px)", "translateY(-4px)", "translateY(0px)"] },
      { duration: 0.8 },
    ],
    [
      ".circle-3",
      { scale: [1, 1.1, 1], transform: ["translateY(0px)", "translateY(-4px)", "translateY(0px)"] },
      { duration: 0.8 },
    ],
    [
      ".circle-4",
      { scale: [1, 1.1, 1], transform: ["translateY(0px)", "translateY(-4px)", "translateY(0px)"] },
      { duration: 0.8 },
    ],
    [
      ".circle-5",
      { scale: [1, 1.1, 1], transform: ["translateY(0px)", "translateY(-4px)", "translateY(0px)"] },
      { duration: 0.8 },
    ],
  ];

  useEffect(() => {
    // 3) Jetzt passt animate’s Signatur: Sequenz-Array + Options
    animate(sequence, {
      repeat: Infinity,
      repeatDelay: 1,
    });
  }, []);

  return (
    <div className="p-8 overflow-hidden h-full relative flex items-center justify-center">
      <div className="flex flex-row flex-shrink-0 justify-center items-center gap-2">
        <Container className="h-8 w-8 circle-1">
          <ClaudeLogo className="h-4 w-4" />
        </Container>
        <Container className="h-12 w-12 circle-2">
          <GoCopilot className="h-6 w-6" />
        </Container>
        <Container className="circle-3">
          <OpenAILogo className="h-8 w-8" />
        </Container>
        <Container className="h-12 w-12 circle-4">
          <MetaIconOutline className="h-6 w-6" />
        </Container>
        <Container className="h-8 w-8 circle-5">
          <GeminiLogo className="h-4 w-4" />
        </Container>
      </div>

      <div className="h-40 w-px absolute top-20 m-auto z-40 bg-gradient-to-b from-transparent via-secondary to-transparent animate-move">
        <div className="w-10 h-32 top-1/2 -translate-y-1/2 absolute -left-10">
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={1200}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
        </div>
      </div>
    </div>
  );
};

const Container = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      `h-16 w-16 rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)]
        shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)]`,
      className
    )}
  >
    {children}
  </div>
);
