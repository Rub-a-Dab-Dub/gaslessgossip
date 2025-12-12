"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { X } from "lucide-react";

import Header from "@/components/ui/Header";
import Avatar from "@/images/photos/avatar.png";
import ArrowRightIcon from "@/images/logos/arrow-right.svg";

import { useAuth } from "@/hooks/useAuth";
import { useProfileData } from "@/hooks/useProfileData";
import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { IUser } from "@/types/user";
import { IPostList } from "@/types/post";

import Quest from "@/components/Quest";
import RoomsTab from "@/components/tabs/Rooms";
import NftsTab from "@/components/tabs/Nfts";
import PostCard from "@/components/cards/PostCard";
import CreatePostButtons from "@/components/post/CreatePostButtons";
import FloatingCreatePostButton from "@/components/post/FloatingCreatePostButton";
import DeletePostDialog from "@/components/post/DeletePostDialog";
import { setToLocalStorage } from "@/lib/local-storage";
import EditPostDialog from "@/components/post/EditPostDialog";
import MyRooms from "@/components/room/MyRooms";
import { ArrowRight } from "@/components/icons";

export default function Me() {
  const { profile, profileStats, myPosts, postsLoading } = useProfileData();
  const { user } = useAuth();

  const [form, setForm] = useState<Partial<IUser>>({});
  const [saving, setSaving] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [post, setPost] = useState<IPostList | null>(null);
  const [postId, setPostId] = useState<number | null>(null);
  const [showPostEdit, setShowPostEdit] = useState(false);
  const [showPostDelete, setShowPostDelete] = useState(false);

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!form.username) return toast.error("Username must not be empty");
    setShowPostDelete;

    try {
      setSaving(true);
      // Only send fields that are allowed in UpdateProfileDto
      const payload: any = {};
      if (form.photo !== undefined) payload.photo = form.photo;
      if (form.address !== undefined) payload.address = form.address;
      if (form.title !== undefined) payload.title = form.title;
      if (form.about !== undefined) payload.about = form.about;
      if (form.username !== undefined) payload.username = form.username;
      if (form.email !== undefined) payload.email = form.email;

      const res = await api.put<ApiResponse>("users/profile", payload);
      if (res.data.error) {
        toast.error(res.data.message ?? "Failed to update profile");
        return;
      }

      setToLocalStorage("user", JSON.stringify(res.data.data));
      setShowEdit(false);
      toast.success("Profile updated");
    } catch (err) {
      console.error(err);
      toast.error("Error occurred while updating profile");
    } finally {
      setShowPostDelete;
      setSaving(false);
    }
  }, [form]);

  const handlePostEdit = (post: IPostList) => {
    setPost(post);
    setShowPostEdit(true);
  };

  const handlePostDelete = (id: number) => {
    setPostId(id);
    setShowPostDelete(true);
  };

  return (
    <>
      <Header />

      {user ? (
        <>
          <div className="max-w-7xl mx-auto px-4 py-32 text-white">
            <ProfileHeader
              profile={profile}
              stats={profileStats}
              onEditClick={() => setShowEdit(true)}
            />

            <QuestsSection />

            <TabGroup>
              <TabList className="flex justify-center text-center gap-8 mb-6 border-b border-dark-teal">
                {["Posts", "Rooms", "NFTs"].map((label) => (
                  <Tab
                    key={label}
                    className="pb-2 w-full outline-none flex justify-center data-selected:text-dark-white text-light-grey data-selected:border-b-4 data-selected:border-teal-300"
                  >
                    {label}
                  </Tab>
                ))}
              </TabList>

              <TabPanels>
                <TabPanel>
                  {postsLoading ? (
                    <p className="py-16 text-center text-sm text-white">
                      Loading posts...
                    </p>
                  ) : myPosts.length === 0 ? (
                    <EmptyPostsState />
                  ) : (
                    <div className="flex flex-col space-y-6">
                      {myPosts.map((post: IPostList) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onEdit={handlePostEdit}
                          onDelete={handlePostDelete}
                        />
                      ))}
                    </div>
                  )}
                </TabPanel>

                <TabPanel>
                  <MyRooms />
                </TabPanel>

                <TabPanel>
                  <NftsTab />
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </div>

          {postId && (
            <DeletePostDialog
              id={postId}
              show={showPostDelete}
              onClose={() => setShowPostDelete(false)}
            />
          )}
          {post && (
            <EditPostDialog
              post={post}
              show={showPostEdit}
              onClose={() => setShowPostEdit(false)}
            />
          )}

          <FloatingCreatePostButton />

          {showEdit && (
            <EditProfileModal
              form={form}
              onChange={handleChange}
              onClose={() => setShowEdit(false)}
              onSave={handleSave}
              saving={saving}
              onPhotoChange={(url) => setForm((prev) => ({ ...prev, photo: url }))}
            />
          )}
        </>
      ) : (
        <></>
      )}
    </>
  );
}

/* ------------------------- Sub Components ------------------------- */

