"use client"
import * as React from "react"
import { motion } from "framer-motion"

import { BootScreen } from "@/components/boot-screen"
import { MusicPlayer } from "@/components/music-player"
import useScrambleText from "@/hooks/use-scramble-text"
import CassetteIcon from "@/components/icons/cassette"

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
      <div className="flex min-h-svh flex-col p-4 sm:p-8">
        <motion.header
          className="fixed"
          initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
          animate={
            hasBooted
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: -6, filter: "blur(4px)" }
          }
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="flex items-center gap-[0.4em] text-base font-bold tracking-[0.3em] text-neo-led-dim sm:text-xl sm:tracking-[0.4em]">
            <CassetteIcon />
            <h1 className="hidden sm:flex">
              WALKMAN<span className="text-neo-led">::</span>117
            </h1>
          </div>
          {/* <p className="mt-1 font-mono text-[9px] tracking-[0.3em] text-muted-foreground/50">
            PERSONAL STEREO
          </p> */}
        </motion.header>
        <div className="flex flex-1 items-center justify-center">
          <MusicPlayer hasBooted={hasBooted} />
        </div>
        <footer className="pb-2 text-center font-semibold">
          <p className="text-[0.5rem] tracking-[0.2em] text-muted-foreground/60 sm:text-[0.65rem]">
            WALKMAN <span className="text-neo-led">::</span> 117 | CRAFTED BY{" "}
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
