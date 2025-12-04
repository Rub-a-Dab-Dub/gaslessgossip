"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition, DialogPanel, DialogTitle, TransitionChild } from "@headlessui/react";
import { X } from "lucide-react";
import api from "@/lib/axios";
import toast from "react-hot-toast";

interface DeleteRoomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    roomId: number;
    roomName: string;
    onDeleted?: () => void;
}

export default function DeleteRoomModal({ isOpen, onClose, roomId, roomName, onDeleted }: DeleteRoomModalProps) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        try {
            setLoading(true);
            const res = await api.delete(`/rooms/${roomId}`);
            if (res.data.error) {
                toast.error(res.data.message || "Failed to delete room");
            } else {
                toast.success(res.data.message || "Room deleted successfully");
                onDeleted?.();
                onClose();
            }
        } catch (err) {
            console.error(err);
            toast.error("Error deleting room");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
                </TransitionChild>

                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#1a1d24] p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-4">
                                    <DialogTitle className="text-lg font-medium text-white">Delete Room</DialogTitle>
                                    <button onClick={onClose} className="p-1 rounded hover:bg-white/10 transition-colors">
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>

                                <div className="mt-2">
                                    <p className="text-sm text-gray-300">
                                        Are you sure you want to delete <span className="font-semibold">{roomName}</span>? This action cannot be undone.
                                    </p>
                                </div>

                                <div className="mt-6 flex justify-end gap-4">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 transition-colors text-white"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 transition-colors text-white"
                                        disabled={loading}
                                    >
                                        {loading ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
