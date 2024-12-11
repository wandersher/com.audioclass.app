import LoadingView from "@/components/LoadingView";
import { useFirebase } from "@/libs/firebase";
import { useFirestore } from "@/libs/firestore";
import { CameraView, CameraType, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { router } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";

export default function Scanner() {
  const [scanned, setScanned] = useState<BarcodeScanningResult | null>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const { profile, courses, startCourse } = useFirestore();

  if (!permission) {
    // Camera permissions are still loading.
    return <LoadingView />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Потрібно надати права користування камерою</Text>
        <Button onPress={requestPermission} title="Надати дозвіл" />
      </View>
    );
  }

  const onBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (scanned && result.data === scanned.data) return setScanned(result);
    try {
      ToastAndroid.show(result.data, ToastAndroid.SHORT);
      setScanned(result);
      const is_started = profile?.courses?.includes(result.data);
      if (is_started) return ToastAndroid.show("Курс уже розпочато", ToastAndroid.LONG);
      const course = courses?.find((it) => it.id === result.data);
      if (!course) return ToastAndroid.show("Не знайдено курс за цим кодом", ToastAndroid.LONG);
      await startCourse(course);
      ToastAndroid.show("Курс успішно додано", ToastAndroid.LONG);
      router.back();
    } catch (error) {
      setScanned(null);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={onBarcodeScanned}
      >
        <View style={{ flex: 1, flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <View
            style={{
              height: 310,
              width: 310,
              borderWidth: 6,
              borderColor: "#ffffff",
              borderRadius: 16,
              position: "absolute",
            }}
          />
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", width: "100%" }} />
          <View style={{ height: 300, flexDirection: "row" }}>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)" }} />
            <View style={{ width: 300 }}></View>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)" }} />
          </View>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", width: "100%" }} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
});
