import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, Alert, TextInput, StyleSheet } from "react-native";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { getDuplicates, addSticker, removeSticker } from "../database/db";
import { useFocusEffect } from "expo-router";
import { colors } from "../theme";

export default function DuplicatesScreen() {
  const [duplicates, setDuplicates] = useState<{ code: string; extras: number }[]>([]);
  const [addInput, setAddInput] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadDuplicates();
    }, [])
  );

  async function loadDuplicates() {
    const map = await getDuplicates();
    const list = Array.from(map.entries())
      .map(([code, extras]) => ({ code, extras }))
      .sort((a, b) => a.code.localeCompare(b.code));
    setDuplicates(list);
  }

  async function handleAdd() {
    const code = addInput.trim().toUpperCase();
    if (!code) return;
    await addSticker(code);
    setAddInput("");
    await loadDuplicates();
  }

  async function handleRemove(code: string) {
    await removeSticker(code);
    await loadDuplicates();
  }

  async function handleExport() {
    if (duplicates.length === 0) {
      Alert.alert("Vazio", "Você não tem figurinhas repetidas para exportar.");
      return;
    }

    const grouped = new Map<string, number[]>();
    for (const { code, extras } of duplicates) {
      const match = code.match(/^([A-Z]+)(\d+)$/);
      if (match) {
        const [, prefix, num] = match;
        if (!grouped.has(prefix)) grouped.set(prefix, []);
        for (let i = 0; i < extras; i++) {
          grouped.get(prefix)!.push(parseInt(num));
        }
      }
    }

    const lines: string[] = [];
    for (const [prefix, nums] of Array.from(grouped.entries()).sort()) {
      nums.sort((a, b) => a - b);
      lines.push(`${prefix} ${nums.join(", ")}`);
    }
    const content = lines.join(";\n");

    const fileUri = FileSystem.documentDirectory + "repetidas.txt";
    await FileSystem.writeAsStringAsync(fileUri, content);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      Alert.alert("Exportado", `Arquivo salvo em:\n${fileUri}`);
    }
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

      <Pressable style={s.exportBtn} onPress={handleExport}>
        <Text style={s.btnText}>Exportar lista (.txt)</Text>
      </Pressable>

      <Text style={s.summary}>{duplicates.length} figurinha(s) repetida(s)</Text>

      {duplicates.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyText}>Nenhuma figurinha repetida ainda.</Text>
        </View>
      ) : (
        <FlatList
          data={duplicates}
          keyExtractor={(item) => item.code}
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
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.secondary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 },
  code: { color: colors.white, fontWeight: "bold" },
  extras: { color: colors.gray400, fontSize: 12 },
  removeBtn: { backgroundColor: colors.red700, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  removeBtnText: { color: colors.white, fontSize: 12 },
});
