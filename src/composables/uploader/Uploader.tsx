import axios from "axios";

export const getSignedUrl = async () => {
    const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/api/get-signed-url`;
    const token = localStorage.getItem("jwtToken");

    return await axios.get(url, {
        headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });
};

export const uploadFile = async (shipmentProcessId: number, file: File, uploadUrl: string) => {
    const url = `${import.meta.env.VITE_REACT_APP_GOLANG_URL}/api${uploadUrl}`;
    const token = localStorage.getItem("jwtToken");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("shipmentProcessId", shipmentProcessId);

    return await axios.post(url, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
