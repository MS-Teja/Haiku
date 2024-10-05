<template>
  <div class="auth-form">
    <h2>{{ isLogin ? 'Sign In' : 'Sign Up' }}</h2>
    <form @submit.prevent="submitForm">
      <input v-model="email" type="email" placeholder="Email" required>
      <input v-model="password" type="password" placeholder="Password" required>
      <button type="submit" class="primary-btn">{{ isLogin ? 'Sign In' : 'Sign Up' }}</button>
    </form>
    <button @click="signInWithGoogle" class="google-btn">
      <font-awesome-icon :icon="['fab', 'google']" style="color: #000000;" />
      Sign in with Google
    </button>
    <p class="toggle-mode">
      {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
      <a href="#" @click.prevent="toggleMode">{{ isLogin ? 'Sign Up' : 'Sign In' }}</a>
    </p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { auth } from '../services/firebase';
import {
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const isLogin = ref(true);
    const router = useRouter();

    const submitForm = async () => {
      try {
        if (isLogin.value) {
          await signInWithEmailAndPassword(auth, email.value, password.value);
        } else {
          await createUserWithEmailAndPassword(auth, email.value, password.value);
        }
        router.push('/');
      } catch (error) {
        alert(error.message);
      }
    };

    const toggleMode = () => {
      isLogin.value = !isLogin.value;
    };

    const signInWithGoogle = async () => {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        router.push('/');
      } catch (error) {
        console.error('Google sign-in error:', error);
        alert(error.message);
      }
    };

    return { email, password, isLogin, submitForm, toggleMode, signInWithGoogle };
  }
}
</script>

<style scoped>
.auth-form {
  max-width: 300px;
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

input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.primary-btn, .google-btn {
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.primary-btn {
  background-color: #007bff;
  color: white;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  color: #757575;
  border: 1px solid #ddd;
  margin-top: 15px;
}

.google-btn img {
  width: 18px;
  margin-right: 10px;
}

.toggle-mode {
  text-align: center;
  margin-top: 15px;
}

.toggle-mode a {
  color: #007bff;
  text-decoration: none;
}
</style>