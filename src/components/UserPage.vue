<template>
    <div class="user-page">
      <h1>{{ username }}'s Haikus</h1>
      <div v-if="loading" class="loading">Loading haikus...</div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="haiku-grid">
        <!-- Use the same haiku card structure as in HaikuList.vue -->
        <div v-for="haiku in userHaikus" :key="haiku.id" class="haiku-card">
          <!-- ... (haiku card content) ... -->
        </div>
      </div>
    </div>
  </template>

  <script>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';

  export default {
    setup() {
      const route = useRoute();
      const userHaikus = ref([]);
      const username = ref('');
      const loading = ref(true);
      const error = ref(null);

      const fetchUserHaikus = async () => {
        try {
          const userId = route.params.id;
          const response = await fetch(`/.netlify/functions/fetchUserHaikus?userId=${userId}`);

          if (!response.ok) {
            throw new Error('Failed to fetch user haikus');
          }

          const data = await response.json();
          userHaikus.value = data.haikus;
          username.value = data.username;
        } catch (err) {
          console.error("Error fetching user haikus:", err);
          error.value = "Failed to load user haikus. Please try again later.";
        } finally {
          loading.value = false;
        }
      };

      onMounted(fetchUserHaikus);

      return { userHaikus, username, loading, error };
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