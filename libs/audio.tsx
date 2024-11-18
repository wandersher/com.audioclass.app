import { Audio as ExpoAudio } from "expo-av";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

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
  stop: () => any;
};

export const AudioContext = createContext<AudioContextType>({} as any);

export function AudioProvider({ children }: any) {
  const [sound, setSound] = useState<ExpoAudio.Sound>();
  const [timer, setTimer] = useState<NodeJS.Timeout>();

  const stop = async () => {
    // clearInterval(timer);
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
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
  };

  return <AudioContext.Provider value={value} children={children} />;
}

export function useAudio(): AudioContextType {
  return useContext(AudioContext);
}
