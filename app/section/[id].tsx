import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ALBUM_DATA } from "../../data/album";
import { getOwnedStickers, addSticker, removeSticker } from "../../database/db";
import { useFocusEffect } from "expo-router";

function getSectionData(id: string): { title: string; stickers: string[] } | null {
  switch (id) {
    case "special":
      return { title: "Figurinha Especial", stickers: ALBUM_DATA.specialStickers };
    case "fwc":
      return { title: "FIFA World Cup History", stickers: ALBUM_DATA.fwcStickers };
    case "cc":
      return { title: "Coca-Cola", stickers: ALBUM_DATA.ccStickers };
    default:
      return null;
  }
}

export default function SectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [owned, setOwned] = useState<Map<string, number>>(new Map());

  const section = getSectionData(id);

  useFocusEffect(
    useCallback(() => {
      loadOwned();
    }, [])
  );

  async function loadOwned() {
    const map = await getOwnedStickers();
    setOwned(map);
  }

  async function handleAdd(stickerCode: string) {
    await addSticker(stickerCode);
    await loadOwned();
  }

  async function handleRemove(stickerCode: string) {
    Alert.alert(
      "Remover figurinha",
      `Deseja remover ${stickerCode} da sua coleção?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            await removeSticker(stickerCode);
            await loadOwned();
          },
        },
      ]
    );
  }

  if (!section) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <Text className="text-white">Seção não encontrada</Text>
      </View>
    );
  }

  const ownedCount = section.stickers.filter((s) => owned.has(s)).length;
  const total = section.stickers.length;

  return (
    <View className="flex-1 bg-primary p-4">
      {/* Header */}
      <View className="mb-4 rounded-xl bg-secondary p-4">
        <Text className="text-white text-xl font-bold">{section.title}</Text>
        <Text className="text-gray-300 mt-1">
          {ownedCount} / {total} figurinhas
        </Text>
        <View className="mt-2 h-3 rounded-full bg-gray-700">
          <View
            className="h-3 rounded-full bg-highlight"
            style={{ width: `${total > 0 ? (ownedCount / total) * 100 : 0}%` }}
          />
        </View>
      </View>

      {/* Stickers Grid */}
      <FlatList
        data={section.stickers}
        keyExtractor={(item) => item}
        numColumns={4}
        columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
        renderItem={({ item: sticker }) => {
          const quantity = owned.get(sticker);
          const isOwned = quantity !== undefined;

          return (
            <View className="flex-1">
              {isOwned ? (
                <Pressable
                  className="rounded-lg bg-green-800 p-3 items-center"
                  onPress={() => handleRemove(sticker)}
                >
                  <Text className="text-white font-bold text-xs">{sticker}</Text>
                  {quantity > 1 && (
                    <Text className="text-green-300 text-xs mt-1">x{quantity}</Text>
                  )}
                </Pressable>
              ) : (
                <Pressable
                  className="rounded-lg bg-gray-700 p-3 items-center border border-dashed border-gray-500"
                  onPress={() => handleAdd(sticker)}
                >
                  <Text className="text-gray-400 font-bold text-xs">{sticker}</Text>
                  <Text className="text-highlight text-xs mt-1">+ Add</Text>
                </Pressable>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}
