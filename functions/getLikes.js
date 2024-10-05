const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  // Your Firebase configuration here
  apiKey: "AIzaSyDDUmKD_Dw9wehZaH_CifLnaDRnlTMysxc",
  authDomain: "haiku-book.firebaseapp.com",
  projectId: "haiku-book",
  storageBucket: "haiku-book.appspot.com",
  messagingSenderId: "474204673410",
  appId: "1:474204673410:web:0214a624a7d0ff38846b9b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

exports.handler = async (event) => {
  try {
    const likesSnapshot = await getDocs(collection(db, 'likes'));
    const likes = {};
    likesSnapshot.forEach(doc => {
      likes[doc.id] = doc.data().count || 0;
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ likes })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch likes', details: error.message })
    };
  }
};