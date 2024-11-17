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
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useFirebase, User } from "./firebase";

type Profile = {
  id: string;
  courses?: string[];
};

type Course = {
  id: string;
  user_id: string;
  name: string;
  group: string;
  audio: string;
};

type Topic = {
  id: string;
  user_id: string;
  course_id: string;
  name: string;
  audio_name: string;
  text: string;
  audio_text: string;
  audio_progress?: number;
  exercises?: string[];
};

type Exercise = {
  id: string;
  user_id: string;
  course_id: string;
  topic_id: string;
  position: number;
  text: string;
  audio: string;
  answers?: number;
  new_answers?: number;
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
};

export const FirestoreContext = createContext<FirestoreContextType>({} as any);

function prepare(data: { [key: string]: any }, user?: User | null) {
  const result: any = { ...data, user_id: user?.uid };
  for (let key of Object.keys(result)) {
    if (result[key] === undefined) delete result[key];
  }
  return result;
}

export function FirestoreProvider({ children }: any) {
  const { app, user } = useFirebase();

  const firestore = useMemo(() => getFirestore(app, "audioclass"), []);

  const [profile, setProfile] = useState<Profile | null>(null);

  const [courses, setCourses] = useState<Course[] | null>(null);
  const [topics, setTopics] = useState<Topic[] | null>(null);
  const [exercises, setExercises] = useState<Exercise[] | null>(null);

  const usersDoc = useCallback((id: string) => doc(firestore, `profiles`, id), [firestore]);

  const coursesCol = useCallback(() => collection(firestore, `courses`), [firestore]);
  const coursesDoc = useCallback((id: string) => doc(firestore, `courses`, id), [firestore]);

  const topicsCol = useCallback(() => collection(firestore, `topics`), [firestore]);
  const topicsDoc = useCallback((id: string) => doc(firestore, `topics`, id), [firestore]);

  const exercisesCol = useCallback(() => collection(firestore, `exercise`), [firestore]);
  const exercisesDoc = useCallback((id: string) => doc(firestore, `exercise`, id), [firestore]);

  useEffect(() => {
    const unsubscribeFromProfile = !user ? () => {} : onSnapshot(usersDoc(user.uid), (doc) => setProfile(doc.data() as any));

    const unsubscribeFromCoures = !user ? () => {} : onSnapshot(query(coursesCol()), ({ docs }) => setCourses(docs.map((doc) => doc.data()) as any));

    const unsubscribeFromTopics = !user ? () => {} : onSnapshot(query(topicsCol()), ({ docs }) => setTopics(docs.map((doc) => doc.data()) as any));

    const unsubscribeFromExercises = !user
      ? () => {}
      : onSnapshot(query(exercisesCol()), ({ docs }) => setExercises(docs.map((doc) => doc.data()) as any));

    return () => {
      unsubscribeFromProfile();
      unsubscribeFromCoures();
      unsubscribeFromTopics();
      unsubscribeFromExercises();
    };
  }, [user]);

  console.log("profile", profile);

  const saveCourse = useCallback((data: Course) => setDoc(coursesDoc(data.id), prepare(data, user), { merge: true }), [firestore, user]);
  const deleteCourse = useCallback((data: Course) => deleteDoc(coursesDoc(data.id)), [firestore]);

  const saveTopic = useCallback((data: Topic) => setDoc(topicsDoc(data.id), prepare(data, user), { merge: true }), [firestore, user]);
  const deleteTopic = useCallback((data: Topic) => deleteDoc(topicsDoc(data.id)), [firestore]);

  const saveExercise = useCallback((data: Exercise) => setDoc(exercisesDoc(data.id), prepare(data, user), { merge: true }), [firestore, user]);
  const deleteExercise = useCallback((data: Exercise) => deleteDoc(exercisesDoc(data.id)), [firestore]);

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
  };

  return <FirestoreContext.Provider value={value} children={children} />;
}

export function useFirestore(): FirestoreContextType {
  return useContext(FirestoreContext);
}
