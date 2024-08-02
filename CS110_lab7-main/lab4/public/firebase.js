// firebase.js
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "apiKey here",
  authDomain: "authDomain here",
  projectId: "projectId here",
  messagingSenderId: "messagingSenderId here",
  appId: "appId here"
};

const app = initializeApp(firebaseConfig);
export { app };
