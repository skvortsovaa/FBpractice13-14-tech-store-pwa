import axios from "axios";

const baseURL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/api/auth/login") &&
      !originalRequest.url?.includes("/api/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("Нет refresh token");
        }

        const { data } = await axios.post(`${baseURL}/api/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem("accessToken", data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("role");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  login: async (email, password) => {
    const { data } = await apiClient.post("/api/auth/login", { email, password });

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("role", data.user.role);

    return data;
  },

  register: async (email, password) => {
    const { data } = await apiClient.post("/api/auth/register", { email, password });
    return data;
  },

  getMe: async () => {
    const { data } = await apiClient.get("/api/auth/me");
    return data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      await apiClient.post("/api/auth/logout", { refreshToken });
    } catch (error) {
      console.error(error);
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("role");
  },

  getProducts: async () => {
    const { data } = await apiClient.get("/api/products");
    return data;
  },

  getProductById: async (id) => {
    const { data } = await apiClient.get(`/api/products/${id}`);
    return data;
  },

  createProduct: async (payload) => {
    const { data } = await apiClient.post("/api/products", payload);
    return data;
  },

  updateProduct: async (id, payload) => {
    const { data } = await apiClient.patch(`/api/products/${id}`, payload);
    return data;
  },

  deleteProduct: async (id) => {
    return apiClient.delete(`/api/products/${id}`);
  },
};
