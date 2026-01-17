import useKeyboardHeight from "@/hooks/useKeyboardHeight";
import { account } from "@/libs/appwrite";
import { showToast } from "@/libs/showToast";
import {
  addComment,
  deleteComment,
  fetchComments,
} from "@/services/comments.service";
import { updatePost } from "@/services/posts.service";
import { useComments } from "@/store/useComments";
import { usePosts } from "@/store/usePosts";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PostCard from "../components/PostCard";

const PostDetails = () => {
  const { postId } = useLocalSearchParams();

  const [userId, setUserId] = useState<string>("");

  const posts = usePosts((s) => s.posts);
  const post = posts.find((post) => post.$id === postId);

  if (!post) {
    showToast({
      type: "error",
      text1: "Post not found",
    });
    throw new Error("Post not found");
  }

  const updatePostState = usePosts((s) => s.updatePost);

  const commentList = useComments((s) => s.commentList);
  const setCommentList = useComments((s) => s.setComments);
  const addCommentState = useComments((s) => s.addComment);
  const deleteCommentState = useComments((s) => s.deleteComment);

  const [comment, setComment] = useState<string>("");

  const keyboardHeight = useKeyboardHeight();

  useEffect(() => {
    async function fetchUserId() {
      const user = await account.get();
      setUserId(user.$id);
    }
    fetchUserId();
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadComments() {
      if (!mounted) return;

      try {
        const data = await fetchComments(postId as string);
        setCommentList(data.rows);
      } catch (error) {
        showToast({
          type: "error",
          text1: "Error",
          text2: "Could not load comments. Please try again later.",
        });
      }
    }
    loadComments();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleAddComment() {
    if (comment.trim().length === 0) {
      showToast({
        type: "error",
        text1: "Comment cannot be empty.",
      });
      return;
    }

    try {
      const newComment = await addComment(postId as string, userId, comment);

      addCommentState(newComment);

      await updatePost(postId as string, {
        commentCount: (post?.commentCount || 0) + 1,
      });
      updatePostState({
        $id: postId as string,
        commentCount: (post?.commentCount || 0) + 1,
      });

      setComment("");
    } catch (error) {
      showToast({
        type: "error",
        text1: "Error",
        text2: "Could not add comment. Please try again later.",
      });
    }
  }

  async function handleDeleteComment(commentId: string) {
    Alert.alert("Are you sure?", "Do you want to delete this comment?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteComment(commentId);
            deleteCommentState(commentId);

            await updatePost(postId as string, {
              commentCount: (post?.commentCount || 0) - 1,
            });
            updatePostState({
              $id: postId as string,
              commentCount: (post?.commentCount || 0) - 1,
            });
          } catch (error) {
            showToast({
              type: "error",
              text1: "Error",
              text2: "Could not delete comment. Please try again later.",
            });
          }
        },
      },
    ]);
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1">
        {/* HEADER */}
        <View className="w-full h-30 bg-orange-500">
          <SafeAreaView>
            <View className="px-6 py-4 flex-row items-center">
              <Pressable
                className="h-10 w-10 bg-orange-600 items-center justify-center rounded-full transition-all duration-300 ease-in-out active:[scale-0.98] active:opacity-85"
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={18} color="white" />
              </Pressable>

              <View className="absolute left-0 right-0 items-center">
                <Text className="text-lg text-white font-semibold">
                  CricTalk
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          <SafeAreaView>
            {/* POST DETAILS */}
            <View className="px-6 -mt-4">
              {/* POST CONTENT */}
              <PostCard userId={userId} post={post} />

              {/* COMMENTS SECTION */}
              <View className="mt-4">
                <Text className="text-slate-900 font-semibold text-xl">
                  Comments
                </Text>

                {/* COMMENT LIST */}
                <FlatList
                  data={commentList}
                  keyExtractor={(item) => item.$id}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  renderItem={({ item }) => (
                    <View className="border-b border-gray-300 pb-4 mt-4">
                      {/* AUTHOR INFO */}
                      <View className="flex-row items-center gap-2">
                        {/* AUTHOR PROFILE IMAGE + DELETE */}
                        <Pressable className="bg-gray-300 h-10 w-10 items-center justify-center rounded-full">
                          <Text className="text-lg font-semibold capitalize text-slate-950">
                            {item.authorId[0]}
                          </Text>
                        </Pressable>

                        {/* AUTHOR NAME */}
                        <Text className="text-lg font-medium text-slate-900">
                          {item.authorId}
                        </Text>

                        {item.authorId === userId && (
                          <Pressable
                            className="ml-auto"
                            onPress={() => handleDeleteComment(item.$id)}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color="gray"
                            />
                          </Pressable>
                        )}
                      </View>

                      {/* COMMENT CONTENT */}
                      <View className="mt-4">
                        <Text className="leading-6 text-slate-800">
                          {item.content}
                        </Text>
                      </View>

                      {/* PUBLISH DATE */}
                      <Text className="text-sm text-slate-600 ml-auto">
                        {new Date(item.$createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </Text>
                    </View>
                  )}
                />
              </View>
            </View>
          </SafeAreaView>
        </ScrollView>
      </View>

      {/* COMMENT INPUT BOX */}
      <SafeAreaView
        edges={["bottom"]}
        style={{ marginBottom: keyboardHeight + 8 }}
      >
        <View className="px-6 flex-row items-center ">
          {/* COMMENT INPUT */}
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Comment"
            className="border border-gray-300 rounded-lg pl-4 h-12 flex-1 mr-4"
          />

          {/* COMMENT ADD BUTTON */}
          <Pressable
            className="h-12 w-12 bg-orange-500 rounded-lg items-center justify-center"
            onPress={handleAddComment}
          >
            <Ionicons name="send-outline" size={18} color="white" />
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default PostDetails;
