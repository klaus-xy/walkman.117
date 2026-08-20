export default function Loading() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <div
        className="neo-inset relative flex size-16 items-center justify-center rounded-full"
        style={{ animation: "reel-spin 3s linear infinite" }}
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
    </div>
  )
}
