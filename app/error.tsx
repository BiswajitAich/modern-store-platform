"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div
      style={{
        height: "80vh",
        padding: "var(--spacing-sm)",
        margin: "var(--spacing-sm)",
      }}
    >
      <h2 className="heading">Something went wrong</h2>
      <p
        style={{
          textAlign: "center",
          fontSize: "var(--font-size-sm)",
          padding: "var(--spacing-md) 0",
        }}
      >
        {error.message}
      </p>
      <button onClick={() => reset()} className="button buttonPrimary">
        Try again
      </button>
    </div>
  );
}
