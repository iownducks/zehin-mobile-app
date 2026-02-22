import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@/context/UserContext";
import { Search, Filter } from "lucide-react-native";
import { Image } from "expo-image";
import { Picker } from "@react-native-picker/picker";

const BOARDS = ["All", "Punjab", "Sindh", "KPK", "Balochistan", "Federal"];
const SUBJECTS = [
  "All",
  "English",
  "Urdu",
  "Math",
  "Science",
  "Islamiat",
  "Pak Studies",
];

export default function Library() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBoard, setSelectedBoard] = useState("All");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedClass, setSelectedClass] = useState(
    user?.class?.toString() || "All",
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchQuery, selectedBoard, selectedSubject, selectedClass]);

  const fetchBooks = async () => {
    try {
      const response = await fetch("/api/books/list");
      const data = await response.json();
      if (data.success) {
        setBooks(data.books);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = books;

    if (searchQuery) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.subject.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedBoard !== "All") {
      filtered = filtered.filter((book) => book.board === selectedBoard);
    }

    if (selectedSubject !== "All") {
      filtered = filtered.filter((book) => book.subject === selectedSubject);
    }

    if (selectedClass !== "All") {
      filtered = filtered.filter(
        (book) => book.class === parseInt(selectedClass),
      );
    }

    setFilteredBooks(filtered);
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
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#FFFFFF",
            marginBottom: 16,
          }}
        >
          Library
        </Text>

        {/* Search Bar */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Search size={20} color="#757575" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search books..."
            style={{ flex: 1, marginLeft: 12, fontSize: 16 }}
          />
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          flexGrow: 0,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderColor: "#E0E0E0",
        }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          gap: 8,
        }}
      >
        <View
          style={{
            backgroundColor: "#F5F5F5",
            borderRadius: 8,
            paddingHorizontal: 12,
            minWidth: 100,
          }}
        >
          <Picker
            selectedValue={selectedClass}
            onValueChange={setSelectedClass}
            style={{ height: 40 }}
          >
            <Picker.Item label="All Classes" value="All" />
            {[...Array(12)].map((_, i) => (
              <Picker.Item
                key={i + 1}
                label={`Class ${i + 1}`}
                value={String(i + 1)}
              />
            ))}
          </Picker>
        </View>

        <View
          style={{
            backgroundColor: "#F5F5F5",
            borderRadius: 8,
            paddingHorizontal: 12,
            minWidth: 100,
          }}
        >
          <Picker
            selectedValue={selectedBoard}
            onValueChange={setSelectedBoard}
            style={{ height: 40 }}
          >
            {BOARDS.map((b) => (
              <Picker.Item key={b} label={b} value={b} />
            ))}
          </Picker>
        </View>

        <View
          style={{
            backgroundColor: "#F5F5F5",
            borderRadius: 8,
            paddingHorizontal: 12,
            minWidth: 100,
          }}
        >
          <Picker
            selectedValue={selectedSubject}
            onValueChange={setSelectedSubject}
            style={{ height: 40 }}
          >
            {SUBJECTS.map((s) => (
              <Picker.Item key={s} label={s} value={s} />
            ))}
          </Picker>
        </View>
      </ScrollView>

      {/* Books Grid */}
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
        ) : filteredBooks.length === 0 ? (
          <View style={{ paddingVertical: 40, alignItems: "center" }}>
            <Text
              style={{ fontSize: 16, color: "#757575", textAlign: "center" }}
            >
              No books found matching your criteria
            </Text>
          </View>
        ) : (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 16,
              justifyContent: "space-between",
            }}
          >
            {filteredBooks.map((book) => (
              <TouchableOpacity
                key={book.id}
                onPress={() => router.push(`/reader/${book.id}`)}
                style={{ width: "47%", marginBottom: 16 }}
              >
                <View
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 12,
                    overflow: "hidden",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Image
                    source={{ uri: book.cover_image }}
                    style={{ width: "100%", height: 200 }}
                    contentFit="cover"
                    transition={100}
                  />
                  <View style={{ padding: 12 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "#1A237E",
                        marginBottom: 4,
                        numberOfLines: 2,
                      }}
                    >
                      {book.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#757575",
                        marginBottom: 2,
                      }}
                    >
                      {book.subject}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "#FFD700",
                        fontWeight: "600",
                      }}
                    >
                      Class {book.class} • {book.board}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
