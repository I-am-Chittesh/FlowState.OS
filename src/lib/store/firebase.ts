// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDzDH2XFaiZmbaHAowiY4aVMguMnWJnz7A",
  authDomain: "flowstate-notifications.firebaseapp.com",
  projectId: "flowstate-notifications",
  storageBucket: "flowstate-notifications.firebasestorage.app",
  messagingSenderId: "77441232552",
  appId: "1:77441232552:web:544d998ed2d6f59ed79c9d",
  measurementId: "G-D7K3DHYL79"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);