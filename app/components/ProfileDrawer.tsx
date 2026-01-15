import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { RefObject } from "react";
import { Dimensions, Pressable, Text, TextInput, View } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  username: string;
  isDrawerOpen: boolean;
  onClose: () => void;
  searchQueryRef: RefObject<TextInput | null>;
};

const ProfileDrawer = ({
  username,
  isDrawerOpen,
  onClose,
  searchQueryRef,
}: Props) => {
  const SIDEBAR_WIDTH = Dimensions.get("window").width * 0.8;

  return (
    <Animated.View
      style={{
        width: SIDEBAR_WIDTH,
        backgroundColor: "#0f172b",
        position: "absolute",
        top: 0,
        bottom: 0,
        left: isDrawerOpen ? 0 : -320,
        shadowColor: "black",
        zIndex: 20,
      }}
    >
      <SafeAreaView>
        <View className="px-6 py-4">
          {/* USER INFO */}
          <Pressable className="flex-row items-center gap-2">
            <View className="w-8 h-8 bg-slate-400 rounded-full items-center justify-center">
              <Text className="uppercase text-lg font-medium text-slate-800">
                {username?.charAt(0)}
              </Text>
            </View>

            <Text className="text-white text-base">{username}</Text>
          </Pressable>

          {/* PROFILE CONTENTS */}
          <View className="mt-8 gap-4">
            <Pressable
              className="flex-row items-center gap-2"
              onPress={() => router.push("/(profile)/ProfileScreen")}
            >
              <Ionicons name="person-outline" size={24} color="white" />
              <Text className="text-white font-medium text-xl">Profile</Text>
            </Pressable>

            <Pressable
              className="flex-row items-center gap-2"
              onPress={() => {
                onClose();
                searchQueryRef.current?.focus();
              }}
            >
              <Ionicons name="search-outline" size={24} color="white" />
              <Text className="text-white font-medium text-xl">Explore</Text>
            </Pressable>

            <Pressable
              className="flex-row items-center gap-2"
              onPress={() => {
                onClose();
                router.push("/(tabs)/RoomsScreen");
              }}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={24}
                color="white"
              />
              <Text className="text-white font-medium text-xl">Rooms</Text>
            </Pressable>

            <Pressable
              className="flex-row items-center gap-2"
              onPress={() => router.push("/(profile)/SettingsScreen")}
            >
              <Ionicons name="settings-outline" size={24} color="white" />
              <Text className="text-white font-medium text-xl">Settings</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

export default ProfileDrawer;
