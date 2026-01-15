import { Post } from "@/interfaces/Post";
import { UserStats } from "@/interfaces/UserStats";
import { account } from "@/libs/appwrite";
import { fetchPostsByUserId } from "@/services/posts.service";
import { fetchUserStatsByUserId } from "@/services/userStats.service";
import { useUser } from "@/store/useUser";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PostCard from "../components/PostCard";

const ProfileScreen = () => {
  const { userId, username, email, joinDate } = useUser();
  const [activeTab, setActiveTab] = useState<"posts" | "stats">("posts");
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const posts = await fetchPostsByUserId(userId!);
        const stats = await fetchUserStatsByUserId(userId!);
        setUserPosts(posts.rows);
        setUserStats(stats.rows[0] || null);
      } catch (error) {
        console.error("Error loading profile data", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [userId]);

  return (
    <View className="flex-1 bg-white">
      {/* HEADER SECTION */}
      <View className="bg-orange-500 pb-10 rounded-b-[48px] shadow-xl">
        <SafeAreaView edges={['top']}>
          <View className="px-6 py-4 flex-row items-center justify-between">
            <Pressable
              className="h-10 w-10 bg-orange-400/50 items-center justify-center rounded-full active:scale-95"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </Pressable>

            <Text className="text-white text-lg font-bold">Profile</Text>

            <Pressable 
              className="h-10 w-10 bg-orange-400/50 items-center justify-center rounded-full active:scale-95"
              onPress={() => router.push("/(profile)/SettingsScreen")}
            >
              <Ionicons name="settings-outline" size={20} color="white" />
            </Pressable>
          </View>

          <View className="px-8 mt-6">
            <View className="flex-row items-center gap-6">
              <View className="w-24 h-24 bg-white/20 rounded-3xl items-center justify-center border-2 border-white/30 rotate-3">
                <Text className="text-5xl text-white font-black -rotate-3">
                  {username?.[0].toUpperCase()}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="text-2xl text-white font-black italic tracking-tighter" numberOfLines={1}>
                  {username}
                </Text>
                <Text className="text-orange-100 text-sm font-bold opacity-80" numberOfLines={1}>
                  {email}
                </Text>
                <View className="bg-orange-600 self-start px-3 py-1 rounded-full mt-2">
                   <Text className="text-white text-[10px] font-bold">Cricket Enthusiast</Text>
                </View>
              </View>
            </View>

            {/* QUICK STATS */}
            <View className="flex-row mt-8 justify-between bg-white/10 p-4 rounded-3xl border border-white/10">
              <View className="items-center">
                <Text className="text-white font-black text-xl">{userPosts.length}</Text>
                <Text className="text-orange-100 text-[10px] font-bold uppercase tracking-widest">Posts</Text>
              </View>
              <View className="w-px bg-white/10" />
              <View className="items-center">
                <Text className="text-white font-black text-xl">{userStats?.messageCount || 0}</Text>
                <Text className="text-orange-100 text-[10px] font-bold uppercase tracking-widest">Messages</Text>
              </View>
              <View className="w-px bg-white/10" />
              <View className="items-center">
                <Text className="text-white font-black text-xl">#{userStats?.messageCount ? "42" : "-"}</Text>
                <Text className="text-orange-100 text-[10px] font-bold uppercase tracking-widest">Rank</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* TABS */}
      <View className="flex-row justify-center gap-10 mt-8 border-b border-gray-100 pb-4">
        <Pressable onPress={() => setActiveTab("posts")} className="items-center">
          <Text className={`font-bold text-base ${activeTab === 'posts' ? 'text-orange-500' : 'text-gray-400'}`}>Posts</Text>
          {activeTab === 'posts' && <View className="h-1 w-6 bg-orange-500 rounded-full mt-1" />}
        </Pressable>
        <Pressable onPress={() => setActiveTab("stats")} className="items-center">
          <Text className={`font-bold text-base ${activeTab === 'stats' ? 'text-orange-500' : 'text-gray-400'}`}>Activity</Text>
          {activeTab === 'stats' && <View className="h-1 w-6 bg-orange-500 rounded-full mt-1" />}
        </Pressable>
      </View>

      <FlatList
        data={activeTab === 'posts' ? userPosts : []}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <PostCard post={item} userId={userId!} />}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name={activeTab === 'posts' ? "document-text-outline" : "analytics-outline"} size={48} color="#cbd5e1" />
            <Text className="text-slate-400 mt-4 font-bold">{isLoading ? "Loading profile..." : "Nothing to show yet"}</Text>
          </View>
        }
      />
    </View>
  );
};

export default ProfileScreen;
