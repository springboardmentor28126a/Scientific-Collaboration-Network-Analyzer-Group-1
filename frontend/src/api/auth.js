import axiosClient from "./axios";

export const registerUser = (data) =>{
    return axiosClient.post("/users/register",data);
};

export const loginUser = (email,password) =>{
    const formData = new URLSearchParams();
    formData.append("username",email);
    formData.append("password",password);

    return axiosClient.post("/users/login", formData, {
        headers: {"Content-Type":"application/x-www-form-urlencoded"},
    });
};

export const getCurrentUser = () =>{
    return axiosClient.get("/users/me");
};

export const logoutUser = ()=>{
    localStorage.removeItem("token");
};