"use client";
import { useEffect, useState } from "react";
import type React from "react";
import Image from "next/image";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import Lottie from "lottie-react";
import animationData from "@/public/logo flsah screen4.json";
import { Fredoka, Baloo_2 } from "next/font/google";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { setToCookie } from "@/lib/cookies";
import { setToLocalStorage } from "@/lib/local-storage";
import { useRouter, useSearchParams } from "next/navigation";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const baloo_2 = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

function Header() {
  return (
    <nav className="flex bg-[#121418] items-center justify-between p-5">
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

export default function Auth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect") || "/feed";
  const [page, setPage] = useState<string>("login");
  const [identifier, setIdentifier] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [showVerification, setShowVerification] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>("");

  useEffect(() => {
    setPage("login");
  }, []);

  const resetForm = () => {
    setIdentifier("");
    setPassword("");
    setEmail("");
    setUsername("");
    setConfirmPassword("");
    setVerificationCode("");
  };

  const isLoginFormValid = () => {
    return identifier !== "" && password !== "";
  };

  const isSignupFormValid = () => {
    return (
      username !== "" &&
      email !== "" &&
      password !== "" &&
      confirmPassword !== "" &&
      password === confirmPassword
    );
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (isAxiosError<ApiResponse>(error)) {
      return error.response?.data?.message ?? error.message ?? fallback;
    }

    if (error instanceof Error) {
      return error.message || fallback;
    }

    return fallback;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      if (!isLoginFormValid()) {
        toast.error("All fields are required");
        return;
      }

      const res = await api.post("/auth/login", {
        identifier,
        password,
      });
      console.log("res is => ", res);

      // Check for 412 status code or code in response (handles both wrapped and unwrapped responses)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseData = res.data as any;
      const responseCode = responseData?.code || responseData?.data?.code;
      const responseDetails =
        responseData?.details || responseData?.data?.details || "";

      // Check if account is not verified (412 code or specific error message)
      const isUnverified =
        res.status === 412 ||
        responseCode === 412 ||
        (typeof responseDetails === "string" &&
          (responseDetails.includes("Your account is not verified") ||
            responseDetails.includes("verification email has been sent")));

      if (isUnverified) {
        // Try multiple paths for userId since response might be wrapped differently
        // The response structure when wrapped: {error: false, message: 'successful', data: {code: 412, userId: ..., ...}}
        // The response structure when not wrapped: {code: 412, userId: ..., ...}
        let userId =
          responseData?.userId ||
          responseData?.data?.userId ||
          responseData?.data?.data?.userId;

        // If still not found, try to find userId anywhere in the nested data structure
        if (
          !userId &&
          responseData?.data &&
          typeof responseData.data === "object"
        ) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          userId = (responseData.data as any).userId;
        }

        console.log(
          "Unverified account detected. Full response:",
          JSON.stringify(res.data, null, 2)
        );
        console.log("Response data.data:", responseData?.data);
        console.log(
          "Checking userId at responseData.data.userId:",
          responseData?.data?.userId
        );
        console.log("Extracted userId:", userId);

        const errorMessage =
          responseDetails ||
          "Your account is not verified. A verification email has been sent to your email. Please check your email and verify your account.";

        if (userId) {
          toast.error(
            "Your account is not verified. Please check your email for verification code."
          );
          router.push(
            `/auth/verify?userId=${userId}&redirect=${encodeURIComponent(redirectPath)}`
          );
          return;
        } else {
          console.error(
            "UserId not found in response. Full response:",
            JSON.stringify(responseData, null, 2)
          );
          console.error("Response status:", res.status);
          toast.error(errorMessage);
        }
        return;
      }

      if (res.data.error) {
        toast.error(res.data.message || "Login failed");
        return;
      }

      if (res.data.data?.token && res.data.data?.user) {
        setToCookie("token", res.data.data.token);
        setToLocalStorage("user", JSON.stringify(res.data.data.user));
        toast.success("Login successful!");
        router.push(redirectPath);
      }
    } catch (error: unknown) {
      console.log("[v0] Login error:", error);

      // Check for 412 status code in error response
      if (isAxiosError<ApiResponse>(error)) {
        const status = error.response?.status;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseData = error.response?.data as any;

        const responseCode = responseData?.code || responseData?.data?.code;
        const responseDetails =
          responseData?.details || responseData?.data?.details || "";

        // Check for 412 status code or specific error message
        const isUnverified =
          status === 412 ||
          responseCode === 412 ||
          (typeof responseDetails === "string" &&
            (responseDetails.includes("Your account is not verified") ||
              responseDetails.includes("verification email has been sent")));

        if (isUnverified) {
          const userId = responseData?.userId || responseData?.data?.userId;
          const errorMessage =
            responseDetails ||
            responseData?.message ||
            "Your account is not verified. A verification email has been sent to your email. Please check your email and verify your account.";

          if (userId) {
            toast.error(
              "Your account is not verified. Please check your email for verification code."
            );
            router.push(
              `/auth/verify?userId=${userId}&redirect=${encodeURIComponent(redirectPath)}`
            );
            return;
          } else {
            toast.error(errorMessage);
            return;
          }
        }
      }

      const errorMessage = getErrorMessage(error, "Login failed");
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      if (!isSignupFormValid()) {
        toast.error("All fields are required and passwords must match");
        return;
      }

      const res = await api.post("/auth/signup", {
        username,
        email,
        password,
        address: "",
      });

      if (res.data.error) {
        toast.error(res.data.message || "Signup failed");
        return;
      }

      const createdUserId = res.data.data?.userId ?? null;
      if (createdUserId) {
        setUserId(createdUserId);
      }
      setShowVerification(true);
      const successMessage =
        res.data.data?.message ||
        res.data.message ||
        "Account created! Please verify your email.";
      toast.success(successMessage);
    } catch (error: unknown) {
      console.log("[v0] Signup error:", error);
      const errorMessage = getErrorMessage(error, "Signup failed");
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
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

      toast.success("Email verified successfully!");

      // Auto-login after verification
      setShowVerification(false);
      setPage("login");
      setIdentifier(username || email);
      resetForm();
    } catch (error: unknown) {
      console.log("[v0] Verification error:", error);
      const errorMessage = getErrorMessage(error, "Verification failed");
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (showVerification && userId) {
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
                We sent a verification code to your email. Please enter it
                below.
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
                  onClick={() => {
                    setShowVerification(false);
                    resetForm();
                  }}
                  className="flex-1 text-white flex shadow-[inset_0_0_12px_1px_#2F2F2F] items-center justify-center space-x-2 px-6 py-4 rounded-full hover:opacity-80 cursor-pointer transition-colors">
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`flex-1 ${
                    verificationCode.length === 6 && !submitting
                      ? "text-black flex shadow-[inset_-6px_-6px_12px_#1E9E90,_inset_6px_6px_10px_#24FFE7] bg-[linear-gradient(135deg,_#15FDE4_100%,_#13E5CE_0%)] items-center justify-center space-x-2 px-6 py-4 rounded-full hover:opacity-80 cursor-pointer transition-colors"
                      : "flex shadow-[inset_0_0_12px_1px_#2F2F2F] items-center justify-center space-x-2 px-6 py-4 rounded-full hover:opacity-80 cursor-pointer transition-colors text-white"
                  }`}>
                  <span>{submitting ? "Verifying..." : "Verify"}</span>
                  {!submitting && <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center flex-grow">
        <div className="max-w-xl w-full space-y-6 rounded-b-4xl pb-30 shadow-[inset_0_0_32px_1px_#0F59513D] flex flex-col items-center">
          <div className="w-64 h-80 relative -top-30">
            <Lottie
              animationData={animationData}
              loop={true}
              className="w-full"
            />
            <Image
              src={"/Ellipse 1.svg"}
              width={24}
              height={24}
              alt=""
              className="relative -top-30 left-18 w-24 object-cover"
            />
            <p
              className={`relative -top-28 text-center text-[#F1F7F6] ${baloo_2.className} max-w-md`}>
              Ready to spill the tea?
            </p>
            <div className="w-full flex flex-col space-y-2">
              <h2
                className={`${fredoka.className} text-[#7AF8EB] text-center relative -top-20 font-medium text-4xl`}>
                {page === "login" ? "Log In" : "Sign Up"}
              </h2>
              <div className="w-full relative -top-16">
                {page === "login" ? (
                  <>
                    <div className="w-full flex items-center font-normal text-zinc-300">
                      Don&apos;t have an account?
                      <span
                        onClick={() => {
                          setPage("register");
                          resetForm();
                        }}
                        className="pl-2 cursor-pointer font-bold text-[#7AF8EB]">
                        Sign up
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-full flex items-center font-normal text-zinc-300">
                      Already have an account?
                      <span
                        onClick={() => {
                          setPage("login");
                          resetForm();
                        }}
                        className="pl-2 cursor-pointer font-bold text-[#7AF8EB]">
                        Log in
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-center pb-20">
        <div className="w-full max-w-xl px-6">
          <form
            method="POST"
            onSubmit={page === "login" ? handleLogin : handleSignup}
            className="space-y-6">
            {page === "login" ? (
              <>
                <div>
                  <label
                    htmlFor="identifier"
                    className="block text-[#7AF8EB] text-sm font-medium mb-2">
                    username or email
                  </label>
                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. MaskedParrot85 or email@example.com"
                    className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#7AF8EB] transition-colors"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="username"
                    className="block text-[#7AF8EB] text-sm font-medium mb-2">
                    username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. MaskedParrot85"
                    className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#7AF8EB] transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-[#7AF8EB] text-sm font-medium mb-2">
                    email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. maskedparrot@gmail.com"
                    className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#7AF8EB] transition-colors"
                  />
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-[#7AF8EB] text-sm font-medium mb-2">
                password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#7AF8EB] transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {page !== "login" && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-[#7AF8EB] text-sm font-medium mb-2">
                  confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#7AF8EB] transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 mb-10">
              <button
                type="submit"
                disabled={submitting}
                className={`${
                  (page === "login"
                    ? isLoginFormValid()
                    : isSignupFormValid()) && !submitting
                    ? "text-black flex shadow-[inset_-6px_-6px_12px_#1E9E90,_inset_6px_6px_10px_#24FFE7] bg-[linear-gradient(135deg,_#15FDE4_100%,_#13E5CE_0%)] items-center space-x-2 px-6 py-4 rounded-full hover:opacity-80 cursor-pointer transition-colors"
                    : "flex shadow-[inset_0_0_12px_1px_#2F2F2F] items-center space-x-2 px-6 py-4 rounded-full hover:opacity-80 cursor-pointer transition-colors text-white"
                }`}>
                {submitting ? (
                  <span>Please wait...</span>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
