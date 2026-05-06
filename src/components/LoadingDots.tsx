"use client";

interface Props {
  text?: string;
}

export default function LoadingDots({ text = "Loading" }: Props) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
      }}
    >
      <span>{text}</span>
      <span style={{ display: "inline-flex", gap: 2 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              width: 4,
              height: 4,
              background: "#000080",
              borderRadius: "50%",
              animation: `pulse 1s ease-in-out ${i * 0.15}s infinite`,
            }}
          />
        ))}
      </span>
    </span>
  );
}