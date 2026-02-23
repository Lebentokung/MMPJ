import React,{ act, createContext, useReducer} from "react";

export const Usercontext = createContext()

const userReducer = (state, action) => {
    switch(action.type){
        case 'ADD_USER':
            return [action.payload, ...state];
        case 'CLEAR_USERS':
            return [];
        case 'UPDATE_USER':
            return state.map((user, index) => index === 0 ? { ...user, ...action.payload } : user);
        default:
            return state;
    }
}

// Testdwadad dffawfawfa

export const UserProvider = ({children}) => {
    const [userState, dispatch] = useReducer (userReducer, []);

    return (
        <Usercontext.Provider value={{userState, dispatch}}>
            {children}
        </Usercontext.Provider>
    )
}