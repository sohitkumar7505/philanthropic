import axios from "axios";

const API = axios.create({
  baseURL: "https://philanthropic-lotter.onrender.com/api",
});

// attach token
API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }

  return req;
});

export default API;