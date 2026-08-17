import axios from "axios";

const API = "http://127.0.0.1:8000/collaboration";

export const getNetwork = async () => {
    const response = await axios.get(`${API}/network`);
    return response.data;
};

export const getPaperResearchers = async (paperId) => {
    const response = await axios.get(`${API}/paper/${paperId}`);
    return response.data;
};

export const assignResearchers = async (paperId, researcherIds) => {
    const response = await axios.post(
        `${API}/assign?paper_id=${paperId}`,
        researcherIds
    );

    return response.data;
};