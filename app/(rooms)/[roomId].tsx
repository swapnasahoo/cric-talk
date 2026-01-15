import useKeyboardHeight from "@/hooks/useKeyboardHeight";
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
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
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
      await handleCreateRoomMessage({ content: messageContent });
      setMessageContent("");
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
          <View className="bg-white rounded-[32px] p-6 shadow-2xl">
            <Text className="text-xl font-bold text-slate-900 mb-4">Edit message</Text>
            <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
              <TextInput
                value={editMessageContent}
                onChangeText={setEditMessageContent}
                multiline
                autoFocus
                className="text-slate-900 font-medium min-h-[100px]"
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
                  await handleUpdateRoomMessage(editRoomMessageId, { content: editMessageContent });
                  setIsEditModalVisible(false);
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
      <Modal visible={isRoomDetailsVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[40px] h-[70%]">
             <View className="w-12 h-1.5 bg-gray-200 rounded-full self-center my-4" />
             <RoomDetailsCard room={room!} setIsRoomDetailsVisible={setIsRoomDetailsVisible} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

  }, []);

  useEffect(() => {
    const unsubscribe = client.subscribe(
      `databases.${CRIC_TALK_DATABASE_ID}.tables.${ROOM_MESSAGE_TABLE_ID}.rows`,
      (res) => {
        if (res.events.includes("databases.*.tables.*.rows.*.create")) {
          const payload: RoomMessage = res.payload as RoomMessage;

          if (payload.roomId === roomId) {
            setRoomMessages((prev) =>
              prev.some((msg) => msg.$id === payload.$id)
                ? prev
                : [payload, ...prev]
            );
          }
        }

        if (res.events.includes("databases.*.tables.*.rows.*.update")) {
          const payload: RoomMessage = res.payload as RoomMessage;

          if (payload.roomId === roomId) {
            setRoomMessages((prev) =>
              prev.map((m) => (m.$id === payload.$id ? payload : m))
            );
          }
        }

        if (res.events.includes("databases.*.tables.*.rows.*.delete")) {
          const payload: RoomMessage = res.payload as RoomMessage;

          if (payload.roomId === roomId) {
            setRoomMessages((prev) =>
              prev.filter((m) => m.$id !== payload.$id)
            );
          }
        }
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1">
        <View className="w-full h-30 bg-orange-500">
          <SafeAreaView>
            <View className="flex-row items-center px-6 py-4 relative">
              <Pressable
                className="w-10 h-10 bg-orange-600 rounded-full items-center justify-center transition-all duration-300 active:scale-[0.98] active:opacity-85"
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={18} color="white" />
              </Pressable>

              <Text className="text-white font-semibold text-lg text-center flex-1 -ml-6">
                {room?.teams && `${room?.teams[0]} vs ${room?.teams[1]}`}
              </Text>

              <Pressable
                className="w-10 h-10 bg-orange-600 items-center justify-center rounded-full transition-all duration-300 active:scale-[0.98] active:opacity-85 absolute right-6"
                onPress={() => setIsRoomDetailsVisible(true)}
              >
                <Ionicons name="information" size={18} color="white" />
              </Pressable>
            </View>
          </SafeAreaView>
        </View>

        <SafeAreaView>
          <RoomDetailsCard
            roomId={roomId as string}
            room={room as Room}
            isVisible={isRoomDetailsVisible}
            onClose={() => setIsRoomDetailsVisible(false)}
          />

          {/* UPCOMING / FINISHED MATCH BANNER */}
          {room && room?.status !== "live" && (
            <View className="mx-auto">
              <Text className="text-lg text-slate-900 font-medium text-center">
                {room?.status === "upcoming"
                  ? "The room hasn't started yet"
                  : room?.status === "finished"
                  ? "The room has finished"
                  : ""}
              </Text>

              <Text className="text-sm text-slate-600 text-center">
                You can't send or edit messages when a room&nbsp;
                {room?.status === "upcoming"
                  ? "is upcoming."
                  : room?.status == "finished"
                  ? "has been finished."
                  : ""}
              </Text>
            </View>
          )}
        </SafeAreaView>

        <View className="flex-1 -mt-18">
          {/* DISCUSSION AREA */}
          <FlatList
            data={roomMessages}
            keyExtractor={(item) => item.$id}
            contentContainerStyle={{
              paddingTop: 40,
              paddingHorizontal: 24,
              paddingBottom: 24,
            }}
            showsVerticalScrollIndicator={false}
            inverted
            renderItem={({ item }) => (
              // DISCUSSION MESSAGE CARD

              <RoomMessageCard
                item={item}
                userId={userId}
                setIsEditModalVisible={setIsEditModalVisible}
                setEditMessageContent={setEditMessageContent}
                setEditRoomMessageId={setEditRoomMessageId}
                handleDeleteRoomMessage={handleDeleteRoomMessage}
              />
            )}
          />
        </View>
      </View>

      <SafeAreaView
        edges={["bottom"]}
        style={{ marginBottom: keyboardHeight + 8 }}
      >
        {/* MESSAGE INPUT AREA */}
        {room?.status === "live" && (
          <View className="px-6 flex-row items-center bg-white shadow-sm elevation-sm mx-4 rounded-lg py-2">
            {/* MESSAGE INPUT */}
            <TextInput
              value={messageContent}
              onChangeText={setMessageContent}
              placeholder="Comment"
              className="border border-gray-300 rounded-lg pl-4 h-12 flex-1 mr-4"
            />

            {/* MESSAGE ADD BUTTON */}
            <Pressable
              disabled={!canSendMessage}
              className={`h-12 w-12 ${
                canSendMessage ? "bg-orange-500" : "bg-gray-500"
              } rounded-lg items-center justify-center transition-all duration-200 ease-in-out scale-[0.98] active:opacity-85`}
              onPress={() =>
                handleCreateRoomMessage({
                  messageContent,
                  userId,
                  username,
                  setMessageContent,
                })
              }
            >
              <Ionicons name="send-outline" size={18} color="white" />
            </Pressable>
          </View>
        )}
      </SafeAreaView>

      {/* EDIT MESSAGE MODAL */}
      <Modal visible={isEditModalVisible} transparent animationType="slide">
        {/* OVERLAY */}
        <Pressable
          className="absolute inset-0 bg-gray-950/30"
          onPress={() => setIsEditModalVisible(false)}
        />

        <View className="flex-1 items-center justify-center">
          <View className="bg-white w-80 h-56 rounded-lg shadow-sm elevation-sm px-6 py-4">
            <Text className="text-lg text-slate-900 font-medium">
              Edit Message
            </Text>

            <TextInput
              value={editMessageContent}
              onChangeText={setEditMessageContent}
              placeholder="Edit your message"
              className="border border-gray-300 rounded-lg h-24 mt-2 pl-4"
              textAlignVertical="top"
              multiline
            />

            {/* ACTION BUTTONS */}
            <View className="flex-row items-center gap-2 ml-auto mt-auto">
              <Pressable onPress={() => setIsEditModalVisible(false)}>
                <Text className="text-slate-900">Cancel</Text>
              </Pressable>

              <Pressable
                disabled={!canEditMessage}
                className={`${
                  canEditMessage ? "bg-orange-500" : "bg-gray-500"
                } px-4 py-2 rounded-lg transition-all duration-200 ease-in-out active:scale-[0.98] active:opacity-85`}
                onPress={() =>
                  handleUpdateRoomMessage({
                    editMessageContent,
                    editRoomMessageId,
                    setIsEditModalVisible,
                    setEditMessageContent,
                    setEditRoomMessageId,
                  })
                }
              >
                <Text className="text-white font-medium">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default RoomDiscussion;
