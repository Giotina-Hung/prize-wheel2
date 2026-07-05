import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBuUQWoDYBHmACni2wpesp8V80wURYXXCw",
  authDomain: "prize-wheel-8689a.firebaseapp.com",
  projectId: "prize-wheel-8689a",
  storageBucket: "prize-wheel-8689a.firebasestorage.app",
  messagingSenderId: "922374142713",
  appId: "1:922374142713:web:55206c7aa5374c44fcc028"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-prizewheel-5930d533-129b-4845-b583-32b3315c93a4");
