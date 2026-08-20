"use client"

// THIS IS A HOOK THAT TAKES IN STRINGS OF TEXTS AN PRINTS IT WITH THE MORPHING/SCRAMBLE EFFECT.
import { useEffect, useState } from "react"

// Pool of "scamble" characters used to simulate the scramble effect
const DEFAULT_CHARS = "!<>-_\\/[]{}—=+*^?#________"

// Characters matching this pattern are always shown as-is and never scrambled.
const DEFAULT_PRESERVE_PATTERN = /[^a-zA-Z0-9]/

interface UseScrambleTextProps {
  text: string
  chars?: string
  scrambleSpeed?: number
  revealSpeed?: number
  preservePattern?: RegExp
}

const useScrambleText = ({
  text,
  chars = DEFAULT_CHARS,
  scrambleSpeed = 50,
  revealSpeed = 3,
  preservePattern = DEFAULT_PRESERVE_PATTERN,
}: UseScrambleTextProps) => {
  const scramble = (revealedCount: number) =>
    text
      .split("")
      .map((char, i) => {
        if (preservePattern.test(char)) return char
        if (i < revealedCount) return char
        return chars[Math.floor(Math.random() * chars.length)]
      })
      .join("")

  // Lazy initializer so the very first paint is already scrambled,
  // instead of flashing the plain `text` before the interval's first tick.
  const [scrambledText, setScrambledText] = useState(() => scramble(0))
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let frame = 0
    setIsComplete(false)
    setScrambledText(scramble(0))

    const interval = setInterval(() => {
      frame++
      const revealedCount = Math.floor(frame / revealSpeed) // Tracks how many characters have been revealed.

      setScrambledText(scramble(revealedCount))

      if (revealedCount >= text.length) {
        clearInterval(interval)
        setIsComplete(true)
      }
    }, scrambleSpeed)

    return () => clearInterval(interval)
  }, [text, chars, scrambleSpeed, revealSpeed, preservePattern])

  return { scrambledText, isComplete }
}

export default useScrambleText
