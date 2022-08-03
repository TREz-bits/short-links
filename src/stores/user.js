import { defineStore } from "pinia";
import { auth } from "../firebaseConfig";
import {createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useDatabaseStore } from "./database";
import router from "../router/router"

export const useUserStore = defineStore('userStore', {
  state: () => ({
    userData: null,
    loadingUser: false,
    loadingSession: false,
  }),
  getters: {
    minuscula(state) {
      return state.userData.toLowerCase();
    }
  },
  actions: {
    async registerUser(email, password) {
      try {
        this.loadingUser = true;
        const {user} = await createUserWithEmailAndPassword(auth, email, password);
        this.userData = {
          email: user.email,
          uid: user.uid,
        }
        router.push('/');
      } catch (error) {
        return error.code
      } finally {
        this.loadingUser = false
      }
    },
    async loginUser(email, password) {
      try {
        this.loadingUser = true;
        const {user} = await signInWithEmailAndPassword (auth,email, password)
        this.userData = {
          email: user.email,
          uid: user.uid,
        }
        router.push('/');
      } catch (error) {
        return error.code
      } finally {
        this.loadingUser = false
      }
    },
    async logOutUser() {
      const store = useDatabaseStore()
      store.$reset()
      try {
        this.loadingUser = true;
        await signOut(auth);
        this.userData = null;
        router.push('/login');
      } catch (error) {
        console.log(error);
      } finally {
        this.loadingUser = false
      }
    },
    currentUser() {
      return new Promise((resolve, reject) => {
        const unsuscribe = onAuthStateChanged(auth ,(user) => {
          if (user) {
            this.userData = {
              email: user.email,
              uid: user.uid,
            }
          } else {
            this.userData = null
          }
          resolve(user)
        }, e => reject(e))
        unsuscribe()
      })
    }
  }
})