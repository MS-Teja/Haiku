<template>
    <img
      :src="imageSrc"
      @error="handleImageError"
      :alt="altText"
      class="profile-image"
    >
  </template>

  <script setup>
  import { ref } from 'vue';

  const props = defineProps({
    src: {
      type: String,
      required: true
    },
    altText: {
      type: String,
      default: 'User profile'
    }
  });

  const imageSrc = ref(props.src);

  const handleImageError = () => {
    // Set a default image URL or data URI
    imageSrc.value = '/path/to/default/profile-image.png';
  };
  </script>

  <style scoped>
  .profile-image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }
  </style>