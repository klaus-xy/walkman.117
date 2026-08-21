"use client"

import * as React from "react"

import { useAudioAnalyser } from "@/hooks/use-audio-analyser"
import { cn } from "@/lib/utils"

const BAR_COUNT = 24
const REST_SCALE = 0.12

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>
  isPlaying: boolean
  className?: string
}

export function AudioVisualizer({
  audioRef,
  isPlaying,
  className,
}: AudioVisualizerProps) {
  const barRefs = React.useRef<(HTMLSpanElement | null)[]>([])
  const rafRef = React.useRef<number | null>(null)
  const { analyserRef, audioContextRef } = useAudioAnalyser(audioRef)

  React.useEffect(() => {
    const analyser = analyserRef.current
    const audioContext = audioContextRef.current
    if (!analyser || !audioContext) return

    if (!isPlaying) {
      barRefs.current.forEach((bar) => {
        if (bar) bar.style.transform = `scaleY(${REST_SCALE})`
      })
      return
    }

    audioContext.resume()
    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const tick = () => {
      analyser.getByteFrequencyData(dataArray)
      barRefs.current.forEach((bar, i) => {
        if (!bar) return
        const scale = Math.max(dataArray[i] / 255, REST_SCALE)
        bar.style.transform = `scaleY(${scale})`
      })
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying])

  return (
    <div
      className={cn(
        "neo-inset-sm flex h-3 flex-1 items-center gap-[2px] overflow-hidden rounded-full px-1.5",
        className
      )}
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            barRefs.current[i] = el
          }}
          className="h-full flex-1 rounded-full transition-transform duration-75 ease-out will-change-transform"
          style={{
            backgroundColor: "var(--neo-led)",
            transform: `scaleY(${REST_SCALE})`,
          }}
        />
      ))}
    </div>
  )
}
