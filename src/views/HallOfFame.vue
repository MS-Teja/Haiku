<template>
  <div class="hall-of-fame">
    <h1>Hall of Fame</h1>
    <div v-if="loading" class="loading">Loading top haikus...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="haiku-grid">
      <div v-for="haiku in topHaikus" :key="haiku.id" class="haiku-card">
        <div class="haiku-image-container">
          <img
            :src="`https://${pinataGateway}/ipfs/${haiku.imageHash}`"
            alt="Haiku Background"
            @error="imageError(haiku.id)"
          >
          <div v-if="haiku.imageError" class="image-error">Failed to load image</div>
          <div class="haiku-text-overlay">
            <p v-for="(line, index) in haiku.text.split('\n')" :key="index">{{ line }}</p>
          </div>
        </div>
        <div class="haiku-footer">
          <div class="author">
            <ProfileImage :src="haiku.photoURL" :alt-text="`${haiku.displayName}'s profile`" />
            <span>{{ haiku.displayName || 'Anonymous' }}</span>
          </div>
          <div class="haiku-actions">
            <span class="likes">❤️ {{ haiku.likes }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  setup() {
    const topHaikus = ref([]);
    const pinataGateway = ref('');
    const loading = ref(true);
    const error = ref(null);

    const fetchTopHaikus = async () => {
      try {
        const response = await fetch('/.netlify/functions/fetchTopHaikus');
        if (!response.ok) {
          throw new Error('Failed to fetch top haikus');
        }
        const data = await response.json();
        topHaikus.value = data.haikus;
        pinataGateway.value = data.pinataGateway;
      } catch (err) {
        console.error("Error fetching top haikus:", err);
        error.value = "Failed to load top haikus. Please try again later.";
      } finally {
        loading.value = false;
      }
    };

    const imageError = (id) => {
      const haiku = topHaikus.value.find(h => h.id === id);
      if (haiku) {
        haiku.imageError = true;
      }
    };

    onMounted(fetchTopHaikus);

    return { topHaikus, pinataGateway, loading, error, imageError };
  }
}
</script>

<style scoped>
.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
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