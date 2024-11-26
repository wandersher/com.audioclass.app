// src/services/PlaybackService.ts
import TrackPlayer, { Event, Progress, State } from "react-native-track-player";
export { State } from "react-native-track-player";
export type { Progress } from "react-native-track-player";

export type Status = Progress & { state: State };

const PlaybackService = async function () {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());

  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
};

TrackPlayer.registerPlaybackService(() => PlaybackService);
TrackPlayer.setupPlayer()
  .then(() => {
    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (event) => {
      console.log("PlaybackProgressUpdated", event);
    });
    TrackPlayer.addEventListener(Event.MetadataTimedReceived, (event) => {
      console.log("MetadataTimedReceived", event);
    });
    Player.ready = true;
  })
  .catch((error) => Player.error);

type Track = {
  url: string;
  title: string;
  artist: string;
};

export default class Player {
  static ready: boolean = false;
  static error: any;
  static is_play: boolean = false;

  static async play(track?: Track) {
    try {
      if (Player.error) throw Player.error;
      if (track) {
        const tracks = await TrackPlayer.getQueue();
        if (tracks.length) await TrackPlayer.remove(tracks.map((_, index) => index));
        await TrackPlayer.add([track]);
      }
      await TrackPlayer.play();
      await TrackPlayer.setVolume(1);
      Player.is_play = true;
    } catch (error) {
      console.log("Помилка відтворення аудіо", error);
    }
  }

  static async pause() {
    await TrackPlayer.pause();
    Player.is_play = false;
  }

  static async seek(value: number) {
    await TrackPlayer.seekBy(value);
  }

  static timer: NodeJS.Timeout;
  static setStatusEvent(callback: (progress: Status) => any) {
    clearInterval(Player.timer);
    Player.timer = setInterval(() => {
      Promise.all([TrackPlayer.getProgress(), TrackPlayer.getPlaybackState()])
        .then(([progress, res]) => callback({ ...progress, state: res?.state }))
        .catch((error) => console.log("Помилка отримання прогресу плеєра", error));
    }, 100);
  }
}
