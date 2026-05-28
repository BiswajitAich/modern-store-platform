const HeroSkeleton = () => {
    return (
        <section
            style={{
                width: "100%",
                height: "clamp(350px, 50vh, 550px)",
                borderRadius: "24px",
                overflow: "hidden",
                position: "relative",
                background: "var(--color-gray)",
                animation: "pulse 1.5s ease-in-out infinite",
            }}
        >
            {/* Background shimmer */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)",
                    transform: "translateX(-100%)",
                    animation: "shimmer 2s infinite",
                }}
            />

            {/* Content */}
            <div
                style={{
                    position: "absolute",
                    left: "5%",
                    bottom: "12%",
                    width: "min(500px, 80%)",
                    zIndex: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                }}
            >
                {/* Title */}
                <div
                    style={{
                        height: "42px",
                        width: "80%",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.75)",
                    }}
                />

                {/* Subtitle */}
                <div
                    style={{
                        height: "18px",
                        width: "95%",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.6)",
                    }}
                />

                <div
                    style={{
                        height: "18px",
                        width: "70%",
                        borderRadius: "8px",
                        background: "rgba(255,255,255,0.6)",
                    }}
                />

                {/* Button */}
                <div
                    style={{
                        marginTop: "10px",
                        width: "140px",
                        height: "46px",
                        borderRadius: "999px",
                        background: "var(--color-primary)",
                    }}
                />
            </div>

            <style>
                {`
          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }

          @keyframes pulse {
            0% {
              opacity: 0.95;
            }
            50% {
              opacity: 0.85;
            }
            100% {
              opacity: 0.95;
            }
          }
        `}
            </style>
        </section>
    );
};

export default HeroSkeleton;