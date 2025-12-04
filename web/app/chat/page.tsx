"use client"

import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Paperclip,
  MessageCircleWarningIcon,
  ArrowRightCircleIcon
} from "lucide-react"
import Header from "@/components/ui/Header";

import Image from "next/image";
import SendTokenDialog from "@/components/SendTokenDialog";
import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import toast from "react-hot-toast";
import { IChat, UserSearchResult } from "@/types/chat";
import { useAuth } from "@/hooks/useAuth";
import { timeAgo } from "@/utils/date";
import { useSearchParams } from "next/navigation";

export default function ChatInterface() {
  const searchParams = useSearchParams();
  const cid = searchParams.get("cid") ?? null;
  const username = searchParams.get("u") ?? null;
  const { user } = useAuth();
  const [message, setMessage] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null)
  const [chatId, setChatId] = useState<number | null>(cid ? Number(cid) : null)
  const [chat, setChat] = useState<IChat | null>(null);
  const [chats, setChats] = useState<IChat[]>([]);
  const [userSearch, setUserSearch] = useState<string>(username ? String(username) : "")
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([]);
  const [isSendTokenOpen, setIsSendTokenOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  console.log("🚀 ~ ChatInterface ~ isLoading:", isLoading)

  // Fetch all chats on load
  const getAllChats = async () => {
    try {
      const res = await api.get<ApiResponse>("/chats/me")
      if (!res.data.error) setChats(res.data.data)
    } catch {
      toast.error("Failed to fetch chats")
    }
  }
  useEffect(() => {
    getAllChats()
  }, [])


  const getChat = async () => {
    try {
      const res = await api.get<ApiResponse>(`/chats/${chatId}`)
      if (!res.data.error) {
        const chat = res.data.data;
        const me = chat.sender.username === user?.username ? chat.receiver : chat.sender;
        setChat(chat)
        setSelectedUser(me)
      }
    } catch {
      toast.error("Failed to fetch chat")
    }
  }
  // Get a single chat
  useEffect(() => {
    if (!chatId) {
      setChat(null)
      setSelectedUser(null)
      return;
    };
    getChat();
  }, [chatId])

  const searchUser = async (u: string) => {
    try {
      const res = await api.get<ApiResponse>(`/users/search?username=${u}`)
      const data = res.data.error ? [] : res.data.data
      if (data.length > 0) {
        data.map((user: UserSearchResult) => {
          if (user && (user?.username).toLowerCase().trim() === u.toLowerCase().trim()) {
            setSelectedUser(user)
          }
        })
      }
      return data;
    } catch {
      return []
    }
  }
  // User search
  useEffect(() => {
    if (userSearch.length < 3) {
      setUserSearchResults([])
      return
    }

    let isMounted = true
    const getSearchUser = async () => {
      setIsLoading(true)
      try {
        const data = await searchUser(userSearch);
        if (isMounted) {
          setUserSearchResults(data)
        }
      } catch {
        setIsLoading(false)
      }
    }

    const delay = setTimeout(getSearchUser, 500)
    return () => {
      isMounted = false
      clearTimeout(delay)
    }
  }, [userSearch])


  // Create new chat
  const handleCreateNewChat = async (username: string | null) => {
    if (!username) {
      toast.error("Cannot initiate chat")
      return
    }
    try {
      const res = await api.post<ApiResponse>("/chats", { username })
      if (!res.data.error) {
        toast.success("Chat initiated")
        setChatId(res.data.data.id)
      } else {
        toast.error("Failed to initiate chat")
      }
    } catch {
      toast.error("Failed to initiate chat")
    }
  }

  // send new message
  const handleSendMessage = async (senderId: number, chatId: number) => {
    if (!senderId) {
      toast.error("Cannot send message without sender ID")
      return;
    } if (!chatId) {
      toast.error("Cannot send message without chat ID")
      return;
    }
    if (!message) return;
    try {
      const res = await api.post<ApiResponse>("/messages", { senderId, chatId, content: message })
      if (!res.data.error) {
        setMessage("")
        setChatId(chatId)
        getChat();
      } else {
        toast.error("Failed to send message in chat")
      }
    } catch {
      toast.error("Failed to send message in chat")
    }
  }

  const renderUserAvatar = (photo?: string | null) => (
    photo ? (
      <Image src={photo} alt="photo" width={40} height={40} className="rounded-full object-cover" />
    ) : (
      <span className="inline-block size-10 overflow-hidden rounded-full bg-gray-800 outline outline-white/10">
        <svg fill="currentColor" viewBox="0 0 24 24" className="size-full text-gray-600">
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.9 0 9.26 2.35 12 5.99zM16 9a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </span>
    )
  )

  return (
    <div className="relative">
      <Header />
      <div className="w-full flex bg-black mt-28 mb-28 lg:mb-0 relative">
        {/* Sidebar - Shows on desktop always, on mobile only when no chat selected */}
        <aside
          className={`${chatId === null ? "flex" : "hidden"
            } md:flex w-full md:w-[320px] h-full min-h-screen fixed z-99`}
        >
          <div className="w-full h-full flex-col flex relative bg-black text-white border-r border-teal-500">
            {/* Search Header */}
            <div className="w-full md:w-[320px] h-[72px] fixed flex items-center gap-2 p-4 border-b border-teal-500">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full border-1 border-teal-400 rounded-full bg-teal-900/30 py-3 pr-10 pl-4 text-sm text-light-grey placeholder:text-light-grey outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  {/* <Search
                  size={24}
                  className="absolute right-3 top-1/2 -translate-y-1/2  text-light-grey"
                /> */}
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="w-full h-[calc(100%-72px)] mt-[72px] flex-1 overflow-y-auto">
              {userSearchResults.length === 0 && chats ? (
                chats.length > 0 ?
                  chats.map((chat) => {
                    const me =
                      user?.username === chat.sender.username
                        ? { ...chat.sender, chat_id: chat.id }
                        : { ...chat.receiver, chat_id: chat.id }

                    const recipient =
                      user?.username === chat.sender.username
                        ? { ...chat.receiver, chat_id: chat.id }
                        : { ...chat.sender, chat_id: chat.id }

                    return (
                      <div
                        key={chat.id}
                        onClick={() => {
                          setSelectedUser(recipient)
                          setChatId(chat.id)
                        }}
                        className={`${chat.id == chatId && 'bg-teal-900/25'} flex items-center gap-2 p-4 hover:bg-gray-900 cursor-pointer border-b border-gray-800/50`}
                      >
                        {renderUserAvatar(recipient.photo)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center font-fredoka justify-between">
                            <span className="font-medium text-sm text-white">{user?.username == chat.sender.username ? chat.receiver.username : chat.sender.username}</span>
                          </div>
                          {chat.lastMessage && <div className="flex flex-col items-start gap-1">
                            <p className="text-sm font-fredoka text-light-grey truncate">{chat.lastMessage?.content}</p>
                            <span className="text-xs text-[#7C837F]">{timeAgo(chat.lastMessage?.createdAt)}</span>
                          </div>
                          }
                        </div>
                        <div className="flex flex-col space-y-1">
                          {chat.unreadCount && chat.unreadCount > 0 ? (
                            <span className="inline-flex items-center justify-center self-end rounded-full bg-light-teal text-black w-4 h-4 text-xs font-medium flex-shrink-0">
                              {chat.unreadCount}
                            </span>
                          ) : <></>}
                        </div>
                      </div>
                    )
                  }) : <></>

              ) : (
                userSearchResults.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => {
                      setSelectedUser(u)
                      setChatId(u.chat_id)
                      setUserSearch("")
                      setUserSearchResults([])
                    }}
                    className="flex items-center gap-3 p-4 hover:bg-gray-900 cursor-pointer border-b border-gray-800/50"
                  >
                    {renderUserAvatar(u.photo)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center font-fredoka justify-between">
                        <span className="font-medium text-sm text-white">{u.username}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}

            </div>
          </div>
        </aside>

        {/* Main Chat Section - Shows on desktop always, on mobile only when chat selected */}
        <section
          className={`${selectedUser !== null ? "flex" : "hidden"
            } md:flex flex-1 flex-col w-full h-full md:ml-[320px]`}
        >
          {selectedUser ?
            <div className="w-full h-screen -mt-[112px]">
              {/* Chat Header */}
              <header className="w-full h-[296px] z-0 -mt-[112px] fixed flex items-end justify-between text-white p-4 border-b border-teal-500 bg-black">
                <div className="flex items-center gap-3">
                  <button className="md:hidden" onClick={() => {
                    setChatId(null);
                    getAllChats();
                  }}>
                    <ArrowLeft className="text-gray-400 w-6 h-6" />
                  </button>
                  <span
                    className="inline-block size-10 overflow-hidden rounded-full bg-gray-100 outline -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10">
                    <svg fill="currentColor" viewBox="0 0 24 24" className="size-full text-gray-300 dark:text-gray-600">
                      <path
                        d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </span>
                  <div>
                    <h2 className="font-semibold text-sm text-dark-white">{selectedUser.username}</h2>
                    <p className="text-xs text-teal-300">{selectedUser.title ?? "0x1 ninja"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* <button>
                  <Search className="w-5 h-5 text-gray-400" />
                </button>
                <button>
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button> */}
                </div>
              </header>

              <div className="w-full h-full">
                {!chatId ?
                  <div className="flex flex-col flex-1 h-full items-center justify-center text-center space-y-4 p-6">
                    <MessageCircleWarningIcon className="w-16 h-16 text-teal-400/80" />
                    <h3 className="text-xl font-semibold text-white font-fredoka">
                      Start a Conversation
                    </h3>
                    <p className="text-light-grey text-sm max-w-sm">
                      Looks like you haven’t chatted with <span className="text-teal-300">{selectedUser.username}</span> yet.
                      Send a message to start the conversation.
                    </p>
                    <button
                      onClick={() => handleCreateNewChat(selectedUser.username)}
                      className="bg-teal-950 text-white cursor-pointer font-medium px-5 py-2 rounded-full transition-all duration-200"
                    >
                      Chat Now
                    </button>
                  </div> :
                  <>
                    <div className="w-full h-[calc(100%-276px)] flex flex-col space-y-4 overflow-y-auto mt-[200px]">
                      {chat?.messages && chat.messages.length > 0 ?
                        chat.messages.map((msg, index) => (
                          <div key={msg.id} className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] md:max-w-[70%] ${msg.senderId === user?.id ? "text-right" : "text-left"}`}>
                              <div
                                className={`px-4 py-3.5 ${msg.senderId === user?.id ? "bg-teal-800 rounded-tl-2xl rounded-bl-2xl" : "rounded-tr-2xl rounded-br-2xl bg-[#16191E]"
                                  }`}
                              >
                                <p className="text-sm text-dark-white">{msg.content}</p>
                                <span className="text-xs text-gray-500 mt-1 inline-block">{timeAgo(String(msg.createdAt))}</span>
                              </div>
                            </div>
                          </div>
                        )) :
                        <div className="flex flex-col flex-1 items-center justify-center text-center space-y-4 p-6 h-[calc(100%-76px)] ">
                          <MessageCircleWarningIcon className="w-16 h-16 text-teal-400/80" />
                          <h3 className="text-xl font-semibold text-white font-fredoka">
                            Start a Conversation
                          </h3>
                          <p className="text-light-grey text-sm max-w-sm text-center">
                            Looks like you haven’t chatted with <span className="text-teal-300">{selectedUser.username}</span> yet.
                            Send a message to start the conversation.
                          </p>
                        </div>
                      }
                    </div>

                    {chat &&
                      <div className="h-[76px] p-4 border-t border-gray-800 bg-black">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 relative">
                            <input
                              placeholder="Whisper..."
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              className="text-white placeholder:text-stone-700 bg-[#16191E] w-full py-2.5 rounded-full pl-4 pr-10 outline-none focus:ring-0"
                            />
                            <button type="button" onClick={() => handleSendMessage(Number(user?.id), chat.id)} className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2">
                              <ArrowRightCircleIcon className="w-5 h-5 text-gray-500" />
                            </button>
                          </div>
                          <button
                            onClick={() => setIsSendTokenOpen(true)}
                            className="flex-shrink-0 p-2 hover:bg-gray-800 rounded-full transition-colors"
                          >
                            <Paperclip className="w-5 h-5 text-emerald-500" />
                          </button>
                        </div>
                      </div>
                    }
                  </>
                }
              </div>
            </div> :
            <div className="w-full h-screen -mt-[112px] flex flex-col items-center justify-center gap-4">
              <MessageCircleWarningIcon size={72} className="text-stone-400" />
              <h3 className="text-xl font-medium text-stone-400">
                Click the user you want to chat with...
              </h3>
            </div>
          }
        </section>
      </div>
      <SendTokenDialog isOpen={isSendTokenOpen} onClose={() => setIsSendTokenOpen(false)} />
    </div>
  )
}
