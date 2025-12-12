"use client";

import {
  Heart,
  MessageCircle,
  Share2,
  EllipsisVertical,
  BoltIcon,
  ZapIcon,
  Search,
} from "lucide-react";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import Quest from "@/components/Quest";
import CreatePostDialog from "@/components/post/CreatePostDialog";
import CreateNewRoom from "@/components/CreateNewRoom";
import CreatePostButtons from "./post/CreatePostButtons";
import React, { useEffect, useState, useRef } from "react";
import { IAllUser } from "@/types/user";
import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const [user, setUser] = useState<IAllUser | null>(null);
  const [users, setUsers] = useState<IAllUser[] | null>(null);
  const [search, setSearch] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [commentOpen, setCommentOpen] = useState<Record<number, boolean>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const pendingPostsRef = useRef<any[]>([]);
  const [inflightLikes, setInflightLikes] = useState<Record<number, boolean>>({});
  const menuRef = useRef<HTMLDivElement>(null);
  const [postComments, setPostComments] = useState<Record<number, any[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<number, boolean>>({});
  const [commentPage, setCommentPage] = useState<Record<number, number>>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Fetch all users on load
  const getAllUsers = async () => {
    try {
      const res = await api.get<ApiResponse>(`/users/all?search=${search}`);
      if (!res.data.error) setUsers(res.data.data.users);
    } catch {
      toast.error("Failed to fetch users");
    }
  };
  useEffect(() => {
    getAllUsers();
  }, []);

  // Fetch posts (feed)
  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await api.get(`/posts`);
      if (res.data && !res.data.error) {
        // API responses follow { error, message, data }
        // `data` contains the posts array.
        setPosts(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to fetch posts');
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Listen for cross-window/new-post events and show refresh button
  useEffect(() => {
    const handler = () => setHasNewPosts(true);
    window.addEventListener("post:created", handler as EventListener);
    return () => window.removeEventListener("post:created", handler as EventListener);
  }, []);

  // SSE: subscribe to new posts stream
  useEffect(() => {
    const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
    const streamUrl = apiBase ? `${apiBase}/posts/stream` : `/posts/stream`;
    let es: EventSource | null = null;
    try {
      es = new EventSource(streamUrl);
    } catch (e) {
      console.error('Failed to open SSE', e);
      return;
    }

    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        pendingPostsRef.current.push(payload);
        setNewCount((c) => c + 1);
        setHasNewPosts(true);
      } catch (err) {
        console.error('Invalid SSE payload', err);
      }
    };
    es.onerror = (err) => {
      console.error('SSE error', err);
      es?.close();
    };

    return () => {
      es?.close();
    };
  }, []);

  const handleLike = async (postId: number, idx: number) => {
    // prevent concurrent like/unlike requests for the same post
    if (inflightLikes[postId]) return;
    setInflightLikes((s) => ({ ...s, [postId]: true }));
    try {
      const res = await api.post(`/posts/${postId}/like`);
      if (res.data && !res.data.error) {
        // The message is in res.data.data.message (wrapped by ResponseInterceptor)
        const msg = (res.data.data?.message || res.data.message || '').toString().toLowerCase();
        setPosts((prev) => {
          const copy = [...prev];
          const p = { ...(copy[idx] || {}) };
          if (msg.includes('unliked')) {
            p.likeCount = Math.max(0, (p.likeCount || 0) - 1);
            p.hasLiked = false;
          } else {
            p.likeCount = (p.likeCount || 0) + 1;
            p.hasLiked = true;
          }
          copy[idx] = p;
          return copy;
        });
      } else {
        toast.error('Unable to like post');
      }
    } catch (err) {
      toast.error('Unable to like post');
    } finally {
      setInflightLikes((s) => {
        const copy = { ...s };
        delete copy[postId];
        return copy;
      });
    }
  };

  const handleShare = async (post: any) => {
    const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/posts/${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.author?.username || 'Post', text: post.content, url });
        toast.success('Shared');
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
    } catch (err) {
      toast.error('Unable to share');
    }
  };

  const fetchComments = async (postId: number) => {
    if (loadingComments[postId]) return;
    setLoadingComments((s) => ({ ...s, [postId]: true }));
    try {
      const res = await api.get(`/posts/${postId}`);
      if (res.data && !res.data.error) {
        const post = res.data.data;
        setPostComments((s) => ({ ...s, [postId]: post.comments || [] }));
      }
    } catch (err) {
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments((s) => ({ ...s, [postId]: false }));
    }
  };

  const toggleCommentBox = (postId: number) => {
    const isOpening = !commentOpen[postId];
    setCommentOpen((s) => ({ ...s, [postId]: isOpening }));
    // Fetch comments when opening
    if (isOpening && !postComments[postId]) {
      fetchComments(postId);
    }
  };

  const submitComment = async (postId: number, idx: number) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    try {
      const res = await api.post(`/posts/${postId}/comment`, { content: text });
      if (res.data && !res.data.error) {
        toast.success('Comment added');
        setCommentText((s) => ({ ...s, [postId]: '' }));
        // Refresh comments to show the new one
        await fetchComments(postId);
        // increment comment count
        setPosts((prev) => {
          const copy = [...prev];
          const p = { ...copy[idx] };
          p.commentCount = (p.commentCount || 0) + 1;
          copy[idx] = p;
          return copy;
        });
      }
    } catch (err) {
      toast.error('Unable to add comment');
    }
  };

  const renderUserAvatar = (photo?: string | null) =>
    photo ? (
      <Image
        src={photo}
        alt="photo"
        width={40}
        height={40}
        className="rounded-full object-cover"
      />
    ) : (
      <span className="inline-block size-10 overflow-hidden rounded-full bg-gray-800 outline outline-white/10">
        <svg
          fill="currentColor"
          viewBox="0 0 24 24"
          className="size-full text-gray-600"
        >
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.9 0 9.26 2.35 12 5.99zM16 9a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </span>
    );
  return (
    <>
      {/* Main Content */}
      <section className="pt-32 pb-20 max-w-4xl mx-auto px-6">
        {/* Feed Tabs */}
        <TabGroup>
          <TabList className="flex justify-center text-center gap-8 mb-8 border-b border-dark-teal">
            <Tab className="pb-2 data-selected:text-light-teal fill-white data-selected:shadow-xl/50 data-selected:shadow-teal-800 data-selected:border-b data-selected:border-dark-teal w-full flex justify-center">
              For You
            </Tab>
            <Tab className="pb-2 data-selected:text-light-teal data-selected:shadow-xl/50 data-selected:shadow-teal-800 data-selected:border-b data-selected:border-dark-teal w-full flex justify-center">
              Connect
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {/* Posts Feed */}
              <div className="space-y-6">
                {hasNewPosts && (
                  <div className="flex justify-center mb-2">
                    <button
                      onClick={() => {
                        fetchPosts();
                        setHasNewPosts(false);
                        setNewCount(0);
                        pendingPostsRef.current = [];
                      }}
                      className="px-4 py-2 rounded-full bg-teal-600 text-white text-sm shadow-md"
                    >
                      {newCount > 0 ? `${newCount} new posts — Tap to refresh` : 'New posts available — Tap to refresh'}
                    </button>
                  </div>
                )}
                {posts && posts.length > 0 ? (
                  posts.map((post, idx) => (
                    <div
                      key={post.id}
                      className="rounded-3xl p-6 border-1 border-dark-teal-border-color shadow-md"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gray-700" />
                          <div>
                            <div className="font-semibold text-dark-white">
                              {post.author?.username || "Unknown"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-secondary">
                          <span className="text-xs">
                            {post.createdAt
                              ? new Date(post.createdAt).toLocaleString()
                              : ""}
                          </span>
                          <button className="hover:text-white">
                            <EllipsisVertical size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-light-grey mb-4">{post.content}</p>

                      {post.medias && post.medias.length > 0 && (
                        <div className="mb-4 grid grid-cols-2 gap-2">
                          {post.medias.map((m: string, i: number) => (
                            <img
                              key={i}
                              src={m}
                              alt={`media-${i}`}
                              className="w-full h-40 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => handleLike(post.id, idx)}
                          disabled={!!inflightLikes[post.id]}
                          className={`flex items-center gap-2 ${post.hasLiked ? 'text-red-400' : 'text-secondary'} ${inflightLikes[post.id] ? 'opacity-60 pointer-events-none' : 'hover:text-red-400'}`}
                        >
                          <Heart size={18} fill={post.hasLiked ? "currentColor" : "none"} />
                          <span className="text-tertiary">
                            {post.likeCount ?? post.likes?.length ?? 0}
                          </span>
                        </button>
                        <button
                          onClick={() => toggleCommentBox(post.id)}
                          className="flex items-center gap-2 text-secondary hover:text-cyan-400"
                        >
                          <MessageCircle size={18} />
                          <span className="text-tertiary">
                            {post.commentCount ?? post.comments?.length ?? 0}
                          </span>
                        </button>
                        <button onClick={() => handleShare(post)} className="flex items-center gap-2 text-secondary hover:text-cyan-400">
                          <Share2 size={18} />
                          <span className="text-tertiary">{post.shareCount ?? 0}</span>
                        </button>
                        <button className="flex items-center gap-2 text-secondary hover:text-cyan-400">
                          <ZapIcon size={18} />
                          <span className="text-tertiary">{post.zapCount ?? 0}</span>
                        </button>
                      </div>

                      {commentOpen[post.id] && (
                        <div className="mt-4">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentText[post.id] || ""}
                            onChange={(e) =>
                              setCommentText((s) => ({ ...s, [post.id]: e.target.value }))
                            }
                            className="w-full border-1 border-gray-700 rounded-full bg-transparent py-2 px-4 text-sm text-light-grey outline-none"
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={() => submitComment(post.id, idx)}
                              className="px-4 py-2 bg-teal-600 rounded-full text-white text-sm"
                            >
                              Comment
                            </button>
                          </div>

                          {/* Display Comments */}
                          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
                            {loadingComments[post.id] ? (
                              <div className="text-center text-gray-500 text-sm">Loading comments...</div>
                            ) : postComments[post.id] && postComments[post.id].length > 0 ? (
                              postComments[post.id].map((comment: any) => (
                                <div key={comment.id} className="bg-gray-800/50 rounded-lg p-3">
                                  <div className="flex items-start gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0" />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-white">
                                          {comment.author?.username || 'Anonymous'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
                                      
                                      {/* Nested Replies */}
                                      {comment.replies && comment.replies.length > 0 && (
                                        <div className="mt-2 ml-4 space-y-2 border-l-2 border-gray-700 pl-3">
                                          {comment.replies.map((reply: any) => (
                                            <div key={reply.id} className="bg-gray-900/50 rounded p-2">
                                              <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-white">
                                                  {reply.author?.username || 'Anonymous'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                  {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : ''}
                                                </span>
                                              </div>
                                              <p className="text-xs text-gray-300 mt-1">{reply.content}</p>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-gray-500 text-sm">No comments yet</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-light-grey">No posts yet</div>
                )}

                {/* Quests Section */}
                <div className="rounded-2xl px-10 py-8 glass-effect__light">
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
              </div>
            </TabPanel>
            <TabPanel>
              <div className="w-full h-full flex-col flex relative bg-transparent text-white">
                {/* Search Header */}
                <div className="w-full flex items-center gap-2 p-4 border-b border-teal-500">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full border-1 border-teal-400 rounded-full bg-teal-900/30 py-3 pr-10 pl-4 text-sm text-light-grey placeholder:text-light-grey outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        type="button"
                        className="cursor-pointer bg-transparent border-none"
                        onClick={() => getAllUsers()}
                      >
                        <Search
                          size={24}
                          className="absolute right-3 top-1/2 -translate-y-1/2  text-light-grey"
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div className="w-full h-full flex-1 overflow-y-auto">
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <Link
                        href={`/user?u=${user.username}`}
                        key={user.id}
                        onClick={() => setUser(user)}
                        className="flex items-center gap-2 p-4 hover:bg-gray-900 cursor-pointer border-b border-gray-800/50"
                      >
                        {renderUserAvatar(user.photo)}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-medium text-sm text-white">
                              {user.username}
                            </span>
                            <p className="text-xs font-fredoka text-light-grey truncate">
                              {user.title}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </section>

      {/* Fixed Bottom Action Bar */}
      <div
        ref={menuRef}
        className={`fixed group md:bg-dark flex flex-col md:flex-row py-4 rounded-l-full bottom-22 transition-all duration-300 ${
          isOpen ? "md:right-0 pr-20" : "-right-0 md:-right-140  px-10"
        } flex items-center gap-4`}
      >
        <div
          className={`overflow-hidden transition-all duration-300 md:w-auto md:mr-10 md:block hidden ${
            isOpen ? "w-0 mr-0" : ""
          }`}
        >
          <div
            className={`p-3 border border-teal-800 bg-dark-teal rounded-full whitespace-nowrap ${
              isOpen ? "hidden" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              style={{
                borderRadius: "32px",
                background: "linear-gradient(135deg, #15FDE4 100%, #13E5CE 0%)",
              }}
              className="rounded-full cursor-pointer text-black p-4 shadow-[0_4px_10px_rgba(20,241,217,0.15),inset_0_-4px_4px_#009282,inset_0_6px_4px_#85FFF2]"
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
            </button>
          </div>
        </div>

        <CreateNewRoom />
        <CreatePostButtons
          onCreated={async (post) => {
            // Refresh the feed from the server so ordering by createdAt is authoritative
            try {
              setHasNewPosts(false);
              setNewCount(0);
              pendingPostsRef.current = pendingPostsRef.current.filter((p) => p.id !== post.id);
              await fetchPosts();
            } catch (err) {
              console.error('Failed to refresh posts after create', err);
            }
          }}
        />
        <button className="hidden md:flex">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17.7806 11.4694C17.8504 11.539 17.9057 11.6217 17.9434 11.7128C17.9812 11.8038 18.0006 11.9014 18.0006 12C18.0006 12.0986 17.9812 12.1962 17.9434 12.2872C17.9057 12.3783 17.8504 12.461 17.7806 12.5306L11.0306 19.2806C10.9609 19.3503 10.8782 19.4056 10.7872 19.4433C10.6961 19.481 10.5985 19.5004 10.5 19.5004C10.4015 19.5004 10.3039 19.481 10.2128 19.4433C10.1218 19.4056 10.0391 19.3503 9.96937 19.2806C9.89969 19.2109 9.84442 19.1282 9.8067 19.0372C9.76899 18.9461 9.74958 18.8485 9.74958 18.75C9.74958 18.6515 9.76899 18.5539 9.8067 18.4628C9.84442 18.3718 9.89969 18.2891 9.96937 18.2194L15.4397 12.75H3C2.80109 12.75 2.61032 12.671 2.46967 12.5303C2.32902 12.3897 2.25 12.1989 2.25 12C2.25 11.8011 2.32902 11.6103 2.46967 11.4697C2.61032 11.329 2.80109 11.25 3 11.25H15.4397L9.96937 5.78062C9.82864 5.63989 9.74958 5.44902 9.74958 5.25C9.74958 5.05098 9.82864 4.86011 9.96937 4.71938C10.1101 4.57864 10.301 4.49958 10.5 4.49958C10.699 4.49958 10.8899 4.57864 11.0306 4.71938L17.7806 11.4694ZM20.25 3C20.0511 3 19.8603 3.07902 19.7197 3.21967C19.579 3.36032 19.5 3.55109 19.5 3.75V20.25C19.5 20.4489 19.579 20.6397 19.7197 20.7803C19.8603 20.921 20.0511 21 20.25 21C20.4489 21 20.6397 20.921 20.7803 20.7803C20.921 20.6397 21 20.4489 21 20.25V3.75C21 3.55109 20.921 3.36032 20.7803 3.21967C20.6397 3.07902 20.4489 3 20.25 3Z"
              fill="#F1F7F6"
            />
          </svg>
        </button>
      </div>
    </>
  );
}
