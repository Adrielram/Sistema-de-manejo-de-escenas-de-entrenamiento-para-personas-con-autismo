import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  username: "",
  role: "",
  centro: "",
  objetivoId: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.isLoggedIn = action.payload.loggedIn;
      state.username = action.payload.username;
      state.role=action.payload.role;
      state.centro=action.payload.centro;
    },
    clearUser: (state) => {
      state.isLoggedIn = false;
      state.username = "";
      state.role="";
      state.centro="";
      state.objetivoId="";
    },
    setCentroSalud: (state, action) => {
      state.centro = action.payload.centro;
    },
    setObjetivoId: (state, action) => {
      state.objetivoId = action.payload.objetivoId;
    }
  },
});

export const { setUser, clearUser, setCentroSalud, setObjetivoId} = userSlice.actions;
export default userSlice.reducer;
