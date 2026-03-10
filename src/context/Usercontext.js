import React, { createContext, useEffect, useReducer, useState } from "react";
import { auth, db } from "../config/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

export const Usercontext = createContext();

const DEFAULT_PROFILE = {
  studentId: "",
  name: "",
  email: "",
  year: "",
  faculty: "",
  avatar: null,
};

const DEFAULT_APP_DATA = {
  timetable: [],
  exams: [],
  plannerActivities: [],
  studyPlans: [],
};

const userReducer = (state, action) => {
  switch (action.type) {
    case "SET_CURRENT_USER":
      return {
        ...state,
        currentUser: action.payload,
      };

    case "ADD_USER":
      return {
        ...state,
        users: [action.payload, ...state.users],
      };

    case "SET_PROFILE":
      return {
        ...state,
        profile: action.payload ? { ...DEFAULT_PROFILE, ...action.payload } : DEFAULT_PROFILE,
      };

    case "RESET_PROFILE":
      return {
        ...state,
        profile: DEFAULT_PROFILE,
      };

    case "SET_TIMETABLE":
      return {
        ...state,
        timetable: action.payload,
      };

    case "SET_EXAMS":
      return {
        ...state,
        exams: action.payload,
      };

    case "SET_PLANNER_ACTIVITIES":
      return {
        ...state,
        plannerActivities: action.payload,
      };

    case "SET_STUDY_PLANS":
      return {
        ...state,
        studyPlans: action.payload,
      };

    case "RESET_APP":
      return {
        ...state,
        timetable: [],
        exams: [],
        plannerActivities: [],
        studyPlans: [],
        profile: DEFAULT_PROFILE,
      };

    default:
      return state;
  }
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, {
    currentUser: null,
    users: [],
    timetable: [],
    exams: [],
    plannerActivities: [],
    studyPlans: [],
    profile: DEFAULT_PROFILE,
  });

  const [loading, setLoading] = useState(true);

  function userDocRef(uid) {
    return doc(db, "users", uid);
  }

  useEffect(() => {
    // Listen to auth changes and load all user data from Firestore.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        dispatch({ type: "SET_CURRENT_USER", payload: user });
        await loadUserData(user.uid);
      } else {
        dispatch({ type: "SET_CURRENT_USER", payload: null });
        dispatch({ type: "SET_PROFILE", payload: null });
        dispatch({ type: "SET_TIMETABLE", payload: [] });
        dispatch({ type: "SET_EXAMS", payload: [] });
        dispatch({ type: "SET_PLANNER_ACTIVITIES", payload: [] });
        dispatch({ type: "SET_STUDY_PLANS", payload: [] });
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function loadUserData(uid) {
    try {
      const snapshot = await getDoc(userDocRef(uid));

      if (!snapshot.exists()) {
        const base = {
          ...DEFAULT_PROFILE,
          email: auth.currentUser?.email || "",
          ...DEFAULT_APP_DATA,
          createdAt: new Date().toISOString(),
        };
        await setDoc(userDocRef(uid), base, { merge: true });
        dispatch({ type: "SET_PROFILE", payload: base });
        dispatch({ type: "SET_TIMETABLE", payload: [] });
        dispatch({ type: "SET_EXAMS", payload: [] });
        dispatch({ type: "SET_PLANNER_ACTIVITIES", payload: [] });
        dispatch({ type: "SET_STUDY_PLANS", payload: [] });
        return;
      }

      const data = snapshot.data();
      dispatch({
        type: "SET_PROFILE",
        payload: {
          studentId: data.studentId || "",
          name: data.name || "",
          email: data.email || auth.currentUser?.email || "",
          year: data.year || "",
          faculty: data.faculty || "",
          avatar: data.avatar || null,
        },
      });
      dispatch({ type: "SET_TIMETABLE", payload: data.timetable || [] });
      dispatch({ type: "SET_EXAMS", payload: data.exams || [] });
      dispatch({ type: "SET_PLANNER_ACTIVITIES", payload: data.plannerActivities || [] });
      dispatch({ type: "SET_STUDY_PLANS", payload: data.studyPlans || [] });
    } catch (error) {
      console.error("Load user data error:", error);
    }
  }

  async function updateUserDoc(payload) {
    const uid = state.currentUser?.uid;
    if (!uid) return;

    try {
      await updateDoc(userDocRef(uid), payload);
    } catch (error) {
      // Fallback for first write when doc was not created yet.
      await setDoc(userDocRef(uid), payload, { merge: true });
    }
  }

  async function saveTimetable(timetable) {
    dispatch({ type: "SET_TIMETABLE", payload: timetable });
    await updateUserDoc({ timetable });
  }

  async function saveExams(exams) {
    dispatch({ type: "SET_EXAMS", payload: exams });
    await updateUserDoc({ exams });
  }

  async function savePlannerActivities(plannerActivities) {
    dispatch({ type: "SET_PLANNER_ACTIVITIES", payload: plannerActivities });
    await updateUserDoc({ plannerActivities });
  }

  async function saveStudyPlans(studyPlans) {
    dispatch({ type: "SET_STUDY_PLANS", payload: studyPlans });
    await updateUserDoc({ studyPlans });
  }

  async function resetAppData() {
    dispatch({ type: "RESET_APP" });
    await updateUserDoc({
      ...DEFAULT_APP_DATA,
      ...DEFAULT_PROFILE,
    });
  }

  async function resetAppDataExceptProfile() {
    dispatch({ type: "SET_TIMETABLE", payload: [] });
    dispatch({ type: "SET_EXAMS", payload: [] });
    dispatch({ type: "SET_PLANNER_ACTIVITIES", payload: [] });
    dispatch({ type: "SET_STUDY_PLANS", payload: [] });
    await updateUserDoc({ ...DEFAULT_APP_DATA });
  }

  // ฟังก์ชันสำหรับ Authentication
  async function registerUser(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        studentId: userData.studentId,
        name: userData.name,
        email: userData.email,
        year: userData.year,
        faculty: userData.faculty,
        avatar: userData.avatar || null,
        ...DEFAULT_APP_DATA,
        createdAt: new Date().toISOString(),
      }, { merge: true });

      dispatch({ 
        type: "SET_PROFILE", 
        payload: {
          studentId: userData.studentId,
          name: userData.name,
          email: userData.email,
          year: userData.year,
          faculty: userData.faculty,
          avatar: userData.avatar || null,
        }
      });

      return { success: true, user };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: error.message };
    }
  }

  async function loginUser(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await loadUserData(user.uid);

      return { success: true, user };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  }

  async function logoutUser() {
    try {
      await signOut(auth);
      dispatch({ type: "SET_CURRENT_USER", payload: null });
      dispatch({ type: "SET_PROFILE", payload: null });
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: error.message };
    }
  }

  async function loadUserProfile(uid) {
    await loadUserData(uid);
  }

  async function updateUserProfile(userData) {
    try {
      if (!state.currentUser) {
        throw new Error("No user logged in");
      }

      await updateUserDoc(userData);

      // อัพเดตใน context
      dispatch({ 
        type: "SET_PROFILE", 
        payload: { ...state.profile, ...userData }
      });

      return { success: true };
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, error: error.message };
    }
  }

  function saveProfile(profileData) {
    dispatch({ type: "SET_PROFILE", payload: profileData });
  }

  function resetProfile() {
    dispatch({ type: "RESET_PROFILE" });
  }

  return (
    <Usercontext.Provider
      value={{
        currentUser: state.currentUser,
        loading,
        userState: state.users,
        timetable: state.timetable,
        exams: state.exams,
        plannerActivities: state.plannerActivities,
        studyPlans: state.studyPlans,
        profile: state.profile, 
        dispatch,
        saveTimetable,
        saveExams,
        savePlannerActivities,
        saveStudyPlans,
        saveProfile, 
        resetProfile,
        resetAppData,
        resetAppDataExceptProfile,
        registerUser,
        loginUser,
        logoutUser,
        loadUserProfile,
        updateUserProfile,
      }}
    >
      {children}
    </Usercontext.Provider>
  );
};