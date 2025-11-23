"use client";

import { ArrowRight, Home, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Lottie from "lottie-react";
import animationData from "@/public/logo flsah screen4.json";
import { use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/Spinner";

import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";

import Partner1 from "@/images/partners/partner-1.png";
import Partner2 from "@/images/partners/partner-2.png";
import Partner3 from "@/images/partners/partner-3.png";

import HeroImage from "@/public/hero-image.svg";
import HeroImageMobile from "@/images/photos/hero-image-mobile.svg";
import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";

const checkAuth = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    return !!token;
  }

  return false;
};

export default function Landing() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userCount, setUserCount] = useState<number>(0);
  const [roomCount, setRoomCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const getUserCount = async () => {
      const res = await api.get<ApiResponse>("/users/count");
      if (!res.data.error) {
        setUserCount(res.data.data || 0);
      }
    };
    const getRoomCount = async () => {
      const res = await api.get<ApiResponse>("/rooms/count");
      if (!res.data.error) {
        setRoomCount(res.data.data || 0);
      }
    };
    setIsAuthenticated(checkAuth());
    getUserCount();
    getRoomCount();
  }, []);

  useEffect(() => {
    if (userCount && roomCount) {
      setIsLoading(false);
    }
  }, [userCount, roomCount]);

  return (
    <div className="overflow-hidden">
      <div
        className="
        bg-[] hero relative pb-16 min-h-screen bg-cover bg-center bg-no-repeat bg-[url('/wave-hero-pattern-mobile.png')] md:bg-[url('/wave-hero-pattern.png')]"
        style={{
          backgroundSize: "cover",
          backgroundBlendMode: "difference",
          backgroundColor: "",
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        }}
      >
        <div className="relative flex lg:flex-row flex-col items-center px-6 min-h-screen">
          {/* Decorative ellipsis dots scattered in background */}
          <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
            {/*/!* Top right cluster *!/*/}
            {/*<div className="absolute top-20 right-32 flex gap-2">*/}
            {/*  <div className="w-[16px] h-[16px] rounded-full bg-[#1A1C20]"></div>*/}
            {/*  <div className="w-[16px] h-[16px] rounded-full bg-[#25272B]"></div>*/}
            {/*  <div className="w-[16px] h-[16px] rounded-full bg-[#2F3135]"></div>*/}
            {/*</div>*/}

            {/* Middle left cluster */}
            <div className="absolute top-1/3 left-48 flex gap-2">
              <div className="w-[16px] h-[16px] rounded-full bg-[#1A1C20]"></div>
              <div className="w-[16px] h-[16px] rounded-full bg-[#25272B]"></div>
              <div className="w-[16px] h-[16px] rounded-full bg-[#2F3135]"></div>
            </div>

            {/*/!* Middle right cluster *!/*/}
            {/*<div className="absolute top-1/2 right-24 flex gap-2">*/}
            {/*  <div className="w-[16px] h-[16px] rounded-full bg-[#1A1C20]"></div>*/}
            {/*  <div className="w-[16px] h-[16px] rounded-full bg-[#25272B]"></div>*/}
            {/*  <div className="w-[16px] h-[16px] rounded-full bg-[#2F3135]"></div>*/}
            {/*</div>*/}

            {/* Bottom left cluster */}
            <div className="absolute bottom-30 left-14 flex gap-2">
              <div className="w-[16px] h-[16px] rounded-full bg-[#1A1C20]"></div>
              <div className="w-[16px] h-[16px] rounded-full bg-[#25272B]"></div>
              <div className="w-[16px] h-[16px] rounded-full bg-[#2F3135]"></div>
            </div>

            {/* Bottom center cluster */}
            <div className="absolute bottom-48 left-1/4 flex gap-2">
              <div className="w-[16px] h-[16px] rounded-full bg-[#1A1C20]"></div>
              <div className="w-[16px] h-[16px] rounded-full bg-[#25272B]"></div>
              <div className="w-[16px] h-[16px] rounded-full bg-[#2F3135]"></div>
            </div>

            {/* Additional scattered dots */}
            <div className="absolute top-1/4 right-1/3 flex gap-2">
              <div className="w-[16px] h-[16px] rounded-full bg-[#1A1C20]"></div>
              <div className="w-[16px] h-[16px] rounded-full bg-[#25272B]"></div>
              <div className="w-[16px] h-[16px] rounded-full bg-[#2F3135]"></div>
            </div>
          </div>

          <div className="flex items-center md:flex-row flex-col md:space-x-28 w-full mx-auto">
            {/* Right Statistics Sidebar */}
            <div
              className="md:flex md:flex-col md:mt-0 hidden md:w-fit w-full gap-4 md:order-0 order-1"
              style={{
                borderRadius: "60px",
                background: "rgba(18, 20, 24, 0.48)",
                boxShadow: "0 0 12px 0 rgba(241, 247, 246, 0.08) inset",
                backdropFilter: "blur(10px)",
                padding: "24px",
              }}
            >
              {/* 19.4k USERS */}
              <div className="">
                <div className="text-2xl bg-[#1C1E22] rounded-full w-20 h-20 flex items-center justify-center font-medium text-white mb-2">
                  {isLoading ? <Spinner /> : userCount}
                </div>
                <div className="text-sm text-[#A3A9A6] uppercase text-center tracking-wide">
                  Users
                </div>
              </div>

              {/* Connecting line */}
              <div className="w-px h-9 bg-[#1C1E22] mx-auto"></div>

              {/* 8k ROOMS */}
              <div className="">
                <div className="text-2xl bg-[#1C1E22] rounded-full w-20 h-20 flex items-center justify-center font-medium text-white mb-2">
                  {isLoading ? <Spinner /> : roomCount}
                </div>
                <div className="text-sm text-[#A3A9A6] uppercase text-center tracking-wide">
                  Rooms
                </div>
              </div>

              {/* Connecting line */}
              <div className="w-px h-9 bg-[#1C1E22] mx-auto"></div>

              {/* 4 CHAINS */}
              <div className="">
                <div className="text-2xl bg-[#1C1E22] rounded-full w-20 h-20 flex items-center justify-center font-medium text-white mb-2">
                  {2}
                </div>
                <div className="text-sm text-[#A3A9A6] uppercase text-center tracking-wide">
                  Chains
                </div>
              </div>
            </div>

            {/* Left Content Area */}
            <div className="flex-1 pr-8">
              <h1 className="text-5xl lg:text-4xl font-medium text-[#F1F7F6] mb-6 leading-tight font-fredoka">
                Turn Your Gossip To Gold
              </h1>
              <p className="text-lg lg:text-xl text-[#A3A9A6] mb-8 max-w-[450px] leading-relaxed font-fredoka">
                Your gossip just got an upgrade. Chat, earn, and gift your way
                through the blockchain’s most rewarding social playground.
              </p>
              <Link
                href={isAuthenticated ? "/feed" : "/auth"}
                className="inline-flex items-center gap-3 text-[#121418] px-8 py-4 font-medium transition-all duration-200 font-fredoka"
                style={{
                  borderRadius: "32px",
                  background:
                    "linear-gradient(135deg, #15FDE4 100%, #13E5CE 0%)",
                  boxShadow:
                    "-6px -6px 12px 0 #1E9E90 inset, 6px 6px 10px 0 #24FFE7 inset",
                }}
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="hidden md:flex mx-auto mt-16 md:flex max-w-2xl sm:mt-24 lg:mt-0 lg:mr-0 lg:ml-10 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="-m-10">
                <Image
                  width="500"
                  height="500"
                  src={HeroImage}
                  alt="App screenshot"
                  className=" rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="-order-1 flex md:hidden mb-14 mx-auto md:mt-16 md:flex max-w-2xl sm:mt-24 lg:mt-0 lg:mr-0 lg:ml-10 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="-m-10">
                <Image
                  width="500"
                  height="500"
                  src={HeroImageMobile}
                  alt="App screenshot"
                  className=" rounded-md"
                />
              </div>
            </div>
          </div>
          {/* Background pattern at bottom of hero section */}
          {/*<div className="absolute -z-10 bottom-0 top-[10rem]">*/}
          {/*  <svg width="1440" height="727" viewBox="0 0 1440 727" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
          {/*    <g filter="url(#filter0_d_1633_18741)">*/}
          {/*      <path*/}
          {/*        d="M0 644.878C215.973 618.391 378.646 623.643 736 664.5C990.646 693.614 1329.06 693.834 1439.82 648.2L1439.82 6.10352e-05H0V644.878Z"*/}
          {/*        fill="#121418"/>*/}
          {/*    </g>*/}
          {/*    <defs>*/}
          {/*      <filter id="filter0_d_1633_18741" x="-26" y="-22" width="1503.82" height="748.708"*/}
          {/*              filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">*/}
          {/*        <feFlood floodOpacity="0" result="BackgroundImageFix"/>*/}
          {/*        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"*/}
          {/*                       result="hardAlpha"/>*/}
          {/*        <feOffset dx="6" dy="10"/>*/}
          {/*        <feGaussianBlur stdDeviation="16"/>*/}
          {/*        <feComposite in2="hardAlpha" operator="out"/>*/}
          {/*        <feColorMatrix type="matrix" values="0 0 0 0 0.8 0 0 0 0 0.807843 0 0 0 0 0.803922 0 0 0 0.06 0"/>*/}
          {/*        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1633_18741"/>*/}
          {/*        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1633_18741" result="shape"/>*/}
          {/*      </filter>*/}
          {/*    </defs>*/}
          {/*  </svg>*/}
          {/*</div>*/}
        </div>

        <div className="hidden md:block absolute right-[26rem] bottom-34 w-54 space-y-4 mx-auto">
          <h4 className="text-dark-white text-2xl">Send Tokens</h4>
          <p className="text-light-grey text-sm">
            Make someone smile. Drop tokens or NFTs into chats to celebrate,
            reward friends, or just
          </p>
        </div>
      </div>

      <div className="px-6 md:hidden flex">
        <div
          className="grid grid-cols-3 divide-x divide-[#1C1E22] mt-14 w-full gap-4"
          style={{
            borderRadius: "60px",
            background: "rgba(18, 20, 24, 0.48)",
            boxShadow: "0 0 12px 0 rgba(241, 247, 246, 0.08) inset",
            backdropFilter: "blur(10px)",
            padding: "24px",
          }}
        >
          {/* 19.4k USERS */}
          <div className="">
            <div className="text-2xl mx-auto bg-[#1C1E22] rounded-full w-20 h-20 flex items-center justify-center font-medium text-white mb-2">
              {isLoading ? <Spinner /> : userCount}
            </div>
            <div className="text-sm text-[#A3A9A6] uppercase text-center tracking-wide">
              Users
            </div>
          </div>

          {/* 8k ROOMS */}
          <div className="">
            <div className="text-2xl mx-auto bg-[#1C1E22] rounded-full w-20 h-20 flex items-center justify-center font-medium text-white mb-2">
              {isLoading ? <Spinner /> : roomCount}
            </div>
            <div className="text-sm text-[#A3A9A6] uppercase text-center tracking-wide">
              Rooms
            </div>
          </div>

          {/* 4 CHAINS */}
          <div className="">
            <div className="text-2xl mx-auto bg-[#1C1E22] rounded-full w-20 h-20 flex items-center justify-center font-medium text-white mb-2">
              4
            </div>
            <div className="text-sm text-[#A3A9A6] uppercase text-center tracking-wide">
              Chains
            </div>
          </div>
        </div>
      </div>

      {/* About Us Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              {/* Heading */}
              <h2 className="text-4xl lg:text-[40px] font-medium text-white font-fredoka">
                About Us
              </h2>

              {/* Description */}
              <p className=" text-[#A3A9A6] leading-[30px] font-fredoka">
                Gasless Gossip is not just another Web3 chat app. It’s where
                gossip meets tokens, secrets meet collectibles, and every
                message pushes you closer to leveling up. We’re turning social
                interaction into a game — fun, chaotic, and rewarding, with no
                gas fees slowing you down.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={isAuthenticated ? "/feed" : "/auth"}
                  className="inline-flex items-center gap-3 text-[#121418] px-8 py-4 font-medium transition-all duration-200 font-fredoka"
                  style={{
                    borderRadius: "32px",
                    background:
                      "linear-gradient(135deg, #15FDE4 100%, #13E5CE 0%)",
                    boxShadow:
                      "-6px -6px 12px 0 #1E9E90 inset, 6px 6px 10px 0 #24FFE7 inset",
                  }}
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <button
                  className="inline-flex items-center gap-3 bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-medium transition-all duration-200 font-fredoka"
                  style={{
                    borderRadius: "32px",
                    background: "var(--bg, #121418)",
                    boxShadow: "0 1px 12px 0 #2F2F2F inset",
                  }}
                >
                  Join Our Community
                  <Home className="w-5 h-5" />
                </button>
              </div>

              {/* Statistics */}
              <ul className="grid grid-cols-3 place-items-center md:place-items-start gap-8 mt-16">
                <li>
                  <div className="text-3xl lg:text-4xl text-white font-fredoka">
                    {roomCount}
                  </div>
                  <div className="text-sm mt-2 lg:text-xl text-[#A3A9A6]">
                    Rooms Created
                  </div>
                </li>

                <li>
                  <div className="text-3xl lg:text-4xl text-white font-fredoka">
                    {userCount}
                  </div>
                  <div className="text-sm mt-2 lg:text-xl text-[#A3A9A6]">
                    Active Users
                  </div>
                </li>

                <li>
                  <div className="text-3xl lg:text-4xl text-white font-fredoka">
                    8.3M+
                  </div>
                  <div className="text-sm mt-2 lg:text-xl text-[#A3A9A6]">
                    Tips Earned
                  </div>
                </li>
              </ul>
            </div>

            {/* Right Column - Image Placeholder */}
            <div className="flex justify-center lg:justify-end">
              {/* <div
                className="w-full max-w-lg h-80 lg:h-96 rounded-3xl"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                  `,
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                  backgroundColor: "#e0e0e0",
                }}
              /> */}
              <video
                className="w-full aspect-video max-w-lg h-80 lg:h-96 object-contain [&::-webkit-media-controls]:opacity-100 [&::-webkit-media-controls]:transition-none rounded-3xl"
                autoPlay
                loop
                muted
                controls
                playsInline
                disablePictureInPicture
                controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
                onContextMenu={(e) => e.preventDefault()}
              >
                <source src="/videos/gaslessgossipbase.mov" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ/Features Section */}
      <section className="py-20 px-6 lg:px-1">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-12">
            <h2 className="text-4xl lg:text-[40px] font-medium text-white font-fredoka mb-4">
              What We Offer
            </h2>
            <p className="text-lg text-[#A3A9A6] font-fredoka">
              Here are some questions we&apos;ve been asked
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Image Placeholder */}
            <div className="h-full">
              <div className="blur-effect rounded-3xl flex flex-col items-center justify-center gap-2 h-full">
                <svg
                  width="154"
                  height="310"
                  viewBox="0 0 154 310"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M58.0201 40.5592C36.1209 46.7864 19.2114 60.4863 8.95476 80.1367C2.57904 92.5911 0.5 101.032 0.5 115.424C0.5 147.944 20.3202 175.759 51.9216 187.383C64.9502 192.365 86.4336 192.642 98.9079 188.214C103.482 186.553 108.333 184.754 109.719 184.339C111.798 183.647 112.075 184.892 112.075 197.209C111.937 217.828 106.392 227.791 89.7601 236.648C73.9594 245.089 71.4645 261.557 84.6318 271.658C102.096 284.805 138.825 259.619 149.775 226.961C152.824 217.966 152.963 216.167 153.379 136.182C153.656 58.4106 153.656 54.2591 151.161 49.6925C147.419 42.9117 140.627 38.6219 133.559 38.6219C127.044 38.6219 119.005 41.5279 116.233 44.7107C114.293 47.2016 109.164 47.6167 107.224 45.6794C106.392 44.9875 101.819 43.0501 96.9674 41.5279C86.7108 38.2067 68.2767 37.7916 58.0201 40.5592ZM91.8391 75.9852C113.323 84.0114 124.272 107.952 116.233 129.124C112.768 138.396 103.482 148.636 95.3042 152.511C89.2057 155.279 78.8105 165.104 78.8105 168.01C78.8105 169.255 77.9789 169.67 76.7314 169.255C75.6226 168.702 74.6524 167.595 74.6524 166.626C74.6524 164.273 63.4256 154.448 57.6043 151.681C52.1988 149.051 42.6352 139.226 39.1701 132.722C37.0911 128.986 36.5367 124.834 36.5367 114.732C36.5367 99.7871 38.6157 94.3901 47.9021 85.2568C59.2675 73.7711 76.3156 70.3115 91.8391 75.9852Z"
                    fill="#F1F7F6"
                  />
                  <path
                    d="M125.944 1.67311C121.647 3.88723 116.242 11.775 116.242 16.0649C116.242 23.9527 125.112 33.086 132.597 33.086C140.497 33.086 149.506 24.2295 149.506 16.3417C149.506 11.775 144.239 3.88723 139.804 1.67311C135.369 -0.541015 130.379 -0.541015 125.944 1.67311Z"
                    fill="#F1F7F6"
                  />
                  <path
                    d="M55.7984 112.519C54.1352 116.809 55.9371 119.576 60.2337 119.991C65.2234 120.545 67.1639 117.501 64.9462 113.211C63.1444 110.166 56.9073 109.613 55.7984 112.519Z"
                    fill="#F1F7F6"
                  />
                  <path
                    d="M72.0289 113.073C70.227 116.532 72.7219 120.269 76.7414 120.269C78.5432 120.269 80.6222 119.162 81.4538 117.916C83.2557 114.457 80.7608 110.582 76.7414 110.582C74.9395 110.582 72.7219 111.689 72.0289 113.073Z"
                    fill="#F1F7F6"
                  />
                  <path
                    d="M88.5213 113.488C86.5808 117.086 88.9371 120.269 93.511 120.269C97.5304 120.269 99.8867 116.394 98.0849 113.073C96.283 109.613 90.3231 109.89 88.5213 113.488Z"
                    fill="#F1F7F6"
                  />
                  <ellipse
                    cx="76.9996"
                    cy="304.523"
                    rx="55.6364"
                    ry="5.46429"
                    fill="#1B1E23"
                  />
                </svg>
                <p className="text-5xl mt-6">gasless gossip</p>
              </div>
            </div>

            {/* Right Column - Interactive Cards */}
            <ul className="space-y-4">
              <li className="bg-[#16191E] backdrop-blur-sm rounded-3xl p-6 border border-[#1B1E23]">
                <div className="flex items-center space-x-10 mb-3">
                  <button
                    type="button"
                    className="rounded-full bg-[#202226] p-2.5 text-white shadow-xs"
                  >
                    <svg
                      width="26"
                      height="25"
                      viewBox="0 0 26 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22.5158 10.6608L13.5213 10.9749L13.4428 8.72628L14.1923 8.70011C14.5899 8.68623 14.9657 8.51497 15.237 8.22402C15.5083 7.93307 15.6529 7.54626 15.6391 7.14867L15.5344 4.1505C15.5205 3.75292 15.3492 3.37714 15.0583 3.10582C14.7673 2.8345 14.3805 2.68988 13.9829 2.70376L10.9848 2.80846C10.5872 2.82235 10.2114 2.9936 9.94007 3.28455C9.66876 3.5755 9.52413 3.96232 9.53801 4.3599L9.64271 7.35807C9.6566 7.75565 9.82785 8.13144 10.1188 8.40275C10.4098 8.67407 10.7966 8.81869 11.1941 8.80481L11.9437 8.77863L12.0222 11.0273L3.0277 11.3414C2.82891 11.3483 2.64102 11.4339 2.50536 11.5794C2.3697 11.7249 2.29739 11.9183 2.30433 12.1171C2.31127 12.3159 2.3969 12.5038 2.54237 12.6394C2.68785 12.7751 2.88126 12.8474 3.08005 12.8404L6.07822 12.7357L6.18292 15.7339L5.43338 15.7601C5.03579 15.774 4.66001 15.9452 4.38869 16.2362C4.11738 16.5271 3.97275 16.9139 3.98664 17.3115L4.09134 20.3097C4.10522 20.7073 4.27648 21.0831 4.56743 21.3544C4.85838 21.6257 5.24519 21.7703 5.64277 21.7564L8.64095 21.6517C9.03853 21.6379 9.41431 21.4666 9.68563 21.1757C9.95694 20.8847 10.1016 20.4979 10.0877 20.1003L9.98298 17.1021C9.9691 16.7045 9.79784 16.3288 9.50689 16.0575C9.21594 15.7861 8.82913 15.6415 8.43155 15.6554L7.682 15.6816L7.57731 12.6834L18.0709 12.317L18.1756 15.3151L17.4261 15.3413C17.0285 15.3552 16.6527 15.5264 16.3814 15.8174C16.1101 16.1083 15.9654 16.4952 15.9793 16.8927L16.084 19.8909C16.0979 20.2885 16.2692 20.6643 16.5601 20.9356C16.8511 21.2069 17.2379 21.3515 17.6355 21.3376L20.6336 21.2329C21.0312 21.2191 21.407 21.0478 21.6783 20.7569C21.9496 20.4659 22.0943 20.0791 22.0804 19.6815L21.9757 16.6833C21.9618 16.2858 21.7905 15.91 21.4996 15.6387C21.2086 15.3673 20.8218 15.2227 20.4242 15.2366L19.6747 15.2628L19.57 12.2646L22.5682 12.1599C22.767 12.153 22.9549 12.0673 23.0905 11.9219C23.2262 11.7764 23.2985 11.583 23.2915 11.3842C23.2846 11.1854 23.199 10.9975 23.0535 10.8618C22.908 10.7262 22.7146 10.6539 22.5158 10.6608ZM11.0371 4.30755L14.0353 4.20285L14.14 7.20102L11.1418 7.30572L11.0371 4.30755ZM8.5886 20.1527L5.59042 20.2574L5.48572 17.2592L8.4839 17.1545L8.5886 20.1527ZM20.5813 19.7339L17.5831 19.8386L17.4784 16.8404L20.4766 16.7357L20.5813 19.7339Z"
                        fill="url(#paint0_linear_1965_2208)"
                      />
                      <defs>
                        <linearGradient
                          id="paint0_linear_1965_2208"
                          x1="12.4838"
                          y1="2.75611"
                          x2="13.1382"
                          y2="21.4947"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#14F1D9" />
                          <stop offset="1" stopColor="#A0F9F1" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </button>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-white font-fredoka">
                      Seamless Collaboration
                    </h3>
                    <p className="text-light-grey font-fredoka">
                      Connect with others effortlessly in real time. Host rooms,
                      share ideas, and build experiences together without
                      friction.
                    </p>
                  </div>
                </div>
              </li>

              <li className="bg-[#16191E] backdrop-blur-sm rounded-3xl p-6 border border-[#1B1E23]">
                <div className="flex items-center space-x-10 mb-3">
                  <button
                    type="button"
                    className="rounded-full bg-[#202226] p-2.5 text-white shadow-xs"
                  >
                    <svg
                      width="26"
                      height="25"
                      viewBox="0 0 26 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M17.7834 4.07143L7.28977 4.43787C5.89874 4.48794 4.58438 5.08777 3.63509 6.10577C2.68579 7.12376 2.1791 8.47676 2.22619 9.8679L2.54029 18.8624C2.55417 19.26 2.72542 19.6358 3.01638 19.9071C3.30733 20.1784 3.69414 20.323 4.09172 20.3092L22.0808 19.681C22.4783 19.6671 22.8541 19.4958 23.1254 19.2049C23.3968 18.9139 23.5414 18.5271 23.5275 18.1295L23.2134 9.13501C23.1633 7.74398 22.5635 6.42962 21.5455 5.48032C20.5275 4.53103 19.1745 4.02434 17.7834 4.07143ZM21.7143 9.18736L21.7405 9.9369L18.7423 10.0416L18.5879 5.61929C19.4399 5.76369 20.2161 6.19742 20.7856 6.84737C21.3551 7.49732 21.6831 8.32376 21.7143 9.18736ZM13.6002 13.223L12.1011 13.2753L11.9964 10.2772L13.4955 10.2248L13.6002 13.223ZM11.4039 14.8006L14.4021 14.6959C14.6009 14.689 14.7888 14.6033 14.9244 14.4579C15.0601 14.3124 15.1324 14.119 15.1255 13.9202L15.0469 11.6716L17.2956 11.593L17.5311 18.3389L8.53663 18.653L8.30106 11.9071L10.5497 11.8286L10.6282 14.0772C10.6352 14.276 10.7208 14.4639 10.8663 14.5996C11.0117 14.7352 11.2051 14.8075 11.4039 14.8006ZM14.9946 10.1725L14.9684 9.42293C14.9615 9.22414 14.8759 9.03624 14.7304 8.90059C14.5849 8.76493 14.3915 8.69262 14.1927 8.69956L11.1945 8.80426C10.9957 8.8112 10.8079 8.89683 10.6722 9.0423C10.5365 9.18778 10.4642 9.38118 10.4712 9.57997L10.4973 10.3295L8.24871 10.408L8.09166 5.91078L17.0862 5.59669L17.2432 10.0939L14.9946 10.1725ZM6.59519 6.03809L6.74962 10.4604L3.75145 10.5651L3.72528 9.81555C3.69617 8.95187 3.96573 8.10457 4.48851 7.41648C5.01129 6.72838 5.75533 6.24156 6.59519 6.03809ZM3.8038 12.0642L6.80197 11.9595L7.03755 18.7054L4.03937 18.8101L3.8038 12.0642ZM22.0284 18.1819L19.0302 18.2866L18.7947 11.5407L21.7928 11.436L22.0284 18.1819Z"
                        fill="url(#paint0_linear_1965_7790)"
                      />
                      <defs>
                        <linearGradient
                          id="paint0_linear_1965_7790"
                          x1="12.5366"
                          y1="4.25465"
                          x2="13.0862"
                          y2="19.9951"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#14F1D9" />
                          <stop offset="1" stopColor="#A0F9F1" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </button>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-white font-fredoka">
                      Reward System
                    </h3>
                    <p className="text-light-grey font-fredoka">
                      Earn tokens as you engage, create, and grow within the
                      community. Your contributions have value.
                    </p>
                  </div>
                </div>
              </li>

              <li className="bg-[#16191E] backdrop-blur-sm rounded-3xl p-6 border border-[#1B1E23]">
                <div className="flex items-center space-x-10 mb-3">
                  <button
                    type="button"
                    className="rounded-full bg-[#202226] p-2.5 text-white shadow-xs"
                  >
                    <svg
                      width="26"
                      height="25"
                      viewBox="0 0 26 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.4001 5.31783C17.5232 3.5847 15.0374 2.66366 12.4843 2.75544L12.384 2.75894C9.81809 2.87499 7.40159 3.99889 5.65956 5.88646C3.91753 7.77403 2.99073 10.2728 3.0805 12.8398C3.22119 16.8686 5.82953 20.1602 9.88715 21.4359C10.3448 21.5795 10.8302 21.6113 11.3027 21.5286C11.7751 21.4458 12.2209 21.251 12.6025 20.9605C12.9841 20.67 13.2905 20.2922 13.496 19.8588C13.7015 19.4254 13.8001 18.949 13.7835 18.4697C13.7696 18.0721 13.9142 17.6853 14.1856 17.3943C14.4569 17.1034 14.8327 16.9321 15.2302 16.9182L19.5598 16.767C20.24 16.7466 20.8928 16.4941 21.4097 16.0515C21.9266 15.6089 22.2766 15.0028 22.4016 14.3339C22.5434 13.5904 22.5985 12.833 22.5657 12.0768C22.5115 10.7968 22.2037 9.54024 21.6603 8.38003C21.117 7.21981 20.3487 6.17897 19.4001 5.31783ZM20.9247 14.0553C20.8618 14.3885 20.6871 14.6904 20.4294 14.9109C20.1717 15.1314 19.8464 15.2574 19.5074 15.268L15.1779 15.4191C14.3827 15.4469 13.6312 15.7894 13.0885 16.3713C12.5459 16.9532 12.2567 17.7269 12.2844 18.522C12.2924 18.7615 12.243 18.9994 12.1402 19.2158C12.0374 19.4322 11.8842 19.6208 11.6936 19.7659C11.5029 19.911 11.2802 20.0083 11.0442 20.0497C10.8082 20.091 10.5658 20.0753 10.3371 20.0037C6.90367 18.9257 4.69738 16.1604 4.57959 12.7874C4.50363 10.6154 5.28779 8.50116 6.76172 6.90401C8.23565 5.30685 10.2803 4.35581 12.4514 4.2575L12.5357 4.25456C14.708 4.18715 16.8197 4.97622 18.4155 6.4516C20.0113 7.92698 20.9633 9.97046 21.0661 12.1413C21.0941 12.7824 21.0479 13.4246 20.9285 14.0551L20.9247 14.0553ZM13.7787 7.58821C13.7865 7.81058 13.7282 8.03025 13.6111 8.21946C13.494 8.40867 13.3234 8.5589 13.121 8.65118C12.9185 8.74345 12.6932 8.77361 12.4736 8.73784C12.254 8.70207 12.0499 8.60199 11.8872 8.45024C11.7245 8.29849 11.6104 8.1019 11.5594 7.88532C11.5084 7.66874 11.5228 7.4419 11.6007 7.23349C11.6786 7.02507 11.8166 6.84445 11.9971 6.71445C12.1777 6.58445 12.3928 6.51092 12.6152 6.50315C12.9134 6.49274 13.2035 6.60121 13.4217 6.8047C13.6399 7.00818 13.7683 7.29002 13.7787 7.58821ZM9.73478 9.9808C9.74255 10.2032 9.6842 10.4228 9.56711 10.612C9.45003 10.8013 9.27947 10.9515 9.077 11.0438C8.87453 11.136 8.64924 11.1662 8.42963 11.1304C8.21002 11.0947 8.00595 10.9946 7.84322 10.8428C7.68049 10.6911 7.56641 10.4945 7.51541 10.2779C7.46442 10.0613 7.47879 9.83449 7.55671 9.62608C7.63463 9.41766 7.77261 9.23704 7.95319 9.10704C8.13376 8.97704 8.34884 8.90351 8.5712 8.89574C8.86939 8.88533 9.1595 8.9938 9.37771 9.19729C9.59593 9.40077 9.72437 9.68261 9.73478 9.9808ZM9.918 15.2276C9.92577 15.45 9.86742 15.6696 9.75034 15.8589C9.63325 16.0481 9.46269 16.1983 9.26022 16.2906C9.05775 16.3828 8.83246 16.413 8.61285 16.3772C8.39324 16.3415 8.18917 16.2414 8.02644 16.0896C7.86371 15.9379 7.74964 15.7413 7.69864 15.5247C7.64764 15.3081 7.66201 15.0813 7.73993 14.8729C7.81786 14.6645 7.95583 14.4838 8.13641 14.3538C8.31699 14.2238 8.53206 14.1503 8.75443 14.1425C9.05261 14.1321 9.34272 14.2406 9.56094 14.4441C9.77915 14.6476 9.90759 14.9294 9.918 15.2276ZM17.9798 9.69288C17.9875 9.91524 17.9292 10.1349 17.8121 10.3241C17.695 10.5133 17.5244 10.6636 17.322 10.7558C17.1195 10.8481 16.8942 10.8783 16.6746 10.8425C16.455 10.8067 16.2509 10.7067 16.0882 10.5549C15.9255 10.4032 15.8114 10.2066 15.7604 9.98999C15.7094 9.77341 15.7238 9.54657 15.8017 9.33815C15.8796 9.12974 16.0176 8.94911 16.1982 8.81912C16.3787 8.68912 16.5938 8.61559 16.8162 8.60782C17.1144 8.59741 17.4045 8.70588 17.6227 8.90936C17.8409 9.11285 17.9693 9.39469 17.9798 9.69288Z"
                        fill="url(#paint0_linear_1965_7816)"
                      />
                      <defs>
                        <linearGradient
                          id="paint0_linear_1965_7816"
                          x1="12.4845"
                          y1="2.75543"
                          x2="13.1388"
                          y2="21.4931"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#14F1D9" />
                          <stop offset="1" stopColor="#A0F9F1" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </button>
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-white font-fredoka">
                      Creative Freedom
                    </h3>
                    <p className="text-light-grey font-fredoka">
                      Design your space, set your rules, and bring your ideas to
                      life. You control how your room looks, feels, and
                      functions.
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          {/* Launch App Button */}
          <div className="flex justify-end mt-12">
            <Link
              href={isAuthenticated ? "/feed" : "/auth"}
              className="inline-flex items-center gap-3 text-[#121418] px-8 py-4 font-medium transition-all duration-200 font-fredoka"
              style={{
                borderRadius: "32px",
                background: "linear-gradient(135deg, #15FDE4 100%, #13E5CE 0%)",
                boxShadow:
                  "-6px -6px 12px 0 #1E9E90 inset, 6px 6px 10px 0 #24FFE7 inset",
              }}
            >
              Launch App
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="mb-12">
            <h2 className="text-4xl lg:text-[40px] font-medium text-white font-fredoka mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-[#A3A9A6] font-fredoka">
              Here are some questions we&apos;ve been asked
            </p>
          </div>

          {/* FAQ Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Disclosure>
              {({ open }) => (
                <div className="h-fit">
                  <Disclosure.Button
                    className={`bg-[#16191E] ${
                      open ? "rounded-t-4xl" : "rounded-full"
                    } border border-[#1B1E23] group flex w-full items-center justify-between px-10 py-6 hover:bg-[#1A1D22] transition-all`}
                  >
                    <span
                      className={`text-lg font-fredoka transition-colors ${
                        open ? "text-teal-300" : "text-dark-white"
                      }`}
                    >
                      What is this platform about?
                    </span>
                    <ChevronDown
                      className={`size-6 transition-transform duration-200 ${
                        open ? "rotate-180 text-teal-300" : "text-dark-white"
                      }`}
                    />
                  </Disclosure.Button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        key="panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <Disclosure.Panel
                          static
                          className="box-border mb-2 flex justify-center items-center p-8 gap-[10px] md:w-[500px] border border-t-0 border-[#1B1E23] shadow-[0_0_16px_rgba(14,145,134,0.8)] rounded-b-[48px] relative md:left-17"
                        >
                          <p className="w-[436px] font-fredoka font-normal text-[16px] leading-6 capitalize text-[#F1F7F6]">
                            It&apos;s a space where creators can build and host
                            interactive rooms, connect with their audience, and
                            earn tokens for engagement.
                          </p>
                        </Disclosure.Panel>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </Disclosure>

            <Disclosure>
              {({ open }) => (
                <div className="h-fit">
                  <Disclosure.Button
                    className={`bg-[#16191E] ${
                      open ? "rounded-t-4xl" : "rounded-full"
                    } border border-[#1B1E23] group flex w-full items-center justify-between px-10 py-6 hover:bg-[#1A1D22] transition-all`}
                  >
                    <span
                      className={`text-lg font-fredoka transition-colors ${
                        open ? "text-teal-300" : "text-dark-white"
                      }`}
                    >
                      Do I Need A Crypto Wallet To Get Started?
                    </span>
                    <ChevronDown
                      className={`size-6 transition-transform duration-200 ${
                        open ? "rotate-180 text-teal-300" : "text-dark-white"
                      }`}
                    />
                  </Disclosure.Button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        key="panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <Disclosure.Panel
                          static
                          className="box-border mb-2 flex justify-center items-center p-8 gap-[10px] md:w-[500px] border border-t-0 border-[#1B1E23] shadow-[0_0_16px_rgba(14,145,134,0.8)] rounded-b-[48px] relative md:left-17"
                        >
                          <p className="w-[436px] font-fredoka font-normal text-[16px] leading-6 capitalize text-[#F1F7F6]">
                            Yes. You&apos;ll need a wallet to receive tokens and
                            manage gated room access.
                          </p>
                        </Disclosure.Panel>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </Disclosure>

            <Disclosure>
              {({ open }) => (
                <div className="h-fit">
                  <Disclosure.Button
                    className={`bg-[#16191E] ${
                      open ? "rounded-t-4xl" : "rounded-full"
                    } border border-[#1B1E23] group flex w-full items-center justify-between px-10 py-6 hover:bg-[#1A1D22] transition-all`}
                  >
                    <span
                      className={`text-lg font-fredoka transition-colors ${
                        open ? "text-teal-300" : "text-dark-white"
                      }`}
                    >
                      Is it beginner-friendly?
                    </span>
                    <ChevronDown
                      className={`size-6 transition-transform duration-200 ${
                        open ? "rotate-180 text-teal-300" : "text-dark-white"
                      }`}
                    />
                  </Disclosure.Button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        key="panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <Disclosure.Panel
                          static
                          className="box-border mb-2 flex justify-center items-center p-8 gap-[10px] md:w-[500px] border border-t-0 border-[#1B1E23] shadow-[0_0_16px_rgba(14,145,134,0.8)] rounded-b-[48px] relative md:left-17"
                        >
                          <p className="w-[436px] font-fredoka font-normal text-[16px] leading-6 capitalize text-[#F1F7F6]">
                            Yes! You don&apos;t need deep blockchain knowledge —
                            everything is designed to be simple and intuitive.
                          </p>
                        </Disclosure.Panel>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </Disclosure>

            <Disclosure>
              {({ open }) => (
                <div className="h-fit">
                  <Disclosure.Button
                    className={`bg-[#16191E] ${
                      open ? "rounded-t-4xl" : "rounded-full"
                    } border border-[#1B1E23] group flex w-full items-center justify-between px-10 py-6 hover:bg-[#1A1D22] transition-all`}
                  >
                    <span
                      className={`text-lg font-fredoka transition-colors ${
                        open ? "text-teal-300" : "text-dark-white"
                      }`}
                    >
                      How do I earn rewards?
                    </span>
                    <ChevronDown
                      className={`size-6 transition-transform duration-200 ${
                        open ? "rotate-180 text-teal-300" : "text-dark-white"
                      }`}
                    />
                  </Disclosure.Button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        key="panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <Disclosure.Panel
                          static
                          className="box-border mb-2 flex justify-center items-center p-8 gap-[10px] md:w-[500px] border border-t-0 border-[#1B1E23] shadow-[0_0_16px_rgba(14,145,134,0.8)] rounded-b-[48px] relative md:left-17"
                        >
                          <p className="w-[436px] font-fredoka font-normal text-[16px] leading-6 capitalize text-[#F1F7F6]">
                            You earn tokens through participation, room
                            engagement, and community-driven activities.
                          </p>
                        </Disclosure.Panel>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </Disclosure>

            <Disclosure>
              {({ open }) => (
                <div className="h-fit">
                  <Disclosure.Button
                    className={`bg-[#16191E] ${
                      open ? "rounded-t-4xl" : "rounded-full"
                    } border border-[#1B1E23] group flex w-full items-center justify-between px-10 py-6 hover:bg-[#1A1D22] transition-all`}
                  >
                    <span
                      className={`text-lg font-fredoka transition-colors ${
                        open ? "text-teal-300" : "text-dark-white"
                      }`}
                    >
                      Can I create paid or private rooms?
                    </span>
                    <ChevronDown
                      className={`size-6 transition-transform duration-200 ${
                        open ? "rotate-180 text-teal-300" : "text-dark-white"
                      }`}
                    />
                  </Disclosure.Button>

                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        key="panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <Disclosure.Panel
                          static
                          className="box-border mb-2 flex justify-center items-center p-8 gap-[10px] md:w-[500px] border border-t-0 border-[#1B1E23] shadow-[0_0_16px_rgba(14,145,134,0.8)] rounded-b-[48px] relative md:left-17"
                        >
                          <p className="w-[436px] font-fredoka font-normal text-[16px] leading-6 capitalize text-[#F1F7F6]">
                            Absolutely. You can set entry fees or keep your room
                            invite-only through the settings page.
                          </p>
                        </Disclosure.Panel>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </Disclosure>
          </div>

          {/* Launch App Button - Bottom Left */}
          <div className="flex justify-start">
            <Link
              href={isAuthenticated ? "/feed" : "/auth"}
              className="inline-flex items-center gap-3 text-[#121418] px-8 py-4 font-medium transition-all duration-200 font-fredoka"
              style={{
                borderRadius: "32px",
                background: "linear-gradient(135deg, #15FDE4 100%, #13E5CE 0%)",
                boxShadow:
                  "-6px -6px 12px 0 #1E9E90 inset, 6px 6px 10px 0 #24FFE7 inset",
              }}
            >
              Launch App
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Our Partners Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-4xl lg:text-[40px] font-medium text-white font-fredoka mb-4">
              Our Partners
            </h2>
            <p className="text-lg text-[#A3A9A6] font-fredoka">
              Got a question or feedback? Reach out to us
            </p>
          </div>

          <div className="flex items-center justify-center gap-6">
            <div className="rounded-full bg-[#202226] p-5 text-white shadow-xs">
              <Image className="w-16 h-16" src={Partner1} alt="Partner 1" />
            </div>

            <div className="rounded-full bg-[#202226] p-5 text-white shadow-xs">
              <Image className="w-16 h-16" src={Partner3} alt="Partner 3" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer
        style={{
          backgroundSize: "cover",
          // backgroundBlendMode: "difference",
          backgroundColor: "#121418",
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        }}
        className="
          relative pb-10 pt-34 px-6 lg:px-12 bg-[#121418]
          bg-[url('/wave-footer-pattern-mobile.png')]
          md:bg-[url('/wave-footer-pattern.png')]
        "
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-8">
          {/* social icons */}
          <div className="flex items-center gap-10">
            {/* X / Twitter */}
            <a
              href="https://x.com/GaslessGossip?t=ORurIpI7nre4NsvekpHb8w&s=09"
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-[#171A1A] flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.7765 16.5398L11.8859 8.85391L16.7117 3.54531C16.8208 3.42228 16.8771 3.2612 16.8682 3.09697C16.8594 2.93275 16.7862 2.77862 16.6645 2.66801C16.5428 2.5574 16.3824 2.49923 16.2181 2.50609C16.0537 2.51296 15.8987 2.58431 15.7867 2.70469L11.1898 7.76094L8.02652 2.78984C7.97012 2.70106 7.89221 2.62795 7.80003 2.57728C7.70785 2.52661 7.60437 2.50003 7.49918 2.5H3.74918C3.63712 2.49995 3.5271 2.53002 3.43066 2.58708C3.33421 2.64413 3.25487 2.72607 3.20096 2.82431C3.14705 2.92255 3.12054 3.03348 3.12421 3.14548C3.12789 3.25749 3.1616 3.36644 3.22184 3.46094L8.11246 11.1461L3.28668 16.4586C3.23033 16.5191 3.18655 16.5902 3.15788 16.6678C3.12922 16.7454 3.11623 16.8279 3.11969 16.9105C3.12314 16.9932 3.14296 17.0743 3.17799 17.1492C3.21303 17.2241 3.26259 17.2914 3.3238 17.347C3.38501 17.4026 3.45664 17.4455 3.53456 17.4733C3.61248 17.501 3.69513 17.513 3.77772 17.5085C3.8603 17.5041 3.94119 17.4833 4.01568 17.4474C4.09017 17.4114 4.15679 17.3611 4.21168 17.2992L8.80856 12.243L11.9718 17.2141C12.0287 17.3021 12.1068 17.3745 12.199 17.4244C12.2911 17.4744 12.3944 17.5004 12.4992 17.5H16.2492C16.3611 17.5 16.471 17.4699 16.5673 17.4128C16.6637 17.3558 16.7429 17.274 16.7968 17.1759C16.8507 17.0778 16.8772 16.967 16.8737 16.8551C16.8701 16.7432 16.8366 16.6343 16.7765 16.5398ZM12.8421 16.25L4.88746 3.75H7.15309L15.1109 16.25H12.8421Z"
                    fill="#F1F7F6"
                  />
                </svg>
              </div>
              <span className="text-xs tracking-widest text-white">
                TWITTER
              </span>
            </a>

            <div className="h-10 w-px bg-white/10" />

            {/* Telegram */}
            <a
              href="http://t.me/+Aiap4sFVRlUyZmU0"
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-[#171A1A] flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.8818 2.04595C17.7849 1.96233 17.6671 1.90672 17.541 1.88511C17.4149 1.86349 17.2853 1.8767 17.1661 1.92329L1.33332 8.11939C1.10893 8.20664 0.918959 8.36443 0.792006 8.56899C0.665054 8.77355 0.60799 9.01382 0.629405 9.25362C0.65082 9.49342 0.749556 9.71977 0.910748 9.8986C1.07194 10.0774 1.28686 10.1991 1.52316 10.2452L5.6255 11.0506V15.6249C5.62469 15.874 5.69874 16.1177 5.83803 16.3242C5.97733 16.5308 6.17546 16.6908 6.40675 16.7835C6.63768 16.8778 6.89164 16.9004 7.13561 16.8484C7.37958 16.7964 7.60227 16.6723 7.77472 16.492L9.75285 14.4405L12.8911 17.1874C13.1175 17.3882 13.4096 17.4993 13.7122 17.4999C13.8448 17.4998 13.9766 17.4789 14.1028 17.4381C14.3091 17.3727 14.4945 17.2544 14.6408 17.095C14.787 16.9356 14.889 16.7406 14.9364 16.5295L18.1075 2.73423C18.1359 2.60982 18.1299 2.48003 18.0901 2.35878C18.0503 2.23753 17.9783 2.12939 17.8818 2.04595ZM13.1052 4.85845L6.10597 9.87095L2.23097 9.11079L13.1052 4.85845ZM6.8755 15.6249V11.9155L8.81222 13.6139L6.8755 15.6249ZM13.7138 16.2499L7.25441 10.5858L16.5513 3.92251L13.7138 16.2499Z"
                    fill="#F1F7F6"
                  />
                </svg>
              </div>
              <span className="text-xs tracking-widest text-white">
                TELEGRAM
              </span>
            </a>

            <div className="h-10 w-px bg-white/10" />

            {/* GitHub */}
            <a
              href="https://github.com/Rub-a-Dab-Dub/gasless_gossip"
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 rounded-full bg-[#171A1A] flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.2742 5.91251C16.4653 5.29626 16.5265 4.64711 16.4542 4.00599C16.3819 3.36487 16.1775 2.7457 15.8539 2.18751C15.799 2.09248 15.7201 2.01357 15.6251 1.95871C15.53 1.90385 15.4222 1.87499 15.3125 1.87501C14.5845 1.87349 13.8663 2.04225 13.2151 2.36781C12.564 2.69337 11.9981 3.16671 11.5625 3.75001H9.6875C9.25193 3.16671 8.68598 2.69337 8.03485 2.36781C7.38372 2.04225 6.66548 1.87349 5.9375 1.87501C5.82777 1.87499 5.71996 1.90385 5.62492 1.95871C5.52988 2.01357 5.45096 2.09248 5.39609 2.18751C5.07254 2.7457 4.86814 3.36487 4.7958 4.00599C4.72346 4.64711 4.78474 5.29626 4.97578 5.91251C4.58963 6.58651 4.38278 7.34827 4.375 8.12501V8.75001C4.37632 9.80751 4.76021 10.8288 5.4558 11.6254C6.15139 12.4219 7.11169 12.9399 8.15938 13.0836C7.73173 13.6308 7.4996 14.3055 7.5 15V15.625H5.625C5.12772 15.625 4.65081 15.4275 4.29917 15.0758C3.94754 14.7242 3.75 14.2473 3.75 13.75C3.75 13.3396 3.66917 12.9333 3.51212 12.5541C3.35508 12.175 3.12489 11.8305 2.83471 11.5403C2.54453 11.2501 2.20003 11.0199 1.82089 10.8629C1.44174 10.7058 1.03538 10.625 0.625 10.625C0.45924 10.625 0.300269 10.6909 0.183058 10.8081C0.065848 10.9253 0 11.0842 0 11.25C0 11.4158 0.065848 11.5747 0.183058 11.692C0.300269 11.8092 0.45924 11.875 0.625 11.875C1.12228 11.875 1.59919 12.0726 1.95083 12.4242C2.30246 12.7758 2.5 13.2527 2.5 13.75C2.5 14.5788 2.82924 15.3737 3.41529 15.9597C4.00134 16.5458 4.7962 16.875 5.625 16.875H7.5V18.125C7.5 18.2908 7.56585 18.4497 7.68306 18.567C7.80027 18.6842 7.95924 18.75 8.125 18.75C8.29076 18.75 8.44973 18.6842 8.56694 18.567C8.68415 18.4497 8.75 18.2908 8.75 18.125V15C8.75 14.5027 8.94754 14.0258 9.29917 13.6742C9.65081 13.3226 10.1277 13.125 10.625 13.125C11.1223 13.125 11.5992 13.3226 11.9508 13.6742C12.3025 14.0258 12.5 14.5027 12.5 15V18.125C12.5 18.2908 12.5658 18.4497 12.6831 18.567C12.8003 18.6842 12.9592 18.75 13.125 18.75C13.2908 18.75 13.4497 18.6842 13.5669 18.567C13.6842 18.4497 13.75 18.2908 13.75 18.125V15C13.7504 14.3055 13.5183 13.6308 13.0906 13.0836C14.1383 12.9399 15.0986 12.4219 15.7942 11.6254C16.4898 10.8288 16.8737 9.80751 16.875 8.75001V8.12501C16.8672 7.34827 16.6604 6.58651 16.2742 5.91251ZM15.625 8.75001C15.625 9.57881 15.2958 10.3737 14.7097 10.9597C14.1237 11.5458 13.3288 11.875 12.5 11.875H8.75C7.9212 11.875 7.12634 11.5458 6.54029 10.9597C5.95424 10.3737 5.625 9.57881 5.625 8.75001V8.12501C5.63266 7.50003 5.81978 6.89042 6.16406 6.36876C6.22824 6.28417 6.26981 6.18462 6.28485 6.0795C6.29988 5.97439 6.28789 5.86717 6.25 5.76798C6.0872 5.34813 6.00886 4.90029 6.01945 4.45011C6.03004 3.99993 6.12936 3.55627 6.31172 3.14454C6.82322 3.19957 7.31577 3.36901 7.75287 3.6403C8.18997 3.91159 8.5604 4.27779 8.83672 4.71173C8.89303 4.79978 8.97051 4.8723 9.06209 4.92267C9.15368 4.97303 9.25642 4.99962 9.36094 5.00001H11.8883C11.9932 5.00001 12.0964 4.97361 12.1884 4.92323C12.2805 4.87285 12.3583 4.80011 12.4148 4.71173C12.6911 4.27775 13.0615 3.91153 13.4986 3.64023C13.9358 3.36893 14.4283 3.19951 14.9398 3.14454C15.122 3.55637 15.221 4.00009 15.2313 4.45027C15.2417 4.90044 15.163 5.34824 15 5.76798C14.9622 5.86623 14.9496 5.97235 14.9632 6.07672C14.9769 6.18109 15.0164 6.2804 15.0781 6.36564C15.4258 6.8873 15.6157 7.49816 15.625 8.12501V8.75001Z"
                    fill="#F1F7F6"
                  />
                </svg>
              </div>
              <span className="text-xs tracking-widest text-white">GITHUB</span>
            </a>
          </div>
        </div>

        <div className="w-full mt-14 flex items-center justify-between text-[12px] text-white/40">
          <span className="text-secondary">© copyright gaslessgossip2025</span>
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="hover:text-white/70 text-light-grey transition-colors"
            >
              privacy policy
            </a>
            <span>•</span>
            <a
              href="#"
              className="hover:text-white/70 text-light-grey transition-colors"
            >
              terms &amp; conditions
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
