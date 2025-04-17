import axios from "axios";

const URL = "http://localhost:8000";

export const GetAlerts = async () => {
  try {
    const response = await axios.get(`${URL}/alerts`);
    return response.data;
  } catch (error) {
    console.error("Error fetching alerts:", error);
  }
};
export const UpdateAlerts = async (id, threshold) => {
  try {
    const response = await axios.put(`${URL}/alerts/${id}/update-threshold`, {
      threshold,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating alert:", error);
  }
};
