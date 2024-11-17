import { useRef, useEffect } from "react";
import { Button, StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";

export default function LoadingView() {
  const animation = useRef<LottieView>(null);

  return (
    <View style={styles.container}>
      <LottieView autoPlay ref={animation} style={styles.animation} source={require("../assets/animations/loading.json")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  animation: {
    width: 200,
    height: 200,
  },
});
