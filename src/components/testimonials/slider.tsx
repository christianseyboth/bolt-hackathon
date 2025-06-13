"use client";

import { useState, useRef, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
import { Transition } from "@headlessui/react";
import { SparklesCore } from "../ui/sparkles";
import { testimonials as pageTestimonials } from "@/constants/page-testimonials";
import { cn } from "@/lib/utils";
// import Particles from './particles'

interface Item {
  src: StaticImageData;
  quote: string;
  name: string;
  designation?: string;
}

export const TestimonialsSlider = () => {
  const [active, setActive] = useState<number>(0);
  const [autorotate, setAutorotate] = useState<boolean>(true);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  const testimonials = pageTestimonials.slice(0, 3);

  useEffect(() => {
    if (!autorotate) return;
    const interval = setInterval(() => {
      setActive(
        active + 1 === testimonials.length ? 0 : (active) => active + 1
      );
    }, 7000);
    return () => clearInterval(interval);
  }, [active, autorotate, testimonials.length]);

  const heightFix = () => {
    if (testimonialsRef.current && testimonialsRef.current.parentElement)
      testimonialsRef.current.parentElement.style.height = `${testimonialsRef.current.clientHeight}px`;
  };

  useEffect(() => {
    heightFix();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        heightFix();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <section>
      <div className="max-w-4xl mx-auto relative z-40 px-6">
        <div className="relative pb-8 md:pb-12">
          {/* Subtle particles animation */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 -z-10 w-96 h-32 -mt-6">
            <SparklesCore
              id="testimonials-particles"
              background="transparent"
              minSize={0.3}
              maxSize={0.8}
              particleDensity={60}
              className="w-full h-full"
              particleColor="#10b981"
            />
          </div>

          {/* Carousel */}
          <div className="text-center">
            {/* Testimonial image */}
            <div className="relative h-28 mb-6">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-30 h-30 -z-10 pointer-events-none rounded-full bg-gradient-to-b from-emerald-500/20 to-transparent p-1">
                {testimonials.map((item, index) => (
                  <Transition
                    key={index}
                    show={active === index}
                    enter="transition ease-[cubic-bezier(0.68,-0.3,0.32,1)] duration-700 order-first"
                    enterFrom="opacity-0 -rotate-[60deg]"
                    enterTo="opacity-100 rotate-0"
                    leave="transition ease-[cubic-bezier(0.68,-0.3,0.32,1)] duration-700"
                    leaveFrom="opacity-100 rotate-0"
                    leaveTo="opacity-0 rotate-[60deg]"
                    beforeEnter={() => heightFix()}
                  >
                    <div className="absolute inset-0 h-full flex items-center justify-center">
                      <Image
                        className="rounded-full border-1 border-emerald-500/30"
                        src={item.src}
                        width={72}
                        height={72}
                        alt={item.name}
                      />
                    </div>
                  </Transition>
                ))}
              </div>
            </div>
            {/* Text */}
            <div className="mb-8 transition-all duration-150 delay-300 ease-in-out px-4 sm:px-6">
              <div className="relative flex flex-col min-h-[120px]" ref={testimonialsRef}>
                {testimonials.map((item, index) => (
                  <Transition
                    key={index}
                    show={active === index}
                    enter="transition ease-in-out duration-500 delay-200 order-first"
                    enterFrom="opacity-0 -translate-x-4"
                    enterTo="opacity-100 translate-x-0"
                    leave="transition ease-out duration-300 delay-300 absolute"
                    leaveFrom="opacity-100 translate-x-0"
                    leaveTo="opacity-0 translate-x-4"
                    beforeEnter={() => heightFix()}
                  >
                    <blockquote className="text-lg md:text-xl font-medium text-neutral-200 text-center leading-relaxed">
                      "{item.quote}"
                    </blockquote>
                  </Transition>
                ))}
              </div>
            </div>
            {/* Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 sm:px-6">
              {testimonials.map((item, index) => (
                <button
                  className={cn(
                    "px-4 py-3 rounded-lg border transition-all duration-200 text-left w-full sm:w-auto",
                    active === index
                      ? "border-emerald-500/50 bg-emerald-500/10 text-neutral-200"
                      : "border-zinc-700 bg-zinc-800/30 text-neutral-400 hover:border-emerald-500/30 hover:bg-emerald-500/5"
                  )}
                  key={index}
                  onClick={() => {
                    setActive(index);
                    setAutorotate(false);
                  }}
                >
                  <div className="font-medium text-sm">
                    {item.name}
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    {item.designation}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
