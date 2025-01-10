"use client";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import store ,{persistor} from "../store/store";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Cargando...</div>} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}