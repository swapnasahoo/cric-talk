import useLikePost from "@/hooks/useLikePost";
import { Post } from "@/interfaces/Post";
import { usePosts } from "@/store/usePosts";
import { formatTimeAgo } from "@/utils/formatTime";
import { Octicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  userId: string;
  post: Post;
};

const PostCard = ({ userId, post }: Props) => {
  const posts = usePosts((s) => s.posts);
  const { likePost } = useLikePost();
  const isLiked = posts.find((p) => p.$id === post.$id)?.likedBy.includes(userId);

  return (
    <Pressable
      className="mb-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:opacity-95"
      onPress={() => router.push(`/(posts)/${post.$id}`)}
    >
      {/* USER INFO */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center border border-orange-200">
            <Text className="text-orange-600 font-bold text-lg capitalize">
              {post.authorName.charAt(0)}
            </Text>
          </View>
          <View>
            <Text className="text-slate-900 font-semibold text-[16px]">
              {post.authorName}
            </Text>
            <Text className="text-gray-500 text-xs">
              {formatTimeAgo(post.$createdAt)}
            </Text>
          </View>
        </View>
        <Pressable className="p-1">
          <Octicons name="kebab-horizontal" size={16} color="#94a3b8" />
        </Pressable>
      </View>

      {/* POST CONTENT */}
      <View className="mt-3">
        <Text className="leading-6 text-slate-800 text-[15px]">
          {post.content}
        </Text>
      </View>

      {/* POST IMAGE */}
      {post.image?.length !== 0 && (
        <View className="w-full aspect-video bg-gray-100 rounded-xl mt-3 overflow-hidden border border-gray-200" />
      )}

      {/* POST ACTIONS */}
      <View className="flex-row items-center justify-between mt-4 pt-3 border-t border-gray-50">
        <Pressable
          className="flex-row items-center gap-2 px-2 py-1 rounded-full active:bg-gray-100"
          onPress={() => likePost({ postId: post.$id })}
        >
          <Octicons
            name={isLiked ? "heart-fill" : "heart"}
            size={18}
            color={isLiked ? "#ef4444" : "#64748b"}
          />
          <Text className={`text-sm ${isLiked ? "text-red-500 font-medium" : "text-slate-500"}`}>
            {post.likes}
          </Text>
        </Pressable>

        <Pressable className="flex-row items-center gap-2 px-2 py-1 rounded-full active:bg-gray-100">
          <Octicons name="comment-discussion" size={18} color="#64748b" />
          <Text className="text-slate-500 text-sm">{post.commentCount}</Text>
        </Pressable>

        <View className="flex-row items-center gap-2 px-2 py-1">
          <Octicons name="eye" size={18} color="#64748b" />
          <Text className="text-slate-500 text-sm">{post.views}</Text>
        </View>

        <Pressable className="p-1 active:bg-gray-100 rounded-full">
          <Octicons name="share" size={18} color="#64748b" />
        </Pressable>
      </View>
    </Pressable>
  );
};

export default PostCard;
