"use client"

import { Slider as SliderPrimitive } from "@base-ui/react/slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  "aria-label": ariaLabel,
  ...props
}: SliderPrimitive.Root.Props<number> & { "aria-label"?: string }) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn("relative flex w-full touch-none items-center select-none", className)}
      {...props}
    >
      <SliderPrimitive.Control className="flex w-full items-center py-2">
        <SliderPrimitive.Track className="neo-inset-sm relative h-2 w-full grow rounded-full">
          <SliderPrimitive.Indicator className="bg-primary/70 absolute h-full rounded-full" />
          <SliderPrimitive.Thumb
            aria-label={ariaLabel}
            className="neo-raised-sm border-background block size-4 rounded-full border bg-[var(--neo-light)] transition-transform outline-none focus-visible:scale-110 dark:bg-[color-mix(in_oklch,var(--background),white_10%)]"
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export { Slider }
