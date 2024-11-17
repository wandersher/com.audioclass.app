import Icons from "@/components/Icons";
import LoadingView from "@/components/LoadingView";
import { useFirebase } from "@/libs/firebase";
import { useFirestore } from "@/libs/firestore";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { TextInput, Button } from "react-native-paper";

export default function Signup() {
  const email_ref = React.useRef<any>(null);
  const password_ref = React.useRef<any>(null);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const { signup } = useFirebase();
  const { createProfile } = useFirestore();

  const onSubmit = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const result = await signup(email, password, name);
      await createProfile();
      console.log("Реєстрація", result);
    } catch (error) {
      console.log("Помилка реєстрації");
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
          label="Повне імʼя"
          value={name}
          onChangeText={(text) => setName(text)}
          style={{ marginBottom: 8 }}
          keyboardType="default"
          returnKeyType="next"
          onSubmitEditing={() => (email_ref.current?.focus ? email_ref.current?.focus() : null)}
        />
        <TextInput
          ref={email_ref}
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
        <Button mode="contained" style={{ borderRadius: 4 }} contentStyle={{ height: 48 }} onPress={onSubmit} loading={loading}>
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
