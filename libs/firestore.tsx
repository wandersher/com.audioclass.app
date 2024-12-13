import {
  getFirestore,
  collection,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  QuerySnapshot,
  DocumentData,
  Query,
  query,
  where,
  orderBy,
  QueryConstraint,
  onSnapshot,
} from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes, uploadString } from "firebase/storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { app, useFirebase, User } from "./firebase";
import { readAsStringAsync } from "expo-file-system";
import { v4 } from "react-native-uuid/dist/v4";

export type Profile = {
  id: string;
  courses?: string[];
};

export type Course = {
  id: string;
  user_id: string;
  name: string;
  group: string;
  audio: string;
};

export type Topic = {
  id: string;
  user_id: string;
  course_id: string;
  name: string;
  audio_name?: string;
  text: string;
  audio_text?: string;
  audio_progress?: number;
  exercises?: string[];
};

export type Exercise = {
  id: string;
  user_id: string;
  course_id: string;
  topic_id: string;
  position: number;
  text: string;
  audio?: string;
  answers?: number;
  new_answers?: number;
};

export type Answer = {
  id: string;
  user_id: string;
  sender_id: string;
  sender_name: string | null | undefined;
  course_id: string;
  topic_id: string;
  exercise_id: string;
  audio: string;
  text?: string;
};

type FirestoreContextType = {
  profile: Profile | null;
  createProfile: () => Promise<any>;

  startCourse: (data: Course) => Promise<any>;
  stopCourse: (data: Course) => Promise<any>;

  courses: Course[] | null;
  saveCourse: (data: Course) => Promise<any>;
  deleteCourse: (data: Course) => Promise<any>;

  topics: Topic[] | null;
  saveTopic: (data: Topic) => Promise<any>;
  deleteTopic: (data: Topic) => Promise<any>;

  exercises: Exercise[] | null;
  saveExercise: (data: Exercise) => Promise<any>;
  deleteExercise: (data: Exercise) => Promise<any>;

  answers: Answer[] | null;
  saveAnswer: (data: Answer) => Promise<any>;
  deleteAnswer: (data: Answer) => Promise<any>;

  upload: (path: string, uri: string) => Promise<string>;
};

export const FirestoreContext = createContext<FirestoreContextType>({} as any);

function prepare(data: { [key: string]: any }, user?: User | null) {
  const result: any = { ...data, user_id: user?.uid };
  for (let key of Object.keys(result)) {
    if (result[key] === undefined) delete result[key];
  }
  return result;
}

const firestore = getFirestore(app, "audioclass");
const storage = getStorage(app, "gs://audioclassroom.appspot.com");

