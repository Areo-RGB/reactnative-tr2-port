import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Configuration from tr2 reference
const firebaseConfig = {
    apiKey: "AIzaSyDcR7KzILxjXrIqe7Xe9v33C9QugQbjLuM",
    authDomain: "multi-e4d82.firebaseapp.com",
    databaseURL: "https://multi-e4d82-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "multi-e4d82",
    storageBucket: "multi-e4d82.firebasestorage.app",
    messagingSenderId: "302955593473",
    appId: "1:302955593473:web:975dc9079614ef137b6500",
    measurementId: "G-P4C0X8XWYN"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
