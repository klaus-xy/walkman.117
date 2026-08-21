"use client"

import * as React from "react"

import { useAudioAnalyser } from "@/hooks/use-audio-analyser"
import { cn } from "@/lib/utils"

const COLUMN_COUNT = 24
const DEFAULT_ROWS = 2
const REST_OPACITY = 0.15

interface AudioVisualizerDotsProps {
  audioRef: React.RefObject<HTMLAudioElement | null>
  isPlaying: boolean
  /** Mirror which frequency bin feeds which column (bass on the right instead of the left). */
  reverse?: boolean
  /** How many dots tall each column is — more rows means finer amplitude resolution per bin. */
  rows?: number
  className?: string
}

export function AudioVisualizerDots({
  audioRef,
  isPlaying,
  reverse = false,
  rows = DEFAULT_ROWS,
  className,
}: AudioVisualizerDotsProps) {
  // dotRefs[column][row], row 0 is the bottom dot.
  const dotRefs = React.useRef<(HTMLSpanElement | null)[][]>(
    Array.from({ length: COLUMN_COUNT }, () => [])
  )
  const rafRef = React.useRef<number | null>(null)
  const { analyserRef, audioContextRef } = useAudioAnalyser(audioRef)

  const setColumnLit = React.useCallback((column: number, litCount: number) => {
    dotRefs.current[column].forEach((dot, row) => {
      if (dot) dot.style.opacity = row < litCount ? "1" : String(REST_OPACITY)
    })
  }, [])

  React.useEffect(() => {
    const analyser = analyserRef.current
    const audioContext = audioContextRef.current
    if (!analyser || !audioContext) return

    if (!isPlaying) {
      for (let i = 0; i < COLUMN_COUNT; i++) setColumnLit(i, 0)
      return
    }

    audioContext.resume()
    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const tick = () => {
      analyser.getByteFrequencyData(dataArray)
      for (let i = 0; i < COLUMN_COUNT; i++) {
        const binIndex = reverse ? COLUMN_COUNT - 1 - i : i
        const amplitude = dataArray[binIndex] / 255
        setColumnLit(i, Math.round(amplitude * rows))
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying, reverse, rows, analyserRef, audioContextRef, setColumnLit])

  return (
    <div
      className={cn(
        "neo-inset-sm flex h-3.5 min-w-0 flex-1 items-center justify-between gap-0.5 overflow-hidden rounded-full px-1.5 sm:h-4",
        className
      )}
    >
      {Array.from({ length: COLUMN_COUNT }).map((_, col) => (
        <div
          key={col}
          className="gap-0.15 flex min-w-0 flex-1 flex-col-reverse items-center"
        >
          {Array.from({ length: rows }).map((_, row) => (
            <span
              key={row}
              ref={(el) => {
                dotRefs.current[col][row] = el
              }}
              className="size-0.75 rounded-full transition-opacity duration-75 ease-out"
              style={{
                backgroundColor: "var(--neo-led)",
                opacity: REST_OPACITY,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
