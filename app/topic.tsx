import { Pressable, StyleSheet } from "react-native";

import { Text, Dimensions, View, Animated } from "react-native";
import Swiper from "@/components/Swiper";
import { useFirebase } from "@/libs/firebase";
import { router, useGlobalSearchParams, useLocalSearchParams, usePathname } from "expo-router";
import { Topic, useFirestore } from "@/libs/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import LoadingView from "@/components/LoadingView";
import { useAudio } from "@/libs/audio";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Player, { Status, State } from "@/libs/player";
import Icons from "@/components/Icons";
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

export default function Topics() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const pathname = usePathname();

  const { profile, topics, courses } = useFirestore();
  const { samples, stop } = useAudio();

  const spin = useRef(new Animated.Value(0));

  const [status, setStatus] = useState<Status>({ state: State.Loading, duration: 0, position: 0, buffered: 0 });

  useEffect(() => {
    Player.setStatusEvent((value) => setStatus(value));

    Animated.loop(
      Animated.sequence([
        Animated.timing(spin.current, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(spin.current, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (pathname === "/topic") {
      stop();
      Player.play();
    }
  }, [pathname]);

  const current = useMemo(() => topics?.find((it) => it.id == id), [id, topics]);
  const current_course = useMemo(() => courses?.find((it) => it.id == current?.course_id), [current, courses]);

  // const player = useAudioPlayer({ uri: samples.EXIT });
  // const status = useAudioPlayerStatus(player);

  const [page, setPage] = useState(0);

  useEffect(() => {
    const { audio_text, name } = current ?? {};
    if (audio_text && !Player.is_play) Player.play({ url: audio_text, title: name ?? "", artist: current_course?.name ?? "" });
  }, [current]);

  const gesture = Gesture.Pan()
    .minDistance(1)
    .onEnd(({ translationX, translationY, velocityX, velocityY }) => {
      console.log({ translationX, translationY, velocityX, velocityY });
      if (Math.abs(velocityX) > SWIPE_SPEED || Math.abs(velocityY) > SWIPE_SPEED) {
        if (Math.abs(translationY) > Math.abs(translationX * SWIPE_RATIO)) {
          // Вертикальний свайп
          if (translationY < 0) {
            // go to exercises
            Player.pause();
            router.push({ pathname: "/exercises", params: { topic_id: current?.id } });
          } else {
            Player.pause();
            router.back();
          }
        }
        if (Math.abs(translationX) > Math.abs(translationY * SWIPE_RATIO)) {
          // Горизонтальний свайп
          if (translationX < 0) {
            // seek + 10 sec
          } else {
            // seek - 10 sec
          }
        }
      }
    })
    .runOnJS(true);

  if (!current) return <LoadingView />;

  const format = (seconds: number) => {
    return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60].map((it) => it.toString().padStart(2, "0")).join(":");
  };

  const onPause = () => {
    Player.pause();
  };
  const onPlay = () => {
    Player.play();
  };
  const onSeek = (value: number) => {
    Player.seek(value);
  };
  // console.log(status);

  const angle = spin.current.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // console.log("spin", angle);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <View style={styles.container}>
          <View style={[styles.child, { backgroundColor: colors[0] }]}>
            <View style={{ height: "50%", paddingHorizontal: 32, justifyContent: "center" }}>
              <Text style={styles.title}>{current.name}</Text>
              <Text style={styles.subtitle}>{`${format(Math.floor(status.position))}/${format(Math.floor(status.duration))}`}</Text>
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
                  onPress={() => onSeek(-10)}
                >
                  <Icons.Backward size={48} color="black" />
                </Pressable>
              </View>
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
                  onPress={() => {
                    switch (status.state) {
                      case State.Paused:
                        return onPlay();
                      default:
                        return onPause();
                    }
                  }}
                >
                  {status.state == State.Playing ? (
                    <Icons.Pause size={48} color="black" />
                  ) : status.state == State.Paused ? (
                    <Icons.Play size={48} color="black" />
                  ) : (
                    <Animated.View style={{ transform: [{ rotate: angle }] }}>
                      <Icons.Loading size={48} color="black" />
                    </Animated.View>
                  )}
                </Pressable>
              </View>
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
                  onPress={() => onSeek(+10)}
                >
                  <Icons.Forward size={48} color="black" />
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
