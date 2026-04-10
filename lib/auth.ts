import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
const API_URL = `${API_BASE_URL}/api/auth`;

export interface UserData {
  _id: string; // Used by MongoDB instead of uid
  uid: string; // Legacy fallback
  email: string;
  fullName: string;
  age: number;
  phone?: string;
  role?: "admin" | "receptionist" | "patient";
  isAvailableOnline?: boolean;
  token?: string;
}

export const registerUser = async (email: string, password: string, fullName: string, age: number, phone?: string) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      email,
      password,
      fullName,
      age,
      phone,
    });
    
    if (response.data.token) {
      document.cookie = `token=${response.data.token}; path=/`;
    }
    return { user: { uid: response.data._id, ...response.data }, userData: response.data };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data.token) {
      document.cookie = `token=${response.data.token}; path=/`;
    }
    return { uid: response.data._id, ...response.data };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

export const logoutUser = async () => {
  try {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserData = async (token: string): Promise<UserData | null> => {
  try {
    const response = await axios.get(`${API_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return { uid: response.data._id, ...response.data };
  } catch (error: any) {
    return null;
  }
};