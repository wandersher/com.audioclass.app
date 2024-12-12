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
  const [recording, setRecording] = useState<ExpoAudio.Recording>();
  const [record, setRecord] = useState<ExpoAudio.RecordingStatus>();
  const record_timer = useRef<NodeJS.Timeout>();
  const [sound, setSound] = useState<ExpoAudio.Sound>();
  const [timer, setTimer] = useState<NodeJS.Timeout>();

  const rec = async () => {
    console.log("rec");
    await ExpoAudio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const { recording, status } = await ExpoAudio.Recording.createAsync(RecordingOptionsPresets.HIGH_QUALITY, setRecord, 500);
    console.log("recording", recording);
    console.log("status", status);
    setRecording(recording);
    setRecord(status);
  };

  const save = async () => {
    if (!recording) return null;
    await recording.stopAndUnloadAsync();
    await ExpoAudio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording.getURI();
    setRecording(undefined);
    return uri;
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