function ProfileHeader({
  profile,
  stats,
  onEditClick,
}: {
  profile: IUser | null;
  stats: any;
  onEditClick: () => void;
}) {
  return (
    <div
      style={{
        boxShadow: "0px 12px 13px -6px #14E3CD14",
      }}
      className="p-3 rounded-bl-3xl rounded-br-3xl flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8"
    >
      <div className="flex items-center gap-6">
        <div>
          <Image
            src={profile?.photo ?? Avatar}
            alt=""
            width={120}
            height={120}
            className="rounded-full object-cover border-2 border-emerald-500"
          />
          <div className="text-sm text-center mt-2 text-dark-white">
            {profile?.username ?? "stranger"}
          </div>
        </div>

        <div>
          <div className="flex gap-6 mb-3">
            {[
              { id: "posts", name: "Posts", link: "" },
              {
                id: "followers",
                name: "Followers",
                link: `/user/followers?u=${profile?.username}`,
              },
              {
                id: "following",
                name: "Following",
                link: `/user/following?u=${profile?.username}`,
              },
            ].map((row) =>
              !row.link ? (
                <div key={row.id}>
                  <div className="text-sm text-tertiary uppercase mb-1">
                    {row.name}
                  </div>
                  <div className="text-2xl font-fredoka font-semibold">
                    {stats?.[row.id] ?? 0}
                  </div>
                </div>
              ) : (
                <Link key={row.id} href={row.link}>
                  <div className="text-sm text-tertiary uppercase mb-1">
                    {row.name}
                  </div>
                  <div className="text-2xl font-fredoka font-semibold">
                    {stats?.[row.id] ?? 0}
                  </div>
                </Link>
              )
            )}
          </div>
          <div className="text-grey-100 text-sm space-y-0.5">
            <div>{profile?.title ?? "--"}</div>
            {profile?.about && <div>{profile.about}</div>}
            <div>XP: {profile?.xp ?? 0}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full lg:w-64">
        <Link
          href="/wallet"
          className="text-white flex justify-center space-x-2 shadow-[inset_0_0_12px_1px_#2F2F2F]  items-center space-x-2 px-6 py-3 rounded-full hover:opacity-80 cursor-pointer transition-colors"
        >
          <span>View Wallet</span>
        </Link>
        <button
          onClick={onEditClick}
          className="px-6 py-3 bg-[#1A1D22] text-gray-300 rounded-full hover:bg-[#1A1D22]/70 font-medium"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}

function QuestsSection() {
  return (
    <div className="rounded-2xl px-10 py-8 glass-effect__light mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-grey-500 font-fredoka">
          Quests
        </h2>
        <button className="text-sm text-teal-300 hover:underline">
          View All
        </button>
      </div>
      <ul className="grid grid-cols-2 gap-4">
        <Quest />
      </ul>
    </div>
  );
}

function EmptyPostsState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 border border-teal-border rounded-xl">
      <h3 className="text-base font-semibold mb-2 text-dark-white">
        No post has been made yet
      </h3>
      <p className="text-light-grey mb-8">
        Create your first post to get started
      </p>
      <CreatePostButtons />
    </div>
  );
}
const safeValue = (val: any) =>
  typeof val === "string" || typeof val === "number" ? val : "";

function EditProfileModal({
  form,
  onChange,
  onClose,
  onSave,
  saving,
  onPhotoChange,
}: {
  form: Partial<IUser>;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  onPhotoChange?: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(form.photo || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post<ApiResponse>("files", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.error) {
        toast.error(res.data.message ?? "Failed to upload photo");
        setPhotoPreview(form.photo || null);
        return;
      }

      const uploadedUrl = res.data.data?.url;
      if (uploadedUrl && onPhotoChange) {
        onPhotoChange(uploadedUrl);
      }
      toast.success("Photo uploaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload photo");
      setPhotoPreview(form.photo || null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-teal-800/75 w-full max-w-lg border border-teal-300 rounded-4xl p-8 shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-emerald-300 hover:text-emerald-400"
        >
          <X size={32} />
        </button>

        <h2 className="text-2xl font-normal pt-4 pb-2 text-left text-zinc-300/80">
          Edit Profile
        </h2>
        <div className="text-sm font-normal text-emerald-200 mb-4">
          Update your account info
        </div>

        {/* Profile Photo Upload */}
        <div className="mb-6 flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700 border-2 border-emerald-500">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.9 0 9.26 2.35 12 5.99zM16 9a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-emerald-500 text-black rounded-full p-2 hover:bg-emerald-400 disabled:opacity-50"
            >
              {uploading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <p className="text-xs text-zinc-400 mt-2">Click to change photo</p>
        </div>

        {["email", "username", "title"].map((field) => (
          <div key={field} className="mb-3">
            <label className="block text-sm text-zinc-300/80 mb-1 capitalize">
              {field}
            </label>
            <input
              type="text"
              name={field}
              value={safeValue(form[field as keyof IUser])}
              onChange={onChange}
              className="w-full px-4 py-2 bg-white/5 text-zinc-200 rounded-md border border-emerald-400/10 outline-none"
            />
          </div>
        ))}

        <div className="mb-4">
          <label className="block text-sm text-zinc-300/80 mb-1">About</label>
          <textarea
            name="about"
            value={form.about || ""}
            onChange={onChange}
            rows={2}
            className="w-full px-4 py-2 bg-white/5 text-zinc-200 rounded-md border border-emerald-400/10 outline-none resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-zinc-100 text-zinc-100 hover:bg-zinc-600 bg-zinc-500 transition"
          >
            Cancel
          </button>
          <button
            disabled={saving || uploading}
            onClick={onSave}
            className="px-6 py-2 rounded-full bg-emerald-500 text-black font-medium hover:bg-emerald-400 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
