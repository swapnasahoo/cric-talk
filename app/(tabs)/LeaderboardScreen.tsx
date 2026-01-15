import { UserStats } from "@/interfaces/UserStats";
import { functions } from "@/libs/appwrite";
import { showToast } from "@/libs/showToast";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LeaderboardPodiumUser from "../components/LeaderboardPodiumUser";
import LeaderboardUserRow from "../components/LeaderboardUserRow";

const LeaderboardScreen = () => {
  const [userStatsLeaderboard, setUserStatsLeaderboard] = useState<UserStats[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadUsersMessageCount = async () => {
    try {
      const data = await functions.createExecution({
        functionId: process.env.EXPO_PUBLIC_APPWRITE_LEADERBOARD_GUARD_FUNCTION_ID!,
        async: false,
      });
      const leaderboardData = JSON.parse(data.responseBody).rows;
      setUserStatsLeaderboard(leaderboardData);
    } catch (error) {
      showToast({
        type: "error",
        text1: "Error fetching leaderboard",
        text2: "Please try again later.",
      });
    }
  };

  useEffect(() => {
    loadUsersMessageCount();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsersMessageCount();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="w-full bg-orange-500 rounded-b-[40px] shadow-lg pb-10">
        <SafeAreaView edges={['top']}>
          {/* HEADER */}
          <View className="px-6 py-4 flex-row items-center justify-between">
            <Pressable
              className="w-10 h-10 bg-orange-400/50 rounded-full items-center justify-center active:scale-95"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </Pressable>

            <Text className="text-white text-xl font-black italic tracking-widest">
              LEADERBOARD
            </Text>

            <Pressable className="w-10 h-10 bg-orange-400/50 rounded-full items-center justify-center active:scale-95">
              <Ionicons name="share-social-outline" size={20} color="white" />
            </Pressable>
          </View>

          {/* TOP 3 LEADERBOARD */}
          <View className="items-center mt-6">
            <View className="flex-row items-end justify-center gap-4 w-full px-6">
              {/* RANK 2 */}
              <View className="flex-1 mb-4">
                <LeaderboardPodiumUser
                  userStat={userStatsLeaderboard[1]}
                  rank={2}
                />
              </View>

              {/* RANK 1 */}
              <View className="flex-1 scale-110 z-10 mb-8">
                <LeaderboardPodiumUser
                  userStat={userStatsLeaderboard[0]}
                  rank={1}
                />
              </View>

              {/* RANK 3 */}
              <View className="flex-1 mb-4">
                <LeaderboardPodiumUser
                  userStat={userStatsLeaderboard[2]}
                  rank={3}
                />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={userStatsLeaderboard.slice(3)}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 30, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#f97316"]} />
        }
        ListHeaderComponent={
          <View className="mb-4 flex-row justify-between items-end">
            <Text className="text-slate-900 text-lg font-bold">Runner-ups</Text>
            <Text className="text-gray-400 text-xs font-medium uppercase tracking-widest">Points</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <LeaderboardUserRow user={item} rank={index + 1} />
        )}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="trophy-outline" size={48} color="#cbd5e1" />
            <Text className="text-slate-400 mt-4 font-medium">Loading leaderboard...</Text>
          </View>
        }
      />
    </View>
  );
};
      </View>
    </View>
  );
};

export default LeaderboardScreen;
