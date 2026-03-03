import React, { createContext, useEffect, useReducer } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const Usercontext = createContext();

const TIMETABLE_KEY = "timetable";
const EXAMS_KEY = "exams";

const userReducer = (state, action) => {
  switch (action.type) {
    case "ADD_USER":
      return {
        ...state,
        users: [action.payload, ...state.users],
      };

    case "SET_PROFILE":
      return {
        ...state,
        profile: action.payload,
      };

    case "RESET_PROFILE":
      return {
        ...state,
        profile: {
          studentId: "",
          name: "",
          email: "",
          year: "",
          faculty: "",
        },
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

    case "RESET_APP":
      return {
        ...state,
        timetable: [],
        exams: [],
        profile: {
          studentId: "",
          name: "",
          email: "",
          year: "",
          faculty: "",
        },
      };

    default:
      return state;
  }
};

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, {
    users: [],
    timetable: [],
    exams: [],
    profile: {
      studentId: "",
      name: "",
      email: "",
      year: "",
      faculty: "",
      avatar: null
    },
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    const [rawTimetable, rawExams] = await Promise.all([
      AsyncStorage.getItem(TIMETABLE_KEY),
      AsyncStorage.getItem(EXAMS_KEY),
    ]);

    dispatch({
      type: "SET_TIMETABLE",
      payload: rawTimetable ? JSON.parse(rawTimetable) : [],
    });

    dispatch({
      type: "SET_EXAMS",
      payload: rawExams ? JSON.parse(rawExams) : [],
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

  async function resetAppData() {
    dispatch({ type: "RESET_APP" });
    await Promise.all([
      AsyncStorage.removeItem(TIMETABLE_KEY),
      AsyncStorage.removeItem(EXAMS_KEY),
    ]);
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
        userState: state.users,
        timetable: state.timetable,
        exams: state.exams,
        profile: state.profile, 
        dispatch,
        saveTimetable,
        saveExams,
        saveProfile, 
        resetProfile,
        resetAppData,
      }}
    >
      {children}
    </Usercontext.Provider>
  );
};