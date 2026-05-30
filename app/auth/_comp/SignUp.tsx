"use client";

import Image from "next/image";
import styles from "../../styles/auth/sign__.module.css";
import { Activity, useEffect, useState } from "react";
// import ErrorMsg from "./ErrorMsg";
import { sendOtpAction, verifyOtpAction } from "../auth.action";
import { tryIt } from "@/app/_lib/custom";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

type ShowState = 1 | 2 | 3;

const SignUp = () => {
  const [showState, setShowState] = useState<ShowState>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOTP] = useState<string>("");
  const [sendOTP, setSendOTP] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [otpVerified, setOTPVerified] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<{ msg: string; success: boolean }>({
    msg: "",
    success: false,
  });

  useEffect(() => {
    if (error.msg) {
      error.success ? toast.success(error.msg) : toast.error(error.msg);
    }
  }, [error]);
  return (
    <div className={styles.wrapper}>
      <form
        className={styles.form}
        onSubmit={async (e: React.SubmitEvent<HTMLFormElement>) => {
          e.preventDefault();
          setLoading(true);
          setError({ msg: "", success: false });

          const formData = new FormData(e.target as HTMLFormElement);

          const firstname = formData.get("firstname") as string;
          const lastname = formData.get("lastname") as string;
          const email = formData.get("email_signup") as string;
          const password = formData.get("password_confirmation") as string;
          const [err, result] = await tryIt(async () => {
            return await fetch("/api/auth/signup", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                firstname,
                lastname,
                email,
                password,
              }),
            });
          });

          if (err) {
            console.log("Error:", err);
            setError({ msg: "Something went wrong", success: false });
            setLoading(false);
            return;
          }

          if (!result) {
            setError({ msg: "No response from server", success: false });
            setLoading(false);
            return;
          }

          const data = await result.json();

          if (data.success) {
            setError({ msg: "Account created successfully!", success: true });
          } else {
            setError({ msg: data.message ?? "Signup failed", success: false });
          }

          await signIn("userCredentials", {
            redirect: true,
            email,
            password,
            callbackUrl: "/explore",
          });
          setLoading(false);
        }}
      >
        <legend className={styles.legend}>Create your account</legend>

        {/* STATE 1 — NAME */}
        <Activity mode={showState === 1 ? "visible" : "hidden"}>
          <label htmlFor="firstname" className={styles.label}>
            First Name
          </label>
          <input
            id="firstname"
            name="firstname"
            type="text"
            placeholder="Enter your first name..."
            className={styles.input}
            autoComplete="given-name"
            disabled={loading}
          />

          <label htmlFor="lastname" className={styles.label}>
            Last Name
          </label>
          <input
            id="lastname"
            name="lastname"
            type="text"
            placeholder="Enter your last name..."
            className={styles.input}
            autoComplete="family-name"
            disabled={loading}
          />
        </Activity>

        {/* STATE 2 — EMAIL + OTP */}
        <Activity mode={showState === 2 ? "visible" : "hidden"}>
          <label htmlFor="email_signup" className={styles.label}>
            Email
          </label>
          <input
            id="email_signup"
            type="email"
            name="email_signup"
            placeholder="Your email..."
            className={styles.input}
            autoComplete="email"
            disabled={loading}
            value={email}
            onChange={(e) => {
              setSendOTP(false);
              setOTPVerified(false);
              setOTP("");
              setEmail(e.target.value);
            }}
          />
          <button
            type="button"
            className={styles.otpButton}
            onClick={async () => {
              setLoading(true);
              setError({ msg: "", success: false });
              const res = await sendOtpAction(email);
              setError({ msg: res.message, success: res.success });
              setSendOTP(res.success);
              setLoading(false);
            }}
            disabled={otpVerified || loading || sendOTP || !email.includes("@")}
          >
            {sendOTP
              ? loading
                ? "Please wait..."
                : "OTP Send complete"
              : "Send OTP"}
          </button>

          <label htmlFor="otp_verification" className={styles.label}>
            OTP Verification
          </label>
          <input
            id="otp_verification"
            type="text"
            value={otp}
            onChange={(e) => {
              const value = e.target.value;
              if (!/^\d*$/.test(value)) return;
              setOTP(e.target.value);
            }}
            inputMode="numeric"
            maxLength={6}
            pattern="\d{6}"
            placeholder="Enter the 6-digit OTP..."
            className={styles.otpInput}
            disabled={otpVerified || loading}
          />

          <button
            type="button"
            className={styles.otpButton}
            onClick={async () => {
              setLoading(true);
              setError({ msg: "", success: false });
              const res = await verifyOtpAction(email, otp);
              setError({ msg: res.message, success: res.success });
              if (res.verified) {
                setOTPVerified(true);
              }
              setLoading(false);
            }}
            disabled={otpVerified || otp.length !== 6 || loading}
          >
            {otpVerified ? "OTP Verified ✔" : "Verify OTP"}
          </button>
        </Activity>

        {/* STATE 3 — PASSWORD */}
        <Activity mode={showState === 3 ? "visible" : "hidden"}>
          <label htmlFor="password_signup" className={styles.label}>
            Password
          </label>
          <div className={styles.passwordBox}>
            <input
              id="password_signup"
              name="password_signup"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password..."
              className={styles.input}
              autoComplete="new-password"
              disabled={loading}
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <Image
                src={showPassword ? "/eye-close.svg" : "/eye-open.svg"}
                alt="toggle"
                width={26}
                height={26}
              />
            </button>
          </div>

          <label htmlFor="password_confirmation" className={styles.label}>
            Confirm Password
          </label>
          <div className={styles.passwordBox}>
            <input
              id="password_confirmation"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password..."
              className={styles.input}
              autoComplete="new-password"
              disabled={loading}
              name="password_confirmation"
            />
            <button
              type="button"
              className={styles.eyeButton}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              <Image
                src={showConfirmPassword ? "/eye-close.svg" : "/eye-open.svg"}
                alt="toggle"
                width={26}
                height={26}
              />
            </button>
          </div>
        </Activity>

        {/* NAV BUTTONS */}
        <div
          className={styles.buttonRow}
          style={{
            justifyContent: showState === 1 ? "flex-end" : "space-between",
          }}
        >
          {showState > 1 && (
            <button
              type="button"
              className={styles.prevNextButton}
              onClick={() => setShowState((prev) => (prev - 1) as ShowState)}
              disabled={loading}
            >
              Back
            </button>
          )}

          {showState < 3 && (
            <button
              type="button"
              className={styles.prevNextButton}
              onClick={() => setShowState((prev) => (prev + 1) as ShowState)}
              disabled={loading}
            >
              Next
            </button>
          )}
        </div>

        {showState === 3 && (
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !otpVerified || !email || !sendOTP}
          >
            Sign Up
          </button>
        )}
        <input
          type="text"
          id="username"
          name="username"
          autoComplete="username"
          style={{ display: "none" }}
        />
        <input
          type="text"
          id="admin"
          name="admin"
          style={{ display: "none" }}
        />
      </form>

      {/* {error.msg && <ErrorMsg message={error.msg} success={error.success} />} */}
    </div>
  );
};

export default SignUp;
