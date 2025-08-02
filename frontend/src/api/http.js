import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://user-management-backend-dec0.onrender.com/api",
  withCredentials: true,
});

export default axiosInstance;
