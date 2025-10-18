import React, { useContext, useState, useEffect } from "react";
import { auth } from "../../firebase/init";
import { GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import type { User, UserInfo } from "firebase/auth";

interface AuthContextType {
    userLoggedIn: boolean;
    isEmailUser: boolean;
    isGoogleUser: boolean;
    currentUser: User | null;
    displayName: string | null;
    userId: string | null;
    tokenId: string | null;
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = React.createContext<AuthContextType>({
    userLoggedIn: false,
    isEmailUser: false,
    isGoogleUser: false,
    currentUser: null,
    displayName: null,
    userId: null,
    tokenId: null,
    setCurrentUser: () => {},
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: React.PropsWithChildren<unknown>) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isEmailUser, setIsEmailUser] = useState(false);
    const [isGoogleUser, setIsGoogleUser] = useState(false);
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [tokenId, setTokenId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, []);

    async function initializeUser(user: User | null) {
        if (user) {
            setCurrentUser(user);
            setDisplayName(user.displayName);
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
            setDisplayName(null);
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
        displayName,
        userId,
        tokenId,
        setCurrentUser,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
