import { StyleSheet } from "react-native";

import { Text, Dimensions, View } from "react-native";
import Swiper from "@/components/Swiper";
import { useFirebase } from "@/libs/firebase";
import { router, usePathname } from "expo-router";
import { useFirestore, Course } from "@/libs/firestore";
import { useEffect, useMemo, useState } from "react";
import LoadingView from "@/components/LoadingView";

import { SoundObject } from "expo-av/build/Audio";
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

export default function Courses() {
  const { profile, courses } = useFirestore();
  const pathname = usePathname();
  const { samples, play, stop } = useAudio();

  const list = useMemo(() => {
    const no_courses = [{ id: "1", name: "У вас немає жодного курсу", audio: samples.NO_ANY_COURSE, group: "", user_id: "" } as Course];
    const result = profile ? courses?.filter((it) => profile?.courses?.includes(it.id)) ?? null : null;
    return result?.length ? result : no_courses;
  }, [profile, courses]);

  const [page, setPage] = useState(0);

  useEffect(() => {
    console.log("from courses", page, pathname);
    if (pathname === "/courses") {
      const current = list?.at(page);
      if (current?.audio) play(current.audio, true);
    }
    // return () => {
    //   stop();
    // };
  }, [page, list, pathname]);

  if (!list) return <LoadingView />;

  return (
    <View style={styles.container}>
      <Swiper
        list={list}
        render={({ item, index }) => (
          <View style={[styles.child, { backgroundColor: colors[index % colors.length] }]}>
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
