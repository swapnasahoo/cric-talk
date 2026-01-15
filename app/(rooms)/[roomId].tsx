import useRoomMessage from "@/hooks/useRoomMessage";
import { Room } from "@/interfaces/Room";
import { RoomMessage } from "@/interfaces/RoomMessage";
import { client } from "@/libs/appwrite";
import { showToast } from "@/libs/showToast";
import { fetchRoomMessages } from "@/services/roomMessage.service";
import { fetchRooms } from "@/services/rooms.service";
import { useUser } from "@/store/useUser";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RoomDetailsCard from "../components/RoomDetailsCard";
import RoomMessageCard from "../components/RoomMessageCard";

const RoomDiscussion = () => {
  const CRIC_TALK_DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_CRIC_TALK_DATABASE_ID!;
  const ROOM_MESSAGE_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_ROOM_MESSAGE_TABLE_ID!;

  const { roomId } = useLocalSearchParams();
  const { userId, username } = useUser();
  const flatListRef = useRef<FlatList>(null);

  const [room, setRoom] = React.useState<Room | null>(null);
  const [roomMessages, setRoomMessages] = useState<RoomMessage[]>([]);
  const [messageContent, setMessageContent] = useState<string>("");
  const [editMessageContent, setEditMessageContent] = useState<string>("");
  const [editRoomMessageId, setEditRoomMessageId] = useState<string>("");
  
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isRoomDetailsVisible, setIsRoomDetailsVisible] = useState<boolean>(false);

  const {
    handleCreateRoomMessage,
    handleUpdateRoomMessage,
    handleDeleteRoomMessage,
  } = useRoomMessage(roomId as string);

  useEffect(() => {
    async function loadRoomDetails() {
      try {
        const data = await fetchRooms();
        const roomDetails = data.rows.find((room) => room.$id === roomId);
        setRoom(roomDetails || null);
      } catch (error) {
        console.error("Failed to load room details");
      }
    }

    async function loadRoomMessages() {
      try {
        const data = await fetchRoomMessages(roomId as string);
        setRoomMessages(data.rows as any);
      } catch (error) {
        showToast({
          type: "error",
          text1: "Error fetching room messages",
          text2: "Please try again later.",
        });
      }
    }

    loadRoomDetails();
    loadRoomMessages();

    const unsubscribe = client.subscribe(
      `databases.${CRIC_TALK_DATABASE_ID}.collections.${ROOM_MESSAGE_TABLE_ID}.documents`,
      (response) => {
        if (response.events.includes("databases.*.collections.*.documents.*.create")) {
          setRoomMessages((prev) => [...prev, response.payload as any]);
          setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
        }
        if (response.events.includes("databases.*.collections.*.documents.*.update")) {
          setRoomMessages((prev) =>
            prev.map((msg) => (msg.$id === (response.payload as any).$id ? (response.payload as any) : msg))
          );
        }
        if (response.events.includes("databases.*.collections.*.documents.*.delete")) {
          setRoomMessages((prev) => prev.filter((msg) => msg.$id !== (response.payload as any).$id));
        }
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  const onSendMessage = async () => {
    if (!messageContent.trim()) return;
    try {
      await handleCreateRoomMessage({ 
        messageContent, 
        userId: userId!, 
        username: username!, 
        setMessageContent 
      });
      // Content is cleared by hook
    } catch (error) {
      showToast({ type: "error", text1: "Failed to send message" });
    }
  };

  return (
    <View className="flex-1 bg-[#F5F7FA]">
      {/* HEADER */}
      <View className="bg-white shadow-sm z-10">
        <SafeAreaView edges={['top']}>
          <View className="px-6 py-3 flex-row items-center border-b border-gray-100">
            <Pressable onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100">
              <Ionicons name="arrow-back" size={24} color="#1e293b" />
            </Pressable>
            
            <Pressable 
              className="flex-1 ml-2 flex-row items-center gap-3"
              onPress={() => setIsRoomDetailsVisible(true)}
            >
              <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center border border-orange-200">
                <Text className="text-orange-600 font-bold">{room?.teams[0][0]}{room?.teams[1][0]}</Text>
              </View>
              <View>
                <Text className="text-slate-900 font-bold text-base" numberOfLines={1}>
                  {room ? `${room.teams[0]} vs ${room.teams[1]}` : "Loading..."}
                </Text>
                <View className="flex-row items-center gap-1">
                  <View className="w-2 h-2 rounded-full bg-red-500" />
                  <Text className="text-red-500 text-[10px] font-bold uppercase">Live Commentary</Text>
                </View>
              </View>
            </Pressable>

            <Pressable className="p-2 rounded-full active:bg-gray-100">
              <Ionicons name="ellipsis-vertical" size={20} color="#64748b" />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        className="flex-1"
      >
        <FlatList
          ref={flatListRef}
          data={roomMessages}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          renderItem={({ item }) => (
            <RoomMessageCard
              item={item}
              userId={userId!}
              setIsEditModalVisible={setIsEditModalVisible}
              setEditMessageContent={setEditMessageContent}
              setEditRoomMessageId={setEditRoomMessageId}
              handleDeleteRoomMessage={handleDeleteRoomMessage}
            />
          )}
        />

        {/* INPUT AREA */}
        <SafeAreaView edges={['bottom']}>
          <View className="px-4 py-3 bg-white border-t border-gray-100 flex-row items-center gap-3">
             <Pressable className="w-10 h-10 items-center justify-center rounded-full bg-gray-50 active:bg-gray-100">
              <Ionicons name="add" size={24} color="#64748b" />
            </Pressable>

            <View className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 border border-gray-200">
              <TextInput
                value={messageContent}
                onChangeText={setMessageContent}
                placeholder="Share your thoughts..."
                multiline
                className="text-slate-900 font-medium max-h-24"
                placeholderTextColor="#94a3b8"
              />
            </View>

            <Pressable 
              onPress={onSendMessage}
              disabled={!messageContent.trim()}
              className={`w-11 h-11 items-center justify-center rounded-2xl ${
                messageContent.trim() ? "bg-orange-500 shadow-lg shadow-orange-500/30" : "bg-gray-200"
              }`}
            >
              <Ionicons name="send" size={20} color="white" />
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      {/* EDIT MODAL */}
      <Modal visible={isEditModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View className="bg-white rounded-4xl p-6 shadow-2xl">
            <Text className="text-xl font-bold text-slate-900 mb-4">Edit message</Text>
            <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
              <TextInput
                value={editMessageContent}
                onChangeText={setEditMessageContent}
                multiline
                autoFocus
                className="text-slate-900 font-medium min-h-25"
              />
            </View>
            <View className="flex-row gap-3">
              <Pressable 
                onPress={() => setIsEditModalVisible(false)}
                className="flex-1 h-12 items-center justify-center rounded-xl bg-gray-100"
              >
                <Text className="text-slate-500 font-bold">Cancel</Text>
              </Pressable>
              <Pressable 
                onPress={async () => {
                  await handleUpdateRoomMessage({
                    editMessageContent,
                    editRoomMessageId,
                    setIsEditModalVisible,
                    setEditMessageContent,
                    setEditRoomMessageId
                  });
                }}
                className="flex-2 h-12 items-center justify-center rounded-xl bg-orange-500"
              >
                <Text className="text-white font-bold">Update Message</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ROOM DETAILS MODAL */}
      <RoomDetailsCard 
        roomId={roomId as string}
        room={room!}
        isVisible={isRoomDetailsVisible}
        onClose={() => setIsRoomDetailsVisible(false)}
      />
    </View>
  );
};

export default RoomDiscussion;