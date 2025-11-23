"use client";

import { ArrowRight } from "lucide-react";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import CreatePostDialog from "@/components/post/CreatePostDialog";

interface CreatePostButtonsProps {
  onCreated?: (post: any) => void;
}

export default function CreatePostButtons({ onCreated }: CreatePostButtonsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {pathname === "/me" ? (
        <button
          onClick={() => setIsDialogOpen(true)}
          className="w-auto flex-1 text-md sm:text-lg cursor-pointer px-8 py-4 font-semibold bg-light-teal glass-effect__lighter text-light-teal rounded-full hover:bg-emerald-500/10 transition-colors flex items-center gap-2 font-medium"
        >
          <span>Create New Posts</span>
          <ArrowRight size={36} />
        </button>
      ) : (
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-3 drop-shadow-lg cursor-pointer bg-darker-grey border-1 border-teal-border text-white px-6 py-3 rounded-full hover:bg-grey-800 transition-colors font-semibold"
        >
          <span
            className="w-12 h-12 bg-[#14F1D9]
    shadow-[0_4px_10px_rgba(20,241,217,0.15),inset_0_-4px_4px_#009282,inset_0_6px_4px_#85FFF2] text-black rounded-full flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-plus-icon lucide-plus"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </span>
          <span className="text-sm">Create Post</span>
        </button>
      )}
      <CreatePostDialog
        show={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreated={onCreated}
      />
    </>
  );
}
