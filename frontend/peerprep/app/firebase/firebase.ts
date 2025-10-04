// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAc-BIyy8f5MyLXCjS67mEJwsbcJTvk6JM",
    authDomain: "peerprep-4fa3c.firebaseapp.com",
    projectId: "peerprep-4fa3c",
    storageBucket: "peerprep-4fa3c.firebasestorage.app",
    messagingSenderId: "644272889551",
    appId: "1:644272889551:web:2da99465d93ed7e25ba1ba",
    measurementId: "G-MH98GY6T4W",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
export { app, analytics, auth };
