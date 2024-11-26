import { StyleSheet } from "react-native";

import { Text, Dimensions, View } from "react-native";
import Swiper from "@/components/Swiper";
import { useFirebase } from "@/libs/firebase";
import { router, useGlobalSearchParams, useLocalSearchParams, usePathname } from "expo-router";
import { useFirestore } from "@/libs/firestore";
import { useEffect, useMemo, useState } from "react";
import LoadingView from "@/components/LoadingView";
import { useAudio } from "@/libs/audio";

const colors = [
  "tomato",
  "thistle",
  "skyblue",
  "teal",
  "orange",
  "lime",
  "coral",
  "darkkhaki",
  "darksalmon",
  "darkseagreen",
  "darkturquoise",
  "hotpink",
];

export default function Topics() {
  const { course_id } = useLocalSearchParams<{ course_id: string }>();
  const pathname = usePathname();
  const { profile, topics } = useFirestore();
  const { play, stop } = useAudio();

  const list = useMemo(() => (profile ? topics?.filter((it) => it.course_id === course_id) ?? null : null), [profile, topics]);

  const [page, setPage] = useState(0);

  useEffect(() => {
    if (pathname === "/topics") {
      const current = list?.at(page);
      if (current?.audio_name) play(current.audio_name, true);
    }
  }, [page, list, pathname]);

  if (!list) return <LoadingView />;

  return (
    <View style={styles.container}>
      <Swiper
        list={list}
        render={({ item, index }) => (
          <View style={[styles.child, { backgroundColor: colors[index % colors.length] }]}>
            <Text style={styles.title}>№{index + 1}</Text>
            <Text style={styles.subtitle}>{item.name}</Text>
          </View>
        )}
        onSwipe={({ page, direction }) => {
          if (direction === "down") return router.back();
          if (direction === "up") return router.push({ pathname: "/topic", params: list[page] });
        }}
        onPageChange={({ page }) => setPage(page)}
      />
    </View>
  );
}
const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  child: { width, justifyContent: "center", paddingHorizontal: 32 },
  title: { fontSize: 36, textAlign: "center" },
  subtitle: { fontSize: 24, textAlign: "center" },
});
