import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Heart } from "lucide-react-native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = (screenWidth - 60) / 2;

const GAMES = [
  {
    id: "memory-match",
    title: "Memory Match",
    emoji: "🃏",
    color: "#FF6B6B",
    bgColor: "#FFE5E5",
  },
  {
    id: "color-tap",
    title: "Color Tap",
    emoji: "🎨",
    color: "#4ECDC4",
    bgColor: "#E5F9F7",
  },
  {
    id: "balloon-pop",
    title: "Balloon Pop",
    emoji: "🎈",
    color: "#F38181",
    bgColor: "#FFEAEA",
  },
  {
    id: "ludo",
    title: "Ludo",
    emoji: "🎲",
    color: "#FF6B35",
    bgColor: "#FFE8DC",
  },
  {
    id: "tic-tac-toe",
    title: "Tic Tac Toe",
    emoji: "⭕",
    color: "#6C5CE7",
    bgColor: "#E8E5FF",
  },
  {
    id: "chess",
    title: "Chess Lite",
    emoji: "♟️",
    color: "#2D3436",
    bgColor: "#DFE6E9",
  },
  {
    id: "sudoku",
    title: "Sudoku",
    emoji: "🔢",
    color: "#00B894",
    bgColor: "#D5F4E6",
  },
  {
    id: "word-search",
    title: "Word Search",
    emoji: "📝",
    color: "#FDCB6E",
    bgColor: "#FFF3D6",
  },
  {
    id: "snake",
    title: "Snake",
    emoji: "🐍",
    color: "#00CEC9",
    bgColor: "#D4F5F4",
  },
  {
    id: "2048",
    title: "2048",
    emoji: "🔢",
    color: "#E17055",
    bgColor: "#FFEAA7",
  },
];

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, []),
  );

  const loadFavorites = async () => {
    try {
      const saved = await AsyncStorage.getItem("favorites");
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  };

  const removeFavorite = async (gameId) => {
    try {
      const newFavorites = favorites.filter((id) => id !== gameId);
      setFavorites(newFavorites);
      await AsyncStorage.setItem("favorites", JSON.stringify(newFavorites));
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  const favoriteGames = GAMES.filter((game) => favorites.includes(game.id));

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF5F0" }}>
      <StatusBar style="dark" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: "Poppins_600SemiBold",
              fontSize: 32,
              color: "#333",
              marginBottom: 4,
            }}
          >
            ❤️ Favorites
          </Text>
          <Text
            style={{
              fontFamily: "Poppins_400Regular",
              fontSize: 15,
              color: "#666",
            }}
          >
            Your favorite games
          </Text>
        </View>

        {/* Empty State */}
        {favoriteGames.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 80,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: "#FFE5E5",
                borderRadius: 40,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Heart size={40} color="#FF6B6B" />
            </View>
            <Text
              style={{
                fontFamily: "Poppins_600SemiBold",
                fontSize: 20,
                color: "#333",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              No favorites yet!
            </Text>
            <Text
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: 15,
                color: "#666",
                textAlign: "center",
                marginBottom: 24,
                paddingHorizontal: 40,
              }}
            >
              Tap the heart on any game to add it here
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/games")}
              style={{
                backgroundColor: "#FF6B35",
                borderRadius: 16,
                paddingVertical: 12,
                paddingHorizontal: 24,
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  fontFamily: "Poppins_500Medium",
                  fontSize: 16,
                  color: "#FFF",
                }}
              >
                Browse Games
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Favorites Grid */
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            {favoriteGames.map((game) => (
              <TouchableOpacity
                key={game.id}
                onPress={() => router.push(`/(tabs)/game/${game.id}`)}
                style={{
                  width: cardWidth,
                  backgroundColor: "#FFF",
                  borderRadius: 20,
                  padding: 20,
                  shadowColor: game.color,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                activeOpacity={0.8}
              >
                {/* Remove Favorite Button */}
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    removeFavorite(game.id);
                  }}
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    zIndex: 10,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>❤️</Text>
                </TouchableOpacity>

                {/* Game Icon */}
                <View
                  style={{
                    width: 64,
                    height: 64,
                    backgroundColor: game.bgColor,
                    borderRadius: 32,
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 16,
                    alignSelf: "center",
                  }}
                >
                  <Text style={{ fontSize: 36 }}>{game.emoji}</Text>
                </View>

                {/* Game Title */}
                <Text
                  style={{
                    fontFamily: "Poppins_600SemiBold",
                    fontSize: 16,
                    color: "#333",
                    textAlign: "center",
                    marginBottom: 12,
                  }}
                >
                  {game.title}
                </Text>

                {/* Play Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: game.color,
                    borderRadius: 12,
                    paddingVertical: 10,
                    alignItems: "center",
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      fontFamily: "Poppins_500Medium",
                      fontSize: 14,
                      color: "#FFF",
                    }}
                  >
                    Play Now!
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
