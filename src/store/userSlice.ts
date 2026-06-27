import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  user_id: number | null;
  group: string | null;
}

const initialState: UserState = {
  user_id: localStorage.getItem("user_id")
    ? parseInt(localStorage.getItem("user_id") as string, 10)
    : null,
  group: localStorage.getItem("group") ?? null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserId: (state, action: PayloadAction<number>) => {
      state.user_id = action.payload;
      localStorage.setItem("user_id", action.payload.toString());
    },
    clearUserId: (state) => {
      state.user_id = null;
      localStorage.removeItem("user_id");
    },
    setGroup: (state, action: PayloadAction<string>) => {
      state.group = action.payload;
      localStorage.setItem("group", action.payload);
    },
    clearGroup: (state, action: PayloadAction<string>) => {
      state.group = null;
      localStorage.removeItem("group");
    },
  },
});

export const { setUserId, clearUserId, setGroup, clearGroup } =
  userSlice.actions;

export default userSlice.reducer;
