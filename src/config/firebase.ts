import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
const app = initializeApp({apiKey:'placeholder',authDomain:'placeholder',projectId:'placeholder',appId:'placeholder'});
export const auth = getAuth(app);
