"use client";

import { useEffect, useState } from "react";
import { Heart, MessageCircle, Share2, User, ZapIcon } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { IPostList } from "@/types/post";
import { timeAgo } from "@/utils/date";
import { IAllUser } from "@/types/user";

interface SimplePostCardProps {
    post: IPostList;
    user: IAllUser
}

export default function SimplePostCard({ post, user }: SimplePostCardProps) {
    const [liked, setLiked] = useState<boolean>(post.hasLiked);
    const [likes, setLikes] = useState<number>(post.likeCount ?? 0);
    const [updating, setUpdating] = useState(false);

    // Handle Like/Unlike
    const handleLike = async (id: number) => {
        if (updating) return;
        setUpdating(true);

        try {
            const res = await api.post<ApiResponse>(`posts/${id}/like`);
            if (res.data.error) return toast.error(res.data.message ?? "Failed");

            const message = res.data.data.message ?? "";
            const isUnlike = message.toLowerCase().includes("unliked");
            setLiked(!isUnlike);
            setLikes((prev) => (isUnlike ? Math.max(prev - 1, 0) : prev + 1));

            toast.success(message);
        } catch {
            toast.error("Something went wrong");
        } finally {
            setUpdating(false);
        }
    };


    return (
        <div className="rounded-3xl p-6 border border-dark-teal-border-color shadow-md hover:border-teal-400/30 transition-all duration-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {user.photo ? (
                        <img
                            src={user.photo}
                            alt={user.username}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-600 flex items-center justify-center">
                            <User size={28} className="text-teal-200" />
                        </div>
                    )}
                    <div>
                        <div className="font-semibold text-dark-white">
                            {user.username}
                        </div>
                        <span className="text-xs text-secondary">{timeAgo(post.createdAt)}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <p className="text-light-grey mb-4 leading-relaxed">{post.content}</p>

            {/* Media */}
            {post.medias?.length ? (
                <div className="mb-4 grid grid-cols-2 gap-3">
                    {post.medias.map((media, i) => (
                        <img
                            key={i}
                            src={media}
                            alt="Post media"
                            className="rounded-2xl object-cover w-full h-48"
                        />
                    ))}
                </div>
            ) : null}

            {/* Actions */}
            <div className="flex items-center gap-6 mt-2">
                <button
                    onClick={() => handleLike(post.id)}
                    disabled={updating}
                    className={`flex items-center gap-2 transition-colors ${liked ? "text-red-500 hover:text-red-400" : "text-secondary hover:text-red-400"
                        }`}
                >
                    <Heart size={18} fill={liked ? "currentColor" : "none"} />
                    <span className="text-tertiary">{likes}</span>
                </button>

                <button className="flex items-center gap-2 text-secondary hover:text-cyan-400">
                    <MessageCircle size={18} />
                    <span className="text-tertiary">{post.commentCount}</span>
                </button>

                <button className="flex items-center gap-2 text-secondary hover:text-violet-400">
                    <Share2 size={18} />
                </button>

                <button className="flex items-center gap-2 text-secondary hover:text-amber-400">
                    <ZapIcon size={18} />
                </button>
            </div>
        </div>
    );
}
