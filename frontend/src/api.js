import axios from "axios"
import { jwtDecode } from "jwt-decode";

// export const BASE_URL = "http://127.0.0.1:8000"

export const BASE_URL = import.meta.env.VITE_BASE_URL || "http://127.0.0.1:8000"

const api = axios.create({
    baseURL: BASE_URL
})

api.interceptors.request.use(
    (config) => {
        const access_token = localStorage.getItem("access_token")
        if (access_token){
            // Do not send Authorization headers for public authentication endpoints
            const publicEndpoints = ["signup/", "login/", "token/"];
            const isPublic = publicEndpoints.some(endpoint => 
                config.url && (config.url.endsWith(endpoint) || config.url.includes("/" + endpoint))
            );

            if (!isPublic) {
                const decode = jwtDecode(access_token)
                const expiry = decode.exp
                const current_time = Date.now()/1000
                if (expiry > current_time){
                    config.headers.Authorization = `Bearer ${access_token}`
                }
            }
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Automatically clear stale tokens from localStorage if a 401 occurs
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
        }
        return Promise.reject(error);
    }
)

export default api