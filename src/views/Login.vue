<template>
    <div>
      <h2>Login or Sign Up</h2>
      <AuthForm />
    </div>
  </template>

  <script>
  import AuthForm from '../components/AuthForm.vue';

  export default {
    components: {
      AuthForm
    }
  }
  </script>