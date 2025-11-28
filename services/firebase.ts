
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import * as firebaseApp from "firebase/app";

// Workaround for TypeScript error: Module '"firebase/app"' has no exported member ...
// This ensures we can access the named exports even if type definitions are resolving incorrectly.
const { initializeApp, getApps, getApp } = firebaseApp as any;

const firebaseConfig = {
    apiKey: "AIzaSyAR4TNdSL8Od45mKpsYtYgf3naSEjdMjLE",
    authDomain: "conecta-4477f.firebaseapp.com",
    projectId: "conecta-4477f",
    storageBucket: "conecta-4477f.firebasestorage.app",
    messagingSenderId: "456133780290",
    appId: "1:456133780290:web:5cf79c4147cf06918a1edb",
    measurementId: "G-CF2F5P81E2"
};

// Initialize Firebase using standard pattern compatible with Vite/Webpack
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
