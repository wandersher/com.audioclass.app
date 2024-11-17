import { Audio as ExpoAudio } from "expo-av";

export default class Audio {
  static sound: ExpoAudio.Sound;
  static loop: NodeJS.Timeout;

  static async play(uri: string, loop?: boolean) {
    await Audio.stop();
    const { sound } = await ExpoAudio.Sound.createAsync({ uri });
    Audio.sound = sound;
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        if (!status.shouldPlay) {
          if (loop) {
            const timeout = setInterval(() => {
              sound.playFromPositionAsync(0).catch((error) => {
                clearInterval(timeout);
                console.error(error);
              }); //
            }, (status.durationMillis ?? 2000) + 2000);
            Audio.loop = timeout;
          }
          sound.playFromPositionAsync(0);
        }
      }
    });
  }

  static async stop() {
    if (Audio.loop) {
      clearInterval(Audio.loop);
    }
    if (Audio.sound) {
      await Audio.sound.stopAsync();
      await Audio.sound.unloadAsync();
    }
  }
}
