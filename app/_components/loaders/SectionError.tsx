import SectionHeading from "../common/SectionHeading";

const SectionError = ({ name = "this section" }: { name?: string }) => {
  return (
    <section style={{ padding: "var(--spacing-lg)", width: "90vw" }}>
      <SectionHeading title={name} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--spacing-xl) 0",
          textAlign: "center",
        }}
      >
        <p style={{ color: "var(--color-gray)", fontSize: "var(--font-size-sm)" }}>
          Failed to load {name.toLowerCase()}. Please try again later.
        </p>
      </div>
    </section>
  );
};

export default SectionError;
