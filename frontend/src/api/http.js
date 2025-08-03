import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://user-management-backend-dec0.onrender.com",
  withCredentials: true,
});

export default axiosInstance;
