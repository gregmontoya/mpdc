import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBSxrgaNnTzRMqo-9C47vZfnTTDRqyyb10",
    authDomain: "mpdc-website-32dae.firebaseapp.com",
    projectId: "mpdc-website-32dae",
    storageBucket: "mpdc-website-32dae.firebasestorage.app",
    messagingSenderId: "210457065303",
    appId: "1:210457065303:web:72882e734aa8054d283012",
    measurementId: "G-C6HW3C8YYV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
