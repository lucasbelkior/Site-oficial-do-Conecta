
import { initializeApp } from "firebase/app";
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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
