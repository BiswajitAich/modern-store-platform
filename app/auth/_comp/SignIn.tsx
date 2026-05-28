"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "../../styles/auth/sign__.module.css";
// import ErrorMsg from "./ErrorMsg";
import { signIn } from "next-auth/react";
import { getErrorMessage } from "../page";
import { toast } from "sonner";

const SignIn = ({ isAdmin }: { isAdmin: string }) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<{ msg: string; success: boolean }>({
    msg: "",
    success: false,
  });

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError({ msg: "", success: false });

    const form = e.target as HTMLFormElement;
    const email = (form.email_signin as HTMLInputElement).value;
    const password = (form.password_signin as HTMLInputElement).value;
    const toSignIn =
      isAdmin === "true" ? "adminCredentials" : "userCredentials";
    const res = await signIn(toSignIn, {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError({ msg: getErrorMessage(res.error), success: false });
    } else {
      window.location.href = "/explore";
    }

    setLoading(false);
  }

  useEffect(() => {
    if (error.msg) {
      if (error.success) {
        toast.success(error.msg);
      } else {
        toast.error(error.msg);
      }
    }
  }, [error.msg]);

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <legend className={styles.legend}>Sign In</legend>

        {/* <label htmlFor="username_signin" className={styles.label}>
          Username
        </label>
        <input
          id="username_signin"
          name="username_signin"
          type="text"
          autoComplete="username"
          placeholder="Your unique username..."
          className={styles.input}
        /> */}

        <label htmlFor="email_signin" className={styles.label}>
          Email
        </label>
        <input
          id="email_signin"
          name="email_signin"
          type="email"
          autoComplete="email"
          placeholder="Your email..."
          className={styles.input}
          maxLength={40}
          disabled={loading}
        />

        <label htmlFor="password_signin" className={styles.label}>
          Password
        </label>

        <div className={styles.passwordBox}>
          <input
            id="password_signin"
            name="password_signin"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Your password..."
            className={styles.input}
            minLength={5}
            maxLength={24}
            disabled={loading}
          />

          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {!showPassword ? (
              <Image
                src="/eye-open.svg"
                alt="show password"
                width={28}
                height={28}
              />
            ) : (
              <Image
                src="/eye-close.svg"
                alt="hide password"
                width={28}
                height={28}
              />
            )}
          </button>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          Sign In
        </button>
        {/* {error.msg && <ErrorMsg message={error.msg} success={error.success} />} */}
        <input
          type="text"
          id="username"
          name="username"
          autoComplete="username"
          style={{ display: "none" }}
        />
      </form>
    </div>
  );
};

export default SignIn;
