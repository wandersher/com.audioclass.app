import { StyleSheet } from "react-native";

import { Text, Dimensions, View } from "react-native";
import Swiper from "@/components/Swiper";
import { useFirebase } from "@/libs/firebase";
import { router, usePathname } from "expo-router";
import { useAudio } from "@/libs/audio";
import { useEffect, useMemo, useState } from "react";
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

export default function HomeScreen() {
  const { signout } = useFirebase();
  const { samples, play, stop } = useAudio();
  const pathname = usePathname();

  const items = useMemo(() => {
    return [
      { id: "1", name: "Мої курси", audio: samples.MY_COURSES },
      { id: "2", name: "Додати курс", audio: samples.ADD_COURSE },
      { id: "3", name: "Вихід", audio: samples.EXIT },
    ];
  }, []);

  const [page, setPage] = useState(0);

  useEffect(() => {
    if (pathname === "/home") {
      const current = items?.at(page);
      if (current?.audio) play(current.audio, true);
    }
    // return () => {
    //   stop();
    // };
  }, [page, items, pathname]);

  return (
    <View style={styles.container}>
      <Swiper
        list={items}
        render={({ item, index }) => (
          <View style={[styles.child, { backgroundColor: colors[index % colors.length] }]}>
            <Text style={styles.text}>{item.name}</Text>
          </View>
        )}
        onSwipe={({ page, direction }) => {
          if (direction === "down") return; //TODO: вибір це свайп вгору
          switch (page) {
            case 0:
              router.push("/courses");
              break;
            case 1:
              router.push("/scanner");
              break;
            case 2:
              signout();
              break;
          }
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
  text: { fontSize: 42, textAlign: "center" },
});
