<template>
  <div class="home">
    <p class="theme">Today's Theme is Cherry blossoms</p>
    <div v-if="loading" class="loading">Loading haikus...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="sortedHaikus.length === 0" class="no-haikus">No haikus found.</div>
    <div v-else class="haiku-grid">
      <div v-for="haiku in sortedHaikus" :key="haiku.id" class="haiku-card">
        <div class="haiku-image-container">
          <img
            :src="getImageSrc(haiku.image)"
            :alt="haiku.text"
            @error="() => imageError(haiku.id)"
            v-if="!haiku.imageError"
          >
          <div v-else class="image-error">Failed to load image</div>
          <div class="haiku-text-overlay">
            <p v-for="(line, index) in haiku.text.split('\n')" :key="index">{{ line }}</p>
          </div>
        </div>
        <div class="haiku-footer">
          <div class="author">
            <img :src="haiku.photoURL" :alt="haiku.displayName" class="author-avatar" @error="() => authorImageError(haiku.id)">
            <span>{{ haiku.displayName || 'Anonymous' }}</span>
          </div>
          <div class="tags">
            <span v-for="tag in haiku.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="haiku-actions">
            <button class="like-btn" @click="likeHaiku(haiku.id)" :class="{ liked: haiku.liked }">
              ❤️ {{ haiku.likes }}
            </button>
            <button class="share-btn" @click="shareHaiku(haiku)">🔗</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    const haikus = ref([]);
    const pinataGateway = ref('');
    const loading = ref(true);
    const error = ref(null);

    const sortedHaikus = computed(() => {
      return [...haikus.value].sort((a, b) => b.timestamp - a.timestamp);
    });

    const fetchHaikusAndLikes = async () => {
      try {
        const response = await fetch('/.netlify/functions/fetchHaikus');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched data:', data);

        if (!data.haikus || !Array.isArray(data.haikus)) {
          throw new Error('Invalid haiku data received');
        }

        haikus.value = data.haikus.map(haiku => ({
          ...haiku,
          liked: false,
          imageError: false,
          authorImageError: false
        }));

        pinataGateway.value = data.pinataGateway;
        
        console.log('Processed haikus:', haikus.value);
      } catch (err) {
        console.error("Error fetching data:", err);
        error.value = `Failed to load haikus: ${err.message}`;
      } finally {
        loading.value = false;
      }
    };

    const getImageSrc = (imageHash) => {
      return `https://${pinataGateway.value}/ipfs/${imageHash}`;
    };

    const imageError = (id) => {
      const haiku = haikus.value.find(h => h.id === id);
      if (haiku) {
        haiku.imageError = true;
      }
    };

    const authorImageError = (id) => {
      const haiku = haikus.value.find(h => h.id === id);
      if (haiku) {
        haiku.authorImageError = true;
      }
    };

    const likeHaiku = async (id) => {
      // Implement like functionality
      console.log('Liking haiku:', id);
    };

    const shareHaiku = (haiku) => {
      // Implement share functionality
      console.log('Sharing haiku:', haiku.id);
    };

    onMounted(fetchHaikusAndLikes);

    return { 
      sortedHaikus, 
      pinataGateway, 
      loading, 
      error,
      getImageSrc,
      imageError,
      authorImageError,
      likeHaiku,
      shareHaiku
    };
  }
}
</script>

<style scoped>
/* Add or update your styles here */
.author-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
}
.tag {
  background-color: #f0f0f0;
  padding: 2px 5px;
  border-radius: 3px;
  margin-right: 5px;
  font-size: 0.8em;
}

.author-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
}
.tag {
  background-color: #f0f0f0;
  padding: 2px 5px;
  border-radius: 3px;
  margin-right: 5px;
  font-size: 0.8em;
}

.like-btn.liked {
  color: #ff4081;
}

.like-btn, .share-btn {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #e8eaed;
}

.like-btn svg, .share-btn svg {
  margin-right: 5px;
}

.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  font-size: 2.5em;
  text-align: center;
  margin-bottom: 10px;
}

.theme {
  font-size: 1.2em;
  text-align: center;
  margin-bottom: 30px;
}

.haiku-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.haiku-card {
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  font-size: 1.2em;
  margin-left: 10px;
}

.loading, .error {
  text-align: center;
  margin-top: 50px;
  font-size: 1.2em;
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