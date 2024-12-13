import { Pressable, StyleSheet, ToastAndroid } from "react-native";

import { Text, Dimensions, View, Animated } from "react-native";
import Swiper from "@/components/Swiper";
import { useFirebase } from "@/libs/firebase";
import { router, useGlobalSearchParams, useLocalSearchParams, usePathname } from "expo-router";
import { Topic, useFirestore } from "@/libs/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import LoadingView from "@/components/LoadingView";
import { useAudio, usePermissions } from "@/libs/audio";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Player, { Status, State } from "@/libs/player";
import Icons from "@/components/Icons";
import { v4 } from "react-native-uuid/dist/v4";
// import Animated, { useSharedValue } from "react-native-reanimated";

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

export default function Answer() {
  const { id, topic_id, course_id, user_id } = useLocalSearchParams<{ id: string; topic_id: string; course_id: string; user_id: string }>();

  const pathname = usePathname();
  const { user } = useFirebase();
  const { profile, topics, courses, exercises, answers, saveAnswer, upload } = useFirestore();
  const { samples, play, stop, record, rec, save } = useAudio();
  const [permissionResponse, requestPermission] = usePermissions();

  const spin = useRef(new Animated.Value(0));

  useEffect(() => {}, []);

  useEffect(() => {
    if (pathname === "/answer") {
      Player.pause();
      stop();
    }
  }, [pathname]);

  // const current = useMemo(() => topics?.find((it) => it.id == id), [id, topics]);
  const current_course = useMemo(() => courses?.find((it) => it.id == course_id), [course_id, courses]);
  const current_topic = useMemo(() => topics?.find((it) => it.id == topic_id), [topic_id, topics]);
  const current_exercise = useMemo(() => exercises?.find((it) => it.id == id), [id, topics]);
  const current_answer = useMemo(() => answers?.find((it) => it.exercise_id == id), [id, answers]);

  useEffect(() => {
    console.log("current_answer", answers);
    if (pathname === "/answer" && current_answer?.audio) {
      play(current_answer?.audio, true);
    }
  }, [current_answer, pathname]);

  // const player = useAudioPlayer({ uri: samples.EXIT });
  // const status = useAudioPlayerStatus(player);

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
            // router.push({ pathname: "/exercises", params: { topic_id: current?.id } });
            // Player.pause();
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

  const format = (seconds: number) => {
    return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60].map((it) => it.toString().padStart(2, "0")).join(":");
  };

  const onStartRecord = async () => {
    try {
      if (permissionResponse?.status !== "granted") {
        console.log("Requesting permission..");
        await requestPermission();
      }
      await stop();
      await rec();
    } catch (error) {}
  };

  const onStopRecord = async () => {
    try {
      const uri = await save();
      if (!uri) return console.log("немає файлу запису");
      console.log("uri", uri);
      const url = await upload(uri, `/audio/answers/${current_exercise?.id}/${profile?.id}.mp3`);
      await saveAnswer({
        id: current_answer?.id ?? v4(),
        user_id: current_exercise!.user_id,
        sender_id: profile!.id,
        sender_name: user?.displayName,
        course_id: current_course!.id,
        topic_id: current_topic!.id,
        exercise_id: id,
        audio: url,
        text: "",
      });
      await play(url, true);
    } catch (error) {
      console.log("Помилка публікації відповіді", error);
      ToastAndroid.show("Помилка публікації відповіді", ToastAndroid.LONG);
    }
  };

  if (!profile || !current_exercise || !current_topic || !current_course) return <LoadingView />;

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <View style={styles.container}>
          <View style={[styles.child, { backgroundColor: colors[0] }]}>
            <View style={{ height: "50%", paddingHorizontal: 32, justifyContent: "center" }}>
              <Text style={styles.title}>{current_exercise.text}</Text>
              <Text style={styles.subtitle}>{`${format(Math.floor((record?.durationMillis ?? 0) / 1000))}`}</Text>
            </View>
            <View style={{ height: "50%", display: "flex", flexDirection: "row" }}>
              <View style={{ flex: 1, paddingHorizontal: 8, paddingVertical: 16 }}>
                <Pressable
                  style={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0,0,0,0.1)",
                    borderRadius: 16,
                  }}
                  onTouchStart={onStartRecord}
                  onTouchEnd={onStopRecord}
                >
                  <Animated.View style={{}}>
                    <Icons.Mic size={64} color={record?.isRecording ? "green" : "black"} />
                  </Animated.View>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </GestureDetector>
    </View>
  );
}
const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  child: { flex: 1, width, justifyContent: "space-between" },
  title: { fontSize: 36, textAlign: "center", marginBottom: 32 },
  subtitle: { fontSize: 24, textAlign: "center" },
});
