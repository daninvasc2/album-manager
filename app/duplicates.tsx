import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { getDuplicates, addSticker, removeSticker } from "../database/db";
import { useFocusEffect } from "expo-router";

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

    // Group by prefix: ESP 1, 2, 3;BRA 4, 5, 6
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
    <View className="flex-1 bg-primary p-4">
      {/* Add duplicate */}
      <View className="flex-row mb-4 gap-2">
        <TextInput
          className="flex-1 rounded-lg bg-secondary px-4 py-3 text-white"
          placeholder="Adicionar repetida (ex: BRA5)..."
          placeholderTextColor="#888"
          value={addInput}
          onChangeText={setAddInput}
          autoCapitalize="characters"
        />
        <Pressable
          className="bg-highlight rounded-lg px-4 justify-center"
          onPress={handleAdd}
        >
          <Text className="text-white font-bold">+</Text>
        </Pressable>
      </View>

      {/* Export button */}
      <Pressable
        className="bg-accent rounded-lg px-4 py-3 mb-4 items-center"
        onPress={handleExport}
      >
        <Text className="text-white font-bold">Exportar lista (.txt)</Text>
      </Pressable>

      {/* Summary */}
      <Text className="text-gray-300 mb-3">
        {duplicates.length} figurinha(s) repetida(s)
      </Text>

      {/* List */}
      {duplicates.length === 0 ? (
        <View className="items-center mt-10">
          <Text className="text-gray-500">Nenhuma figurinha repetida ainda.</Text>
        </View>
      ) : (
        <FlatList
          data={duplicates}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <View className="flex-row justify-between items-center bg-secondary rounded-lg px-4 py-3 mb-2">
              <View>
                <Text className="text-white font-bold">{item.code}</Text>
                <Text className="text-gray-400 text-xs">
                  {item.extras} extra(s)
                </Text>
              </View>
              <Pressable
                className="bg-red-700 rounded-lg px-3 py-2"
                onPress={() => handleRemove(item.code)}
              >
                <Text className="text-white text-sm">- Remover</Text>
              </Pressable>
            </View>
          )}
        />
      )}
    </View>
  );
}
