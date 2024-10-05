import { defineStore } from 'pinia';
import { auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
  }),
  actions: {
    init() {
      onAuthStateChanged(auth, (user) => {
        this.user = user;
      });
    },
  },
});