import { Room } from "@/interfaces/Room";
import { create } from "zustand";

type RoomsStateType = {
  rooms: Room[];
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  updateRoom: (roomData: Partial<Room> & Pick<Room, "$id">) => void;
  deleteRoom: (roomId: string) => void;
};

export const useRooms = create<RoomsStateType>((set) => ({
  rooms: [],
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set((s) => ({ rooms: [...s.rooms, room] })),
  updateRoom: (roomData) =>
    set((s) => ({
      rooms: s.rooms.map((r) =>
        r.$id === roomData.$id ? { ...r, ...roomData } : r
      ),
    })),
  deleteRoom: (roomId) =>
    set((s) => ({ rooms: s.rooms.filter((r) => r.$id !== roomId) })),
}));
