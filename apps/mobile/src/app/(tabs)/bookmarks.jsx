import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@/context/UserContext";
import { Bookmark, Trash2, BookOpen } from "lucide-react-native";
import { Image } from "expo-image";

export default function Bookmarks() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    try {
      const response = await fetch(`/api/bookmarks/list?userId=${user.id}`);
      const data = await response.json();
      if (data.success) {
        setBookmarks(data.bookmarks);
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBookmark = async (bookmarkId) => {
    Alert.alert(
      "Delete Bookmark",
      "Are you sure you want to delete this bookmark?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `/api/bookmarks/delete?id=${bookmarkId}`,
                {
                  method: "DELETE",
                },
              );
              if (response.ok) {
                setBookmarks(bookmarks.filter((b) => b.id !== bookmarkId));
              }
            } catch (error) {
              console.error("Error deleting bookmark:", error);
              Alert.alert("Error", "Failed to delete bookmark");
            }
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#1A237E",
          paddingTop: insets.top + 20,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#FFFFFF" }}>
          Bookmarks
        </Text>
        <Text style={{ fontSize: 14, color: "#E8EAF6", marginTop: 4 }}>
          {bookmarks.length} saved bookmark{bookmarks.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#1A237E" />
          </View>
        ) : bookmarks.length === 0 ? (
          <View style={{ paddingVertical: 60, alignItems: "center" }}>
            <Bookmark size={64} color="#E0E0E0" />
            <Text
              style={{
                fontSize: 18,
                color: "#757575",
                marginTop: 16,
                textAlign: "center",
              }}
            >
              No bookmarks yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#9E9E9E",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Start reading and bookmark important pages
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/library")}
              style={{
                backgroundColor: "#1A237E",
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 12,
                marginTop: 24,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                Browse Library
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          bookmarks.map((bookmark) => (
            <View
              key={bookmark.id}
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Image
                  source={{ uri: bookmark.cover_image }}
                  style={{ width: 50, height: 70, borderRadius: 8 }}
                  contentFit="cover"
                  transition={100}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#1A237E",
                      marginBottom: 4,
                    }}
                  >
                    {bookmark.book_title}
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: "#757575", marginBottom: 4 }}
                  >
                    {bookmark.subject}
                  </Text>
                  {bookmark.chapter_title && (
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#1A237E",
                        marginBottom: 4,
                      }}
                    >
                      Chapter {bookmark.chapter_number}:{" "}
                      {bookmark.chapter_title}
                    </Text>
                  )}
                  {bookmark.note && (
                    <View
                      style={{
                        backgroundColor: "#FFF8E1",
                        padding: 8,
                        borderRadius: 8,
                        marginTop: 8,
                        borderLeftWidth: 3,
                        borderLeftColor: "#FFD700",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#424242",
                          fontStyle: "italic",
                        }}
                      >
                        "{bookmark.note}"
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={{ flexDirection: "row", marginTop: 12, gap: 8 }}>
                <TouchableOpacity
                  onPress={() => router.push(`/reader/${bookmark.book_id}`)}
                  style={{
                    flex: 1,
                    backgroundColor: "#1A237E",
                    paddingVertical: 10,
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <BookOpen size={16} color="#FFFFFF" />
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 14,
                      fontWeight: "600",
                    }}
                  >
                    Read
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => deleteBookmark(bookmark.id)}
                  style={{
                    backgroundColor: "#FFEBEE",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Trash2 size={16} color="#C62828" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
