import { Room } from "@/interfaces/Room";
import { account } from "@/libs/appwrite";
import { showToast } from "@/libs/showToast";
import { executeRoom } from "@/services/rooms.service";
import { useRooms } from "@/store/useRooms";
import { useUser } from "@/store/useUser";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const CreateRoomModal = ({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) => {
  const [userId, setUserId] = useState<string>("");
  const username = useUser((s) => s.username) || "";

  const addRoom = useRooms((s) => s.addRoom);

  const [createPostType, setCreatePostType] = useState<
    "teamInfo" | "matchInfo" | "roomSettings"
  >("teamInfo");

  const [showStartDatePicker, setShowStartDatePicker] =
    useState<boolean>(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState<boolean>(false);

  const [team1, setTeam1] = useState<string>("");
  const [team2, setTeam2] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [matchType, setMatchType] = useState<"ODI" | "TEST" | "T20">("ODI");
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const matchTypeDropdown = [
    {
      label: "ODI",
      value: "ODI",
    },
    {
      label: "TEST",
      value: "TEST",
    },
    {
      label: "T20",
      value: "T20",
    },
  ];

  function handleNextStep() {
    if (createPostType === "teamInfo") {
      if (!team1.trim() || !team2.trim()) {
        alert("Please enter both team names.");
        return;
      }

      setCreatePostType("matchInfo");
      return;
    }

    if (createPostType === "matchInfo") {
      if (!startDate || !endDate) {
        alert("Please enter both starting and ending dates.");
        return;
      }

      if (!matchType) {
        alert("Please select the match type.");
        return;
      }

      setCreatePostType("roomSettings");
      return;
    }

    if (createPostType === "roomSettings") {
      handleCreateRoom();
    }
  }

  async function handleCreateRoom() {
    if (!startDate || !endDate) return;

    const now = new Date();
    let status: "upcoming" | "live" | "finished";

    if (startDate > now) {
      status = "upcoming";
    } else if (startDate < now && endDate > now) {
      status = "live";
    } else {
      status = "finished";
      setIsLocked(true);
    }

    try {
      const execution = await executeRoom({
        action: "create",
        teams: [team1.trim(), team2.trim()],
        status,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        matchType,
        isLocked,
      });
      const parsed = JSON.parse(execution.responseBody);

      const room: Room = parsed.data;
      addRoom(room);

      onClose();
      setCreatePostType("teamInfo");
      setTeam1("");
      setTeam2("");
      setStartDate(null);
      setEndDate(null);
      setMatchType("ODI");
      setIsLocked(false);

      showToast({
        type: "success",
        text1: "Room Created",
        text2: "The room has been created successfully.",
      });
    } catch (error) {
      showToast({
        type: "error",
        text1: "Room Creation Failed",
        text2: "Please try again later.",
      });
    }
  }

  useEffect(() => {
    async function fetchUserId() {
      const user = await account.get();
      setUserId(user.$id);
    }
    fetchUserId();
  }, []);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-center items-center">
        {/* OVERLAY */}
        <Pressable
          className="absolute inset-0 bg-gray-950/20"
          onPress={onClose}
        />

        {/* MODAL CONTENT */}
        <View className="bg-white w-80 h-120 shadow-sm elevation-sm rounded-lg px-6 py-4">
          <Text className="text-slate-900 font-semibold text-center text-lg">
            Create Room
          </Text>

          {/* FORM CONTENT */}
          {createPostType === "teamInfo" && (
            <>
              <View className="mt-4 gap-2">
                <Text className="text-600 font-medium">Team 1</Text>
                <TextInput
                  value={team1}
                  onChangeText={setTeam1}
                  placeholder="Enter team name"
                  className="border border-gray-300 rounded-lg pl-4"
                />
              </View>

              <View className="mt-4 gap-2">
                <Text className="text-600 font-medium">Team 2</Text>
                <TextInput
                  value={team2}
                  onChangeText={setTeam2}
                  placeholder="Enter team name"
                  className="border border-gray-300 rounded-lg pl-4"
                />
              </View>
            </>
          )}

          {createPostType === "matchInfo" && (
            <>
              <View className="mt-4 gap-2">
                <Text className="text-slate-900 font-medium">Start Date</Text>
                <Pressable
                  className="border border-gray-300 rounded-lg pl-4 h-12 justify-center"
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text
                    className={startDate ? "text-slate-900" : "text-gray-400"}
                  >
                    {startDate
                      ? startDate.toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : new Date().toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                  </Text>
                </Pressable>
              </View>

              <View className="mt-4 gap-2">
                <Text className="text-slate-900 font-medium">End Date</Text>
                <Pressable
                  className="border border-gray-300 rounded-lg pl-4 h-12 justify-center"
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text
                    className={endDate ? "text-slate-900" : "text-gray-400"}
                  >
                    {endDate
                      ? endDate.toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : new Date().toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                  </Text>
                </Pressable>
              </View>

              <View className="mt-4 gap-2">
                <Text className="text-slate-900 font-medium">Match Type</Text>
                <Dropdown
                  data={matchTypeDropdown}
                  labelField="label"
                  valueField="value"
                  onChange={(item) => setMatchType(item.value)}
                  placeholder="Select match type"
                  style={styles.dropdown}
                  containerStyle={styles.dropdownContainer}
                  placeholderStyle={styles.dropdownPlaceholderText}
                  selectedTextStyle={styles.dropdownSelectedText}
                />
              </View>

              <DateTimePickerModal
                isVisible={showStartDatePicker}
                mode="datetime"
                onConfirm={(date) => {
                  setStartDate(date);
                  setShowStartDatePicker(false);
                }}
                onCancel={() => setShowStartDatePicker(false)}
                minimumDate={new Date()}
              />

              <DateTimePickerModal
                isVisible={showEndDatePicker}
                mode="datetime"
                onConfirm={(date) => {
                  setEndDate(date);
                  setShowEndDatePicker(false);
                }}
                onCancel={() => setShowEndDatePicker(false)}
                minimumDate={startDate || new Date()}
              />
            </>
          )}

          {createPostType === "roomSettings" && (
            <View className="mt-4">
              <View>
                <Text className="text-slate-900 font-medium text-center">
                  Do you want open chat now?
                </Text>

                <Text className="text-slate-500 text-sm text-center mt-1">
                  You can change this setting later.
                </Text>
              </View>

              <View className="mt-4 gap-2 flex-row items-center">
                <Pressable
                  className="bg-green-500 px-6 py-3 rounded-xl w-1/2 transition-all duration-300 active:opacity-85 active:scale-[0.95]"
                  onPress={() => setIsLocked(false)}
                >
                  <Text className="text-white font-medium text-center">
                    Yes
                  </Text>
                </Pressable>

                <Pressable
                  className="bg-red-500 px-6 py-3 rounded-xl w-1/2 transition-all duration-300 active:opacity-85 active:scale-[0.95]"
                  onPress={() => setIsLocked(true)}
                >
                  <Text className="text-white font-medium text-center">No</Text>
                </Pressable>
              </View>
            </View>
          )}

          <Pressable
            className="bg-orange-500 px-6 py-3 rounded-lg mt-6 transition-all duration-300 active:opacity-85 active:scale-[0.98]"
            onPress={handleNextStep}
          >
            <Text className="text-center text-white font-semibold text-lg">
              {createPostType !== "roomSettings" ? "Next" : "Create Room"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    borderWidth: 1,
    borderColor: "#d1d5dc",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
  },
  dropdownContainer: {
    marginTop: 4,
    borderRadius: 8,
  },
  dropdownPlaceholderText: {
    color: "#6a7282",
    fontSize: 16,
  },
  dropdownSelectedText: {
    color: "#0f172b",
    fontSize: 16,
  },
});

export default CreateRoomModal;
