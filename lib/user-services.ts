import axios from 'axios';

const API_URL = 'http://localhost:5001/api/users'; // We need to add this to the server

export const getAllUsers = async () => {
  // Normally requires Admin token
  try {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.map((user: any) => ({
      id: user._id,
      ...user
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

export const updateUserRole = async (uid: string, newRole: "patient" | "admin" | "receptionist") => {
  try {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    await axios.put(`${API_URL}/${uid}/role`, { role: newRole }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    console.error("Error updating user role:", error);
  }
};
