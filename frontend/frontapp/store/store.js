// src/store.js
import { configureStore } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";
import userReducer from '../slices/userSlice';

export function makeStore() {
  return configureStore({
    reducer: {
      user: userReducer, // Tus reducers van aquí
    },
  });
}

// Crea el wrapper
export const wrapper = createWrapper(makeStore);