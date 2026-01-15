import { Room } from "@/interfaces/Room";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const MatchRoomCard = ({ room }: { room: Room }) => {
  const getStatusColor = () => {
    switch (room.status) {
      case "live": return "bg-red-500";
      case "upcoming": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Pressable 
      className="mx-6 mb-6 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden active:opacity-95"
      onPress={() => router.push(`/(rooms)/${room.$id}`)}
    >
      {/* STATUS HEADER */}
      <View className="flex-row items-center justify-between px-6 py-2 border-b border-gray-50 bg-gray-50/50">
        <View className="flex-row items-center gap-2">
          <View className={`w-2 h-2 rounded-full ${room.status === 'live' ? 'bg-red-500' : 'bg-gray-400'}`} />
          <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{room.status}</Text>
        </View>
        <Text className="text-[10px] text-gray-400 font-medium">Stadium: Lords, London</Text>
      </View>

      <View className="p-6">
        {/* TEAMS */}
        <View className="flex-row items-center justify-between mb-4">
          {/* TEAM 1 */}
          <View className="items-center flex-1">
            <View className="bg-blue-100 w-14 h-14 items-center justify-center rounded-2xl border border-blue-200 mb-2">
              <Text className="text-blue-700 font-bold text-xl">
                {room.teams[0].slice(0, 3).toUpperCase()}
              </Text>
            </View>
            <Text className="text-slate-900 font-bold text-sm text-center" numberOfLines={1}>
              {room.teams[0]}
            </Text>
          </View>

          <View className="px-4 items-center">
            <Text className="text-gray-300 font-black text-2xl italic">VS</Text>
          </View>

          {/* TEAM 2 */}
          <View className="items-center flex-1">
            <View className="bg-orange-100 w-14 h-14 items-center justify-center rounded-2xl border border-orange-200 mb-2">
              <Text className="text-orange-700 font-bold text-xl">
                {room.teams[1].slice(0, 3).toUpperCase()}
              </Text>
            </View>
            <Text className="text-slate-900 font-bold text-sm text-center" numberOfLines={1}>
              {room.teams[1]}
            </Text>
          </View>
        </View>

        {/* DETAILS */}
        <View className="flex-row items-center justify-center gap-4 py-3 border-t border-gray-50 mt-2">
          <View className="flex-row items-center gap-1">
            <Ionicons name="people-outline" size={14} color="#64748b" />
            <Text className="text-slate-500 text-xs font-medium">1.2k joined</Text>
          </View>
          <View className="w-1 h-1 bg-gray-300 rounded-full" />
          <View className="flex-row items-center gap-1">
            <Ionicons name="chatbubble-outline" size={14} color="#64748b" />
            <Text className="text-slate-500 text-xs font-medium">450 messages</Text>
          </View>
        </View>

        {/* ACTION BUTTON */}
        <View
          className={`${getStatusColor()} py-3 rounded-xl items-center justify-center mt-2 shadow-sm`}
        >
          <Text className="text-white font-bold text-base uppercase tracking-wider">
            {room.status === "live" ? "Join Commentary" : "Set Reminder"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

export default MatchRoomCard;


export default MatchRoomCard;
