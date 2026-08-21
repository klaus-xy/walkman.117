"use client"

import * as React from "react"

// A media element can only ever be routed into one MediaElementSourceNode
// for its entire lifetime, so the analyser is created once per element and
// cached here — every visualizer variant shares the same node instead of
// racing to connect it.
const analyserCache = new WeakMap<HTMLMediaElement, AnalyserNode>()

interface UseAudioAnalyserOptions {
  fftSize?: number
  smoothingTimeConstant?: number
}

export function useAudioAnalyser(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  { fftSize = 64, smoothingTimeConstant = 0.8 }: UseAudioAnalyserOptions = {}
) {
  const analyserRef = React.useRef<AnalyserNode | null>(null)
  const audioContextRef = React.useRef<AudioContext | null>(null)

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    let analyser = analyserCache.get(audio)
    if (!analyser) {
      const audioContext = new AudioContext()
      analyser = audioContext.createAnalyser()
      analyser.fftSize = fftSize
      analyser.smoothingTimeConstant = smoothingTimeConstant

      const source = audioContext.createMediaElementSource(audio)
      source.connect(analyser)
      analyser.connect(audioContext.destination)

      analyserCache.set(audio, analyser)
    }

    analyserRef.current = analyser
    audioContextRef.current = analyser.context as AudioContext
  }, [audioRef, fftSize, smoothingTimeConstant])

  return { analyserRef, audioContextRef }
}
