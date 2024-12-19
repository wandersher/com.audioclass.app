import { Audio } from "expo-av";
import { RecordingOptionsPresets } from "expo-av/build/Audio";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Platform, ToastAndroid } from "react-native";
import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  AVModeIOSOption,
} from "react-native-audio-recorder-player";
import { Dirs } from "react-native-file-access";

type RecordContextType = {
  record: Audio.RecordingStatus | undefined;
  startRecording: () => Promise<any>;
  stopRecording: () => Promise<string | null>;
};

export const RecordContext = createContext<RecordContextType>({} as any);

export function RecordProvider({ children }: any) {
  const recorder = useRef<Audio.Recording>();
  const recorder2 = useRef<AudioRecorderPlayer>(new AudioRecorderPlayer());

  const [record, setRecord] = useState<Audio.RecordingStatus>();

  const [permissions, request] = Audio.usePermissions();

  const onPermissionsNeeded = async () => {
    switch (permissions?.status) {
      case Audio.PermissionStatus.GRANTED:
        return true;
      case Audio.PermissionStatus.UNDETERMINED:
      case Audio.PermissionStatus.DENIED:
        const current = await request();
        if (current.status !== Audio.PermissionStatus.GRANTED) {
          ToastAndroid.show("Для запису звуку потрібно надати права", ToastAndroid.SHORT);
          return false;
        }
        return true;
    }
  };

  useEffect(() => {
    onPermissionsNeeded();
  }, [permissions?.status]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    }).catch((error) => console.error(error));
  });

  const wait = useCallback((time: number) => new Promise((resolve) => setTimeout(resolve, time)), []);

  const startRecording = async () => {
    try {
      if (permissions?.status !== Audio.PermissionStatus.GRANTED) {
        ToastAndroid.show("Для запису звуку потрібно надати права", ToastAndroid.SHORT);
        return await request();
      }
      console.log("recorder2");

      const path = Platform.select({
        ios: "hello.m4a",
        android: `${Dirs.CacheDir}/hello.wav`,
      });

      const audioSet: AudioSet = {
        AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
        AudioSourceAndroid: AudioSourceAndroidType.MIC,
        AVModeIOS: AVModeIOSOption.measurement,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
        AVNumberOfChannelsKeyIOS: 2,
        AVFormatIDKeyIOS: AVEncodingOption.aac,
      };

      const uri = await recorder2.current.startRecorder(path, audioSet);
      recorder2.current.addRecordBackListener((e) => {
        setRecord({
          canRecord: true,
          isRecording: true,
          isDoneRecording: false,
          durationMillis: e.currentPosition,
          uri,
        });
        return;
      });
      // const { recording } = await Audio.Recording.createAsync(RecordingOptionsPresets.HIGH_QUALITY, (state) => setRecord(state), 100);
      // recorder.current = recording;

      console.log("Recorder started", uri);
    } catch (error: any) {
      ToastAndroid.show(`Помилка запису: ${error.message}`, ToastAndroid.LONG);
      console.error("Error while starting recording", error);
      return null;
    }
  };

  const stopRecording = async () => {
    try {
      console.log("Try stop recording");
      // let tries = 0;
      // while (!recorder.current) {
      //   console.log("Recorder not ready");
      //   if (tries++ >= 5) throw new Error("Не вдалось отримати запис");
      //   await wait(1000);
      // }
      // // if (!recorder.current) return null;
      // await recorder.current.stopAndUnloadAsync();
      // const duration = record?.durationMillis ?? 0;
      // const uri = duration > 1000 ? recorder.current.getURI() : null;
      // console.log(`Record stopped on ${duration} duration`, uri);
      // recorder.current = undefined;
      // return uri;

      const uri = await recorder2.current.stopRecorder();
      recorder2.current.removeRecordBackListener();
      setRecord({
        canRecord: true,
        isRecording: false,
        isDoneRecording: true,
        durationMillis: 0,
      });
      console.log("recording stopped", uri);
      return uri;
    } catch (error: any) {
      ToastAndroid.show(`Помилка запису: ${error.message}`, ToastAndroid.LONG);
      console.error("Error while stopping recording", error);
      return null;
    }
  };

  const value = {
    record,
    startRecording,
    stopRecording,
  };

  return <RecordContext.Provider value={value} children={children} />;
}

export function useRecorder(): RecordContextType {
  return useContext(RecordContext);
}
