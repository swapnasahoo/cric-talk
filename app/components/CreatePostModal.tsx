import useCreatePost from "@/hooks/useCreatePost";
import { showToast } from "@/libs/showToast";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

const CreatePostModal = ({ isVisible, onClose }: Props) => {
  const [content, setContent] = useState<string>("");

  const { createNewPost } = useCreatePost();

  async function handleCreatePost() {
    try {
      await createNewPost({ content });
      onClose();
      setContent("");

      showToast({
        type: "success",
        text1: "Post Created",
        text2: "Your post has been created successfully.",
      });
    } catch (error) {
      showToast({
        type: "error",
        text1: "Error",
        text2: "Could not create post. Please try again later.",
      });
    }
  }

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1">
          {/* MODAL HEADER */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <Ionicons
              name="close"
              size={24}
              color="#0f172b"
              onPress={onClose}
            />

            <Pressable onPress={handleCreatePost}>
              <Text className="text-orange-500 font-semibold">Create Post</Text>
            </Pressable>
          </View>

          {/* MODAL CONTENT */}
          <View className="px-6 py-4">
            <Text className="text-lg font-semibold text-slate-900 tracking-wide">
              What's on your mind?
            </Text>

            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Write anything about cricket..."
              multiline
              numberOfLines={8}
              maxLength={512}
              className="border border-gray-300 mt-2 rounded-lg text-slate-900"
            />

            <Text className="text-sm text-gray-800 mt-2 ml-auto">
              {content.length} / 512
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default CreatePostModal;
