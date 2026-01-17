import useLikePost from "@/hooks/useLikePost";
import { Post } from "@/interfaces/Post";
import { showToast } from "@/libs/showToast";
import { executePost } from "@/services/posts.service";
import { usePosts } from "@/store/usePosts";
import { Octicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import EditPostModal from "./EditPostModal";

type Props = {
  userId: string;
  post: Post;
};

const PostCard = ({ userId, post }: Props) => {
  const posts = usePosts((s) => s.posts);
  const deletePostState = usePosts((s) => s.deletePost);

  const { likePost } = useLikePost();

  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);

  async function handleDeletePost() {
    Alert.alert("Are you sure?", "Do you want to delete the post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const execution = await executePost({
              action: "delete",
              postId: post.$id,
            });
            const parsed = JSON.parse(execution.responseBody);

            const deletedPostId = parsed.data.postId;

            deletePostState(deletedPostId);
            showToast({ type: "success", text1: "Post deleted successfully" });
          } catch (error) {
            showToast({
              type: "error",
              text1: "Failed to delete the post",
              text2: "Please try again later.",
            });
          }
        },
      },
    ]);
  }

  return (
    <>
      <Pressable
        className="mb-4 border-b border-gray-200 pb-4"
        onPress={() => router.push(`/(posts)/${post.$id}`)}
      >
        {/* USER INFO + POST ACTION ICON */}
        <View className="flex-row items-center gap-2">
          <Pressable className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center transition-all ease-in-out duration-300 active:scale-[0.98] active:opacity-85">
            <Text className="text-slate-900 font-medium text-lg capitalize">
              {post.authorName.charAt(0)}
            </Text>
          </Pressable>

          <Text className="text-slate-900 font-medium text-lg">
            {post.authorName}
          </Text>

          <Text className="text-sm">
            ·{" "}
            {Math.floor(
              (Date.now() - new Date(post.$createdAt).getTime()) /
                1000 /
                60 /
                60
            )}
            hr ago
          </Text>

          {post.authorId === userId && (
            <View className="flex-row items-center gap-4 ml-auto">
              {/* EDIT POST ICON */}
              <Pressable
                className="flex-row items-center"
                onPress={() => setIsEditModalVisible(true)}
              >
                <Octicons name="pencil" size={18} color="black" />
              </Pressable>

              {/* DELETE POST ICON */}
              <Pressable onPress={handleDeletePost}>
                <Octicons name="trash" size={18} color="black" />
              </Pressable>
            </View>
          )}
        </View>

        {/* POST CONTENT */}
        <View className="mt-2">
          <Text className="leading-6 text-slate-800">{post.content}</Text>
        </View>

        {/* POST IMAGE */}
        {post.image?.length !== 0 && (
          <Pressable className="w-full aspect-video bg-gray-300 rounded-lg mt-4" />
        )}

        {/* POST ACTIONS */}
        <View className="flex-row items-center justify-between mt-4">
          <Pressable
            className="flex-row items-center gap-2"
            onPress={() => likePost({ postId: post.$id, userId })}
          >
            <Octicons
              name={
                posts.find((p) => p.$id === post.$id)?.likedBy.includes(userId)
                  ? "heart-fill"
                  : "heart"
              }
              size={18}
              color={
                posts.find((p) => p.$id === post.$id)?.likedBy.includes(userId)
                  ? "red"
                  : "gray"
              }
            />
            <Text>
              {post.likes} Like{post.likes === 1 ? "" : "s"}
            </Text>
          </Pressable>

          <Pressable className="flex-row items-center gap-2">
            <Octicons name="comment-discussion" size={18} color="black" />
            <Text>
              {post.commentCount} Comment
              {post.commentCount === 1 ? "" : "s"}
            </Text>
          </Pressable>

          <Pressable className="flex-row items-center gap-2">
            <Octicons name="eye" size={18} color="black" />
            <Text>
              {post.views} View{post.views === 1 ? "" : "s"}
            </Text>
          </Pressable>
        </View>
      </Pressable>

      <EditPostModal
        isVisible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        postId={post.$id}
        initialContent={post.content}
      />
    </>
  );
};

export default PostCard;
