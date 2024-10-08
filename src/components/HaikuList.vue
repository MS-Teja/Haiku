<template>
  <div class="haiku-list">
    <div v-if="loading" class="loading">Loading haikus...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="haiku-grid">
      <div v-for="haiku in haikus" :key="haiku.id" class="haiku-card">
        <div class="haiku-image-container">
          <img
            :src="`https://${pinataGateway}/ipfs/${haiku.image}`"
            :alt="haiku.text"
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
            <!-- <img v-if="haiku.photoURL" :src="haiku.photoURL" alt="Author" class="author-avatar"> -->
            <span>{{ haiku.displayName || 'Anonymous' }}</span>
          </div>
          <div class="tags">
            <span v-for="tag in haiku.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="haiku-actions">
            <button class="like-btn" @click="likeHaiku(haiku.id)">❤️ {{ haiku.likes }}</button>
            <button class="share-btn" @click="shareHaiku(haiku)">🔗</button>
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
    const haikus = ref([]);
    const pinataGateway = ref('');
    const loading = ref(true);
    const error = ref(null);

    const fetchHaikus = async () => {
      try {
        const response = await fetch('/.netlify/functions/fetchHaikus');

        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const data = await response.json();

        haikus.value = data.haikus;
        pinataGateway.value = data.pinataGateway;
      } catch (err) {
        console.error("Error fetching data:", err);
        error.value = "Failed to load haikus. Please try again later.";
      } finally {
        loading.value = false;
      }
    };

    const imageError = (id) => {
      const haiku = haikus.value.find(h => h.id === id);
      if (haiku) {
        haiku.imageError = true;
      }
    };

    const likeHaiku = async (id) => {
      try {
        const response = await fetch('/.netlify/functions/likeHaiku', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
        });

        if (!response.ok) {
          throw new Error('Failed to like haiku');
        }

        const result = await response.json();
        const haiku = haikus.value.find(h => h.id === id);
        if (haiku) {
          haiku.likes = result.likes;
        }
      } catch (error) {
        console.error('Error liking haiku:', error);
        alert('Failed to like haiku. Please try again.');
      }
    };

    const shareHaiku = (haiku) => {
      // ... (shareHaiku function remains the same) ...
    };

    const fallbackShare = (url) => {
      // ... (fallbackShare function remains the same) ...
    };

    onMounted(fetchHaikus);

    return { haikus, pinataGateway, loading, error, imageError, likeHaiku, shareHaiku };
  }
}
</script>

<style scoped>
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 5px;
}

.tag {
  background-color: #e0e0e0;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 0.8em;
  color: #333;
}

.haiku-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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