import { account } from "@/libs/appwrite";
import { useUser } from "@/store/useUser";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import "../global.css";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);

  const setUserId = useUser((s) => s.setUserId);
  const setUsername = useUser((s) => s.setUsername);
  const setEmail = useUser((s) => s.setEmail);
  const setFavTeam = useUser((s) => s.setFavTeam);
  const setJoinDate = useUser((s) => s.setJoinDate);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await account.get();
        setUserId(userData.$id);
        setUsername(userData.name || userData.email.split("@")[0]);
        setFavTeam(userData.prefs.favTeam || "None");
        setEmail(userData.email);
        setJoinDate(new Date(userData.$createdAt));
      } catch (error) {
        console.log("No active session or error fetching user");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (isLoading) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}></Stack>
      <Toast />
    </>
  );
}
