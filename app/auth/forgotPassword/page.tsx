"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import styles from "../../styles/auth/sign__.module.css";
import { resetPasswordAction, sendOtpAction, verifyOtpAction } from "../auth.action";
import { useRouter } from "next/navigation";

type ShowState = 1 | 2 | 3;

export default function ForgotPassword() {
    const [showState, setShowState] = useState<ShowState>(1);

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    const [sendOTP, setSendOTP] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState({
        msg: "",
        success: false,
    });
    const router = useRouter();
    useEffect(() => {
        if (!error.msg) return;

        error.success
            ? toast.success(error.msg)
            : toast.error(error.msg);
    }, [error]);

    return (
        <main className={styles.wrapper} style={{ minHeight: "90vh" }}>
            <form
                className={styles.form}
                onSubmit={async (e) => {
                    e.preventDefault();

                    const formData = new FormData(e.currentTarget);

                    const password =
                        formData.get("password") as string;

                    const confirmPassword =
                        formData.get("confirmPassword") as string;

                    if (password !== confirmPassword) {
                        setError({
                            msg: "Passwords do not match",
                            success: false,
                        });
                        return;
                    }

                    setLoading(true);

                    try {
                        const res = await resetPasswordAction({
                            email,
                            password,
                        });
                        if (!res.success) {
                            toast.error(res.message ?? "Failed to reset password");
                            return;
                        }
                        toast.success(res.message ?? "Password reset successful");
                        router.push("/auth?mode=signin")
                    } catch {
                        toast.error("Failed to reset password");
                    }

                    setLoading(false);
                }}
            >
                <legend className={styles.legend}>
                    Reset Password
                </legend>

                {/* EMAIL */}
                {showState === 1 && (
                    <>
                        <label
                            htmlFor="email"
                            className={styles.label}
                        >
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            className={styles.input}
                            value={email}
                            disabled={loading}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setSendOTP(false);
                                setOtpVerified(false);
                                setOtp("");
                            }}
                        />

                        <button
                            type="button"
                            className={styles.otpButton}
                            disabled={
                                loading ||
                                sendOTP ||
                                !email.includes("@")
                            }
                            onClick={async () => {
                                setLoading(true);

                                try {
                                    const res = await sendOtpAction(email, "false", "reset-password");
                                    // const res = {
                                    //     success: true,
                                    //     message: "OTP sent",
                                    // };

                                    setSendOTP(res.success);

                                    setError({
                                        msg: res.message,
                                        success: res.success,
                                    });

                                    if (res.success) {
                                        setShowState(2);
                                    }
                                } finally {
                                    setLoading(false);
                                }
                            }}
                        >
                            {sendOTP
                                ? "OTP Sent"
                                : "Send OTP"}
                        </button>
                    </>
                )}

                {/* OTP */}
                {showState === 2 && (
                    <>
                        <label
                            htmlFor="otp"
                            className={styles.label}
                        >
                            OTP Verification
                        </label>

                        <input
                            id="otp"
                            value={otp}
                            maxLength={6}
                            inputMode="numeric"
                            className={styles.otpInput}
                            disabled={loading || otpVerified}
                            onChange={(e) => {
                                if (!/^\d*$/.test(e.target.value))
                                    return;

                                setOtp(e.target.value);
                            }}
                        />

                        <button
                            type="button"
                            className={styles.otpButton}
                            disabled={
                                loading ||
                                otp.length !== 6 ||
                                otpVerified
                            }
                            onClick={async () => {
                                setLoading(true);

                                try {
                                    const res = await verifyOtpAction(email, otp);

                                    // const res = {
                                    //     verified: true,
                                    //     success: true,
                                    //     message:
                                    //         "OTP verified successfully",
                                    // };

                                    setError({
                                        msg: res.message,
                                        success: res.success,
                                    });

                                    if (res.verified) {
                                        setOtpVerified(true);
                                        setShowState(3);
                                    }
                                } finally {
                                    setLoading(false);
                                }
                            }}
                        >
                            {otpVerified
                                ? "OTP Verified ✔"
                                : "Verify OTP"}
                        </button>
                    </>
                )}

                {/* PASSWORD */}
                {showState === 3 && (
                    <>
                        <label
                            htmlFor="password"
                            className={styles.label}
                        >
                            New Password
                        </label>

                        <div className={styles.passwordBox}>
                            <input
                                id="password"
                                name="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                className={styles.input}
                                disabled={loading}
                            />

                            <button
                                type="button"
                                className={styles.eyeButton}
                                onClick={() =>
                                    setShowPassword((p) => !p)
                                }
                            >
                                <Image
                                    src={
                                        showPassword
                                            ? "/eye-close.svg"
                                            : "/eye-open.svg"
                                    }
                                    alt=""
                                    width={26}
                                    height={26}
                                />
                            </button>
                        </div>

                        <label
                            htmlFor="confirmPassword"
                            className={styles.label}
                        >
                            Confirm Password
                        </label>

                        <div className={styles.passwordBox}>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                className={styles.input}
                                disabled={loading}
                            />

                            <button
                                type="button"
                                className={styles.eyeButton}
                                onClick={() =>
                                    setShowConfirmPassword(
                                        (p) => !p
                                    )
                                }
                            >
                                <Image
                                    src={
                                        showConfirmPassword
                                            ? "/eye-close.svg"
                                            : "/eye-open.svg"
                                    }
                                    alt=""
                                    width={26}
                                    height={26}
                                />
                            </button>
                        </div>

                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={
                                loading || !otpVerified
                            }
                        >
                            Reset Password
                        </button>
                    </>
                )}
            </form>
        </main>
    );
}