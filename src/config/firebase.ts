import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyChAXUAWmm9BKH7fpz2YsyPCgHgNhpiKRs",
  authDomain: "doceajuda-82a91.firebaseapp.com",
  projectId: "doceajuda-82a91",
  storageBucket: "doceajuda-82a91.firebasestorage.app",
  messagingSenderId: "736154920849",
  appId: "1:736154920849:android:88f7a18199572613e09c30"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);