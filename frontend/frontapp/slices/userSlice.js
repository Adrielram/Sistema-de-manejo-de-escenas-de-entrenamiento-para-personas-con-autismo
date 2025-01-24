import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  username: "",
  role: "",
  center: "",
  objetivoId: "",
  idEscena: "",
  userId: "",
  objetivoId: "",
  hijoNombre: "",
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
      state.center="";
      state.objetivoId="";
      state.idEscena="";
      state.userId= "";
      state.objetivoId = "";
      state.hijoNombre = "";
    },
    setCenter: (state, action) => {
      state.center = action.payload.center;
    },
    setObjetivoId: (state, action) => {
      state.objetivoId = action.payload.objetivoId;
    },
    setUserId: (state,action) => {
      state.userId = action.payload.userId;
    },
    setObjetivoId: (state, action) => {
      state.objetivoId = action.payload.objetivoId;
    },
    setIdEscena: (state, action) => {
      state.idEscena = action.payload.idEscena;
    },
    setHijoNombre(state, action) {
      state.hijoNombre = action.payload.hijoNombre;
    },
  },
});

export const { setUser, clearUser , setCenter, setUserId, setObjetivoId, setIdEscena,setHijoNombre} = userSlice.actions;
export default userSlice.reducer;
