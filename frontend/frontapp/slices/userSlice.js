import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  username: "",
  role: "",
  center: "",  
  userId: "",
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
    },
    clearUser: (state) => {
      state.isLoggedIn = false;
      state.username = "";
      state.role="";
      state.center="";
      state.userId= "";
      state.objetivoId = "";
    },

    setCenter: (state, action) => {
      state.center = action.payload.center;
    },
    setUserId: (state,action) => {
      state.userId = action.payload.userId;
    },
    setObjetivoId: (state, action) => {
      state.objetivoId = action.payload.objetivoId;
  },
  
}
});

export const { setUser, clearUser, setCenter, setUserId, setObjetivoId} = userSlice.actions;
export default userSlice.reducer;
