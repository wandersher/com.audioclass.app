import { Audio as ExpoAudio } from "expo-av";
import { RecordingOptionsPresets } from "expo-av/build/Audio";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export const usePermissions = ExpoAudio.usePermissions;

const samples = {
  MY_COURSES:
    "https://firebasestorage.googleapis.com/v0/b/audioclassroom.appspot.com/o/audio%2Fmy_courses.mp3?alt=media&token=2931b413-17ca-4f31-a60c-93a4688064f7",
  NO_ANY_COURSE:
    "https://firebasestorage.googleapis.com/v0/b/audioclassroom.appspot.com/o/audio%2Fno_any_course.mp3?alt=media&token=4faa43ea-e927-497c-8122-d04db2974144",
  NO_ANY_TOPICS:
    "https://firebasestorage.googleapis.com/v0/b/audioclassroom.appspot.com/o/audio%2Fno_any_topics_go_back.mp3?alt=media&token=324280cc-8dfc-42e4-9da2-943c3db1b2f7",
  ADD_COURSE:
    "https://firebasestorage.googleapis.com/v0/b/audioclassroom.appspot.com/o/audio%2Fadd_course.mp3?alt=media&token=a6318dea-d684-4642-999d-b90c1020fd82",
  EXIT: "https://firebasestorage.googleapis.com/v0/b/audioclassroom.appspot.com/o/audio%2Fexit.mp3?alt=media&token=48680ffc-737c-4f39-a074-f5b529bd5f2f",
};

type AudioContextType = {
  samples: typeof samples;
  play: (url: string, loop?: boolean) => any;
  stop: () => Promise<any>;
};

export const AudioContext = createContext<AudioContextType>({} as any);

export function AudioProvider({ children }: any) {
  const audio = useRef<ExpoAudio.Sound>();

  useEffect(() => {
    return () => {
      if (audio.current) {
        audio.current.stopAsync();
      }
    };
  });

  // const [sound, setSound] = useState<ExpoAudio.Sound>();
  const wait = useCallback((time: number) => new Promise((resolve) => setTimeout(resolve, time)), []);

  const play = async (uri: string, loop?: boolean) => {
    try {
      // console.log("Play audio", audio.current);
      if (audio.current) {
        if (audio.current._loaded) {
          await audio.current.stopAsync();
          await audio.current.unloadAsync();
        }
        await audio.current.loadAsync({ uri }, { positionMillis: 0, isLooping: loop, shouldPlay: true });
      } else {
        const { sound } = await ExpoAudio.Sound.createAsync({ uri }, { positionMillis: 0, isLooping: loop, shouldPlay: true });
        audio.current = sound;
      }
    } catch (error: any) {
      console.log("Audio playing error", error);
    }
  };

  const stop = async () => {
    let tries = 0;
    while (!audio.current) {
      console.log("Audio not ready");
      if (tries++ >= 5) throw new Error("Audio not ready for 5 tries");
      await wait(250);
    }
    await audio.current.stopAsync();
    await audio.current.unloadAsync();
  };

  const value = {
    samples,
    play,
    stop,
  };

  return <AudioContext.Provider value={value} children={children} />;
}

export function useAudio(): AudioContextType {
  return useContext(AudioContext);
}
