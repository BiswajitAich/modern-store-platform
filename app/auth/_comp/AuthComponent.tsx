"use client";
import { Activity, useEffect } from "react";
import dynamic from "next/dynamic";
const SignIn = dynamic(() => import("./SignIn"), {
  ssr: false,
  loading: () => <LoadingComponent />,
});
const SignUp = dynamic(() => import("./SignUp"), {
  ssr: false,
  loading: () => <LoadingComponent />,
});
import styles from "../../styles/auth/auth.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
const AuthComponent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAdmin: string = searchParams.get("admin") ?? "false";
  const mode = searchParams.get("mode");
  const displaySignIn = mode !== "signup";

  useEffect(() => {
    if (isAdmin === "true") {
      router.replace("/auth?admin=true");
      return;
    }
    if (!mode) {
      router.replace("/auth?mode=signin");
    }
  }, [mode, isAdmin, router]);

  return (
    <main className={styles.container}>
      <Activity mode={displaySignIn ? "visible" : "hidden"}>
        <SignIn isAdmin={isAdmin} />
      </Activity>
      <Activity
        mode={!displaySignIn && isAdmin !== "true" ? "visible" : "hidden"}
      >
        <SignUp />
      </Activity>
      {isAdmin !== "true" && (
        <div className={styles.authToggle}>
          Click here to:
          <button
            onClick={() => {
              router.replace(
                `/auth?mode=${displaySignIn ? "signup" : "signin"}`,
              );
            }}
            className={styles.authToggleButton}
          >
            {displaySignIn ? "Sign Up" : "Sign In"}
          </button>
        </div>
      )}
      <Link href={'/auth/forgotPassword'} className={styles.authToggle}>forgot password</Link>
    </main>
  );
};

export default AuthComponent;

const LoadingComponent = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        height: "90dvh",
        alignItems: "center",
      }}
    >
      <div
        style={{
          height: "60dvh",
          width: "40%",
          minWidth: "400px",
          maxWidth: "100vw",
          borderRadius: "1rem",
          backgroundColor: "var(--bg-tertiary)",
          textAlign: "center",
          alignContent: "center",
          fontSize: "1.5rem",
          color: "var(--text-secondary)",
        }}
      >
        <p>Loading...</p>
      </div>
    </div>
  );
};
