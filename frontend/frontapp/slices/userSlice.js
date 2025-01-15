import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  username: "",
  role: "",
  centro: "",
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
    },
    setCentroSalud: (state, action) => {
      state.centro = action.payload.centro;
    },
  },
});

export const { setUser, clearUser, setCentroSalud} = userSlice.actions;
export default userSlice.reducer;
