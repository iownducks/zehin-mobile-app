import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@/context/UserContext";
import {
  BookOpen,
  Bookmark,
  Heart,
  ChevronRight,
  FileText,
  Upload,
  ClipboardList,
  Layers,
} from "lucide-react-native";
import { Image } from "expo-image";

export default function Home() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const router = useRouter();
  const [recentBooks, setRecentBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentHistory();
    }
  }, [user]);

  const fetchRecentHistory = async () => {
    try {
      const response = await fetch(
        `/api/reading-history/list?userId=${user.id}`,
      );
      const data = await response.json();
      if (data.success) {
        setRecentBooks(data.history.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#1A237E",
          paddingTop: insets.top + 20,
          paddingBottom: 30,
          paddingHorizontal: 20,
        }}
      >
        <Text style={{ fontSize: 16, color: "#E8EAF6", marginBottom: 4 }}>
          Welcome back,
        </Text>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#FFFFFF" }}>
          {user?.name || "Student"}
        </Text>
        <Text style={{ fontSize: 14, color: "#FFD700", marginTop: 4 }}>
          Class {user?.class} • {user?.board} Board
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Actions */}
        <View style={{ padding: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#1A237E",
              marginBottom: 14,
            }}
          >
            Quick Access
          </Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/library")}
              style={{
                flex: 1,
                backgroundColor: "#1A237E",
                borderRadius: 16,
                padding: 20,
                alignItems: "center",
              }}
            >
              <BookOpen size={32} color="#FFD700" />
              <Text
                style={{ color: "#FFFFFF", fontWeight: "600", marginTop: 8 }}
              >
                Library
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/bookmarks")}
              style={{
                flex: 1,
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 20,
                alignItems: "center",
                borderWidth: 2,
                borderColor: "#1A237E",
              }}
            >
              <Bookmark size={32} color="#1A237E" />
              <Text
                style={{ color: "#1A237E", fontWeight: "600", marginTop: 8 }}
              >
                Bookmarks
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/favorites")}
              style={{
                flex: 1,
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 20,
                alignItems: "center",
                borderWidth: 2,
                borderColor: "#1A237E",
              }}
            >
              <Heart size={32} color="#1A237E" />
              <Text
                style={{ color: "#1A237E", fontWeight: "600", marginTop: 8 }}
              >
                Favorites
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Continue Reading */}
        {!isLoading && recentBooks.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "#1A237E" }}
              >
                Continue Reading
              </Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/library")}>
                <Text
                  style={{ color: "#1A237E", fontSize: 14, fontWeight: "600" }}
                >
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            {recentBooks.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`/reader/${item.book_id}`)}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Image
                  source={{ uri: item.cover_image }}
                  style={{ width: 60, height: 80, borderRadius: 8 }}
                  contentFit="cover"
                  transition={100}
                />
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#1A237E",
                      marginBottom: 4,
                    }}
                  >
                    {item.book_title}
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: "#757575", marginBottom: 8 }}
                  >
                    {item.subject} • Class {item.class}
                  </Text>
                  <View
                    style={{
                      height: 4,
                      backgroundColor: "#E0E0E0",
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${item.progress_percentage || 0}%`,
                        backgroundColor: "#FFD700",
                      }}
                    />
                  </View>
                  <Text
                    style={{ fontSize: 12, color: "#9E9E9E", marginTop: 4 }}
                  >
                    {Math.round(item.progress_percentage || 0)}% complete
                  </Text>
                </View>
                <ChevronRight size={20} color="#9E9E9E" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {isLoading && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#1A237E" />
          </View>
        )}

        {/* Coming Soon Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#1A237E",
              marginBottom: 16,
            }}
          >
            Coming Soon
          </Text>

          {[
            {
              icon: <FileText size={24} color="#1A237E" />,
              title: "My Notes",
              desc: "Create and organize your study notes",
            },
            {
              icon: <Upload size={24} color="#1A237E" />,
              title: "My Uploads",
              desc: "Upload your own study materials",
            },
            {
              icon: <ClipboardList size={24} color="#1A237E" />,
              title: "Practice Tests",
              desc: "Test yourself with subject-wise quizzes",
            },
            {
              icon: <Layers size={24} color="#1A237E" />,
              title: "Flashcards",
              desc: "Memorize key concepts with smart flashcards",
            },
          ].map((item) => (
            <View
              key={item.title}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                opacity: 0.6,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    backgroundColor: "#E8EAF6",
                    borderRadius: 10,
                    padding: 10,
                    marginRight: 14,
                  }}
                >
                  {item.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#1A237E",
                      marginBottom: 4,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text style={{ fontSize: 14, color: "#757575" }}>
                    {item.desc}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  backgroundColor: "#FFD700",
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 12,
                  marginLeft: 8,
                }}
              >
                <Text
                  style={{ fontSize: 12, fontWeight: "bold", color: "#1A237E" }}
                >
                  SOON
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
