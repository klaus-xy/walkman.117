import { BootScreen } from "@/components/boot-screen"
import { MusicPlayer } from "@/components/music-player"

export default function Page() {
  return (
    <BootScreen>
      <div className="flex min-h-svh items-center justify-center p-6">
        <MusicPlayer />
      </div>
    </BootScreen>
  )
}
