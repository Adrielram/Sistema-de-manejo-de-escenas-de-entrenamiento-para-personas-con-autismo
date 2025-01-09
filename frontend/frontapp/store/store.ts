"use client";
import { configureStore } from "@reduxjs/toolkit";
import userReducer from '../slices/userSlice';

// Crear el store
const store = configureStore({
  reducer: {
    user: userReducer, // Aquí agregamos nuestro slice
  },
});


// Tipo del estado global
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;