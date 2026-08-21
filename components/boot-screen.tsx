"use client"

import * as React from "react"

import useScrambleText from "@/hooks/use-scramble-text"
import { cn } from "@/lib/utils"

const BOOT_MS = 1700
const FADE_MS = 1000

interface BootScreenProps {
  children: React.ReactNode
  /** Fires once, right as the boot overlay starts fading out. */
  onBooted?: () => void
}

export function BootScreen({ children, onBooted }: BootScreenProps) {
  const [booted, setBooted] = React.useState(false)
  const [hidden, setHidden] = React.useState(false)
  const { scrambledText, isComplete } = useScrambleText({
    text: "WALKMAN // 117",
    chars: "::",
    scrambleSpeed: 80,
    revealSpeed: 2,
  })

  const onBootedRef = React.useRef(onBooted)
  onBootedRef.current = onBooted

  React.useEffect(() => {
    if (!isComplete) return
    const bootTimer = setTimeout(() => {
      setBooted(true)
      onBootedRef.current?.()
    }, BOOT_MS)
    return () => clearTimeout(bootTimer)
  }, [isComplete])

  React.useEffect(() => {
    if (!booted) return
    const hideTimer = setTimeout(() => setHidden(true), FADE_MS)
    return () => clearTimeout(hideTimer)
  }, [booted])

  return (
    <>
      {children}
      {!hidden && (
        <div
          aria-hidden="true"
          style={{ transitionDuration: booted ? `${FADE_MS}ms` : "0ms" }}
          className={cn(
            "fixed inset-0 z-100 flex flex-col items-center justify-center gap-6 bg-background transition-[opacity,filter] ease-out",
            booted
              ? "pointer-events-none opacity-0 blur-xl"
              : "opacity-100 blur-none"
          )}
        >
          <span
            style={{ transitionDuration: booted ? `${FADE_MS}ms` : "0ms" }}
            className={cn(
              "flex gap-[0.3em] text-2xl font-bold text-muted-foreground transition-[opacity,filter,transform] ease-out",
              booted
                ? "-translate-y-1 opacity-0 blur-sm"
                : "translate-y-0 opacity-100 blur-none"
            )}
          >
            {scrambledText.split("").map((char, i) => (
              <span key={i} className="inline-block w-[0.75em] text-center">
                {char}
              </span>
            ))}
          </span>
        </div>
      )}
    </>
  )
}
