import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@/context/UserContext";
import {
  User,
  BookOpen,
  LogOut,
  Mail,
  GraduationCap,
  Building2,
} from "lucide-react-native";

export default function Profile() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/auth/login");
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#1A237E",
          paddingTop: insets.top + 20,
          paddingBottom: 40,
          paddingHorizontal: 20,
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#FFD700",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 32, fontWeight: "bold", color: "#1A237E" }}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#FFFFFF",
            marginBottom: 4,
          }}
        >
          {user?.name || "User"}
        </Text>
        <Text style={{ fontSize: 14, color: "#E8EAF6" }}>
          {user?.email || "email@example.com"}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1, marginTop: -20 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#1A237E",
              marginBottom: 16,
            }}
          >
            Account Information
          </Text>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#E8EAF6",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Mail size={20} color="#1A237E" />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 12, color: "#757575", marginBottom: 2 }}>
                Email
              </Text>
              <Text
                style={{ fontSize: 14, color: "#1A237E", fontWeight: "500" }}
              >
                {user?.email}
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#E8EAF6",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GraduationCap size={20} color="#1A237E" />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 12, color: "#757575", marginBottom: 2 }}>
                Class
              </Text>
              <Text
                style={{ fontSize: 14, color: "#1A237E", fontWeight: "500" }}
              >
                Class {user?.class}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: "#E8EAF6",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Building2 size={20} color="#1A237E" />
            </View>
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={{ fontSize: 12, color: "#757575", marginBottom: 2 }}>
                Board
              </Text>
              <Text
                style={{ fontSize: 14, color: "#1A237E", fontWeight: "500" }}
              >
                {user?.board}
              </Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <BookOpen size={24} color="#1A237E" />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#1A237E",
                marginLeft: 8,
              }}
            >
              About Zihn
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: "#757575", lineHeight: 20 }}>
            Zihn (ذہن) is your digital study companion, providing access to
            textbooks for Class 1-12 across all major boards in Pakistan.
          </Text>
          <Text style={{ fontSize: 12, color: "#9E9E9E", marginTop: 12 }}>
            Version 1.0.0
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            backgroundColor: "#FFEBEE",
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LogOut size={20} color="#C62828" />
          <Text
            style={{
              color: "#C62828",
              fontSize: 16,
              fontWeight: "600",
              marginLeft: 8,
            }}
          >
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
