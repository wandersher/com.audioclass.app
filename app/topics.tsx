import { StyleSheet } from "react-native";

import { Text, Dimensions, View } from "react-native";
import Swiper from "@/components/Swiper";
import { useFirebase } from "@/libs/firebase";
import { router, useGlobalSearchParams, useLocalSearchParams } from "expo-router";
import { useFirestore } from "@/libs/firestore";
import { useEffect, useMemo, useState } from "react";
import LoadingView from "@/components/LoadingView";
import Audio from "@/libs/audio";
const colors = ["tomato", "thistle", "skyblue", "teal", "orange", "lime"];

export default function Topics() {
  const { course_id } = useLocalSearchParams<{ course_id: string }>();

  const { profile, topics } = useFirestore();

  const list = useMemo(() => (profile ? topics?.filter((it) => it.course_id === course_id) ?? null : null), [profile, topics]);

  const [page, setPage] = useState(0);

  useEffect(() => {
    const current = list?.at(page);
    if (current?.audio_name) Audio.play(current.audio_name, true);
  }, [page, list]);

  useEffect(() => {
    return () => {
      Audio.stop();
    };
  }, []);

  if (!list) return <LoadingView />;

  return (
    <View style={styles.container}>
      <Swiper
        list={list}
        render={({ item, index }) => (
          <View style={[styles.child, { backgroundColor: colors[index] }]}>
            <Text style={styles.title}>№{index + 1}</Text>
            <Text style={styles.subtitle}>{item.name}</Text>
          </View>
        )}
        onSwipe={({ page, direction }) => {
          if (direction === "down") return router.back();
          console.log(page, direction);
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
