import { Audio as ExpoAudio } from "expo-av";
import { RecordingOptionsPresets } from "expo-av/build/Audio";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export const usePermissions = ExpoAudio.usePermissions;

const samples = {
  MY_COURSES:
    "https://firebasestorage.googleapis.com/v0/b/audioclassroom.appspot.com/o/audio%2Fmy_courses.mp3?alt=media&token=2931b413-17ca-4f31-a60c-93a4688064f7",
  NO_ANY_COURSE:
    "https://firebasestorage.googleapis.com/v0/b/audioclassroom.appspot.com/o/audio%2Fno_any_course.mp3?alt=media&token=4faa43ea-e927-497c-8122-d04db2974144",
  ADD_COURSE:
    "https://firebasestorage.googleapis.com/v0/b/audioclassroom.appspot.com/o/audio%2Fadd_course.mp3?alt=media&token=a6318dea-d684-4642-999d-b90c1020fd82",
  EXIT: "https://firebasestorage.googleapis.com/v0/b/audioclassroom.appspot.com/o/audio%2Fexit.mp3?alt=media&token=48680ffc-737c-4f39-a074-f5b529bd5f2f",
};

type AudioContextType = {
  samples: typeof samples;
  play: (url: string, loop?: boolean) => any;
  stop: () => Promise<any>;
  record: ExpoAudio.RecordingStatus | undefined;
  rec: () => any;
  save: () => Promise<string | null>;
};

export const AudioContext = createContext<AudioContextType>({} as any);

export function AudioProvider({ children }: any) {
  const micro = useRef<ExpoAudio.Recording>();
  const [record, setRecord] = useState<ExpoAudio.RecordingStatus>();

  const [sound, setSound] = useState<ExpoAudio.Sound>();

  const wait = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

  const rec = async () => {
    console.log("start");
    await ExpoAudio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const { recording } = await ExpoAudio.Recording.createAsync(RecordingOptionsPresets.HIGH_QUALITY, setRecord, 500);
    micro.current = recording;
    console.log("started");
  };

  const save = async () => {
    try {
      console.log("stop");
      let attempt = 30;
      while (!micro.current && attempt-- > 0) {
        console.log("Спроба завершити запис який ще не розпочався");
        await wait(100);
      }
      if (!micro.current) return null;
      await micro.current.stopAndUnloadAsync();
      console.log("stoped", record?.durationMillis);
      const uri = (record?.durationMillis ?? 0) > 1000 ? micro.current.getURI() : null;
      micro.current = undefined;
      return uri;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const stop = async () => {
    if (sound) {
      await sound.stopAsync();
      // await sound.unloadAsync();
    }
  };

  const play = async (uri: string, loop?: boolean) => {
    // let timeout: any = null;
    try {
      // clearInterval(timer);
      if (!sound) {
        const result = await ExpoAudio.Sound.createAsync({ uri }, { positionMillis: 0, isLooping: loop, shouldPlay: true });
        setSound(result.sound);
        // result.sound.setOnPlaybackStatusUpdate((status) => {
        //   if (status.isLoaded) {
        //     if (!status.shouldPlay) {
        //       if (loop) {
        //         timeout = setInterval(async () => {
        //           const state = await instance.getStatusAsync();
        //           if (state.isLoaded) {
        //             await instance.playFromPositionAsync(0);
        //           } else {
        //             clearInterval(timeout);
        //           }
        //         }, (status.durationMillis ?? 2000) + 2000);
        //         setTimer(timeout);
        //       }
        //       instance.playFromPositionAsync(0).catch((error) => {
        //         console.log("playFromPositionAsync:37", error);
        //       }); //
        //     }
        //   }
        // });
      } else {
        await sound.unloadAsync();
        await sound.loadAsync({ uri }, { positionMillis: 0, isLooping: loop, shouldPlay: true });
      }
    } catch (error: any) {
      // if (timeout) clearInterval(timeout);
      console.log("Audio error", error);
    }
  };

  // const seek = async (time: number)=>{
  //   try {
  //     // clearInterval(timer);
  //     if (sound) {
  //       const state = await sound.getStatusAsync()
  //       await sound.setPositionAsync()

  //     }
  //   } catch (error: any) {
  //     // if (timeout) clearInterval(timeout);
  //     console.log("Audio error", error);
  //   }
  // }

  const value = {
    samples,
    play,
    stop,
    record,
    rec,
    save,
  };

  return <AudioContext.Provider value={value} children={children} />;
}

export function useAudio(): AudioContextType {
  return useContext(AudioContext);
}
