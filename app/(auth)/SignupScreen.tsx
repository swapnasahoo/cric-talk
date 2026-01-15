import { showToast } from "@/libs/showToast";
import {
  createUserWithEmailAndPassword,
  loginUserWithEmailAndPassword,
} from "@/services/auth.service";
import { Octicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { usePreventScreenCapture } from "expo-screen-capture";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SignupScreen = () => {
  usePreventScreenCapture();

  const [email, setEmail] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [isPasswordHidden, setIsPasswordHidden] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);

  const isDisabled: boolean =
    email?.trim().length === 0 ||
    !email ||
    password.trim().length === 0 ||
    !password ||
    isLoading;

  async function handleSignup() {
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(email, password);
      await loginUserWithEmailAndPassword(email, password);
      router.replace("/(tabs)/HomeScreen");
    } catch (error) {
      showToast({
        type: "error",
        text1: "Signup Failed",
        text2: "Email might be already in use or server error.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white">
      <View className="w-full h-40 bg-orange-500 rounded-b-[48px] justify-center items-center shadow-lg">
        <SafeAreaView>
          <Text className="text-white font-black text-3xl tracking-tighter">
            Create Account
          </Text>
        </SafeAreaView>
      </View>

      <View className="flex-1 px-8 pt-10">
        <Text className="text-slate-400 text-sm font-medium mb-8">
          Join 10,000+ cricket fans and start discussing your favorite matches!
        </Text>
        
        {/* EMAIL INPUT */}
        <View className="mb-6">
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
            Email Address
          </Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
            <Octicons name="mail" size={20} color="#94a3b8" />
            <TextInput
              value={email || ""}
              onChangeText={setEmail}
              placeholder="name@example.com"
              className="flex-1 ml-3 text-slate-900 font-medium"
              placeholderTextColor="#cbd5e1"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* PASSWORD INPUT */}
        <View className="mb-10">
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
            Create Password
          </Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
            <Octicons name="lock" size={20} color="#94a3b8" />
            <TextInput
              value={password || ""}
              onChangeText={setPassword}
              secureTextEntry={isPasswordHidden}
              placeholder="Strong password"
              className="flex-1 ml-3 text-slate-900 font-medium"
              placeholderTextColor="#cbd5e1"
            />
            <Pressable onPress={() => setIsPasswordHidden(!isPasswordHidden)}>
              <Octicons
                name={isPasswordHidden ? "eye-closed" : "eye"}
                size={20}
                color="#64748b"
              />
            </Pressable>
          </View>
          <Text className="text-gray-400 text-[10px] mt-2 ml-1">
            Minimum 8 characters with a mix of letters and numbers.
          </Text>
        </View>

        {/* SIGNUP BUTTON */}
        <Pressable
          className={`h-14 rounded-2xl items-center justify-center shadow-lg shadow-orange-500/30 ${
            isDisabled ? "bg-orange-200" : "bg-orange-500 active:scale-95"
          }`}
          disabled={isDisabled}
          onPress={handleSignup}
        >
          <Text className="text-white font-black text-lg tracking-wide">
            {isLoading ? "CREATING..." : "START DISCUSSING"}
          </Text>
        </Pressable>

        {/* LOGIN LINK */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-slate-400 font-medium">Already have an account? </Text>
          <Pressable onPress={() => router.push("/(auth)/LoginScreen")}>
            <Text className="text-orange-500 font-bold">Sign In</Text>
          </Pressable>
        </View>

        <View className="mt-auto mb-6">
          <Text className="text-gray-300 text-[10px] text-center px-10">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SignupScreen;
