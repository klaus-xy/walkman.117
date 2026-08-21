"use client"

import * as React from "react"
import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
} from "framer-motion"
import {
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react"

import { useAudioAnalyser } from "@/hooks/use-audio-analyser"
import useScrambleText from "@/hooks/use-scramble-text"
import { cn } from "@/lib/utils"
import { tracks } from "@/lib/tracks"
import { AudioVisualizerDots } from "@/components/audio-visualizer-dots"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Slider } from "@/components/ui/slider"

type RepeatMode = "off" | "all" | "one"

// Stable module-level reference so the scramble effect doesn't restart on
// every render (a new RegExp literal inline would be a fresh object each time).
const TITLE_SCRAMBLE_PRESERVE_PATTERN = /[^a-zA-Z0-9!]/

function formatTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "--:--"
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function DeckButton({
  active,
  large,
  className,
  ...props
}: React.ComponentProps<"button"> & { active?: boolean; large?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-foreground transition-all outline-none",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        "active:not-disabled:translate-y-px disabled:pointer-events-none disabled:opacity-40",
        large ? "size-16" : "size-10",
        active ? "neo-inset text-primary" : "neo-raised-sm",
        className
      )}
      {...props}
    />
  )
}

const REEL_TARGET_DEG_PER_SEC = 360 / 3 // matches the previous 3s-per-revolution pace
const REEL_RAMP_SECONDS = 1.1

function Reel({ spinning }: { spinning: boolean }) {
  const rotation = useMotionValue(0)
  const velocity = useMotionValue(0)

  React.useEffect(() => {
    const controls = animate(velocity, spinning ? REEL_TARGET_DEG_PER_SEC : 0, {
      duration: REEL_RAMP_SECONDS,
      ease: "easeInOut",
    })
    return () => controls.stop()
  }, [spinning, velocity])

  useAnimationFrame((_, delta) => {
    rotation.set(rotation.get() + velocity.get() * (delta / 1000))
  })

  return (
    <div className="neo-raised neo-donut relative flex size-16 shrink-0 items-center justify-center rounded-full sm:size-20">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{ rotate: rotation }}
      >
        {[0, 45, 90, 135].map((deg) => (
          <span
            key={deg}
            className="absolute h-[65%] w-px bg-muted-foreground/25"
            style={{ transform: `rotate(${deg}deg)` }}
          />
        ))}
      </motion.div>
      <span className="neo-donut relative size-4 rounded-full bg-background" />
    </div>
  )
}

// Mounted fresh only once boot finishes, so its scramble animation starts
// right then instead of already being resolved by the time it's visible.
function ScrambledKhz({ text }: { text: string }) {
  const { scrambledText } = useScrambleText({
    text,
    chars: "0123456789",
    scrambleSpeed: 60,
    revealSpeed: 3,
  })
  return <>{scrambledText}</>
}

function StatusLed({ active, label }: { active: boolean; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span
        className="size-1.5 shrink-0 rounded-full transition-colors duration-300"
        style={{
          backgroundColor: active ? "var(--neo-led)" : "var(--neo-led-dim)",
          boxShadow: active ? "0 0 4px var(--neo-led)" : "none",
        }}
      />
      <span
        className={cn(
          "font-mono text-[9px] tracking-widest transition-colors duration-300",
          active ? "text-muted-foreground" : "text-muted-foreground/40"
        )}
      >
        {label}
      </span>
    </span>
  )
}

