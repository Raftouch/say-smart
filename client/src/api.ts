import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:1252",
});

export default api;
