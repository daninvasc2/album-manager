import { useState, useCallback } from "react";
import { View, Text, SectionList, Pressable, Alert, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";
import { ALBUM_DATA } from "../data/album";
import { getOwnedStickers } from "../database/db";
import { formatForClipboard } from "../data/teamOrder";
import { useFocusEffect } from "expo-router";
import { colors } from "../theme";

interface MissingSection {
  title: string;
  data: string[];
}

export default function MissingScreen() {
  const [sections, setSections] = useState<MissingSection[]>([]);
  const [totalMissing, setTotalMissing] = useState(0);
  const [allMissing, setAllMissing] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadMissing();
    }, [])
  );

  async function loadMissing() {
    const owned = await getOwnedStickers();
    const result: MissingSection[] = [];
    const missing: string[] = [];
    let count = 0;

    const missingSpecial = ALBUM_DATA.specialStickers.filter((st) => !owned.has(st));
    if (missingSpecial.length > 0) {
      result.push({ title: "Especial", data: missingSpecial });
      missing.push(...missingSpecial);
      count += missingSpecial.length;
    }

    const missingFwc = ALBUM_DATA.fwcStickers.filter((st) => !owned.has(st));
    if (missingFwc.length > 0) {
      result.push({ title: "FIFA World Cup History", data: missingFwc });
      missing.push(...missingFwc);
      count += missingFwc.length;
    }

    for (const group of ALBUM_DATA.groups) {
      for (const team of group.teams) {
        const teamMissing = team.stickers.filter((st) => !owned.has(st));
        if (teamMissing.length > 0) {
          result.push({ title: `${team.name} (${team.code}) — Grupo ${group.id}`, data: teamMissing });
          missing.push(...teamMissing);
          count += teamMissing.length;
        }
      }
    }

    const missingCc = ALBUM_DATA.ccStickers.filter((st) => !owned.has(st));
    if (missingCc.length > 0) {
      result.push({ title: "Coca-Cola", data: missingCc });
      missing.push(...missingCc);
      count += missingCc.length;
    }

    setSections(result);
    setTotalMissing(count);
    setAllMissing(missing);
  }

  async function handleCopy() {
    if (allMissing.length === 0) {
      Alert.alert("Vazio", "Não há figurinhas faltantes.");
      return;
    }

    // Convert to format expected by formatForClipboard (extras = 1 for each)
    const items = allMissing.map((code) => ({ code, extras: 1 }));
    const content = formatForClipboard(items);
    await Clipboard.setStringAsync(content);
    Alert.alert("Copiado!", "Lista de faltantes copiada para a área de transferência.");
  }

  return (
    <View style={s.container}>
      <View style={s.card}>
        <Text style={s.title}>Figurinhas Faltantes</Text>
        <Text style={s.subtitle}>{totalMissing} figurinha(s) faltando para completar o álbum</Text>
      </View>

      <Pressable style={s.copyBtn} onPress={handleCopy}>
        <Text style={s.btnText}>Copiar lista</Text>
      </Pressable>

      {totalMissing === 0 ? (
        <View style={s.empty}>
          <Text style={s.completeText}>🎉 Álbum completo! Parabéns!</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item}
          renderSectionHeader={({ section }) => (
            <Text style={s.sectionHeader}>{section.title} ({section.data.length})</Text>
          )}
          renderItem={({ item }) => (
            <View style={s.item}>
              <Text style={s.itemText}>{item}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, padding: 16 },
  card: { backgroundColor: colors.secondary, borderRadius: 12, padding: 16, marginBottom: 16 },
  title: { color: colors.white, fontSize: 18, fontWeight: "bold" },
  subtitle: { color: colors.gray300, marginTop: 4 },
  copyBtn: { backgroundColor: colors.accent, borderRadius: 8, paddingVertical: 12, alignItems: "center", marginBottom: 16 },
  btnText: { color: colors.white, fontWeight: "bold" },
  empty: { alignItems: "center", marginTop: 40 },
  completeText: { color: colors.green400, fontSize: 18, fontWeight: "bold" },
  sectionHeader: { color: colors.highlight, fontWeight: "bold", fontSize: 14, marginTop: 12, marginBottom: 4 },
  item: { backgroundColor: colors.secondary, borderRadius: 4, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 4 },
  itemText: { color: colors.gray300, fontSize: 14 },
});
