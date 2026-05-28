import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import { Link } from "expo-router";
import { ALBUM_DATA, TOTAL_STICKERS } from "../data/album";
import { getOwnedCount, searchOwned, addSticker } from "../database/db";
import { useFocusEffect } from "expo-router";

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ code: string; quantity: number }[]>([]);
  const [ownedCount, setOwnedCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadOwnedCount();
    }, [])
  );

  async function loadOwnedCount() {
    const count = await getOwnedCount();
    setOwnedCount(count);
  }

  async function handleSearch(text: string) {
    setQuery(text);
    if (text.trim().length === 0) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    const found = await searchOwned(text.trim());
    setResults(found);
  }

  async function handleAddSticker() {
    const code = query.trim().toUpperCase();
    if (!code) return;

    await addSticker(code);
    Alert.alert("Adicionada!", `${code} foi adicionada à sua coleção.`);
    await handleSearch(query);
    await loadOwnedCount();
  }

  const percentage = TOTAL_STICKERS > 0 ? ((ownedCount / TOTAL_STICKERS) * 100).toFixed(1) : "0";

  return (
    <View className="flex-1 bg-primary p-4">
      {/* Progress */}
      <View className="mb-4 rounded-xl bg-secondary p-4">
        <Text className="text-white text-lg font-bold">Progresso do Álbum</Text>
        <Text className="text-gray-300 text-sm mt-1">
          {ownedCount} / {TOTAL_STICKERS} figurinhas ({percentage}%)
        </Text>
        <View className="mt-2 h-3 rounded-full bg-gray-700">
          <View
            className="h-3 rounded-full bg-highlight"
            style={{ width: `${Math.min(parseFloat(percentage), 100)}%` }}
          />
        </View>
      </View>

      {/* Search */}
      <View className="mb-4">
        <TextInput
          className="rounded-lg bg-secondary px-4 py-3 text-white"
          placeholder="Buscar figurinha (ex: BRA, FWC1)..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="characters"
        />
      </View>

      {/* Search Results */}
      {hasSearched && (
        <View className="mb-4">
          {results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => item.code}
              style={{ maxHeight: 200 }}
              renderItem={({ item }) => (
                <View className="flex-row justify-between items-center bg-secondary rounded-lg px-4 py-3 mb-2">
                  <Text className="text-white font-bold">{item.code}</Text>
                  <Text className="text-gray-300">
                    Qtd: {item.quantity} {item.quantity > 1 ? "(repetida)" : ""}
                  </Text>
                </View>
              )}
            />
          ) : (
            <View className="items-center bg-secondary rounded-lg p-4">
              <Text className="text-gray-300 mb-3">
                Nenhum resultado para "{query.toUpperCase()}"
              </Text>
              <Pressable
                className="bg-highlight rounded-lg px-6 py-3"
                onPress={handleAddSticker}
              >
                <Text className="text-white font-bold">
                  Adicionar {query.toUpperCase()} à coleção
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {/* Quick Actions */}
      <View className="flex-row gap-2 mb-4">
        <Link href="/duplicates" asChild>
          <Pressable className="flex-1 bg-accent rounded-lg px-4 py-3 items-center">
            <Text className="text-white font-bold text-sm">Repetidas</Text>
          </Pressable>
        </Link>
        <Link href="/missing" asChild>
          <Pressable className="flex-1 bg-accent rounded-lg px-4 py-3 items-center">
            <Text className="text-white font-bold text-sm">Faltantes</Text>
          </Pressable>
        </Link>
      </View>

      {/* Special Sections */}
      <Text className="text-white text-lg font-bold mb-3">Seções Especiais</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        <Link href="/section/special" asChild>
          <Pressable className="bg-secondary rounded-lg px-3 py-2">
            <Text className="text-white text-sm">Especial</Text>
            <Text className="text-gray-400 text-xs">00</Text>
          </Pressable>
        </Link>
        <Link href="/section/fwc" asChild>
          <Pressable className="bg-secondary rounded-lg px-3 py-2">
            <Text className="text-white text-sm">FIFA World Cup</Text>
            <Text className="text-gray-400 text-xs">FWC1-19</Text>
          </Pressable>
        </Link>
        <Link href="/section/cc" asChild>
          <Pressable className="bg-secondary rounded-lg px-3 py-2">
            <Text className="text-white text-sm">Coca-Cola</Text>
            <Text className="text-gray-400 text-xs">CC1-14</Text>
          </Pressable>
        </Link>
      </View>

      {/* Groups List */}
      <Text className="text-white text-lg font-bold mb-3">Grupos</Text>
      <FlatList
        data={ALBUM_DATA.groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item: group }) => (
          <View className="mb-3">
            <Text className="text-highlight font-bold text-base mb-1">
              Grupo {group.id}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {group.teams.map((team) => (
                <Link
                  key={team.code}
                  href={`/team/${team.code}` as any}
                  asChild
                >
                  <Pressable className="bg-secondary rounded-lg px-3 py-2">
                    <Text className="text-white text-sm">{team.name}</Text>
                    <Text className="text-gray-400 text-xs">{team.code}</Text>
                  </Pressable>
                </Link>
              ))}
            </View>
          </View>
        )}
      />
    </View>
  );
}
