import { useState, useCallback } from "react";
import { View, Text, SectionList, Pressable, Alert, TextInput, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";
import { getDuplicates, addSticker, removeSticker } from "../database/db";
import { ALBUM_DATA, isValidStickerCode, normalizeCode } from "../data/album";
import { formatForClipboard } from "../data/teamOrder";
import { useFocusEffect } from "expo-router";
import { colors } from "../theme";

interface DuplicateSection {
  title: string;
  data: { code: string; extras: number }[];
}

export default function DuplicatesScreen() {
  const [sections, setSections] = useState<DuplicateSection[]>([]);
  const [totalDuplicates, setTotalDuplicates] = useState(0);
  const [allDuplicates, setAllDuplicates] = useState<{ code: string; extras: number }[]>([]);
  const [addInput, setAddInput] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadDuplicates();
    }, [])
  );

  async function loadDuplicates() {
    const map = await getDuplicates();
    const allItems = Array.from(map.entries()).map(([code, extras]) => ({ code, extras }));
    setAllDuplicates(allItems);
    setTotalDuplicates(allItems.length);

    // Group by section following album order
    const result: DuplicateSection[] = [];
    const codeSet = new Set(allItems.map((i) => i.code));
    const codeMap = new Map(allItems.map((i) => [i.code, i]));

    // Special
    const specialDupes = ALBUM_DATA.specialStickers.filter((s) => codeSet.has(s)).map((s) => codeMap.get(s)!);
    if (specialDupes.length > 0) result.push({ title: "Especial", data: specialDupes });

    // FWC
    const fwcDupes = ALBUM_DATA.fwcStickers.filter((s) => codeSet.has(s)).map((s) => codeMap.get(s)!);
    if (fwcDupes.length > 0) result.push({ title: "FIFA World Cup History", data: fwcDupes });

    // Teams by group
    for (const group of ALBUM_DATA.groups) {
      for (const team of group.teams) {
        const teamDupes = team.stickers.filter((s) => codeSet.has(s)).map((s) => codeMap.get(s)!);
        if (teamDupes.length > 0) {
          result.push({ title: `${team.name} (${team.code}) — Grupo ${group.id}`, data: teamDupes });
        }
      }
    }

    // CC
    const ccDupes = ALBUM_DATA.ccStickers.filter((s) => codeSet.has(s)).map((s) => codeMap.get(s)!);
    if (ccDupes.length > 0) result.push({ title: "Coca-Cola", data: ccDupes });

    setSections(result);
  }

  async function handleAdd() {
    const code = normalizeCode(addInput);
    if (!code) return;

    if (!isValidStickerCode(code)) {
      Alert.alert(
        "Figurinha inválida",
        `"${code}" não existe no álbum. Verifique o código (ex: BRA1, FWC5, CC3).`
      );
      return;
    }

    await addSticker(code);
    setAddInput("");
    await loadDuplicates();
  }

  async function handleRemove(code: string) {
    await removeSticker(code);
    await loadDuplicates();
  }

  async function handleCopy() {
    if (allDuplicates.length === 0) {
      Alert.alert("Vazio", "Você não tem figurinhas repetidas para copiar.");
      return;
    }

    const content = formatForClipboard(allDuplicates);
    await Clipboard.setStringAsync(content);
    Alert.alert("Copiado!", "Lista de repetidas copiada para a área de transferência.");
  }

  return (
    <View style={s.container}>
      <View style={s.addRow}>
        <TextInput
          style={s.input}
          placeholder="Adicionar repetida (ex: BRA5)..."
          placeholderTextColor={colors.gray500}
          value={addInput}
          onChangeText={setAddInput}
          autoCapitalize="characters"
        />
        <Pressable style={s.addBtn} onPress={handleAdd}>
          <Text style={s.btnText}>+</Text>
        </Pressable>
      </View>

      <Pressable style={s.exportBtn} onPress={handleCopy}>
        <Text style={s.btnText}>Copiar lista</Text>
      </Pressable>

      <Text style={s.summary}>{totalDuplicates} figurinha(s) repetida(s)</Text>

      {totalDuplicates === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>Nenhuma figurinha repetida ainda.</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.code}
          renderSectionHeader={({ section }) => (
            <Text style={s.sectionHeader}>{section.title} ({section.data.length})</Text>
          )}
          renderItem={({ item }) => (
            <View style={s.row}>
              <View>
                <Text style={s.code}>{item.code}</Text>
                <Text style={s.extras}>{item.extras} extra(s)</Text>
              </View>
              <Pressable style={s.removeBtn} onPress={() => handleRemove(item.code)}>
                <Text style={s.removeBtnText}>- Remover</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, padding: 16 },
  addRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  input: { flex: 1, backgroundColor: colors.secondary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, color: colors.white },
  addBtn: { backgroundColor: colors.highlight, borderRadius: 8, paddingHorizontal: 16, justifyContent: "center" },
  exportBtn: { backgroundColor: colors.accent, borderRadius: 8, paddingVertical: 12, alignItems: "center", marginBottom: 16 },
  btnText: { color: colors.white, fontWeight: "bold" },
  summary: { color: colors.gray300, marginBottom: 12 },
  empty: { alignItems: "center", marginTop: 40 },
  emptyText: { color: colors.gray500 },
  sectionHeader: { color: colors.highlight, fontWeight: "bold", fontSize: 14, marginTop: 12, marginBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.secondary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 },
  code: { color: colors.white, fontWeight: "bold" },
  extras: { color: colors.gray400, fontSize: 12 },
  removeBtn: { backgroundColor: colors.red700, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  removeBtnText: { color: colors.white, fontSize: 12 },
});
