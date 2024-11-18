import Icons from "@/components/Icons";
import LoadingView from "@/components/LoadingView";
import { useFirebase } from "@/libs/firebase";
import { router } from "expo-router";
import * as React from "react";
import { StyleSheet, ToastAndroid, View } from "react-native";
import { TextInput, Button } from "react-native-paper";

export default function Signin() {
  const password_ref = React.useRef<any>(null);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const { signin } = useFirebase();

  const onSubmit = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await signin(email, password);
      router.replace("/home");
    } catch (error: any) {
      console.log("Помилка входу в акаунт", error.code);
      switch (error.code) {
        case "auth/invalid-credential":
          return ToastAndroid.show("Невірні дані авторизації", ToastAndroid.LONG);
        default:
          return ToastAndroid.show("Невірні дані авторизації", ToastAndroid.LONG);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LoadingView />
      <View style={styles.form}>
        <TextInput
          mode="outlined"
          label="Електронна пошта"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={{ marginBottom: 8 }}
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => (password_ref.current?.focus ? password_ref.current?.focus() : null)}
        />
        <TextInput
          ref={password_ref}
          mode="outlined"
          label="Пароль"
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={{ marginBottom: 16 }}
          keyboardType="visible-password"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          secureTextEntry={!visible}
          right={
            visible ? <Icons.ViewOff onPress={() => setVisible(false)} /> : <Icons.View color="#0000000" size={24} onPress={() => setVisible(true)} />
          }
        />
        <Button mode="contained" style={{ borderRadius: 4, marginBottom: 8 }} contentStyle={{ height: 48 }} onPress={onSubmit} loading={loading}>
          Вхід
        </Button>
        <Button mode="text" contentStyle={{ height: 48 }} onPress={() => router.push("/signup")}>
          Реєстрація
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
  },
  form: {
    padding: 16,
  },
  form_item: {
    marginBottom: 8,
  },
});
