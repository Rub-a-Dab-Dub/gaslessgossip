"use client";

import { ArrowRight, CircleCheck, Share } from "lucide-react";
import Image from "next/image";
import { Fredoka, Baloo_2 } from "next/font/google";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Spinner } from "./Spinner";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const baloo_2 = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface WelcomeScreenProps {
  username: string;
}

export default function WelcomeScreen({ username }: WelcomeScreenProps) {
  const [hasValidated, setHasValidated] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendTimer, setResendTimer] = useState(120); // 2 minutes in seconds
  const [canResend, setCanResend] = useState(true);
  const router = useRouter();
  useEffect(() => {
    if (!hasValidated && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [hasValidated]);
  useEffect(() => {
    // Timer countdown
    if (resendTimer > 0 && !canResend) {
      const timerId = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);
  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when last digit is entered
    if (value && index === 5) {
      const otpString = [...newOtp.slice(0, 5), value].join("");
      verifyOtp(otpString);
    }
  };

  const verifyOtp = async (otpString: string) => {
    setIsVerifying(true);
    setError("");

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (otpString === "123456") {
      setHasValidated(true);
    } else {
      setError("Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }

    setIsVerifying(false);
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      // Auto-verify pasted OTP
      verifyOtp(pastedData);
    }
  };

  const handleResend = async () => {
    setError("");
    setOtp(["", "", "", "", "", ""]);

    setCanResend(false);
    setResendTimer(120);
    // Simulate resend
    await new Promise((resolve) => setTimeout(resolve, 500));
    alert("A new OTP has been sent to your email!");
    inputRefs.current[0]?.focus();
  };
  return (
    <div className="w-222 bg-linear-to-r from-[#121A19] to-[#121A19] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Success Message */}
      <div className="flex justify-center items-center w-222 h-15 gap-2 bg-[#121A19] shadow-[0_8px_24px_0_#14F1D914] rounded-b-xl px-4 py-2">
        {hasValidated ? (
          <>
            <CircleCheck className="w-5 h-5 fill-[#14F1D9] border-none" />
            <span className="text-white text-sm">
              You&apos;ve successfully created an account
            </span>
          </>
        ) : (
          <span className="text-white text-sm">
            Welcome to Gasless Gossip! Let&apos;s set up your account
          </span>
        )}
      </div>

      <div className="flex flex-col items-center max-w-xl w-222 py-15 px-6">
        {isVerifying ? (
          <Spinner />
        ) : hasValidated ? (
          <>
            <div className="relative mb-8">
              <Image
                src={"/chick.svg"}
                width={150}
                height={150}
                alt="Chick"
                className="relative w-75 h-54 object-contain"
              />
            </div>

            <p
              className={`${fredoka.className} text-2xl font-medium text-[#F1F7F6] mb-2 text-center`}
            >
              Welcome, {username}
            </p>

            <p
              className={`${baloo_2.className} text-sm text-[#A3A9A6] mb-12 text-center max-w-sm`}
            >
              Complete task and earn points (XP)
              <br />
              to grow your pet
            </p>

            <div className="flex items-center gap-4">
              <button className="w-12 h-12 bg-[#121418] hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors shadow-[inset_0_0_12px_1px_#0F5951]">
                <Share className="w-5 h-5 text-white" />
              </button>

              {/* Continue Button */}
              <button
                onClick={() => router.push("/feed")}
                className="w-73 justify-center bg-[linear-gradient(135deg,_#15FDE4_100%,_#13E5CE_0%)]
  shadow-[inset_-6px_-6px_12px_#1E9E90,_inset_6px_6px_10px_#24FFE7] cursor-pointer hover:bg-cyan-500 text-black font-semibold px-12 py-3 rounded-full inline-flex items-center gap-2 transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="relative mb-8">
              <p
                className={`${fredoka.className} text-2xl font-medium text-[#F1F7F6] mb-2 text-center`}
              >
                Hi, {username}! Please verify your email to get started.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-300 block text-center">
                  Enter 6-digit code
                </label>
                <div
                  className="flex justify-center gap-2"
                  onPaste={handlePaste}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-xl font-semibold border-2 border-gray-700 rounded-lg text-white focus:border-cyan-400 focus:outline-none transition-colors"
                      disabled={isVerifying}
                    />
                  ))}
                </div>
                {error && (
                  <p className="text-red-400 text-sm text-center mt-2">
                    {error}
                  </p>
                )}
              </div>
              <div className="text-center">
                <button
                  onClick={handleResend}
                  disabled={isVerifying}
                  className="text-sm text-[#14F1D9] hover:text-cyan-300 transition-colors disabled:text-gray-600"
                >
                  {canResend
                    ? "Didn't receive the code? Resend"
                    : `Resend code in ${Math.floor(resendTimer / 60)}:${String(
                        resendTimer % 60
                      ).padStart(2, "0")}`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
