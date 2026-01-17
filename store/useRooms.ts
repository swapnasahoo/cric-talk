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
  addRoom: (room) =>
    set((s) => {
      const updateRooms: Room[] = [...s.rooms, room];
      const sortedRooms: Room[] = updateRooms.sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );

      return { rooms: sortedRooms };
    }),
  updateRoom: (roomData) =>
    set((s) => {
      const updatedRooms = s.rooms.map((r) =>
        r.$id === roomData.$id ? { ...r, ...roomData } : r
      );

      const sortedRooms = updatedRooms.sort(
        (a, b) =>
          new Date(b.startTime || "").getTime() -
          new Date(a.startTime || "").getTime()
      );

      return { rooms: sortedRooms };
    }),
  deleteRoom: (roomId) =>
    set((s) => ({ rooms: s.rooms.filter((r) => r.$id !== roomId) })),
}));
