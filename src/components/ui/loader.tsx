"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@/components/providers/gsap-provider";
import { Logo } from "../common/Logo";

export function FullScreenLoader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gsap = useGSAP();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const logoA = container.querySelector(".logo-a");
    const dots = gsap.utils.toArray<SVGElement>(".dot");

    gsap.set(container, { autoAlpha: 1 });
    gsap.set(logoA, { y: -50, autoAlpha: 0 });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });

    tl.to(logoA, {
      y: 0,
      autoAlpha: 1,
      duration: 0.8,
      ease: "power2.out",
    })
      .to(
        dots,
        {
          scaleY: 0.4,
          scaleX: 1.2,
          y: "-=10",
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut",
          stagger: {
            each: 0.1,
            from: "center",
          },
        },
        "-=0.5"
      )
      .to(logoA, {
        y: 50,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power2.in",
      });
  }, [gsap]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full flex flex-col items-center justify-center bg-background fixed inset-0 z-50"
      style={{ opacity: 0 }}
    >
      <div className="relative w-24 h-24 flex items-center justify-center">
        <Logo width={100} height={100} />
      </div>
      <div className="flex space-x-2 mt-4" aria-label="Loading content">
        <span className="sr-only">Loading...</span>
        <svg className="dot h-3 w-3" viewBox="0 0 10 10">
          <circle
            cx="5"
            cy="5"
            r="5"
            className="fill-current text-primary/30"
          />
        </svg>
        <svg className="dot h-3 w-3" viewBox="0 0 10 10">
          <circle
            cx="5"
            cy="5"
            r="5"
            className="fill-current text-primary/50"
          />
        </svg>
        <svg className="dot h-3 w-3" viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="5" className="fill-current text-primary" />
        </svg>
        <svg className="dot h-3 w-3" viewBox="0 0 10 10">
          <circle
            cx="5"
            cy="5"
            r="5"
            className="fill-current text-primary/50"
          />
        </svg>
        <svg className="dot h-3 w-3" viewBox="0 0 10 10">
          <circle
            cx="5"
            cy="5"
            r="5"
            className="fill-current text-primary/30"
          />
        </svg>
      </div>
      <p className="mt-4 text-muted-foreground font-medium">
        Connecting to AgriConnect...
      </p>
    </div>
  );
}
