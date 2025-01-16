import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  username: "",
  role: "",
  centro: "",
  userId: "",
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
      state.userId= "";
    },
    setCentroSalud: (state, action) => {
      state.centro = action.payload.centro;
    },
    setUserId: (state,action) => {
      state.userId = action.payload.userId;
    },
  },
});

export const { setUser, clearUser, setCentroSalud, setUserId} = userSlice.actions;
export default userSlice.reducer;
