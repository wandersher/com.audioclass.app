import { StyleSheet } from "react-native";

import { Text, Dimensions, View } from "react-native";
import Swiper from "@/components/Swiper";
import { useFirebase } from "@/libs/firebase";
import { router } from "expo-router";
import { useFirestore } from "@/libs/firestore";
import { useEffect, useMemo, useState } from "react";
import LoadingView from "@/components/LoadingView";

import { SoundObject } from "expo-av/build/Audio";
import Audio from "@/libs/audio";
const colors = ["tomato", "thistle", "skyblue", "teal", "orange", "lime"];

export default function Courses() {
  const { profile, courses } = useFirestore();

  const list = useMemo(() => (profile ? courses?.filter((it) => profile?.courses?.includes(it.id)) ?? null : null), [profile, courses]);

  const [page, setPage] = useState(0);

  useEffect(() => {
    const current = list?.at(page);
    if (current?.audio) Audio.play(current.audio, true);
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
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.subtitle}>{item.group}</Text>
          </View>
        )}
        onSwipe={({ page, direction }) => {
          if (direction === "down") return router.back();
          router.push({ pathname: "/topics", params: { course_id: list[page].id } });
        }}
        onPageChange={({ page }) => {
          setPage(page);
        }}
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
