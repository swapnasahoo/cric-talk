import { RoomMessage } from "@/interfaces/RoomMessage";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  item: RoomMessage;
  userId: string;
  setIsEditModalVisible: (visible: boolean) => void;
  setEditMessageContent: (content: string) => void;
  setEditRoomMessageId: (id: string) => void;
  handleDeleteRoomMessage: (RoomMessageId: string) => void;
};

const RoomMessageCard = ({
  item,
  userId,
  setIsEditModalVisible,
  setEditMessageContent,
  setEditRoomMessageId,
  handleDeleteRoomMessage,
}: Props) => {
  const isOwnMessage = item.authorId === userId;

  const formatMessageTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View className={`mb-4 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
      <View className="flex-row items-end gap-2 max-w-[85%]">
        {!isOwnMessage && (
          <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center border border-orange-200">
            <Text className="text-orange-600 font-bold text-xs uppercase">
              {item.authorName.charAt(0)}
            </Text>
          </View>
        )}

        <View
          className={`px-4 py-3 rounded-2xl ${
            isOwnMessage 
              ? "bg-orange-500 rounded-br-none" 
              : "bg-white border border-gray-100 rounded-bl-none shadow-sm"
          }`}
        >
          {!isOwnMessage && (
            <Text className="text-orange-600 text-[10px] font-black uppercase tracking-tighter mb-1">
              {item.authorName}
            </Text>
          )}

          <Text
            className={`${
              isOwnMessage ? "text-white" : "text-slate-800"
            } text-[15px] leading-5 font-medium`}
          >
            {item.content}
          </Text>

          <View className="flex-row items-center justify-end mt-1 gap-1">
            <Text
              className={`${
                isOwnMessage ? "text-orange-100" : "text-gray-400"
              } text-[9px] font-bold`}
            >
              {formatMessageTime(item.$createdAt)}
            </Text>
            {isOwnMessage && (
              <Ionicons name="checkmark-done" size={12} color="#ffedd5" />
            )}
          </View>
        </View>

        {isOwnMessage && (
          <View className="flex-col gap-2 pb-1">
            <Pressable
              onPress={() => {
                setIsEditModalVisible(true);
                setEditRoomMessageId(item.$id);
                setEditMessageContent(item.content);
              }}
              className="p-1 bg-gray-100 rounded-full"
            >
              <Ionicons name="pencil" size={12} color="#64748b" />
            </Pressable>
            <Pressable 
              onPress={() => handleDeleteRoomMessage(item.$id)}
              className="p-1 bg-red-50 rounded-full"
            >
              <Ionicons name="trash" size={12} color="#ef4444" />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
};
      )}
    </View>
  );
};

export default RoomMessageCard;
