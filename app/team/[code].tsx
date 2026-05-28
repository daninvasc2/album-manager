import { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ALBUM_DATA } from "../../data/album";
import { getOwnedStickers, addSticker, removeSticker } from "../../database/db";
import { useFocusEffect } from "expo-router";

export default function TeamScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [owned, setOwned] = useState<Map<string, number>>(new Map());

  const team = ALBUM_DATA.groups
    .flatMap((g) => g.teams)
    .find((t) => t.code === code);

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

  if (!team) {
    return (
      <View className="flex-1 bg-primary items-center justify-center">
        <Text className="text-white">Seleção não encontrada</Text>
      </View>
    );
  }

  const ownedCount = team.stickers.filter((s) => owned.has(s)).length;
  const total = team.stickers.length;

  return (
    <View className="flex-1 bg-primary p-4">
      {/* Header */}
      <View className="mb-4 rounded-xl bg-secondary p-4">
        <Text className="text-white text-xl font-bold">{team.name}</Text>
        <Text className="text-gray-300 mt-1">
          {ownedCount} / {total} figurinhas
        </Text>
        <View className="mt-2 h-3 rounded-full bg-gray-700">
          <View
            className="h-3 rounded-full bg-highlight"
            style={{ width: `${(ownedCount / total) * 100}%` }}
          />
        </View>
      </View>

      {/* Stickers Grid */}
      <FlatList
        data={team.stickers}
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
