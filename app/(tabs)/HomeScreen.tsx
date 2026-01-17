import { account } from "@/libs/appwrite";
import { executePost, fetchPosts } from "@/services/posts.service";
import { usePosts } from "@/store/usePosts";
import { useUser } from "@/store/useUser";
import { Octicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { ViewToken } from "react-native";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CreatePostModal from "../components/CreatePostModal";
import PostCard from "../components/PostCard";
import ProfileDrawer from "../components/ProfileDrawer";

const HomeScreen = () => {
  const [userId, setUserId] = useState<string>("");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const seacrhQueryRef = useRef<TextInput>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const posts = usePosts((s) => s.posts);
  const setPosts = usePosts((s) => s.setPosts);
  const updatePostState = usePosts((s) => s.updatePost);

  const username = useUser((s) => s.username);

  async function increamentView(postId: string) {
    const post = posts.find((p) => p.$id === postId);
    if (!post) return;

    if (post.viewedBy.includes(userId)) return;

    const optimisticPost = {
      ...post,
      views: post.views + 1,
      viewedBy: [...post.viewedBy, userId],
    };

    updatePostState(optimisticPost);

    try {
      const execution = await executePost({
        action: "view",
        postId: postId,
      });
      const parsed = JSON.parse(execution.responseBody);

      const updatedPost = parsed.data;
      updatePostState(updatedPost);
    } catch (error) {
      updatePostState(post);
    }
  }

  const viewedPostsRef = useRef<Set<string>>(new Set());
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      viewableItems.forEach(({ item, isViewable }) => {
        if (!isViewable) return;
        if (viewedPostsRef.current.has(item.$id)) return;

        viewedPostsRef.current.add(item.$id);

        increamentView(item.$id);
      });
    },
    [posts]
  );

  useEffect(() => {
    let mounted = true;

    async function fetchUserId() {
      if (!mounted) return;
      const user = await account.get();

      setUserId(user.$id);
    }
    fetchUserId();

    async function fetchAllPosts() {
      if (!mounted) return;
      const data = await fetchPosts();
      setPosts(data.rows);
    }
    fetchAllPosts();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="w-full h-30 bg-orange-500">
        <SafeAreaView>
          <View className="px-6 py-4 flex-row items-center justify-between w-full">
            {/* USER AVATAR */}
            <Pressable
              className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center transition-all ease-in-out duration-300 active:scale-[0.98] active:opacity-85"
              onPress={() => setIsDrawerOpen(true)}
            >
              <Text className="text-slate-900 font-medium text-lg capitalize">
                {username?.charAt(0)}
              </Text>
            </Pressable>

            {/* APP NAME */}
            <Text className="text-white text-xl font-semibold">CricTalk</Text>

            {/* NOTIFICATION ICON */}
            <Pressable className="bg-orange-600 w-10 h-10 rounded-full items-center justify-center transition-all ease-in-out duration-300 active:scale-[0.98] active:opacity-85">
              <Octicons name="bell-fill" size={18} color="white" />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      <View className="px-6 py-4">
        {/* SEARCH BAR + FILTER BUTTON */}
        <View className="flex-row items-center">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            ref={seacrhQueryRef}
            placeholder="Search anything..."
            className="border border-gray-300 rounded-lg pl-4 flex-1 mr-4 h-12"
          />

          <Pressable className="bg-orange-500 w-12 h-12 rounded-lg items-center justify-center">
            <Octicons name="filter" size={24} color="white" />
          </Pressable>
        </View>

        {/* POSTS */}
        <View className="mt-6">
          <FlatList
            data={posts}
            keyExtractor={(item) => item.$id}
            contentContainerStyle={{ paddingBottom: 200 }}
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            renderItem={({ item }) => <PostCard userId={userId} post={item} />}
          />
        </View>
      </View>

      {/* CREATE POST BUTTON */}
      <Pressable
        className="w-16 h-16 bg-orange-500 rounded-full items-center justify-center absolute bottom-6 right-6 shadow-md elevation-xs"
        onPress={() => setIsVisible(true)}
      >
        <Octicons name="plus" size={24} color="white" />
      </Pressable>

      {/* CREATE POST MODAL */}
      <CreatePostModal
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
      />

      {/* PROFILE DRAWER OVERLAY */}
      {isDrawerOpen && (
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 10,
          }}
          onPress={() => setIsDrawerOpen(false)}
        />
      )}

      {/* PROFILE DRAWER */}
      <ProfileDrawer
        username={username || ""}
        isDrawerOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        searchQueryRef={seacrhQueryRef}
      />
    </View>
  );
};

export default HomeScreen;
