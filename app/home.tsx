import { StyleSheet } from "react-native";

import { Text, Dimensions, View } from "react-native";
import Swiper from "@/components/Swiper";
import { useFirebase } from "@/libs/firebase";
import { router } from "expo-router";
const colors = ["tomato", "thistle", "skyblue", "teal", "orange", "lime"];
export default function HomeScreen() {
  const { signout } = useFirebase();
  return (
    <View style={styles.container}>
      <Swiper
        list={["Мої курси", "Додати курс", "Вихід"]}
        render={({ item, index }) => (
          <View style={[styles.child, { backgroundColor: colors[index] }]}>
            <Text style={styles.text}>{item}</Text>
          </View>
        )}
        onSwipe={({ page, direction }) => {
          console.log(page, direction);
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
