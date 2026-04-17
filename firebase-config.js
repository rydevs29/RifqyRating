import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-analytics.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA1WHFjidCIEotEG4nOOUCV1OHU-cslddU",
  authDomain: "rifqymetrics.firebaseapp.com",
  databaseURL: "https://rifqymetrics-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rifqymetrics",
  storageBucket: "rifqymetrics.firebasestorage.app",
  messagingSenderId: "459868583825",
  appId: "1:459868583825:web:c2f532f800d584b8b14c30",
  measurementId: "G-0HV0S6LRHB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export layanan agar bisa dipakai di script.js dan admin.js
export const db = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
