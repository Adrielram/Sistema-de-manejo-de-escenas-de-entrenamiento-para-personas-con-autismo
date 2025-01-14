"use client";
import { configureStore } from "@reduxjs/toolkit";
import userReducer, { clearUser, setUser } from '../slices/userSlice';
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
// Verificar la cookie JWT y actualizar el estado de Redux
const verifySession = async () => {
  try {
    const response = await fetch("http://localhost:8000/api/verify-session/", {
      method: "GET",
      credentials: "include", // Esto envía las cookies al backend
    });

    if (response.ok) {
      const data = await response.json();
      store.dispatch(
        setUser({
          username: data.username,
          role: data.role,
          loggedIn: true,
        })
      );
    } else {
      store.dispatch(clearUser()); // Limpia el estado si la cookie no es válida
    }
  } catch (error) {
    console.error("Error al verificar la sesión:", error);
    store.dispatch(clearUser());
  }
};

// Crear el persistor y verificar la cookie durante el rehydrate
export const persistor = persistStore(store, null, () => {
  verifySession(); // Verificar la cookie después de rehidratar el estado
});
// Tipo del estado global
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;