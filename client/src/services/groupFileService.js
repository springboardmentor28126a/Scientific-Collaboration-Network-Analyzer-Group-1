import API from "./api";

export const getGroupFiles = async (groupId) => {
    const res = await API.get(`/group-files/group/${groupId}`);
    return res.data;
};

export const uploadGroupFile = async (groupId, file) => {
    const formData = new FormData();

    formData.append("file", file);

    const res = await API.post(
        `/group-files/upload/${groupId}`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return res.data;
};

export const downloadGroupFile = async (fileId) => {
    const res = await API.get(`/group-files/download/${fileId}`);
    return res.data.download_url;
};

export const deleteGroupFile = async (fileId) => {
    return API.delete(`/group-files/${fileId}`);
};