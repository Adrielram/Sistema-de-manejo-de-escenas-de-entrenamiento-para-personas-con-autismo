import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  username: "",
  role: "",
  center: "",
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
    },
    setCenter: (state, action) => {
      state.center = action.payload.center;
    },
  },
});

export const { setUser, clearUser, setCenter} = userSlice.actions;
export default userSlice.reducer;
