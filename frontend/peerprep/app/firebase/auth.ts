import { auth } from "./firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    updatePassword,
    signInWithRedirect,
    GoogleAuthProvider,
    // signInWithPopup,
} from "firebase/auth";

export interface AuthCredentials {
    email: string;
    password: string;
}

export const doCreateUserWithEmailAndPassword = async (
    email: AuthCredentials["email"],
    password: AuthCredentials["password"]
): Promise<import("firebase/auth").UserCredential> => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const doSignInWithEmailAndPassword = (
    email: AuthCredentials["email"],
    password: AuthCredentials["password"]
): Promise<import("firebase/auth").UserCredential> => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
};

export const doSignOut = () => {
    return auth.signOut();
};

export const doPasswordReset = (email: AuthCredentials["email"]) => {
    return sendPasswordResetEmail(auth, email);
};

export const doPasswordChange = (password: AuthCredentials["password"]) => {
    if (!auth.currentUser) {
        throw new Error("No authenticated user found.");
    }
    return updatePassword(auth.currentUser, password);
};

export const doSendEmailVerification = () => {
    if (!auth.currentUser) {
        throw new Error("No authenticated user found.");
    }
    return sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/home`,
    });
};
