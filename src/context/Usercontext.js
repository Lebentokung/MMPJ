import React, { createContext, useEffect, useReducer, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../config/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

export const Usercontext = createContext();

const TIMETABLE_KEY = "timetable";
const EXAMS_KEY = "exams";
const PLANNER_ACTIVITIES_KEY = "plannerActivities";
const STUDY_PLANS_KEY = "studyPlans";
const DEFAULT_PROFILE = {
  studentId: "",
  name: "",
  email: "",
  year: "",
  faculty: "",
  avatar: null,
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

  useEffect(() => {
    // ฟัง authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        dispatch({ type: "SET_CURRENT_USER", payload: user });
        // โหลดข้อมูล profile จาก Firestore
        await loadUserProfile(user.uid);
      } else {
        dispatch({ type: "SET_CURRENT_USER", payload: null });
        dispatch({ type: "SET_PROFILE", payload: null });
      }
      setLoading(false);
    });

    loadInitialData();

    return unsubscribe;
  }, []);

  async function loadInitialData() {
    const [rawTimetable, rawExams, rawPlannerActivities, rawStudyPlans] = await Promise.all([
      AsyncStorage.getItem(TIMETABLE_KEY),
      AsyncStorage.getItem(EXAMS_KEY),
      AsyncStorage.getItem(PLANNER_ACTIVITIES_KEY),
      AsyncStorage.getItem(STUDY_PLANS_KEY),
    ]);

    dispatch({
      type: "SET_TIMETABLE",
      payload: rawTimetable ? JSON.parse(rawTimetable) : [],
    });

    dispatch({
      type: "SET_EXAMS",
      payload: rawExams ? JSON.parse(rawExams) : [],
    });

    dispatch({
      type: "SET_PLANNER_ACTIVITIES",
      payload: rawPlannerActivities ? JSON.parse(rawPlannerActivities) : [],
    });

    dispatch({
      type: "SET_STUDY_PLANS",
      payload: rawStudyPlans ? JSON.parse(rawStudyPlans) : [],
    });
  }

  async function saveTimetable(timetable) {
    dispatch({ type: "SET_TIMETABLE", payload: timetable });
    await AsyncStorage.setItem(TIMETABLE_KEY, JSON.stringify(timetable));
  }

  async function saveExams(exams) {
    dispatch({ type: "SET_EXAMS", payload: exams });
    await AsyncStorage.setItem(EXAMS_KEY, JSON.stringify(exams));
  }

  async function savePlannerActivities(plannerActivities) {
    dispatch({ type: "SET_PLANNER_ACTIVITIES", payload: plannerActivities });
    await AsyncStorage.setItem(PLANNER_ACTIVITIES_KEY, JSON.stringify(plannerActivities));
  }

  async function saveStudyPlans(studyPlans) {
    dispatch({ type: "SET_STUDY_PLANS", payload: studyPlans });
    await AsyncStorage.setItem(STUDY_PLANS_KEY, JSON.stringify(studyPlans));
  }

  async function resetAppData() {
    dispatch({ type: "RESET_APP" });
    await Promise.all([
      AsyncStorage.removeItem(TIMETABLE_KEY),
      AsyncStorage.removeItem(EXAMS_KEY),
      AsyncStorage.removeItem(PLANNER_ACTIVITIES_KEY),
      AsyncStorage.removeItem(STUDY_PLANS_KEY),
    ]);
  }

  async function resetAppDataExceptProfile() {
    dispatch({ type: "SET_TIMETABLE", payload: [] });
    dispatch({ type: "SET_EXAMS", payload: [] });
    dispatch({ type: "SET_PLANNER_ACTIVITIES", payload: [] });
    dispatch({ type: "SET_STUDY_PLANS", payload: [] });
    await Promise.all([
      AsyncStorage.removeItem(TIMETABLE_KEY),
      AsyncStorage.removeItem(EXAMS_KEY),
      AsyncStorage.removeItem(PLANNER_ACTIVITIES_KEY),
      AsyncStorage.removeItem(STUDY_PLANS_KEY),
    ]);
  }

  // ฟังก์ชันสำหรับ Authentication
  async function registerUser(email, password, userData) {
    try {
      // สร้าง account ใน Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // บันทึกข้อมูลผู้ใช้ใน Firestore
      await setDoc(doc(db, "users", user.uid), {
        studentId: userData.studentId,
        name: userData.name,
        email: userData.email,
        year: userData.year,
        faculty: userData.faculty,
        avatar: userData.avatar || null,
        createdAt: new Date().toISOString(),
      });

      // อัพเดต profile ใน context
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

      // โหลดข้อมูล profile จาก Firestore
      await loadUserProfile(user.uid);

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
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const profileData = docSnap.data();
        dispatch({ type: "SET_PROFILE", payload: profileData });
        return profileData;
      }
    } catch (error) {
      console.error("Load profile error:", error);
    }
  }

  async function updateUserProfile(userData) {
    try {
      if (!state.currentUser) {
        throw new Error("No user logged in");
      }

      // อัพเดตใน Firestore
      await updateDoc(doc(db, "users", state.currentUser.uid), userData);

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