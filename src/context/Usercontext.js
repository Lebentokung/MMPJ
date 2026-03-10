import React, { createContext, useEffect, useReducer } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    users: [],
    timetable: [],
    exams: [],
    plannerActivities: [],
    studyPlans: [],
    profile: DEFAULT_PROFILE,
  });

  useEffect(() => {
    loadInitialData();
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
      }}
    >
      {children}
    </Usercontext.Provider>
  );
};