import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { ALBUM_DATA, TOTAL_STICKERS, isValidStickerCode, normalizeCode } from "../data/album";
import { getOwnedCount, searchOwned, addSticker } from "../database/db";
import { colors } from "../theme";

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ code: string; quantity: number }[]>([]);
  const [ownedCount, setOwnedCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [groupFilter, setGroupFilter] = useState("");

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
    const normalized = normalizeCode(text);
    const found = await searchOwned(normalized);
    setResults(found);
  }

  async function handleAddSticker() {
    const code = normalizeCode(query);
    if (!code) return;

    if (!isValidStickerCode(code)) {
      Alert.alert(
        "Figurinha inválida",
        `"${code}" não existe no álbum. Verifique o código (ex: BRA1, FWC5, CC3).`
      );
      return;
    }

    await addSticker(code);
    Alert.alert("Adicionada!", `${code} foi adicionada à sua coleção.`);
    await handleSearch(query);
    await loadOwnedCount();
  }

  const percentage = TOTAL_STICKERS > 0 ? ((ownedCount / TOTAL_STICKERS) * 100).toFixed(1) : "0";

  const filteredGroups = groupFilter.trim().length === 0
    ? ALBUM_DATA.groups
    : ALBUM_DATA.groups
        .map((group) => ({
          ...group,
          teams: group.teams.filter(
            (team) =>
              team.name.toLowerCase().includes(groupFilter.toLowerCase()) ||
              team.code.toLowerCase().includes(groupFilter.toLowerCase())
          ),
        }))
        .filter((group) => group.teams.length > 0);

  return (
    <ScrollView style={s.container}>
      {/* Progress */}
      <View style={s.card}>
        <Text style={s.cardTitle}>Progresso do Álbum</Text>
        <Text style={s.cardSubtitle}>
          {ownedCount} / {TOTAL_STICKERS} figurinhas ({percentage}%)
        </Text>
        <View style={s.progressBg}>
          <View style={[s.progressFill, { width: `${Math.min(parseFloat(percentage), 100)}%` }]} />
        </View>
      </View>

      {/* Search */}
      <TextInput
        style={s.input}
        placeholder="Buscar figurinha (ex: BRA, FWC1)..."
        placeholderTextColor={colors.gray500}
        value={query}
        onChangeText={handleSearch}
        autoCapitalize="characters"
      />

      {/* Search Results */}
      {hasSearched && (
        <View style={s.section}>
          {results.length > 0 ? (
            results.map((item) => (
              <View key={item.code} style={s.resultRow}>
                <Text style={s.resultCode}>{item.code}</Text>
                <Text style={s.resultQty}>
                  Qtd: {item.quantity} {item.quantity > 1 ? "(repetida)" : ""}
                </Text>
              </View>
            ))
          ) : (
            <View style={s.emptyResult}>
              <Text style={s.cardSubtitle}>
                Nenhum resultado para "{normalizeCode(query)}"
              </Text>
              {isValidStickerCode(normalizeCode(query)) ? (
                <Pressable style={s.btnHighlight} onPress={handleAddSticker}>
                  <Text style={s.btnText}>Adicionar {normalizeCode(query)} à coleção</Text>
                </Pressable>
              ) : (
                <Text style={s.hintText}>
                  Código inválido. Use o formato correto (ex: BRA1, FWC5, CC3).
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Quick Actions */}
      <View style={s.row}>
        <Link href="/duplicates" asChild>
          <Pressable style={s.btnAccent}>
            <Text style={s.btnText}>Repetidas</Text>
          </Pressable>
        </Link>
        <Link href="/missing" asChild>
          <Pressable style={s.btnAccent}>
            <Text style={s.btnText}>Faltantes</Text>
          </Pressable>
        </Link>
      </View>

      {/* Special Sections */}
      <Text style={s.sectionTitle}>Seções Especiais</Text>
      <View style={s.teamRow}>
        <Link href="/section/special" asChild>
          <Pressable style={s.teamCard}>
            <Text style={s.teamName}>Especial</Text>
            <Text style={s.teamCode}>00</Text>
          </Pressable>
        </Link>
        <Link href="/section/fwc" asChild>
          <Pressable style={s.teamCard}>
            <Text style={s.teamName}>FIFA World Cup</Text>
            <Text style={s.teamCode}>FWC1-19</Text>
          </Pressable>
        </Link>
        <Link href="/section/cc" asChild>
          <Pressable style={s.teamCard}>
            <Text style={s.teamName}>Coca-Cola</Text>
            <Text style={s.teamCode}>CC1-14</Text>
          </Pressable>
        </Link>
      </View>

      {/* Groups */}
      <Text style={s.sectionTitle}>Grupos</Text>
      <TextInput
        style={s.input}
        placeholder="Filtrar seleção (ex: Brasil, ARG)..."
        placeholderTextColor={colors.gray500}
        value={groupFilter}
        onChangeText={setGroupFilter}
      />

      {filteredGroups.map((group) => (
        <View key={group.id} style={s.section}>
          <Text style={s.groupTitle}>Grupo {group.id}</Text>
          <View style={s.teamRow}>
            {group.teams.map((team) => (
              <Link key={team.code} href={`/team/${team.code}` as any} asChild>
                <Pressable style={s.teamCard}>
                  <Text style={s.teamName}>{team.name}</Text>
                  <Text style={s.teamCode}>{team.code}</Text>
                </Pressable>
              </Link>
            ))}
          </View>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, padding: 16 },
  card: { backgroundColor: colors.secondary, borderRadius: 12, padding: 16, marginBottom: 16 },
  cardTitle: { color: colors.white, fontSize: 18, fontWeight: "bold" },
  cardSubtitle: { color: colors.gray300, fontSize: 14, marginTop: 4 },
  progressBg: { height: 12, borderRadius: 6, backgroundColor: colors.gray700, marginTop: 8 },
  progressFill: { height: 12, borderRadius: 6, backgroundColor: colors.highlight },
  input: { backgroundColor: colors.secondary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, color: colors.white, marginBottom: 16 },
  section: { marginBottom: 16 },
  resultRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.secondary, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 },
  resultCode: { color: colors.white, fontWeight: "bold" },
  resultQty: { color: colors.gray300 },
  emptyResult: { alignItems: "center", backgroundColor: colors.secondary, borderRadius: 8, padding: 16 },
  hintText: { color: colors.gray500, fontSize: 12, marginTop: 8 },
  row: { flexDirection: "row", gap: 8, marginBottom: 16 },
  btnAccent: { flex: 1, backgroundColor: colors.accent, borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  btnHighlight: { backgroundColor: colors.highlight, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12, marginTop: 12 },
  btnText: { color: colors.white, fontWeight: "bold", fontSize: 14 },
  sectionTitle: { color: colors.white, fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  groupTitle: { color: colors.highlight, fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  teamRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  teamCard: { backgroundColor: colors.secondary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  teamName: { color: colors.white, fontSize: 14 },
  teamCode: { color: colors.gray400, fontSize: 12 },
});
