import { UserStats } from "@/interfaces/UserStats";
import React from "react";
import { Text, View } from "react-native";

type Props = {
  user: UserStats;
  rank: number;
};

const LeaderboardUserRow = ({ user, rank }: Props) => {
  return (
    <View className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex-row items-center mb-3 active:bg-gray-50">
      <View className="bg-gray-100 w-10 h-10 items-center justify-center rounded-xl">
        <Text className="text-slate-500 font-bold">#{rank + 3}</Text>
      </View>

      <View className="ml-4 flex-1">
        <Text className="text-slate-900 font-bold text-base">{user.username}</Text>
        <Text className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
          Collector
        </Text>
      </View>

      <View className="items-end">
        <Text className="text-orange-500 font-black text-lg">
          {new Intl.NumberFormat("en-IN", { notation: "compact" }).format(
            user.messageCount
          )}
        </Text>
        <Text className="text-[10px] text-gray-400 font-medium uppercase">Points</Text>
      </View>
    </View>
  );
};


export default LeaderboardUserRow;
