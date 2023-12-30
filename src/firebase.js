import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD9y7J4pPoFiThVm4ANU28IljeNrFiFKUA",
  authDomain: "opd-system-cd627.firebaseapp.com",
  projectId: "opd-system-cd627",
  storageBucket: "opd-system-cd627.appspot.com",
  messagingSenderId: "1076078044312",
  appId: "1:1076078044312:web:4bdcfbf476d0ce621f9ced"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
