'use client'

import {
  MessageCircleMore,
  LogOut,
  X,
  Menu,
} from 'lucide-react';
import { Dialog, DialogPanel } from '@headlessui/react'
import { usePathname, useRouter } from "next/navigation";
import MobileProgresBar from "@/components/MobileProgresBar";

import {
  HomeIcon,
  QuestIcon,
  ChatsIcon,
  RoomIcon,
  UserIcon
} from "@/components/icons"

import Image from "next/image";

import gossipLogo from "@/images/logos/gossip.svg";
import logoMobile from "@/images/logos/logo.svg"

import { useState } from "react";
import Link from "next/link";
import { useAuth } from '@/hooks/useAuth';
import { deleteFromCookie } from '@/lib/cookies';
import { deleteFromLocalStorage } from '@/lib/local-storage';

const navigation = [
  { name: 'home', icon: HomeIcon, href: '/feed' },
  { name: 'quests', icon: QuestIcon, href: '/quests' },
  { name: 'chats', icon: ChatsIcon, href: '/chat' },
  { name: 'rooms', icon: RoomIcon, href: '/rooms' },
  { name: 'me', icon: UserIcon, href: '/me' },
]

export default function Header() {
  const router = useRouter();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    deleteFromCookie("token")
    deleteFromLocalStorage("user")
    router.push("/auth")
  }

  return (
    <header className="fixed top-0 left-0 right-0 sm:border-b border-[#181E1D] bg-[#121418] z-[98] overflow-hidden h-[110px]">
      <div className="max-w-7xl mx-auto md:px-0 px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 hidden md:flex">
          <Image
            src={gossipLogo}
            alt="Gossip Logo"
            sizes="(min-width: 1024px) 32rem, 20rem"
          />
        </div>

        <div className="flex md:hidden">
          <MobileProgresBar />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex flex items-center gap-16">
          {navigation.map((item) => (
            <div className="text-center" key={item.name}>
              <Link
                href={item.href}
                className={`text-light-grey ${item.href === pathname ? 'text-light-teal' : 'hover:text-light-grey'
                  }`}
              >
                <item.icon
                  className={`aspect-square w-auto h-13 p-3 text-light-grey ${item.href === pathname ? 'btn-glass-effect text-light-teal' : 'hover:text-light-grey'
                    }`}
                />
                <span className="text-center">{item.name}</span>
              </Link>
            </div>
          ))}
        </nav>

        <Image
          src={logoMobile}
          alt="Gossip Logo"
          sizes="(min-width: 1024px) 32rem, 20rem"
          className="sm:hidden block"
        />

        {/* Desktop User ID and Logout */}
        <div className="hidden lg:flex flex items-center gap-3 border border-[#1A2221] rounded-full">
          <span className="text-xs text-gray-500 px-6">{user?.username ?? "Stranger"}</span>
          <button className="p-2 btn-glass-effect rounded-full">
            <LogOut onClick={handleLogout}
              className="aspect-square w-auto h-14 p-3 text-teal-200"
            />
          </button>
        </div>

        {/* Mobile menu button */}
        {!mobileMenuOpen &&
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A2221]"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5 text-gray-400" />
          </button>
        }
      </div>

      {/* Mobile menu */}
      <div className="fixed w-screen bottom-0 bg-dark-900 h-28 px-4 py-2 border-t border-teal drop-shadow-xl shadow-xl block sm:hidden">
        <div className="w-full grid grid-cols-5 items-center gap-2">
          {navigation.map((item) => (
            <div className="text-center flex flex-col items-center" key={item.name}>
              <Link
                href={item.href}
                className={`text-light-grey ${item.href === pathname ? 'text-light-teal' : 'hover:text-light-grey'
                  }`}
              >
                <item.icon
                  className={`aspect-square w-auto h-13 p-3 text-light-grey ${item.href === pathname ? 'btn-glass-effect text-light-teal' : 'hover:text-light-grey'
                    }`}
                />
                <span className="text-center">{item.name}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <Dialog as="div" className="lg:hidden mt-48 z-[99]" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99]" />
        <DialogPanel className="fixed inset-y-0 right-0 z-[99] w-full overflow-y-auto bg-[#0a0f1a] px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Image
              src={gossipLogo}
              alt="Gossip Logo"
              className="h-8 w-auto"
            />
            <button
              type="button"
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A2221]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="divide-y divide-gray-800">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <Link
                    href={item.href}
                    key={item.name}
                    className={`flex w-full items-center gap-4 rounded-lg px-4 py-3 ${pathname === item.href
                      ? 'bg-[#0F5951] text-[#14F1D9]'
                      : 'text-[#A3A9A6] hover:bg-[#1A2221] hover:text-white'
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex-shrink-0">
                      {item.name === 'chats' ? (
                        <MessageCircleMore
                          className={`aspect-square w-auto h-13 p-3 text-light-grey ${item.href === pathname ? 'btn-glass-effect text-light-teal' : 'hover:text-light-grey'
                            }`} />
                      ) : (
                        <item.icon
                          className={`aspect-square w-auto h-13 p-3 text-light-grey ${item.href === pathname ? 'btn-glass-effect text-light-teal' : 'hover:text-light-grey'
                            }`}
                        />
                      )}
                    </div>
                    <span className="text-base font-semibold capitalize">{item.name}</span>
                  </Link>
                ))}
              </div>
              <div className="py-6">
                <div className="flex items-center justify-between rounded-lg bg-[#1A2221] px-4 py-3">
                  <span className="text-sm text-gray-400">{user?.username ?? "Stranger"}</span>
                  <button className="p-2 btn-glass-effect rounded-full">
                    <LogOut onClick={handleLogout}
                      className="aspect-square w-auto h-14 p-3 text-teal-200"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}
