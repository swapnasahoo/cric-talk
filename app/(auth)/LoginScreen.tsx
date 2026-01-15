import { showToast } from "@/libs/showToast";
import { loginUserWithEmailAndPassword } from "@/services/auth.service";
import { Octicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { usePreventScreenCapture } from "expo-screen-capture";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LoginScreen = () => {
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

  async function handleLogin() {
    setIsLoading(true);
    try {
      await loginUserWithEmailAndPassword(email, password);
      router.replace("/(tabs)/HomeScreen");
    } catch (error) {
      showToast({
        type: "error",
        text1: "Login Failed",
        text2: "Invalid credentials or server error.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-white">
      <View className="w-full h-[40%] bg-orange-500 rounded-b-[48px] justify-center items-center shadow-2xl">
        <SafeAreaView>
          <View className="items-center">
            <View className="w-20 h-20 bg-white/20 rounded-3xl items-center justify-center mb-6 border border-white/30">
               <Octicons name="rocket" size={40} color="white" />
            </View>
            <Text className="text-white font-black text-4xl tracking-tighter">
              CricTalk
            </Text>
            <View className="h-1 w-12 bg-white rounded-full mt-1 mb-2" />
            <Text className="text-orange-100 text-center px-10 font-medium">
              Join the most passionate cricket community in the world!
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <View className="flex-1 px-8 pt-10">
        <Text className="text-slate-900 text-3xl font-bold mb-8">Welcome back!</Text>
        
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
        <View className="mb-8">
          <Text className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
            Password
          </Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
            <Octicons name="lock" size={20} color="#94a3b8" />
            <TextInput
              value={password || ""}
              onChangeText={setPassword}
              secureTextEntry={isPasswordHidden}
              placeholder="Your secure password"
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
          <Pressable className="mt-2 ml-auto">
            <Text className="text-orange-500 font-bold text-xs">Forgot Password?</Text>
          </Pressable>
        </View>

        {/* LOGIN BUTTON */}
        <Pressable
          className={`h-14 rounded-2xl items-center justify-center shadow-lg shadow-orange-500/30 ${
            isDisabled ? "bg-orange-200" : "bg-orange-500 active:scale-95"
          }`}
          disabled={isDisabled}
          onPress={handleLogin}
        >
          <Text className="text-white font-black text-lg tracking-wide">
            {isLoading ? "SIGNING IN..." : "SIGN IN"}
          </Text>
        </Pressable>

        {/* SIGNUP LINK */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-slate-400 font-medium">New to CricTalk? </Text>
          <Pressable onPress={() => router.push("/(auth)/SignupScreen")}>
            <Text className="text-orange-500 font-bold">Create Account</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
              isDisabled ? "text-slate-500" : "text-white"
            } font-medium text-lg text-center`}
          >
            Login
          </Text>
        </Pressable>

        {/* SIGNUP LINK */}
        <View className="flex-row items-center mx-auto mt-2 gap-2">
          <Text className="text-lg font-medium text-slate-900">
            Don't have an account?
          </Text>
          <Pressable onPress={() => router.replace("/(auth)/SignupScreen")}>
            <Text className="text-lg text-orange-500 font-medium">Signup</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default LoginScreen;
