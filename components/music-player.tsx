"use client"

import * as React from "react"
import {
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

import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"

type Track = {
  id: string
  title: string
  artist: string
  // Drop matching audio files into /public/audio to make these play.
  src: string
}

const tracks: Track[] = [
  {
    id: "t1",
    title: "She Could Be You",
    artist: "Shawn Hlookoff",
    src: "/audio/SheCouldBeYou.mp3",
  },
  {
    id: "t2",
    title: "Beneath Your Beautiful",
    artist: "Labrinth",
    src: "/audio/Labrinth_Beneath_Your_Beautiful.mp3",
  },
  {
    id: "t3",
    title: "Midnight City",
    artist: "M38",
    src: "/audio/M38-Midnight_City.mp3",
  },
  {
    id: "t4",
    title: "Prairies",
    artist: "BoyWithUke",
    src: "/audio/Boywithuke-Prairies.mp3",
  },
  {
    id: "t5",
    title: "Paper Moon",
    artist: "Kite Season",
    src: "/audio/track-4.mp3",
  },
  // {
  //   id: "t6",
  //   title: "Analog Sky",
  //   artist: "Marigold",
  //   src: "/audio/track-5.mp3",
  // },
]

type RepeatMode = "off" | "all" | "one"

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

function Reel({ spinning }: { spinning: boolean }) {
  return (
    <div
      className="neo-inset relative flex size-16 shrink-0 items-center justify-center rounded-full sm:size-20"
      style={{
        animation: "reel-spin 3s linear infinite",
        animationPlayState: spinning ? "running" : "paused",
      }}
    >
      {[0, 45, 90, 135].map((deg) => (
        <span
          key={deg}
          className="absolute h-[65%] w-px bg-muted-foreground/25"
          style={{ transform: `rotate(${deg}deg)` }}
        />
      ))}
      <span className="neo-raised-sm relative size-4 rounded-full bg-background" />
    </div>
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

export function MusicPlayer() {
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const autoplayIntent = React.useRef(false)

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
    <div className="grid w-full max-w-3xl gap-6 md:grid-cols-2 md:items-start">
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
          <span className="font-mono text-xs tracking-[0.3em] text-muted-foreground">
            WALKMAN // 117
          </span>
          <span className="font-mono text-[10px] tracking-widest text-muted-foreground/70">
            {shuffle ? "SHUF " : ""}
            {repeatMode !== "off"
              ? repeatMode === "one"
                ? "RPT-1"
                : "RPT-ALL"
              : ""}
          </span>
        </div>

        <div className="neo-inset flex items-center gap-4 rounded-2xl p-5">
          <Reel spinning={isPlaying} />
          <div className="neo-inset-sm h-3 flex-1 rounded-full" />
          <Reel spinning={isPlaying} />
        </div>

        <div className="text-center">
          <p className="truncate text-lg font-semibold">{currentTrack.title}</p>
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

      <section className="neo-raised-lg flex max-h-[420px] flex-col gap-1 overflow-y-auto rounded-[2rem] p-4 sm:p-6">
        <span className="mb-2 font-mono text-xs tracking-[0.3em] text-muted-foreground">
          PLAYLIST // 00
        </span>
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
      </section>
    </div>
  )
}
