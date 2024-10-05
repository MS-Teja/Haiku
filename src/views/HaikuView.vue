<template>
    <div class="haiku-view" v-if="haiku">
      <div class="haiku-card">
        <div class="haiku-image-container">
          <img
            :src="`https://${pinataGateway}/ipfs/${haiku.imageHash}`"
            alt="Haiku Background"
            @error="imageError"
          >
          <div v-if="imageLoadError" class="image-error">Failed to load image</div>
          <div class="haiku-text-overlay">
            <p v-for="(line, index) in haiku.text.split('\n')" :key="index">{{ line }}</p>
          </div>
        </div>
        <div class="haiku-footer">
          <span class="author">{{ haiku.author || 'Anonymous' }}</span>
          <div class="haiku-actions">
            <button class="like-btn" @click="likeHaiku" :class="{ liked: haiku.liked }">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" :fill="haiku.liked ? '#ff4081' : '#e8eaed'">
                <path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z"/>
              </svg>
              {{ haiku.likes }}
            </button>
            <button class="share-btn" @click="shareHaiku">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed">
                <path d="M680-80q-50 0-85-35t-35-85q0-6 3-28L282-392q-16 15-37 23.5t-45 8.5q-50 0-85-35t-35-85q0-50 35-85t85-35q24 0 45 8.5t37 23.5l281-164q-2-7-2.5-13.5T560-760q0-50 35-85t85-35q50 0 85 35t35 85q0 50-35 85t-85 35q-24 0-45-8.5T598-672L317-508q2 7 2.5 13.5t.5 14.5q0 8-.5 14.5T317-452l281 164q16-15 37-23.5t45-8.5q50 0 85 35t35 85q0 50-35 85t-85 35Zm0-80q17 0 28.5-11.5T720-200q0-17-11.5-28.5T680-240q-17 0-28.5 11.5T640-200q0 17 11.5 28.5T680-160ZM200-440q17 0 28.5-11.5T240-480q0-17-11.5-28.5T200-520q-17 0-28.5 11.5T160-480q0 17 11.5 28.5T200-440Zm480-280q17 0 28.5-11.5T720-760q0-17-11.5-28.5T680-800q-17 0-28.5 11.5T640-760q0 17 11.5 28.5T680-720Zm0 520ZM200-480Zm480-280Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else>Loading...</div>
  </template>

  <script>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { db } from '../services/firebase';
  import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';

  export default {
    setup() {
      const route = useRoute();
      const haiku = ref(null);
      const pinataGateway = ref('');
      const imageLoadError = ref(false);

      const fetchHaiku = async () => {
        try {
          const response = await fetch(`/.netlify/functions/fetchHaiku?id=${route.params.id}`);
          if (!response.ok) throw new Error('Failed to fetch haiku');
          const data = await response.json();

          const likesDoc = await getDoc(doc(db, 'likes', route.params.id));
          const likes = likesDoc.exists() ? likesDoc.data().count : 0;

          haiku.value = {
            ...data.haiku,
            likes,
            liked: false
          };
          pinataGateway.value = data.pinataGateway;
        } catch (error) {
          console.error('Error fetching haiku:', error);
        }
      };

      const imageError = () => {
        imageLoadError.value = true;
      };

      const likeHaiku = async () => {
        if (haiku.value.liked) return;
        try {
          const likesRef = doc(db, 'likes', haiku.value.id);
          await updateDoc(likesRef, {
            count: increment(1)
          });
          haiku.value.likes++;
          haiku.value.liked = true;
        } catch (error) {
          console.error('Error liking haiku:', error);
          alert('Failed to like haiku. Please try again.');
        }
      };

      const shareHaiku = async () => {
      const shareUrl = window.location.href;

      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Check out this haiku!',
            text: haiku.value.text,
            url: shareUrl,
          });
          alert('Haiku shared successfully!');
        } catch (error) {
          console.error('Error sharing haiku:', error);
          fallbackShare(shareUrl);
        }
      } else {
        fallbackShare(shareUrl);
      }
    };

    const fallbackShare = async (url) => {
      try {
        await navigator.clipboard.writeText(url);
        alert('Haiku link copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        alert('Failed to copy link. Please try again.');
      }
    };

    onMounted(fetchHaiku);

    return { haiku, pinataGateway, imageLoadError, imageError, likeHaiku, shareHaiku };
  }
}
</script>

<style scoped>
.haiku-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.haiku-card {
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.haiku-image-container {
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 Aspect Ratio */
}

.haiku-image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.haiku-text-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 10px;
}

.haiku-text-overlay p {
  margin: 5px 0;
  font-size: 18px;
  font-weight: bold;
}

.haiku-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.author {
  font-size: 0.9em;
  color: #666;
}

.haiku-actions button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #e8eaed;
  margin-left: 10px;
}

.like-btn.liked {
  color: #ff4081;
}

.like-btn svg, .share-btn svg {
  margin-right: 5px;
}

.image-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
}
</style>