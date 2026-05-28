import SectionHeading from "../common/SectionHeading";

const CardSkeleton = ({ name = "Loading", num = 10 }: { name?: string, num?: number }) => {
    return (
        <>
            <SectionHeading title={name} />
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(187px, 1fr))",
                    gap: "16px",
                    width: "100%",
                    padding: "var(--spacing-lg)"
                }}
            >

                {[...Array(num)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            border: "1px solid #e5e5e5",
                            borderRadius: "16px",
                            overflow: "hidden",
                            background: "var(--bg-tertiary)",
                            padding: "12px",
                            animation: "pulse 1.5s infinite ease-in-out",
                        }}
                    >
                        {/* Image */}
                        <div
                            style={{
                                width: "100%",
                                aspectRatio: "1 / 1",
                                borderRadius: "12px",
                                background: "var(--color-gray)",
                                marginBottom: "12px",
                            }}
                        />

                        {/* Store */}
                        <div
                            style={{
                                width: "40%",
                                height: "12px",
                                background: "var(--color-primary-dark)",
                                borderRadius: "6px",
                                marginBottom: "10px",
                            }}
                        />

                        {/* Title */}
                        <div
                            style={{
                                width: "80%",
                                height: "16px",
                                background: "#e5e5e5",
                                borderRadius: "6px",
                                marginBottom: "14px",
                            }}
                        />

                        {/* Price */}
                        <div
                            style={{
                                display: "flex",
                                gap: "10px",
                                alignItems: "center",
                            }}
                        >
                            <div
                                style={{
                                    width: "70px",
                                    height: "18px",
                                    background: "#e5e5e5",
                                    borderRadius: "6px",
                                }}
                            />

                            <div
                                style={{
                                    width: "50px",
                                    height: "14px",
                                    background: "var(--color-gray)",
                                    borderRadius: "6px",
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
            <style>
                {`
                @keyframes pulse {
                    0% {
                    opacity: 1;
                    }
                    50% {
                    opacity: 0.5;
                    }
                    100% {
                    opacity: 1;
                    }
                }
                `}
            </style>
        </ >
    );
};
export default CardSkeleton;