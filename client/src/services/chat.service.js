import axiosInstance from "../axios/axiosInstance";

// Fetch Roles
export const chatWithGemini = async (prompt, setLoading) => {
  try {
    setLoading(true);
    const { data } = await axiosInstance.post("/insights/chat", { prompt });
    return data;
  } catch (error) {
    console.error(error);
    // rejectWithValue isn't available here (not in createAsyncThunk context).
    // Throw an Error so callers can handle it via .catch()
    throw new Error(error.response?.data?.message || "Failed to chat");
  } finally {
    setLoading(false);
  }
};
