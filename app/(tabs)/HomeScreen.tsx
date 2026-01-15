import useCreatePost from "@/hooks/useCreatePost";
import { showToast } from "@/libs/showToast";
import { executePost, fetchPosts } from "@/services/posts.service";
import { usePosts } from "@/store/usePosts";
import { useUser } from "@/store/useUser";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { ViewToken } from "react-native";
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import PostCard from "../components/PostCard";

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const searchQueryRef = useRef<TextInput>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [content, setContent] = useState<string>("");

  const posts = usePosts((s) => s.posts);
  const setPosts = usePosts((s) => s.setPosts);
  const updatePostState = usePosts((s) => s.updatePost);
  const { createNewPost } = useCreatePost();

  const { username, userId } = useUser();

  const SIDEBAR_WIDTH = Dimensions.get("window").width * 0.75;

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function incrementView(postId: string) {
    try {
      const execution = await executePost({
        action: "view",
        postId: postId,
      });
      const parsed = JSON.parse(execution.responseBody);
      const updatedPost = parsed.data;
      updatePostState(updatedPost);
    } catch (error) {
      console.error("Failed to increment view", error);
    }
  }

  const viewedPostsRef = useRef<Set<string>>(new Set());
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      viewableItems.forEach(({ item, isViewable }) => {
        if (!isViewable) return;
        if (viewedPostsRef.current.has(item.$id)) return;

        viewedPostsRef.current.add(item.$id);
        incrementView(item.$id);
      });
    },
    [posts]
  );

  const fetchAllPosts = async () => {
    try {
      const data = await fetchPosts();
      setPosts(data.rows);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchAllPosts();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllPosts();
    setRefreshing(false);
  }, []);

  const sidebarStyle = useAnimatedStyle(() => {
    return {
      left: withTiming(isDrawerOpen ? 0 : -SIDEBAR_WIDTH, { duration: 300 }),
    };
  });

  async function handleCreatePost() {
    if (!content.trim()) return;
    
    Alert.alert("Creating Post", "Are you sure you want to create this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Create",
        onPress: async () => {
          try {
            await createNewPost({ content });
            setIsVisible(false);
            setContent("");

            showToast({
              type: "success",
              text1: "Post Created",
              text2: "Your post has been created successfully.",
            });
            onRefresh();
          } catch (error) {
            showToast({
              type: "error",
              text1: "Error",
              text2: "Could not create post. Please try again later.",
            });
          }
        },
      },
    ]);
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* HEADER */}
      <View className="w-full bg-orange-500 shadow-md z-10">
        <SafeAreaView edges={['top']}>
          <View className="px-6 py-4 flex-row items-center justify-between w-full">
            {/* USER AVATAR */}
            <Pressable
              className="w-10 h-10 bg-orange-400 rounded-full items-center justify-center border border-orange-300 active:scale-95"
              onPress={() => setIsDrawerOpen(true)}
            >
              <Text className="text-white font-bold text-lg capitalize">
                {username?.charAt(0)}
              </Text>
            </Pressable>

            {/* APP NAME */}
            <View className="items-center">
              <Text className="text-white text-2xl font-bold tracking-tight">CricTalk</Text>
              <View className="h-1 w-8 bg-white rounded-full -mt-0.5" />
            </View>

            {/* NOTIFICATION ICON */}
            <Pressable className="bg-orange-600 w-10 h-10 rounded-full items-center justify-center active:scale-95">
              <Octicons name="bell-fill" size={18} color="white" />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#f97316"]} />
        }
        ListHeaderComponent={
          <View className="mb-6">
            {/* SEARCH BAR + FILTER BUTTON */}
            <View className="flex-row items-center gap-3">
              <View className="flex-1 flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 h-12 shadow-sm">
                <Octicons name="search" size={18} color="#94a3b8" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  ref={searchQueryRef}
                  placeholder="Search posts or authors..."
                  className="flex-1 ml-3 text-slate-900"
                  placeholderTextColor="#94a3b8"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={18} color="#cbd5e1" />
                  </Pressable>
                )}
              </View>

              <Pressable className="bg-white w-12 h-12 rounded-2xl items-center justify-center border border-gray-200 shadow-sm active:bg-gray-50">
                <Octicons name="filter" size={20} color="#f97316" />
              </Pressable>
            </View>
            
            <View className="mt-6 flex-row items-center justify-between">
              <Text className="text-slate-900 text-xl font-bold">Recent Updates</Text>
              <Pressable>
                <Text className="text-orange-500 font-medium">View Trends</Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => <PostCard userId={userId!} post={item} />}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Octicons name="inbox" size={48} color="#cbd5e1" />
            <Text className="text-slate-400 mt-4 text-base">No posts found</Text>
          </View>
        }
      />

      {/* CREATE POST BUTTON */}
      <Pressable
        className="w-16 h-16 bg-orange-500 rounded-full items-center justify-center absolute bottom-10 right-6 shadow-lg elevation-lg active:scale-90"
        onPress={() => setIsVisible(true)}
      >
        <Octicons name="plus" size={30} color="white" />
      </Pressable>

      {/* CREATE POST MODAL */}
      <Modal visible={isVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-4xl h-[85%] pb-10">
            <SafeAreaView className="flex-1" edges={['bottom']}>
              {/* MODAL HEADER */}
              <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
                <Pressable onPress={() => setIsVisible(false)} className="p-2">
                  <Ionicons name="close" size={28} color="#1e293b" />
                </Pressable>

                <Text className="text-lg font-bold text-slate-900">New Post</Text>

                <Pressable 
                  onPress={handleCreatePost}
                  disabled={!content.trim()}
                  className={`px-4 py-2 rounded-full ${content.trim() ? 'bg-orange-500' : 'bg-orange-200'}`}
                >
                  <Text className="text-white font-bold">Post</Text>
                </Pressable>
              </View>

              {/* MODAL CONTENT */}
              <View className="px-6 py-6 flex-1">
                <View className="flex-row gap-4">
                  <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center">
                    <Text className="text-orange-600 font-bold text-xl">{username?.charAt(0)}</Text>
                  </View>
                  <View className="flex-1">
                    <TextInput
                      value={content}
                      onChangeText={setContent}
                      placeholder="What's happening in cricket?"
                      multiline
                      textAlignVertical="top"
                      className="text-lg text-slate-900 min-h-[150px]"
                      placeholderTextColor="#94a3b8"
                      autoFocus
                    />
                  </View>
                </View>

                {/* ATTACHMENTS */}
                <View className="mt-auto flex-row items-center gap-6 py-4 border-t border-gray-100">
                  <Pressable className="flex-row items-center gap-2">
                    <Ionicons name="image-outline" size={24} color="#f97316" />
                    <Text className="text-gray-600 font-medium">Image</Text>
                  </Pressable>
                  <Pressable className="flex-row items-center gap-2">
                    <Ionicons name="videocam-outline" size={24} color="#f97316" />
                    <Text className="text-gray-600 font-medium">Video</Text>
                  </Pressable>
                  <Text className="ml-auto text-sm text-gray-400">
                    {content.length}/512
                  </Text>
                </View>
              </View>
            </SafeAreaView>
          </View>
        </View>
      </Modal>

      {/* PROFILE DRAWER OVERLAY */}
      {isDrawerOpen && (
        <Pressable
          className="absolute inset-0 bg-black/60 z-20"
          onPress={() => setIsDrawerOpen(false)}
        />
      )}

      {/* PROFILE DRAWER */}
      <Animated.View
        style={[
          {
            width: SIDEBAR_WIDTH,
            backgroundColor: "#0f172b",
            position: "absolute",
            top: 0,
            bottom: 0,
            zIndex: 30,
            paddingTop: 50,
          },
          sidebarStyle
        ]}
      >
        <SafeAreaView className="flex-1 px-6">
          {/* USER INFO */}
          <View className="mb-10 items-center">
            <View className="w-20 h-20 bg-slate-700 rounded-full items-center justify-center border-4 border-slate-600 mb-4 transition-all active:scale-95">
              <Text className="uppercase text-3xl font-bold text-white">
                {username?.charAt(0)}
              </Text>
            </View>
            <Text className="text-white text-xl font-bold">{username}</Text>
            <Text className="text-slate-400 text-sm">Cricket Enthusiast</Text>
          </View>

          {/* PROFILE CONTENTS */}
          <View className="gap-6">
            {[
              { label: "Profile", icon: "person-outline", href: "/(profile)/ProfileScreen" },
              { label: "Rooms", icon: "chatbubbles-outline", href: "/(tabs)/RoomsScreen" },
              { label: "Leaderboard", icon: "trophy-outline", href: "/(tabs)/LeaderboardScreen" },
              { label: "Settings", icon: "settings-outline", href: "/(profile)/SettingsScreen" },
            ].map((item, idx) => (
              <Pressable
                key={idx}
                className="flex-row items-center gap-4 py-2 active:bg-slate-800 rounded-xl"
                onPress={() => {
                  setIsDrawerOpen(false);
                  router.push(item.href as any);
                }}
              >
                <View className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center">
                  <Ionicons name={item.icon as any} size={22} color="white" />
                </View>
                <Text className="text-white font-semibold text-lg">{item.label}</Text>
              </Pressable>
            ))}
          </View>

          <View className="mt-auto mb-10">
            <Pressable 
              className="flex-row items-center gap-4 py-4 border-t border-slate-800"
              onPress={() => {
                // Handle logout logic here or redirect to login
                setIsDrawerOpen(false);
                router.replace("/(auth)/LoginScreen");
              }}
            >
              <Ionicons name="log-out-outline" size={24} color="#f87171" />
              <Text className="text-red-400 font-bold text-lg">Log Out</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

export default HomeScreen;
