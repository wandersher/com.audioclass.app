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

export default function Exercises() {
  const { topic_id } = useLocalSearchParams<{ topic_id: string }>();
  const pathname = usePathname();
  const { profile, topics, exercises } = useFirestore();
  const { play, stop } = useAudio();

  const list = useMemo(
    () => (profile ? exercises?.filter((it) => it.topic_id === topic_id).sort((a, b) => (a.position > b.position ? 1 : -1)) ?? null : null),
    [profile, exercises]
  );

  const [page, setPage] = useState(0);

  useEffect(() => {
    if (pathname === "/exercises") {
      const current = list?.at(page);
      if (current?.audio) play(current.audio, true);
    }
  }, [page, list, pathname]);

  if (!list) return <LoadingView />;

  return (
    <View style={styles.container}>
      <Swiper
        list={list.length ? list : [{ id: "", text: "У цій темі немає завдань", user_id: "", course_id: "", topic_id, position: 0 }]}
        render={({ item, index }) => (
          <View style={[styles.child, { backgroundColor: colors[index % colors.length] }]}>
            {item.id ? <Text style={styles.title}>№{index + 1}</Text> : null}
            <Text style={styles.subtitle}>{item.text}</Text>
          </View>
        )}
        onSwipe={({ page, direction }) => {
          if (direction === "down") return router.back();
          if (direction === "up" && list.length) return router.push({ pathname: "/answer", params: list[page] });
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
