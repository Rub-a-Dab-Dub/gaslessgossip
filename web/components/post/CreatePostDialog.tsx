"use client";

import { Dialog, DialogPanel } from "@headlessui/react";
import { Gift, ArrowRight } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import Avatar from "@/components/ui/Avatar";
import { usePathname } from "next/navigation";
import CreateSuccessDialog from "@/components/CreateSuccessDialog";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { GiftIcon, UploadImageIcon } from "@/components/icons";

interface CreatePostDialogProps {
  show: boolean;
  onClose: () => void;
  onCreated?: (post: any) => void;
}

export default function CreatePostDialog({
  show,
  onClose,
  onCreated,
}: CreatePostDialogProps) {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isPosted, setIsPosted] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // create object URLs for previews
    const urls = selectedFiles.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [selectedFiles]);

  const handlePost = async () => {
    if (!content.trim() && selectedFiles.length === 0) return;
    try {
      setIsPosting(true);
      const form = new FormData();
      form.append("content", content);
      form.append("isAnonymous", String(isAnonymous));
      selectedFiles.forEach((f) => form.append("files", f));

      const res = await api.post<ApiResponse>(`posts`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent: any) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });
      if (res.data.error) {
        toast.error(res.data.message ?? "Failed");
        return;
      }
      toast.success(res.data.message ?? 'Post created');
      setIsPosted(true);
      setContent("");
      setSelectedFiles([]);
      setPreviews([]);
      setUploadProgress(0);
      // Notify parent / listeners that a post was created so UI can refresh
      try {
        const payload = res.data?.data ?? null;
        if (onCreated && payload) onCreated(payload);
        window.dispatchEvent(new CustomEvent("post:created", { detail: payload }));
      } catch (e) {
        // ignore
      }
      onClose();
    } catch (error) {
      toast.error("Unable to create post, an error occurred..");
      console.error("Error posting:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handlePost();
    }
  };

  return (
    <>
      <Dialog open={show} onClose={onClose} className="relative z-50">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel
            style={{
              boxShadow: "0px 14px 13px 0px #14E3CD14",
            }}
            className="w-full max-w-5xl -mt-[12rem] bg-dark-900 border border-[#14F1D9]/30 rounded-3xl"
          >
            <div className="p-6">
              <div className="flex gap-4">
                <Avatar />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What's happening?"
                  className="w-full bg-transparent text-white text-xl placeholder:text-gray-500 resize-none focus:outline-none min-h-[200px]"
                  autoFocus
                />
              </div>

              {/* Upload progress bar */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-800 h-2 rounded-full mt-4 mb-2">
                  <div
                    className="h-2 bg-teal-400 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="p-2 text-[#14F1D9] hover:bg-[#14F1D9]/10 rounded-lg"
                    >
                      <UploadImageIcon />
                    </button>
                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setSelectedFiles((s) => [...s, ...files]);
                      }}
                    />
                  <button className="p-2 text-[#14F1D9] hover:bg-[#14F1D9]/10 rounded-lg">
                    <GiftIcon />
                  </button>
                </div>

                {/* Previews */}
                {previews.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {previews.map((p, i) => (
                      <div key={i} className="relative">
                        <img src={p} className="w-full h-24 object-cover rounded-md" />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFiles((s) => s.filter((_, idx) => idx !== i));
                            setPreviews((s) => s.filter((_, idx) => idx !== i));
                          }}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handlePost}
                  disabled={!content.trim() || isPosting}
                  className="flex items-center gap-3 bg-teal-border border border-dark-teal text-white px-6 py-3 rounded-full hover:bg-grey-800 transition-colors font-semibold"
                >
                  <span className="w-12 h-12 bg-light-teal text-black rounded-full flex items-center justify-center">
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
                  <span className="text-sm font-bold text-light-teal">
                    Post
                  </span>
                </button>
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center gap-2 mt-4 text-white">
                <input
                  type="checkbox"
                  id="anonymous-toggle"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 focus:ring-teal-500 text-teal-500 bg-transparent"
                />
                <label htmlFor="anonymous-toggle" className="text-sm cursor-pointer select-none">
                  Post anonymously
                </label>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      <CreateSuccessDialog
        action="post"
        isOpen={isPosted}
        onClose={() => setIsPosted(false)}
        xpEarned={30}
      />
    </>
  );
}
