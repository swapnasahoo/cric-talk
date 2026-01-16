import { showToast } from "@/libs/showToast";
import { fetchRooms } from "@/services/rooms.service";
import { useRooms } from "@/store/useRooms";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CreateRoomModal from "../components/CreateRoomModal";
import MatchRoomCard from "../components/MatchRoomCard";

type FilterChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

const FilterChip = ({ label, selected, onPress }: FilterChipProps) => {
  return (
    <Pressable
      className={`${
        selected ? "bg-orange-500" : "bg-transparent border border-orange-500"
      } px-4 py-2 rounded-full ${
        label === "all" || label === "live" ? "w-20" : "w-max"
      } items-center transition-all duration-300 ease-in-out active:scale-[0.97] active:opacity-85`}
      onPress={onPress}
    >
      <Text
        className={`${
          selected ? "text-white" : "text-orange-500"
        } font-medium capitalize`}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const RoomsScreen = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  const rooms = useRooms((s) => s.rooms);
  const setRooms = useRooms((s) => s.setRooms);

  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "live" | "upcoming" | "finished"
  >("all");

  const filteredRooms = useMemo(() => {
    if (selectedFilter === "all") return rooms;
    else return rooms.filter((room) => room.status === selectedFilter);
  }, [rooms, selectedFilter]);

  useEffect(() => {
    let mounted = true;

    async function loadRooms() {
      if (!mounted) return;

      try {
        const data = await fetchRooms();
        setRooms(data.rows);
      } catch (error) {
        showToast({
          type: "error",
          text1: "Error fetching rooms",
          text2: "Please try again later.",
        });
      }
    }
    loadRooms();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View className="flex-1 bg-white">
      {/* HEADER */}
      <View className="w-full h-30 bg-orange-500">
        <SafeAreaView>
          <View className="px-6 py-4 flex-row items-center justify-between">
            <Pressable
              className="bg-orange-600 h-10 w-10 rounded-full items-center justify-center transition-all duration-300 active:scale-[0.98] active:opacity-85"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={18} color="white" />
            </Pressable>

            <Text className="text-white text-xl font-semibold">Rooms</Text>

            <Pressable className="bg-orange-600 h-10 p-2 rounded-full items-center justify-center transition-all duration-300 active:scale-[0.98] active:opacity-85">
              <Ionicons name="settings-outline" size={18} color="white" />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      {/* CONTENT */}
      <SafeAreaView>
        {/* FILTER BAR */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: "center",
            gap: 8,
            paddingHorizontal: 24,
            paddingBottom: 16,
          }}
        >
          {["all", "live", "upcoming", "finished"].map((label, index) => (
            <FilterChip
              key={index}
              label={label}
              selected={selectedFilter === label}
              onPress={() => setSelectedFilter(label as any)}
            />
          ))}
        </ScrollView>

        {/* MATCH ROOM CARD */}
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 80 }}
          renderItem={({ item }) => <MatchRoomCard room={item} />}
        />
      </SafeAreaView>

      {/* CREATE ROOM BUTTON */}
      <Pressable
        className="w-16 h-16 bg-orange-500 rounded-full items-center justify-center absolute bottom-6 right-6 shadow-md elevation-xs"
        onPress={() => setIsVisible(!isVisible)}
      >
        <Octicons name="plus" size={24} color="white" />
      </Pressable>

      {/* CREATE ROOM MODAL */}
      <CreateRoomModal
        visible={isVisible}
        onClose={() => setIsVisible(false)}
      />
    </View>
  );
};

export default RoomsScreen;
