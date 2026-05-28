import { useState, useCallback } from "react";
import { View, Text, SectionList } from "react-native";
import { ALBUM_DATA } from "../data/album";
import { getOwnedStickers } from "../database/db";
import { useFocusEffect } from "expo-router";

interface MissingSection {
  title: string;
  data: string[];
}

export default function MissingScreen() {
  const [sections, setSections] = useState<MissingSection[]>([]);
  const [totalMissing, setTotalMissing] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadMissing();
    }, [])
  );

  async function loadMissing() {
    const owned = await getOwnedStickers();
    const result: MissingSection[] = [];
    let count = 0;

    // Special stickers
    const missingSpecial = ALBUM_DATA.specialStickers.filter((s) => !owned.has(s));
    if (missingSpecial.length > 0) {
      result.push({ title: "Especial", data: missingSpecial });
      count += missingSpecial.length;
    }

    // FWC
    const missingFwc = ALBUM_DATA.fwcStickers.filter((s) => !owned.has(s));
    if (missingFwc.length > 0) {
      result.push({ title: "FIFA World Cup History", data: missingFwc });
      count += missingFwc.length;
    }

    // Teams by group
    for (const group of ALBUM_DATA.groups) {
      for (const team of group.teams) {
        const missing = team.stickers.filter((s) => !owned.has(s));
        if (missing.length > 0) {
          result.push({
            title: `${team.name} (${team.code}) — Grupo ${group.id}`,
            data: missing,
          });
          count += missing.length;
        }
      }
    }

    // CC
    const missingCc = ALBUM_DATA.ccStickers.filter((s) => !owned.has(s));
    if (missingCc.length > 0) {
      result.push({ title: "Coca-Cola", data: missingCc });
      count += missingCc.length;
    }

    setSections(result);
    setTotalMissing(count);
  }

  return (
    <View className="flex-1 bg-primary p-4">
      {/* Summary */}
      <View className="mb-4 rounded-xl bg-secondary p-4">
        <Text className="text-white text-lg font-bold">Figurinhas Faltantes</Text>
        <Text className="text-gray-300 mt-1">
          {totalMissing} figurinha(s) faltando para completar o álbum
        </Text>
      </View>

      {totalMissing === 0 ? (
        <View className="items-center mt-10">
          <Text className="text-green-400 text-lg font-bold">
            🎉 Álbum completo! Parabéns!
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item}
          renderSectionHeader={({ section }) => (
            <Text className="text-highlight font-bold text-sm mt-3 mb-1">
              {section.title} ({section.data.length})
            </Text>
          )}
          renderItem={({ item }) => (
            <View className="bg-secondary rounded px-3 py-2 mb-1">
              <Text className="text-gray-300 text-sm">{item}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
