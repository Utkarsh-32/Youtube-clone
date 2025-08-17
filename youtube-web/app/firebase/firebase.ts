// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIy_lufjaVdEHcKjR9HGwqtylNtOMRinw",
  authDomain: "yt-clone-221b.firebaseapp.com",
  projectId: "yt-clone-221b",
  appId: "1:609390155491:web:4b8ecf8b085593d87517d6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export function signInWithGoogle() {
    return signInWithPopup(auth, new GoogleAuthProvider());
}

export function signOut() {
  return auth.signOut();
}

export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}