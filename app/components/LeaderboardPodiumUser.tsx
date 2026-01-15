import { UserStats } from "@/interfaces/UserStats";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type Props = {
  userStat: UserStats;
  rank: 1 | 2 | 3;
};

const LeaderboardPodiumUser = ({ userStat, rank }: Props) => {
  const isFirst = rank === 1;
  const sizeClass = isFirst ? "w-24 h-24" : "h-20 w-20";
  const crownColor = isFirst ? "#fbbf24" : rank === 2 ? "#94a3b8" : "#92400e";

  return (
    <View className="items-center">
      {isFirst && (
        <View className="mb-[-10px] z-10">
          <Ionicons name="ribbon" size={28} color={crownColor} />
        </View>
      )}
      
      <View
        className={`${sizeClass} rounded-full items-center justify-center border-4 ${
          isFirst ? "border-yellow-400 bg-white" : "border-slate-300 bg-slate-100"
        } shadow-lg shadow-black/20`}
      >
        <Text className={`${isFirst ? "text-orange-600" : "text-slate-600"} capitalize font-black ${isFirst ? "text-4xl" : "text-2xl"}`}>
          {userStat?.username[0] ?? "-"}
        </Text>
        
        <View className={`absolute -bottom-2 ${isFirst ? "bg-yellow-400" : "bg-slate-400"} px-2 rounded-full border-2 border-white`}>
          <Text className="text-white font-bold text-xs">{rank}</Text>
        </View>
      </View>

      <View className="mt-4 items-center">
        <Text className={`font-bold text-center ${isFirst ? "text-white text-lg" : "text-white/90 text-sm"}`} numberOfLines={1}>
          {userStat?.username || "-"}
        </Text>
        <Text className="text-orange-200 text-xs font-medium">
          {userStat ? `${userStat.messageCount} msg` : "0 msg"}
        </Text>
      </View>
    </View>
  );
};

export default LeaderboardPodiumUser;