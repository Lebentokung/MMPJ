import React,{ act, createContext, useReducer} from "react";

export const Usercontext = createContext()

const userReducer = (state, action) => {
    switch(action.type){
        case 'ADD_USER':
            return { ...state, users: [action.payload, ...state.users] };
        default:
            return state;
    }
}

export const UserProvider = ({children}) => {
    const initialState = {
        users: [],
        timetable: [],
        exams: [],
        activities: [],
    };

    const [userState, dispatch] = useReducer(userReducer, initialState);

    return (
        <Usercontext.Provider value={{state: userState, dispatch}}>
            {children}
        </Usercontext.Provider>
    )
}