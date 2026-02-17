import React,{ act, createContext, useReducer} from "react";

export const Usercontext = createContext()

const userReducer = (state, action) => {
    switch(action.type){
        case 'ADD_USER':
            return [action.payload, ...state];
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