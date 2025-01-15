import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isLoggedIn: false,
  username: "",
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
    },
    clearUser: (state) => {
      state.isLoggedIn = false;
      state.username = "";
      state.userId = "";
      state.objetivoId = "";
    },
    setUserId: (state, action) => {
      state.userId = action.payload.userId;
    },
    setObjetivoId: (state, action) => {
      state.objetivoId = action.payload.objetivoId;
  },
  
}
});

export const { setUser, clearUser, setUserId, setObjetivoId} = userSlice.actions;
export default userSlice.reducer;
