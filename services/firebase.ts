
import * as firebaseApp from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAR4TNdSL8Od45mKpsYtYgf3naSEjdMjLE",
    authDomain: "conecta-4477f.firebaseapp.com",
    projectId: "conecta-4477f",
    storageBucket: "conecta-4477f.firebasestorage.app",
    messagingSenderId: "456133780290",
    appId: "1:456133780290:web:5cf79c4147cf06918a1edb",
    measurementId: "G-CF2F5P81E2"
};

// Initialize Firebase only if it hasn't been initialized yet
// Using modular SDK: check getApps() length
// We use 'as any' to bypass TypeScript errors where definitions might claim 'initializeApp' doesn't exist
const appModule = firebaseApp as any;

const app = appModule.getApps && appModule.getApps().length > 0 
    ? appModule.getApp() 
    : appModule.initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
