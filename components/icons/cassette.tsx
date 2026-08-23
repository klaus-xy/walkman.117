import React from "react"

interface CassetteIconProps {
  /** Outer container size, in rem. The inner glyph is sized in em, so it scales with this. */
  size?: number
  className?: string
}

const CassetteIcon = ({ size = 1.75, className }: CassetteIconProps) => {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[0.2em] bg-muted ${className ?? ""}`}
      style={{
        width: `${size}rem`,
        height: `${size}rem`,
        fontSize: `${size}rem`,
      }}
    >
      <span
        className="flex items-center justify-between rounded-[0.06em] bg-foreground/80"
        style={{ width: "0.7em", height: "0.5em", padding: "0 0.08em" }}
      >
        <span
          className="rounded-full bg-muted"
          style={{ width: "0.2em", height: "0.2em" }}
        />
        <span
          className="rounded-full bg-muted"
          style={{ width: "0.2em", height: "0.2em" }}
        />
      </span>
    </span>
  )
}

export default CassetteIcon
