import { createAsyncThunk } from "@reduxjs/toolkit";
import { notification } from "../../types/notification.ts";
import axios from "axios";

export const saveNotifications = createAsyncThunk(
  "notifications/save",
  async (data: notification[], thunkAPI) => {
    try {
      const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/insert-notification`;
      const token = localStorage.getItem("jwtToken");

      return await axios.post(url, data, {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  },
);
