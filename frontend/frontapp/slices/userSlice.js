import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  username: "",
  role: "",
  centro: "",
  objetivoId: "",
  idEscena: ""
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.isLoggedIn = action.payload.loggedIn;
      state.username = action.payload.username;
      state.role=action.payload.role;
    },
    clearUser: (state) => {
      state.isLoggedIn = false;
      state.username = "";
      state.role="";
      state.centro="";
      state.objetivoId="";
      state.idEscena="";
    },
    setCentroSalud: (state, action) => {
      state.centro = action.payload.centro;
    },
    setObjetivoId: (state, action) => {
      state.objetivoId = action.payload.objetivoId;
    },
    setIdEscena: (state, action) => {
      state.idEscena = action.payload.idEscena;
    } 
  }
});

export const { setUser, clearUser, setCentroSalud, setObjetivoId, setIdEscena} = userSlice.actions;
export default userSlice.reducer;
