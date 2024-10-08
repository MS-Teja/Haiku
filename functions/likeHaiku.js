const admin = require('firebase-admin');
const pinataSDK = require('@pinata/sdk');

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { haikuId, userId } = JSON.parse(event.body);

  try {
    const db = admin.firestore();
    const likesRef = db.collection('likes');

    // Check if the user has already liked this haiku
    const existingLike = await likesRef.where('haikuId', '==', haikuId).where('userId', '==', userId).get();

    if (!existingLike.empty) {
      return { statusCode: 400, body: JSON.stringify({ error: 'User has already liked this haiku' }) };
    }

    // Add the like to Firebase
    await likesRef.add({
      haikuId,
      userId,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update like count in Pinata
    const haikuMetadata = await pinata.getJSON(haikuId);
    const currentLikes = haikuMetadata.metadata.keyvalues.likes || 0;
    const updatedLikes = currentLikes + 1;

    await pinata.hashMetadata(haikuId, {
      keyvalues: {
        ...haikuMetadata.metadata.keyvalues,
        likes: updatedLikes
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, likes: updatedLikes })
    };
  } catch (error) {
    console.error('Error liking haiku:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to like haiku', details: error.message })
    };
  }
};