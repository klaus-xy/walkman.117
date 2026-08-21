import { BootScreen } from "@/components/boot-screen"
import { MusicPlayer } from "@/components/music-player"

export default function Page() {
  return (
    <BootScreen>
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
              KLAUS117
            </a>
          </p>
        </footer>
      </div>
    </BootScreen>
  )
}
