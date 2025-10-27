import { auth } from "./init";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    updatePassword,
    // signInWithRedirect,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
} from "firebase/auth";

export interface AuthCredentials {
    email: string;
    password: string;
}

export const doCreateUserWithEmailAndPassword = async (
    email: AuthCredentials["email"],
    password: AuthCredentials["password"],
    username: string
): Promise<import("firebase/auth").UserCredential> => {
    return createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            await fetch("http://localhost:4000/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${await auth?.currentUser?.getIdToken()}`,
                },
                body: JSON.stringify({ uuid: auth?.currentUser?.uid, username: username }),
            });
            return userCredential;
        })
        .catch((error) => {
            throw error;
        });
};

export const doUpdateUserProfile = async (displayName: string) => {
    if (!auth.currentUser) {
        throw new Error("No authenticated user found.");
    }
    return updateProfile(auth.currentUser, { displayName });
};

export const doSignInWithEmailAndPassword = (
    email: AuthCredentials["email"],
    password: AuthCredentials["password"]
): Promise<import("firebase/auth").UserCredential> => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const doSignInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
};

export const doSignOut = () => {
    return auth.signOut();
};

export const doPasswordReset = (email: AuthCredentials["email"]) => {
    return sendPasswordResetEmail(auth, email)
        .then(() => {
            console.log("Password reset email sent successfully.");
        })
        .catch((error) => {
            console.error("Error sending password reset email:", error);
            throw new Error(error);
        });
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
