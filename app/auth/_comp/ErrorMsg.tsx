import { useEffect, useState } from "react";

const ErrorMsg = ({
  message,
  success,
}: {
  message: string;
  success: boolean;
}) => {
  const [displayMsg, setDisplayMsg] = useState<boolean>(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayMsg(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      {displayMsg && (
        <button
          style={{
            position: "fixed",
            top: "10px",
            color: success ? "green" : "red",
            fontWeight: "bold",
            zIndex: 1000,
            backgroundColor: "var(--bg-secondary)",
            padding: "10px 20px",
            borderRadius: "5px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
          onClick={() => setDisplayMsg(false)}
        >
          {message}
        </button>
      )}
    </>
  );
};

export default ErrorMsg;
