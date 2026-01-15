import { Room } from "@/interfaces/Room";
import { showToast } from "@/libs/showToast";
import { fetchRooms } from "@/services/rooms.service";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CreateRoomModal from "../components/CreateRoomModal";
import MatchRoomCard from "../components/MatchRoomCard";


const RoomsScreen = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "live" | "upcoming" | "finished"
  >("all");

  const filteredRooms = useMemo(() => {
    if (selectedFilter === "all") return rooms;
    else return rooms.filter((room) => room.status === selectedFilter);
  }, [rooms, selectedFilter]);

  const loadRooms = async () => {
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
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRooms();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* HEADER */}
      <View className="w-full bg-orange-500 shadow-md">
        <SafeAreaView edges={['top']}>
          <View className="px-6 py-4 flex-row items-center justify-between">
            <Pressable
              className="bg-orange-600 h-10 w-10 rounded-full items-center justify-center active:scale-95"
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </Pressable>

            <Text className="text-white text-xl font-bold tracking-tight">Match Rooms</Text>

            <Pressable className="bg-orange-600 h-10 w-10 rounded-full items-center justify-center active:scale-95">
              <Ionicons name="search-outline" size={20} color="white" />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      {/* FILTERS */}
      <View className="py-4 bg-white border-b border-gray-100 shadow-sm">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        >
          {["all", "live", "upcoming", "finished"].map((filter) => (
            <Pressable
              key={filter}
              onPress={() => setSelectedFilter(filter as any)}
              className={`px-6 py-2 rounded-full border ${
                selectedFilter === filter 
                  ? "bg-orange-500 border-orange-500" 
                  : "bg-white border-gray-200"
              }`}
            >
              <Text className={`font-bold capitalize ${selectedFilter === filter ? "text-white" : "text-gray-500"}`}>
                {filter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* CONTENT */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.$id}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#f97316"]} />
        }
        renderItem={({ item }) => <MatchRoomCard room={item} />}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="basketball-outline" size={64} color="#cbd5e1" />
            <Text className="text-slate-400 mt-4 text-lg font-medium">No matches found</Text>
            <Text className="text-slate-300 text-sm">Try a different filter</Text>
          </View>
        }
      />

      {/* CREATE ROOM BUTTON (ADMIN/HOST) */}
      <Pressable
        className="w-16 h-16 bg-orange-500 rounded-full items-center justify-center absolute bottom-10 right-6 shadow-lg active:scale-90"
        onPress={() => setIsVisible(true)}
      >
        <Ionicons name="add" size={32} color="white" />
      </Pressable>

      <CreateRoomModal isVisible={isVisible} setIsVisible={setIsVisible} />
    </View>
  );
};
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
