"use client";
import { useEffect, useState } from "react";
import type React from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Fredoka } from "next/font/google";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { useRouter, useSearchParams } from "next/navigation";
import { setToCookie } from "@/lib/cookies";
import { setToLocalStorage } from "@/lib/local-storage";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function Header() {
  return (
    <nav className="flex bg-dark-900 items-center justify-between p-5">
      <div className="flex items-center space-x-2 gap-70">
        <div className="flex items-center">
          <Image
            src={"/gg.svg"}
            width={64}
            height={48}
            alt="Logo"
            className="w-16 h-12"
          />
        </div>
        <div className="flex space-x-6 text-sm text-white">
          <a href="#" className="hover:text-[#7AF8EB] transition-colors">
            home
          </a>
          <a href="#" className="hover:text-[#7AF8EB] transition-colors">
            about
          </a>
          <a href="#" className="hover:text-[#7AF8EB] transition-colors">
            home
          </a>
        </div>
      </div>

      <button className=" text-white flex shadow-[inset_0_0_12px_1px_#2F2F2F]  items-center space-x-2 px-6 py-4 rounded-full hover:opacity-80 cursor-pointer transition-colors">
        <span>Get Started</span>
        <ArrowRight />
      </button>
    </nav>
  );
}

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdParam = searchParams?.get("userId");
  const redirectPath = searchParams?.get("redirect") || "/feed";
  const [userId, setUserId] = useState<number | null>(null);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (userIdParam) {
      const parsedUserId = parseInt(userIdParam, 10);
      if (!isNaN(parsedUserId)) {
        setUserId(parsedUserId);
      } else {
        toast.error("Invalid user ID. Please try logging in again.");
        router.push("/auth");
      }
    } else {
      toast.error("User ID not found. Please try logging in again.");
      router.push("/auth");
    }
  }, [userIdParam, router]);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (isAxiosError<ApiResponse>(error)) {
      return error.response?.data?.message ?? error.message ?? fallback;
    }

    if (error instanceof Error) {
      return error.message || fallback;
    }

    return fallback;
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      if (!verificationCode || verificationCode.length < 6) {
        toast.error("Please enter a valid verification code");
        return;
      }

      if (!userId) {
        toast.error("User ID not found. Please try again.");
        return;
      }

      const res = await api.post(`/auth/verify-email/${userId}`, {
        token: verificationCode,
      });

      if (res.data.error) {
        toast.error(res.data.message || "Verification failed");
        return;
      }

      // Check if token and user data are returned for auto-login
      const responseData = res.data as any;
      const token = responseData?.data?.token || responseData?.token;
      const userData = responseData?.data?.user || responseData?.user;

      if (token && userData) {
        // Auto-login the user after successful verification
        setToCookie("token", token);
        setToLocalStorage("user", JSON.stringify(userData));
        toast.success("Email verified successfully! Logging you in...");
        
        // Route to dashboard
        router.push(redirectPath);
      } else {
        // Fallback: if token not provided, redirect to login
        toast.success("Email verified successfully!");
        router.push(`/auth?redirect=${encodeURIComponent(redirectPath)}`);
      }
    } catch (error: unknown) {
      console.log("[v0] Verification error:", error);
      const errorMessage = getErrorMessage(error, "Verification failed");
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!userId) {
      toast.error("User ID not found. Please try again.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(`/auth/resend-verification/${userId}`);

      if (res.data.error) {
        toast.error(res.data.message || "Failed to resend verification code");
        return;
      }

      toast.success("Verification code sent successfully!");
    } catch (error: unknown) {
      console.log("[v0] Resend verification error:", error);
      const errorMessage = getErrorMessage(
        error,
        "Failed to resend verification code"
      );
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!userId) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-white">Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-xl w-full space-y-6 rounded-b-4xl pb-30 shadow-[inset_0_0_32px_1px_#0F59513D] flex flex-col items-center px-6">
          <div className="pt-10">
            <h2
              className={`${fredoka.className} text-[#7AF8EB] text-center font-medium text-3xl mb-4`}>
              Verify Your Email
            </h2>
            <p className="text-zinc-300 text-center text-sm mb-6">
              We sent a verification code to your email. Please enter it below.
            </p>
          </div>

          <form onSubmit={handleVerifyEmail} className="w-full space-y-6">
            <div>
              <label
                htmlFor="verificationCode"
                className="block text-[#7AF8EB] text-sm font-medium mb-2">
                Verification Code
              </label>
              <input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.slice(0, 6))
                }
                placeholder="000000"
                maxLength={6}
                className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#7AF8EB] transition-colors text-center text-2xl tracking-widest"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push("/auth")}
                className="flex-1 text-white flex shadow-[inset_0_0_12px_1px_#2F2F2F] items-center justify-center space-x-2 px-6 py-4 rounded-full hover:opacity-80 cursor-pointer transition-colors">
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`flex-1 ${
                  verificationCode.length === 6 && !submitting
                    ? "text-black flex shadow-[inset_-6px_-6px_12px_#1E9E90,inset_6px_6px_10px_#24FFE7] bg-[linear-gradient(135deg,#15FDE4_100%,#13E5CE_0%)] items-center justify-center space-x-2 px-6 py-4 rounded-full hover:opacity-80 cursor-pointer transition-colors"
                    : "flex shadow-[inset_0_0_12px_1px_#2F2F2F] items-center justify-center space-x-2 px-6 py-4 rounded-full hover:opacity-80 cursor-pointer transition-colors text-white"
                }`}>
                <span>{submitting ? "Verifying..." : "Verify"}</span>
                {!submitting && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </form>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={submitting}
              className="text-[#7AF8EB] text-sm hover:underline">
              Resend verification code
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
