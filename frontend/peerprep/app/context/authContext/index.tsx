import React, { useContext, useState, useEffect } from "react";
import { auth } from "../../firebase/firebase";
import { GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import type { User, UserInfo } from "firebase/auth";

interface AuthContextType {
    userLoggedIn: boolean;
    isEmailUser: boolean;
    isGoogleUser: boolean;
    currentUser: User | null;
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = React.createContext<AuthContextType>({
    userLoggedIn: false,
    isEmailUser: false,
    isGoogleUser: false,
    currentUser: null,
    setCurrentUser: () => {},
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: React.PropsWithChildren<unknown>) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [isEmailUser, setIsEmailUser] = useState(false);
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, []);

    async function initializeUser(user: User | null) {
        if (user) {
            setCurrentUser(user);

            // check if provider is email and password login
            const isEmail = user.providerData.some((provider: UserInfo) => provider.providerId === "password");
            setIsEmailUser(isEmail);

            // check if the auth provider is google or not
            const isGoogle = user.providerData.some(
                (provider: UserInfo) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
            );
            setIsGoogleUser(isGoogle);

            setUserLoggedIn(true);
        } else {
            setCurrentUser(null);
            setUserLoggedIn(false);
        }

        setLoading(false);
    }

    const value = {
        userLoggedIn,
        isEmailUser,
        isGoogleUser,
        currentUser,
        setCurrentUser,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
