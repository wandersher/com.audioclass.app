import LoadingView from "@/components/LoadingView";
import { useFirebase } from "@/libs/firebase";
import { useNavigation, useRouter, router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { TextInput } from "react-native-paper";

export default function Loading() {
  const { user } = useFirebase();

  useEffect(() => {
    // console.log("user", user);
    if (user != undefined) router.replace(user ? "/home" : "/signin");
  }, [user]);

  return (
    <View style={styles.container}>
      <LoadingView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
