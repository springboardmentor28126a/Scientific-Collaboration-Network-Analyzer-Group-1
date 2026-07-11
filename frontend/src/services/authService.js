import api from "./api";

// --------------------------------------
// LOGIN
// --------------------------------------

export const loginUser = async (credentials) => {

    const response = await api.post(
        "/auth/login",
        credentials
    );

    return response.data;

};

// --------------------------------------
// PUBLIC REGISTER
// --------------------------------------

export const registerUser = async (userData) => {

    const response = await api.post(
        "/users/register",
        userData
    );

    return response.data;

};