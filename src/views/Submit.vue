<template>
    <div>
      <h2>Submit a Haiku</h2>
      <HaikuForm v-if="isAuthenticated" />
      <div v-else>
        <p>Please log in to submit a haiku.</p>
        <router-link to="/login">Log In</router-link>
      </div>
    </div>
  </template>

  <script>
  import { ref, onMounted } from 'vue';
  import HaikuForm from '../components/HaikuForm.vue';
  import { auth } from '../services/firebase';

  export default {
    components: {
      HaikuForm
    },
    setup() {
      const isAuthenticated = ref(false);

      onMounted(() => {
        auth.onAuthStateChanged(user => {
          isAuthenticated.value = !!user;
        });
      });

      return { isAuthenticated };
    }
  }
  </script>