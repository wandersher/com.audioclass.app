import { StyleSheet } from "react-native";

import { Text, Dimensions, View } from "react-native";
import Swiper from "@/components/Swiper";
import { useFirebase } from "@/libs/firebase";
import { router, useGlobalSearchParams, useLocalSearchParams, usePathname } from "expo-router";
import { Topic, useFirestore } from "@/libs/firestore";
import { useEffect, useMemo, useState } from "react";
import LoadingView from "@/components/LoadingView";
import { useAudio } from "@/libs/audio";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

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

const SWIPE_SPEED = 1000;
const SWIPE_RATIO = 2;

export default function Topics() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pathname = usePathname();

  const { profile, topics } = useFirestore();
  const { play, stop } = useAudio();

  const current = useMemo(() => topics?.find((it) => it.id == id), [id, topics]);

  const [page, setPage] = useState(0);

  const gesture = Gesture.Pan()
    .minDistance(1)
    .onEnd(({ translationX, translationY, velocityX, velocityY }) => {
      console.log({ translationX, translationY, velocityX, velocityY });
      if (Math.abs(velocityX) > SWIPE_SPEED || Math.abs(velocityY) > SWIPE_SPEED) {
        if (Math.abs(translationY) > Math.abs(translationX * SWIPE_RATIO)) {
          // Вертикальний свайп
          if (translationY < 0) {
            // go to exercises
          } else {
            router.back();
          }
        }
        if (Math.abs(translationX) > Math.abs(translationY * SWIPE_RATIO)) {
          // Горизонтальний свайп
          if (translationX < 0) {
            console.log("Свайп вліво");
            // seek + 10 sec
          } else {
            console.log("Свайп вправо");
            // seek - 10 sec
          }
        }
      }
    })
    .runOnJS(true);

  if (!current) return <LoadingView />;

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <View style={styles.container}>
          <View style={[styles.child, { backgroundColor: colors[0] }]}>
            {/* <Text style={styles.title}>№{index + 1}</Text>
            <Text style={styles.subtitle}>{item.name}</Text> */}
          </View>
        </View>
      </GestureDetector>
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
