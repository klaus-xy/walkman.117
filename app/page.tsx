"use client"
import * as React from "react"

import { BootScreen } from "@/components/boot-screen"
import { MusicPlayer } from "@/components/music-player"
import useScrambleText from "@/hooks/use-scramble-text"

// Mounted fresh only once boot finishes, so its scramble animation starts
// right then instead of already being resolved by the time it's visible.
function ScrambledName() {
  const { scrambledText } = useScrambleText({
    text: "KLAUS117",
    chars: "KLAUS117:",
    scrambleSpeed: 80,
    revealSpeed: 3,
  })
  return <>{scrambledText}</>
}

export default function Page() {
  const [hasBooted, setHasBooted] = React.useState(false)

  return (
    <BootScreen onBooted={() => setHasBooted(true)}>
      <div className="flex min-h-svh flex-col p-6">
        <div className="flex flex-1 items-center justify-center">
          <MusicPlayer />
        </div>
        <footer className="pb-2 text-center font-semibold">
          <p className="text-[0.5rem] tracking-[0.2em] text-muted-foreground/60 sm:text-[0.65rem]">
            WALKMAN.117 :: CRAFTED BY{" "}
            <a
              href="https://x.com/0xKlaus117"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-neo-led hover:underline"
            >
              {hasBooted ? <ScrambledName /> : "KLAUS117"}
            </a>
          </p>
        </footer>
      </div>
    </BootScreen>
  )
}
