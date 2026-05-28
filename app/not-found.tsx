import Link from "next/link";
import Image from "next/image";
import Loading from "./loading";
const NotFound = () => {
  const containerStyle: React.CSSProperties = {
    minHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background:
      "linear-gradient(135deg, var(--color-primary-light) 0%, #764ba2 100%)",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  };

  const contentStyle: React.CSSProperties = {
    textAlign: "center",
    maxWidth: "600px",
    background: "var(--bg-tertiary)",
    borderRadius: "20px",
    padding: "60px 40px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  };

  const imageStyle: React.CSSProperties = {
    width: "240px",
    height: "240px",
    margin: "0 auto 30px",
    display: "block",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "120px",
    fontWeight: "800",
    margin: "0 0 10px",
    background:
      "linear-gradient(135deg, var(--color-primary-light) 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    lineHeight: "1",
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: "28px",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "15px",
  };

  const textStyle: React.CSSProperties = {
    fontSize: "16px",
    color: "#718096",
    marginBottom: "35px",
    lineHeight: "1.6",
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    flexWrap: "wrap",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textDecoration: "none",
    display: "inline-block",
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background:
      "linear-gradient(135deg, var(--color-primary-light) 0%, #764ba2 100%)",
    color: "white",
  };

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <Image
          height={200}
          width={240}
          src="/not-found.gif"
          alt="404 Not Found"
          style={imageStyle}
        />

        <h1 style={titleStyle}>404</h1>

        <h2 style={subtitleStyle}>Page Not Found</h2>

        <p style={textStyle}>
          Oops! The page you're looking for seems to have wandered off.
          <br />
          Don't worry, let's get you back on track.
        </p>

        <div style={buttonContainerStyle}>
          <Link href="/explore" style={primaryButtonStyle}>
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