function NowPlayingBars() {
  return (
    <span className="flex h-3 w-3 shrink-0 items-end gap-px" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-px flex-1 rounded-full"
          style={{
            backgroundColor: "var(--neo-led)",
            animation: "eq-bounce 0.9s ease-in-out infinite",
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </span>
  )
}

export function MusicPlayer({ hasBooted = true }: { hasBooted?: boolean }) {
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const autoplayIntent = React.useRef(false)
  const { sampleRate } = useAudioAnalyser(audioRef)

  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [hasError, setHasError] = React.useState(false)
  const [volume, setVolume] = React.useState(0.75)
  const [muted, setMuted] = React.useState(false)
  const [shuffle, setShuffle] = React.useState(false)
  const [repeatMode, setRepeatMode] = React.useState<RepeatMode>("off")
  const [durations, setDurations] = React.useState<
    Record<string, number | null>
  >({})

  const currentTrack = tracks[currentIndex]
  const { scrambledText: titleText } = useScrambleText({
    text: currentTrack.title,
    chars: ":",
    scrambleSpeed: 50,
    revealSpeed: 3,
    preservePattern: TITLE_SCRAMBLE_PRESERVE_PATTERN,
  })

  React.useEffect(() => {
    const probes = tracks.map((track) => {
      const probe = new Audio()
      probe.preload = "metadata"
      const onLoaded = () =>
        setDurations((d) => ({ ...d, [track.id]: probe.duration }))
      const onError = () => setDurations((d) => ({ ...d, [track.id]: null }))
      probe.addEventListener("loadedmetadata", onLoaded)
      probe.addEventListener("error", onError)
      probe.src = track.src
      return { probe, onLoaded, onError }
    })

    return () => {
      probes.forEach(({ probe, onLoaded, onError }) => {
        probe.removeEventListener("loadedmetadata", onLoaded)
        probe.removeEventListener("error", onError)
        probe.src = ""
      })
    }
  }, [])

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    setCurrentTime(0)
    setHasError(false)
    if (autoplayIntent.current) {
      audio.play().catch(() => setIsPlaying(false))
    }
  }, [currentIndex])

  React.useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [volume])

  function playTrack(index: number) {
    autoplayIntent.current = true
    setCurrentIndex(index)
  }

  function goNext() {
    if (shuffle && tracks.length > 1) {
      let next = currentIndex
      while (next === currentIndex)
        next = Math.floor(Math.random() * tracks.length)
      playTrack(next)
      return
    }
    playTrack((currentIndex + 1) % tracks.length)
  }

  function goPrev() {
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      setCurrentTime(0)
      return
    }
    if (shuffle && tracks.length > 1) {
      let prev = currentIndex
      while (prev === currentIndex)
        prev = Math.floor(Math.random() * tracks.length)
      playTrack(prev)
      return
    }
    playTrack((currentIndex - 1 + tracks.length) % tracks.length)
  }

  function handleEnded() {
    const audio = audioRef.current
    if (repeatMode === "one" && audio) {
      audio.currentTime = 0
      audio.play().catch(() => setIsPlaying(false))
      return
    }
    const isLast = currentIndex === tracks.length - 1
    if (!shuffle && isLast && repeatMode === "off") {
      setIsPlaying(false)
      return
    }
    goNext()
  }

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      autoplayIntent.current = true
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }

  function cycleRepeat() {
    setRepeatMode((mode) =>
      mode === "off" ? "all" : mode === "all" ? "one" : "off"
    )
  }

  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat
  const VolumeIcon =
    muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <Drawer showSwipeHandle>
      <div className="w-full max-w-md">
        <audio
          ref={audioRef}
          src={currentTrack.src}
          muted={muted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onError={() => setHasError(true)}
          onEnded={handleEnded}
        />

        <section className="neo-raised-lg flex flex-col gap-6 rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-[0.3em] text-muted-foreground">
              ::01
            </span>

            {/* <div className="flex items-center gap-3">
              {" "}
              <StatusLed active={shuffle} label="SHUF" />
              <StatusLed
                active={repeatMode !== "off"}
                label={
                  repeatMode === "one"
                    ? "RPT-1"
                    : repeatMode === "all"
                      ? "RPT-ALL"
                      : "RPT"
                }
              />
            </div> */}
            <div className="flex items-center gap-3">
              <StatusLed active={shuffle} label="SHUF" />
              <StatusLed
                active={repeatMode !== "off"}
                label={
                  repeatMode === "one"
                    ? "RPT-1"
                    : repeatMode === "all"
                      ? "RPT-ALL"
                      : "RPT"
                }
              />
              <DrawerTrigger
                aria-label="Open playlist"
                className="neo-raised-sm flex size-8 shrink-0 items-center justify-center rounded-full text-foreground transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px"
              >
                <ListMusic className="size-4" />
              </DrawerTrigger>
            </div>
          </div>

          <div className="neo-inset neo-glass-cover relative flex flex-col items-center gap-2 rounded-2xl p-5">
            <div className="flex w-full items-center gap-4">
              <Reel spinning={isPlaying} />
              <AudioVisualizerDots
                audioRef={audioRef}
                isPlaying={isPlaying}
                rows={3}
              />
              <Reel spinning={isPlaying} />
            </div>
            {sampleRate ? (
              <p className="absolute bottom-5 font-mono text-[10px] tracking-widest text-muted-foreground/50">
                {hasBooted ? (
                  <ScrambledKhz
                    text={`${(sampleRate / 1000).toFixed(1)} KHZ`}
                  />
                ) : (
                  `${(sampleRate / 1000).toFixed(1)} KHZ`
                )}
              </p>
            ) : null}
          </div>

          <div className="text-center">
            <p className="truncate text-lg font-semibold">{titleText}</p>
            <p className="truncate text-sm text-muted-foreground">
              {currentTrack.artist}
            </p>
            {hasError ? (
              <p className="mt-1 text-xs text-muted-foreground/70">
                Audio file not found — add it to /public/audio
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <span
              className="w-10 shrink-0 font-mono text-xs tabular-nums"
              style={{ color: "var(--neo-led)" }}
            >
              {formatTime(currentTime)}
            </span>
            <Slider
              value={currentTime}
              min={0}
              max={duration > 0 ? duration : 1}
              step={0.1}
              disabled={!duration}
              onValueChange={(next) => {
                if (audioRef.current) audioRef.current.currentTime = next
                setCurrentTime(next)
              }}
            />
            <span className="w-10 shrink-0 text-right font-mono text-xs text-muted-foreground tabular-nums">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <DeckButton
              active={shuffle}
              aria-label="Toggle shuffle"
              aria-pressed={shuffle}
              onClick={() => setShuffle((s) => !s)}
            >
              <Shuffle className="size-4" />
            </DeckButton>
            <DeckButton aria-label="Previous track" onClick={goPrev}>
              <SkipBack className="size-4" />
            </DeckButton>
            <DeckButton
              large
              active={isPlaying}
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="size-6" />
              ) : (
                <Play className="ml-0.5 size-6" />
              )}
            </DeckButton>
            <DeckButton aria-label="Next track" onClick={goNext}>
              <SkipForward className="size-4" />
            </DeckButton>
            <DeckButton
              active={repeatMode !== "off"}
              aria-label="Cycle repeat mode"
              aria-pressed={repeatMode !== "off"}
              onClick={cycleRepeat}
            >
              <RepeatIcon className="size-4" />
            </DeckButton>
          </div>

          <div className="flex items-center gap-3">
            <DeckButton
              aria-label={muted ? "Unmute" : "Mute"}
              aria-pressed={muted}
              active={muted}
              onClick={() => setMuted((m) => !m)}
              className="size-9"
            >
              <VolumeIcon className="size-4" />
            </DeckButton>
            <Slider
              value={muted ? 0 : Math.round(volume * 100)}
              min={0}
              max={100}
              step={1}
              onValueChange={(next) => {
                setVolume(next / 100)
                if (next > 0) setMuted(false)
              }}
            />
          </div>
        </section>
      </div>

      <DrawerContent className="neo-raised-lg rounded-t-[2rem] bg-background">
        <DrawerHeader>
          <DrawerTitle className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
            PLAYLIST // 01
          </DrawerTitle>
          <DrawerDescription>
            {tracks.length} track{tracks.length === 1 ? "" : "s"}
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-4 pt-2">
          {tracks.map((track, index) => {
            const active = index === currentIndex
            const trackDuration = durations[track.id]
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => playTrack(index)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all outline-none",
                  "focus-visible:ring-3 focus-visible:ring-ring/50",
                  active ? "neo-inset" : "hover:neo-raised-sm"
                )}
              >
                <span className="flex w-4 shrink-0 items-center justify-center">
                  {active && isPlaying ? (
                    <NowPlayingBars />
                  ) : (
                    <span
                      className={cn(
                        "font-mono text-xs",
                        active ? "" : "text-muted-foreground/70"
                      )}
                      style={active ? { color: "var(--neo-led)" } : undefined}
                    >
                      {index + 1}
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block truncate text-sm font-medium",
                      active && "text-primary"
                    )}
                  >
                    {track.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {track.artist}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                  {trackDuration === undefined
                    ? "--:--"
                    : trackDuration === null
                      ? "--:--"
                      : formatTime(trackDuration)}
                </span>
              </button>
            )
          })}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
