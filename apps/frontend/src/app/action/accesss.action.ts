import axios from "axios";

export const getAccess = async () => {
  try {
    const res = await axios.get(`${process.env.LOGIN_API_URL}/mypermission`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("smartsite-auth")}`,
      },
    });
    if (res.status === 200) {
      return Promise.resolve({
        status: res.status,
        data: res.data.permissions,
      });
    }
    return res.data.permissions || [];
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return Promise.resolve({
      status: error?.response.status,
      data: error?.response?.data?.message,
    });
  }
};
