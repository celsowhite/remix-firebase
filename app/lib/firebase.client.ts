import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBiynubpBcpvsdD97mvUh7hcTUyd8_RH7Y",
  authDomain: "remix-firebase-starter-31a0b.firebaseapp.com",
  projectId: "remix-firebase-starter-31a0b",
  storageBucket: "remix-firebase-starter-31a0b.appspot.com",
  messagingSenderId: "931917794612",
  appId: "1:931917794612:web:6dcdb8afa44271996ca961",
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
