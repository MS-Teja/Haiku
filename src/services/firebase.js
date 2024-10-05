import { initializeApp } from 'firebase/app';
import { getAuth} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDDUmKD_Dw9wehZaH_CifLnaDRnlTMysxc",
    authDomain: "haiku-book.firebaseapp.com",
    projectId: "haiku-book",
    storageBucket: "haiku-book.appspot.com",
    messagingSenderId: "474204673410",
    appId: "1:474204673410:web:0214a624a7d0ff38846b9b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const pinataGateway = 'harlequin-real-pelican-820.mypinata.cloud';

export { auth, db, pinataGateway };