import { ImageResponse } from "next/og"

export const size = {
  width: 32,
  height: 32,
}
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e4e4e6",
          borderRadius: 8,
        }}
      >
        <div
          style={{
            width: 22,
            height: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 3px",
            background: "#2b2b2b",
            borderRadius: 3,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#e4e4e6",
            }}
          />
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#e4e4e6",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  )
}
