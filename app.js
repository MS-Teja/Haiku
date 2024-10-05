// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDDUmKD_Dw9wehZaH_CifLnaDRnlTMysxc",
    authDomain: "haiku-book.firebaseapp.com",
    projectId: "haiku-book",
    storageBucket: "haiku-book.appspot.com",
    messagingSenderId: "474204673410",
    appId: "1:474204673410:web:0214a624a7d0ff38846b9b"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the auth service
const auth = firebase.auth();

// Get a reference to the firestore service
const db = firebase.firestore();

// Authentication state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('haiku-submission').style.display = 'block';
        document.getElementById('signout').style.display = 'block';
        loadHaikus();
    } else {
        // User is signed out
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('haiku-submission').style.display = 'none';
        document.getElementById('signout').style.display = 'none';
    }
});

// Sign Up
document.getElementById('signup').addEventListener('click', (e) => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed up
            const user = userCredential.user;
            console.log('User signed up:', user);
        })
        .catch((error) => {
            console.error('Error signing up:', error);
            alert(error.message);
        });
});

// Sign In
document.getElementById('signin').addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log('User signed in:', user);
        })
        .catch((error) => {
            console.error('Error signing in:', error);
            alert(error.message);
        });
});

// Sign Out
document.getElementById('signout').addEventListener('click', (e) => {
    auth.signOut().then(() => {
        console.log('User signed out');
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
});

// Haiku submission
document.getElementById('haiku-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const line1 = document.getElementById('line1').value;
    const line2 = document.getElementById('line2').value;
    const line3 = document.getElementById('line3').value;
    const imageFile = document.getElementById('haiku-image').files[0];

    // if (validateHaiku(line1, line2, line3)) {
        const imageBase64 = await convertToBase64(imageFile);
        await submitHaiku(line1, line2, line3, imageBase64);
    // } else {
    //     alert('Please check your haiku structure (5-7-5 syllables)');
    // }
});

function validateHaiku(line1, line2, line3) {
    // This is a very basic syllable counter. You might want to use a more sophisticated one.
    const syllableCount = (line) => line.split(/[aeiou]/gi).length - 1;
    return syllableCount(line1) === 5 && syllableCount(line2) === 7 && syllableCount(line3) === 5;
}

async function submitHaiku(line1, line2, line3, imageBase64) {
    const haikuText = `${line1}\n${line2}\n${line3}`;

    try {
        const response = await fetch('/.netlify/functions/uploadToPinata', {
            method: 'POST',
            body: JSON.stringify({ text: haikuText, image: imageBase64 }),
        });

        const { textHash, imageHash } = await response.json();

        // Store the IPFS hashes in your database (Firestore)
        await db.collection('haikus').add({
            textHash,
            imageHash,
            author: auth.currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Haiku submitted successfully!');
        document.getElementById('haiku-form').reset();
        loadHaikus();
    } catch (error) {
        console.error("Error submitting haiku: ", error);
        alert('Failed to submit haiku. Please try again.');
    }
}

function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

async function submitHaiku(line1, line2, line3, imageBase64) {
    const haikuText = `${line1}\n${line2}\n${line3}`;

    try {
        const response = await fetch('/.netlify/functions/uploadToPinata', {
            method: 'POST',
            body: JSON.stringify({ text: haikuText, image: imageBase64 }),
        });

        const { textHash, imageHash } = await response.json();

        // Store metadata in Firestore
        await db.collection('haikus').add({
            textHash,
            imageHash,
            author: auth.currentUser.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 0
        });

        alert('Haiku submitted successfully!');
        document.getElementById('haiku-form').reset();
        loadHaikus();
    } catch (error) {
        console.error("Error submitting haiku: ", error);
        alert('Failed to submit haiku. Please try again.');
    }
}

async function loadHaikus() {
    const haikusSnapshot = await db.collection('haikus').orderBy('createdAt', 'desc').limit(10).get();
    const haikuDisplay = document.getElementById('haiku-display');
    haikuDisplay.innerHTML = '';

    haikusSnapshot.forEach(async (doc) => {
        const haiku = doc.data();
        const haikuElement = document.createElement('div');

        // Fetch haiku text from IPFS
        const textResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${haiku.textHash}`);
        const haikuText = await textResponse.json();

        haikuElement.innerHTML = `
            <img src="https://gateway.pinata.cloud/ipfs/${haiku.imageHash}" alt="Haiku Image" width="200">
            <p>${haikuText.haiku}</p>
            <p>Likes: ${haiku.likes}</p>
            <button onclick="likeHaiku('${doc.id}')">Like</button>
        `;
        haikuDisplay.appendChild(haikuElement);
    });
}

async function likeHaiku(haikuId) {
    try {
        await db.collection('haikus').doc(haikuId).update({
            likes: firebase.firestore.FieldValue.increment(1)
        });
        loadHaikus(); // Reload haikus to show updated like count
    } catch (error) {
        console.error("Error liking haiku: ", error);
    }
}