export function FirestoreProvider({ children }: any) {
  const { user } = useFirebase();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [courses, setCourses] = useState<Course[] | null>(null);
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [exercises, setExercises] = useState<Exercise[] | null>(null);
  const [answers, setAnswers] = useState<Answer[] | null>(null);

  const usersDoc = useCallback((id: string) => doc(firestore, `profiles`, id), [firestore]);

  const coursesCol = useCallback(() => query(collection(firestore, `courses`)), [firestore]);
  const coursesDoc = useCallback((id: string) => doc(firestore, `courses`, id), [firestore]);

  const topicsCol = useCallback(() => query(collection(firestore, `topics`)), [firestore]);
  const topicsDoc = useCallback((id: string) => doc(firestore, `topics`, id), [firestore]);

  const exercisesCol = useCallback(() => query(collection(firestore, `exercise`)), [firestore]);
  const exercisesDoc = useCallback((id: string) => doc(firestore, `exercise`, id), [firestore]);

  const answersCol = useCallback(() => query(collection(firestore, `answers`), where("sender_id", "==", user?.uid ?? "")), [firestore, user]);
  const answersDoc = useCallback((id: string) => doc(firestore, `answers`, id), [firestore]);

  useEffect(() => {
    const unsubscribeFromProfile = !user
      ? () => {}
      : onSnapshot(usersDoc(user.uid), (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as any);
          } else {
            setDoc(usersDoc(user.uid), { id: user.uid, courses: [] }, { merge: true });
          }
        });

    const unsubscribeFromCoures = !user ? () => {} : onSnapshot(coursesCol(), ({ docs }) => setCourses(docs.map((doc) => doc.data()) as any));

    const unsubscribeFromTopics = !user ? () => {} : onSnapshot(topicsCol(), ({ docs }) => setTopics(docs.map((doc) => doc.data()) as any));

    const unsubscribeFromExercises = !user
      ? () => {}
      : onSnapshot(query(exercisesCol()), ({ docs }) => setExercises(docs.map((doc) => doc.data()) as any));

    const unsubscribeFromAnswers = !user ? () => {} : onSnapshot(answersCol(), ({ docs }) => setAnswers(docs.map((doc) => doc.data()) as any));

    return () => {
      unsubscribeFromProfile();
      unsubscribeFromCoures();
      unsubscribeFromTopics();
      unsubscribeFromExercises();
      unsubscribeFromAnswers();
    };
  }, [user]);

  const saveCourse = useCallback((data: Course) => setDoc(coursesDoc(data.id), prepare(data, user), { merge: true }), [firestore, user]);
  const deleteCourse = useCallback((data: Course) => deleteDoc(coursesDoc(data.id)), [firestore]);

  const saveTopic = useCallback((data: Topic) => setDoc(topicsDoc(data.id), prepare(data, user), { merge: true }), [firestore, user]);
  const deleteTopic = useCallback((data: Topic) => deleteDoc(topicsDoc(data.id)), [firestore]);

  const saveExercise = useCallback((data: Exercise) => setDoc(exercisesDoc(data.id), prepare(data, user), { merge: true }), [firestore, user]);
  const deleteExercise = useCallback((data: Exercise) => deleteDoc(exercisesDoc(data.id)), [firestore]);

  const saveAnswer = useCallback((data: Answer) => setDoc(answersDoc(data.id), data, { merge: true }), [firestore]);
  const deleteAnswer = useCallback((data: Answer) => deleteDoc(answersDoc(data.id)), [firestore]);

  const upload = async (uri: string, path: string) => {
    // const blob = await readAsStringAsync(uri)
    const blob = await new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log("помилка завантаження запису по URI", e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });

    const fileRef = ref(getStorage(), path);
    await uploadBytes(fileRef, blob);

    // We're done with the blob, close and release it
    blob.close();

    return await getDownloadURL(fileRef);
  };

  const createProfile = useCallback(
    () => (user ? setDoc(usersDoc(user.uid), { id: user.uid }, { merge: true }) : Promise.reject("Користувач не авторизований")),
    [firestore, user]
  );

  const startCourse = useCallback(
    (data: Course) =>
      profile
        ? setDoc(usersDoc(profile.id), { courses: [...(profile.courses ?? []), data.id] }, { merge: true })
        : Promise.reject("Користувач не авторизований"),
    [firestore, profile]
  );
  const stopCourse = useCallback(
    (data: Course) =>
      profile
        ? setDoc(usersDoc(profile.id), { courses: (profile.courses ?? []).filter((it) => it != data.id) }, { merge: true })
        : Promise.reject("Користувач не авторизований"),
    [firestore, profile]
  );

  const value = {
    profile,
    createProfile,

    startCourse,
    stopCourse,

    courses,
    saveCourse,
    deleteCourse,

    topics,
    saveTopic,
    deleteTopic,

    exercises,
    saveExercise,
    deleteExercise,

    answers,
    saveAnswer,
    deleteAnswer,
    upload,
  };

  return <FirestoreContext.Provider value={value} children={children} />;
}

export function useFirestore(): FirestoreContextType {
  return useContext(FirestoreContext);
}
