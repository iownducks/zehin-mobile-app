import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@/context/UserContext";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  List,
  Sun,
  Moon,
  ZoomIn,
  ZoomOut,
} from "lucide-react-native";

export default function Reader() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const router = useRouter();

  const [book, setBook] = useState(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showChapterList, setShowChapterList] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    fetchBook();
  }, [id]);

  useEffect(() => {
    if (book && user) {
      updateReadingHistory();
    }
  }, [currentChapterIndex, book]);

  const fetchBook = async () => {
    try {
      const response = await fetch(`/api/books/${id}`);
      const data = await response.json();
      if (data.success) {
        setBook(data.book);
      }
    } catch (error) {
      console.error("Error fetching book:", error);
      Alert.alert("Error", "Failed to load book");
    } finally {
      setIsLoading(false);
    }
  };

  const updateReadingHistory = async () => {
    if (!user || !book) return;

    try {
      const progress = ((currentChapterIndex + 1) / book.chapters.length) * 100;
      await fetch("/api/reading-history/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          bookId: book.id,
          chapterId: book.chapters[currentChapterIndex]?.id,
          progressPercentage: progress,
          lastPosition: currentChapterIndex,
        }),
      });
    } catch (error) {
      console.error("Error updating history:", error);
    }
  };

  const toggleBookmark = async () => {
    if (!user || !book) return;

    try {
      if (isBookmarked) {
        setIsBookmarked(false);
      } else {
        const response = await fetch("/api/bookmarks/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            bookId: book.id,
            chapterId: book.chapters[currentChapterIndex]?.id,
            position: 0,
            note: "",
          }),
        });
        if (response.ok) {
          setIsBookmarked(true);
          Alert.alert("Success", "Bookmark added!");
        }
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      Alert.alert("Error", "Failed to bookmark");
    }
  };

  const getThemeColors = () => {
    switch (theme) {
      case "dark":
        return { bg: "#1A1A1A", text: "#E0E0E0" };
      case "sepia":
        return { bg: "#F4ECD8", text: "#5C4A3A" };
      default:
        return { bg: "#FFFFFF", text: "#212121" };
    }
  };

  const stripHtml = (html) => {
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F5F5F5",
        }}
      >
        <ActivityIndicator size="large" color="#1A237E" />
      </View>
    );
  }

  if (!book) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F5F5F5",
        }}
      >
        <Text style={{ color: "#757575" }}>Book not found</Text>
      </View>
    );
  }

  const colors = getThemeColors();
  const currentChapter = book.chapters[currentChapterIndex];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          backgroundColor: "#1A237E",
          paddingTop: insets.top + 12,
          paddingBottom: 12,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={{ flex: 1, marginHorizontal: 16 }}>
          <Text
            style={{ fontSize: 16, fontWeight: "600", color: "#FFFFFF" }}
            numberOfLines={1}
          >
            {book.title}
          </Text>
          <Text style={{ fontSize: 12, color: "#E8EAF6" }} numberOfLines={1}>
            {currentChapter?.title}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={() => setShowChapterList(!showChapterList)}
          >
            <List size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleBookmark}>
            {isBookmarked ? (
              <BookmarkCheck size={24} color="#FFD700" />
            ) : (
              <Bookmark size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Chapter List Overlay */}
      {showChapterList && (
        <View
          style={{
            position: "absolute",
            top: insets.top + 60,
            left: 16,
            right: 16,
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            maxHeight: 400,
            zIndex: 100,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <ScrollView style={{ maxHeight: 400 }}>
            {book.chapters.map((chapter, index) => (
              <TouchableOpacity
                key={chapter.id}
                onPress={() => {
                  setCurrentChapterIndex(index);
                  setShowChapterList(false);
                }}
                style={{
                  padding: 16,
                  borderBottomWidth: 1,
                  borderColor: "#E0E0E0",
                  backgroundColor:
                    index === currentChapterIndex ? "#E8EAF6" : "#FFFFFF",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: index === currentChapterIndex ? "600" : "400",
                    color:
                      index === currentChapterIndex ? "#1A237E" : "#424242",
                  }}
                >
                  {chapter.chapter_number}. {chapter.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Reader Controls */}
      <View
        style={{
          backgroundColor: colors.bg,
          borderBottomWidth: 1,
          borderColor: theme === "dark" ? "#424242" : "#E0E0E0",
          paddingVertical: 12,
          paddingHorizontal: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={() => setFontSize(Math.max(12, fontSize - 2))}
            style={{ padding: 8 }}
          >
            <ZoomOut size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFontSize(Math.min(24, fontSize + 2))}
            style={{ padding: 8 }}
          >
            <ZoomIn size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => setTheme("light")}
            style={{
              padding: 8,
              backgroundColor: theme === "light" ? "#1A237E" : "transparent",
              borderRadius: 8,
            }}
          >
            <Sun
              size={20}
              color={theme === "light" ? "#FFFFFF" : colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTheme("sepia")}
            style={{
              padding: 8,
              backgroundColor: theme === "sepia" ? "#8B7355" : "transparent",
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 20 }}>☕</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTheme("dark")}
            style={{
              padding: 8,
              backgroundColor: theme === "dark" ? "#424242" : "transparent",
              borderRadius: 8,
            }}
          >
            <Moon
              size={20}
              color={theme === "dark" ? "#FFFFFF" : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontSize: fontSize,
            lineHeight: fontSize * 1.6,
            color: colors.text,
          }}
        >
          {stripHtml(currentChapter?.content || "No content available")}
        </Text>
      </ScrollView>

      {/* Navigation */}
      <View
        style={{
          backgroundColor: colors.bg,
          borderTopWidth: 1,
          borderColor: theme === "dark" ? "#424242" : "#E0E0E0",
          paddingVertical: 12,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 12,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() =>
            setCurrentChapterIndex(Math.max(0, currentChapterIndex - 1))
          }
          disabled={currentChapterIndex === 0}
          style={{
            backgroundColor: currentChapterIndex === 0 ? "#E0E0E0" : "#1A237E",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Previous</Text>
        </TouchableOpacity>

        <Text style={{ color: colors.text, fontSize: 14 }}>
          {currentChapterIndex + 1} / {book.chapters.length}
        </Text>

        <TouchableOpacity
          onPress={() =>
            setCurrentChapterIndex(
              Math.min(book.chapters.length - 1, currentChapterIndex + 1),
            )
          }
          disabled={currentChapterIndex === book.chapters.length - 1}
          style={{
            backgroundColor:
              currentChapterIndex === book.chapters.length - 1
                ? "#E0E0E0"
                : "#1A237E",
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
