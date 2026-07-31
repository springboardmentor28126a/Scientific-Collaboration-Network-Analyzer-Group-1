import API from "./api";

export const createGroup = async (group) => {

    const res = await API.post(
        "/groups/create",
        group
    );

    return res.data;

};

export const updateGroup = async (groupId, groupData) => {

    const res = await API.put(
        `/groups/${groupId}`,
        {
            name: groupData.name,
            description: groupData.description,
            visibility: groupData.visibility
        },
        {
            params: {
                requester_id: groupData.requester_id
            }
        }
    );

    return res.data;

};
export const deleteGroup = async (groupId, requesterId) => {
    const res = await API.delete(
        `/groups/${groupId}`,
        {
            params: {
                requester_id: requesterId
            }
        }
    );

    return res.data;
};
export const leaveGroup = async (groupId, userId) => {

    const res = await API.delete(
        `/groups/${groupId}/leave/${userId}`
    );

    return res.data;

};