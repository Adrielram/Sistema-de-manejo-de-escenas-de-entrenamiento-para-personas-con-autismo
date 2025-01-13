"use client";
import { configureStore } from "@reduxjs/toolkit";
import userReducer from '../slices/userSlice';
import { persistStore, persistReducer } from 'redux-persist';
import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage'; // Usa localStorage
import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
const persistConfig = {
  key: 'root', // Clave principal para almacenar el estado
  storage, // Usa localStorage para persistir el estado
};
const rootReducer = combineReducers({
  user: userReducer,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);
// Crear el store
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['register'], // Si sabes que es seguro ignorar estas claves
      },
    }),
});

// Exporta el store y el persistor
export const persistor = persistStore(store);



// Tipo del estado global
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;