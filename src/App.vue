<template>
  <div id="app">
    <nav class="navbar">
      <div class="navbar-left">
        <router-link to="/" class="nav-logo">Haiku Harmony</router-link>
      </div>
      <div class="navbar-center">
        <router-link to="/hall-of-fame" class="nav-link">Hall Of Fame</router-link>
        <router-link to="/submit" class="nav-link">Create a Haiku</router-link>
        <router-link to="/about" class="nav-link">About</router-link>
      </div>
      <div class="navbar-right">
        <template v-if="user">
          <div class="account-dropdown" @click="toggleDropdown">
            <ProfileImage v-if="user.photoURL" :src="user.photoURL" />
            <span v-else class="account-icon">👤</span>
            <div v-if="showDropdown" class="dropdown-content">
              <span>{{ user.displayName || user.email }}</span>
              <a href="#" @click.prevent="logout">Logout</a>
            </div>
          </div>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link">Sign In</router-link>
        </template>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { auth } from './services/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const user = ref(null);
    const router = useRouter();
    const showDropdown = ref(false);

    const logout = async () => {
      try {
        await signOut(auth);
        alert('Logged out successfully');
        router.push('/');
      } catch (error) {
        console.error('Logout error:', error);
      }
    };

    const toggleDropdown = () => {
      showDropdown.value = !showDropdown.value;
    };

    onMounted(() => {
      auth.onAuthStateChanged(currentUser => {
        user.value = currentUser;
      });
    });

    return { user, logout, showDropdown, toggleDropdown };
  }
}
</script>

<style scoped>
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #f8f8f8;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.navbar-left, .navbar-center, .navbar-right {
  display: flex;
  align-items: center;
}

.nav-logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
}

.nav-link {
  margin: 0 1rem;
  color: #333;
  text-decoration: none;
}

.account-dropdown {
  position: relative;
  cursor: pointer;
}

.account-icon {
  font-size: 1.5rem;
}

.dropdown-content {
  position: absolute;
  right: 0;
  background-color: #f9f9f9;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
  padding: 0.5rem;
}

.dropdown-content span {
  display: block;
  padding: 0.5rem 0;
}

.dropdown-content a {
  color: #333;
  text-decoration: none;
  display: block;
  padding: 0.5rem 0;
}

.dropdown-content a:hover {
  background-color: #f1f1f1;
}
</style>