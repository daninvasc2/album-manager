import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { ALBUM_DATA } from "../../data/album";
import { getOwnedStickers, addSticker, removeSticker } from "../../database/db";
import { colors } from "../../theme";

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
    Alert.alert("Remover figurinha", `Deseja remover ${stickerCode} da sua coleção?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          await removeSticker(stickerCode);
          await loadOwned();
        },
      },
    ]);
  }

  if (!section) {
    return (
      <View style={s.container}>
        <Text style={{ color: colors.white }}>Seção não encontrada</Text>
      </View>
    );
  }

  const ownedCount = section.stickers.filter((st) => owned.has(st)).length;
  const total = section.stickers.length;

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.title}>{section.title}</Text>
        <Text style={s.subtitle}>{ownedCount} / {total} figurinhas</Text>
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${total > 0 ? (ownedCount / total) * 100 : 0}%` }]} />
        </View>
      </View>

      <FlatList
        data={section.stickers}
        keyExtractor={(item) => item}
        numColumns={4}
        columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
        renderItem={({ item: sticker }) => {
          const quantity = owned.get(sticker);
          const isOwned = quantity !== undefined;

          return (
            <View style={{ flex: 1 }}>
              {isOwned ? (
                <Pressable style={s.stickerOwned} onPress={() => handleRemove(sticker)}>
                  <Text style={s.stickerText}>{sticker}</Text>
                  {quantity > 1 && <Text style={s.stickerQty}>x{quantity}</Text>}
                </Pressable>
              ) : (
                <Pressable style={s.stickerMissing} onPress={() => handleAdd(sticker)}>
                  <Text style={s.stickerMissingText}>{sticker}</Text>
                  <Text style={s.addText}>+ Add</Text>
                </Pressable>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, padding: 16 },
  card: { backgroundColor: colors.secondary, borderRadius: 12, padding: 16, marginBottom: 16 },
  title: { color: colors.white, fontSize: 20, fontWeight: "bold" },
  subtitle: { color: colors.gray300, marginTop: 4 },
  progressBg: { height: 12, borderRadius: 6, backgroundColor: colors.gray700, marginTop: 8 },
  progressFill: { height: 12, borderRadius: 6, backgroundColor: colors.highlight },
  stickerOwned: { backgroundColor: colors.green800, borderRadius: 8, padding: 12, alignItems: "center" },
  stickerMissing: { backgroundColor: colors.gray700, borderRadius: 8, padding: 12, alignItems: "center", borderWidth: 1, borderStyle: "dashed", borderColor: colors.gray500 },
  stickerText: { color: colors.white, fontWeight: "bold", fontSize: 11 },
  stickerQty: { color: colors.green300, fontSize: 11, marginTop: 2 },
  stickerMissingText: { color: colors.gray400, fontWeight: "bold", fontSize: 11 },
  addText: { color: colors.highlight, fontSize: 11, marginTop: 2 },
});
