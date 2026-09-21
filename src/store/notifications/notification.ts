import { createAsyncThunk } from "@reduxjs/toolkit";
import { Notification, UpdateNotification } from "../../types/notification.ts";
import axios from "axios";

export const saveNotifications = createAsyncThunk(
  "notifications/save",
  async (data: Notification[], thunkAPI) => {
    try {
      const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/insert-notification`;
      const token = localStorage.getItem("jwtToken");

      await axios.post(url, data, {
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

export const updateNotifications = createAsyncThunk(
  "notifications/update",
  async (
    {
      notification_id,
      data,
    }: { notification_id: number; data: UpdateNotification },
    thunkAPI,
  ) => {
    try {
      const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-notification/${notification_id}`;
      const token = localStorage.getItem("jwtToken");

      await axios.post(url, data, {
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

export const markAllNotifsAsRead = createAsyncThunk(
  "notifications/mark-all-as-read",
  async (_, thunkAPI) => {
    try {
      const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/mark-all-as-read`;
      const token = localStorage.getItem("jwtToken");

      await axios.patch(url, null, {
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
