import React, { useContext, useState, useEffect } from "react";
import { auth } from "../Firebase/init";
import { GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import type { User, UserInfo } from "firebase/auth";

/**
 * Authentication context type definition
 */
interface AuthContextType {
    userLoggedIn: boolean;
    isEmailUser: boolean;
    isGoogleUser: boolean;
    currentUser: User | null;
    userId: string | null;
    tokenId: string | null;
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

/**
 * Authentication context creation
 */
const AuthContext = React.createContext<AuthContextType>({
    userLoggedIn: false,
    isEmailUser: false,
    isGoogleUser: false,
    currentUser: null,
    userId: null,
    tokenId: null,
    setCurrentUser: () => {},
});

/**
 * Custom hook to use authentication context
 * @returns AuthContextType
 */
export function useAuth() {
    return useContext(AuthContext);
}

/**
 * Authentication provider component
 * @param props - Props containing children elements
 * @returns JSX.Element
 */
export function AuthProvider({ children }: React.PropsWithChildren<unknown>) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isEmailUser, setIsEmailUser] = useState(false);
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const [tokenId, setTokenId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, []);

    /**
     * Initialize user state on authentication state change
     * @param user - Firebase User object or null
     */
    async function initializeUser(user: User | null) {
        if (user) {
            setCurrentUser(user);

            setUserId(user.uid);

            const token = await user.getIdToken();
            setTokenId(token);

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
            setUserId(null);
            setUserLoggedIn(false);
        }

        setLoading(false);
    }

    const value = {
        userLoggedIn,
        isEmailUser,
        isGoogleUser,
        currentUser,
        userId,
        tokenId,
        setCurrentUser,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
