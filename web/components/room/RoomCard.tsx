/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Image from "next/image";
import NFTOne from "@/images/photos/nft-1.png";
import { IRoom } from "@/types/room";
import Avatar from "../ui/Avatar";
import { Clock10, Users2, Edit2, Trash2 } from "lucide-react";
import DeleteRoomModal from "./DeleteRoomModal";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface RoomCardProps {
    room: IRoom;
    action: boolean;
}

export default function RoomCard({ room, action }: RoomCardProps) {
    const router = useRouter();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        try {
            setLoading(true);
            const res = await api.delete(`/rooms/${room.id}`);
            if (res.data.error) toast.error(res.data.message || "Failed to delete room");
            else {
                toast.success(res.data.message || "Room deleted successfully");
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            toast.error("Error deleting room");
        } finally {
            setLoading(false);
            setIsDeleteOpen(false);
        }
    };

    // Determine access type label
    const accessLabel = () => {
        switch (room.type) {
            case "public":
                return (
                    <span className="px-2 py-0.5 bg-green-600 text-white rounded-full text-xs font-semibold">
                        Public
                    </span>
                );
            case "paid":
                return (
                    <span className="px-2 py-0.5 bg-yellow-600 text-black rounded-full text-xs font-semibold">
                        Paid ${room.fee ?? 0}
                    </span>
                );
            case "invite_only":
                return (
                    <span className="px-2 py-0.5 bg-purple-600 text-white rounded-full text-xs font-semibold">
                        Invite Only
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <div className="bg-zinc-900 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full mb-4 p-4 sm:p-0 relative">
                {/* Room Image */}
                <div className="flex-shrink-0 w-full sm:w-[180px] h-[150px] sm:h-[120px] rounded-2xl overflow-hidden relative">
                    <Image
                        src={room?.photo || NFTOne}
                        alt={room?.name}
                        className="w-full h-full object-cover"
                    />

                    {/* Access Label */}
                    <div className="absolute top-2 left-2">{accessLabel()}</div>
                </div>

                {/* Room Info */}
                <div className="flex-1 flex flex-col justify-between w-full space-y-3 sm:space-y-6">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 pr-2">
                            <h2 className="text-dark-white text-lg sm:text-xl font-bold font-fredoka truncate">
                                {room?.name ?? ""}
                            </h2>
                            {room?.description && (
                                <p className="text-tertiary text-sm line-clamp-2 mt-1">{room.description}</p>
                            )}
                        </div>

                        {/* Edit / Delete Buttons */}
                        {action && (
                            <div className="flex gap-2 mt-1 sm:mt-0 pr-4">
                                <button
                                    onClick={() => router.push(`/rooms/edit?id=${room.id}`)}
                                    className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                    title="Edit Room"
                                >
                                    <Edit2 className="w-5 h-5 text-gray-400" />
                                </button>
                                <button
                                    onClick={() => setIsDeleteOpen(true)}
                                    className="p-2 rounded-lg hover:bg-red-600/20 transition-colors"
                                    title="Delete Room"
                                >
                                    <Trash2 className="w-5 h-5 text-red-500" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Room Stats */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 text-sm sm:text-base mt-2 sm:mt-0">
                        {/* Member Avatars */}
                        {room.members?.length > 0 && (
                            <div className="flex items-center gap-1">
                                <div className="isolate flex -space-x-1 overflow-hidden">
                                    {room.members.slice(0, 4).map((member) => (
                                        <div
                                            key={member.id}
                                            className="relative inline-block w-6 h-6 rounded-full overflow-hidden border border-gray-700"
                                        >
                                            {member.user.photo ? (
                                                <img
                                                    src={member.user.photo}
                                                    alt="avatar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Avatar />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {room.members?.length > 0 && <div className="hidden sm:block h-6 w-px bg-gray-700" />}

                        {/* Members count */}
                        <div className="flex items-center gap-1 text-red-500">
                            <Users2 size={16} />
                            <span className="text-zinc-400 font-semibold">{room.members?.length ?? 0}</span>
                        </div>

                        <div className="hidden sm:block h-6 w-px bg-gray-700" />

                        {/* Duration */}
                        <div className="flex items-center gap-1 text-cyan-400">
                            <Clock10 size={16} />
                            <span className="text-zinc-400">{room?.duration ?? "-"} mins</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            <DeleteRoomModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                roomId={room.id}
                roomName={room.name}
            />
        </>
    );
}
