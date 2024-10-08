<template>
  <div class="haiku-form">
    <h2>Create a Haiku</h2>
    <form @submit.prevent="submitHaiku">
      <input v-model="line1" placeholder="First line (5 syllables)" required>
      <input v-model="line2" placeholder="Second line (7 syllables)" required>
      <input v-model="line3" placeholder="Third line (5 syllables)" required>
      <select v-model="selectedImageId" required>
        <option value="" disabled>Select a background</option>
        <option value="1">Subtle Mist Over Rolling Hills</option>
        <option value="2">Faint Watercolor Sky with Light Clouds</option>
        <option value="3">Soft Reflection on a Quiet Lake</option>
        <option value="4">Abstract Bamboo Shadows on a Pale Wall</option>
        <option value="5">Bare Branches Against a Faded Winter Sky</option>
        <option value="6">Light Fog Over Distant Mountains</option>
        <option value="7">Subtle Blossom Petals in the Breeze</option>
        <option value="8">Soft Rain Falling Over a Quiet Garden</option>
      </select>
      <input v-model="tags" placeholder="Tags (comma-separated)" required>
      <button type="submit" class="submit-btn" :disabled="!isFormValid">Submit Haiku</button>
    </form>
    <p v-if="message" :class="{ 'success': isSuccess, 'error': !isSuccess }">
      {{ message }}
    </p>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useUserStore } from '../stores/user';

export default {
  setup() {
    const line1 = ref('');
    const line2 = ref('');
    const line3 = ref('');
    const selectedImageId = ref('');
    const tags = ref('');
    const message = ref('');
    const isSuccess = ref(false);
    const userStore = useUserStore();

    const isFormValid = computed(() => {
      return line1.value.trim() && line2.value.trim() && line3.value.trim() && selectedImageId.value && tags.value.trim();
    });

    const submitHaiku = async () => {
    try {
      const haikuText = `${line1.value}\n${line2.value}\n${line3.value}`;
      const response = await fetch('/.netlify/functions/uploadToPinata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: haikuText,
          selectedImage: selectedImageId.value,
          userId: userStore.user.uid,
          displayName: userStore.user.displayName,
          photoURL: userStore.user.photoURL,
          tags: tags.value.split(',').map(tag => tag.trim())
        }),
      });;

        if (!response.ok) {
          throw new Error('Failed to submit haiku');
        }

        const result = await response.json();
        console.log('Haiku submitted successfully:', result);

        // Reset form
        line1.value = '';
        line2.value = '';
        line3.value = '';
        selectedImageId.value = '';
        tags.value = '';

        message.value = 'Haiku submitted successfully!';
        isSuccess.value = true;

        // Optionally, emit an event to refresh the haiku list
        // this.$emit('haiku-submitted');
      } catch (error) {
        console.error('Error submitting haiku:', error);
        message.value = 'Failed to submit haiku. Please try again.';
        isSuccess.value = false;
      }
    };

    return {
      line1, line2, line3, selectedImageId, tags, submitHaiku, isFormValid, message, isSuccess
    };
  }
}
</script>

<style scoped>
.haiku-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

input, select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.submit-btn {
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.success {
  color: #28a745;
}

.error {
  color: #dc3545;
}
</style>