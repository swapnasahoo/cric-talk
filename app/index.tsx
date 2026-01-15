import { useUser } from "@/store/useUser";
import { Redirect } from "expo-router";

export default function Index() {
  const userId = useUser((s) => s.userId);

  if (!userId) {
    return <Redirect href="/(auth)/LoginScreen" />;
  }

  return <Redirect href="/(tabs)/HomeScreen" />;
}
