import { ListFilter } from "../../types/table";
import axios from "axios";
import { UpdateNotification } from "../../types/notification.ts";

export const getNotification = async (notification_id: number) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/get-notification/${notification_id}`;
  const token = localStorage.getItem("jwtToken");

  return await axios.get(url, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getNotificationList = async (filter: ListFilter) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/notification-list`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, filter, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addNotification = async (notification: Notification) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/add-invoice`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, notification, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateInvoice = async (invoice: UpdateNotification) => {
  const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/update-invoice`;
  const token = localStorage.getItem("jwtToken");

  return await axios.post(url, invoice, {
    headers: {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};
