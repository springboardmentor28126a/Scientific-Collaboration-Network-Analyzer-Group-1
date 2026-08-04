import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Notifications() {

    const navigate = useNavigate();
    const user = JSON.parse(
        localStorage.getItem("user")
    );

    const [requests, setRequests] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {

        loadRequests();
        loadNotifications();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadRequests = async () => {
        try {
            const response = await api.get(`/friends/requests/${user.id}`);
            setRequests(response.data);
        } catch (error) {
            console.error(error);
        }

    };

    const loadNotifications = async () => {
        try {
            const response = await api.get("/dashboard/notifications");
            setNotifications(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const accept = async (id) => {

        await api.put(

            `/friends/accept/${id}`

        );

        loadRequests();

    };

    const reject = async (id) => {

        await api.put(

            `/friends/reject/${id}`

        );

        loadRequests();

    };

    const markRead = async (id) => {
        try {
            await api.put(`/dashboard/notifications/${id}/read`);
            setNotifications((current) => current.map((notification) => (
                notification.id === id ? { ...notification, is_read: true } : notification
            )));
        } catch (error) {
            console.error(error);
        }
    };

    const reviewPublication = async (notification, decision) => {
        const comments = window.prompt(
            decision === "approve"
                ? "Approval comments (optional)"
                : "Rejection reason",
            ""
        );

        if (comments === null) return;

        try {
            await api.put(
                `/reviewer/${decision}/${notification.resource_id}`,
                { review_comments: comments }
            );
            await markRead(notification.id);
            loadNotifications();
        } catch (error) {
            alert(error.response?.data?.detail || "Unable to submit the review.");
        }
    };

    return (

        <div>

            <h1>

                Notifications

            </h1>

            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    onClick={() => !notification.is_read && markRead(notification.id)}
                    style={{
                        background: "rgba(255,255,255,0.06)",
                        padding: "20px",
                        borderRadius: "10px",
                        marginBottom: "15px",
                        opacity: notification.is_read ? 0.7 : 1,
                        cursor: notification.is_read ? "default" : "pointer",
                    }}
                >
                    <h3>{notification.title}</h3>
                    <p>{notification.message}</p>
                    <small>{new Date(notification.created_at).toLocaleString()}</small>

                    {notification.notification_type === "publication_review_request" &&
                        !notification.is_read && (
                            <div style={{ marginTop: "12px" }}>
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        reviewPublication(notification, "approve");
                                    }}
                                >
                                    Accept
                                </button>
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        navigate(`/publications?publication=${notification.resource_id}`);
                                    }}
                                    style={{ marginLeft: "10px" }}
                                >
                                    View Publication
                                </button>
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        reviewPublication(notification, "reject");
                                    }}
                                    style={{ marginLeft: "10px" }}
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                </div>
            ))}

            {

                requests.length === 0 ?

                (

                    <h3>

                        No Requests

                    </h3>

                )

                :

                requests.map((request) => (

                    <div

                        key={request.request_id}

                        style={{

                            background: "rgba(255,255,255,0.06)",

                            padding: "20px",

                            borderRadius: "10px",

                            marginBottom: "15px"

                        }}

                    >

                        <h3>

    👤 {request.sender_name}

</h3>

                       <p>

    🏫 {request.institution || "Institution not added"}

</p>

<p>

    💻 {request.department || "Department not added"}

</p>

<p>

    🔬 {request.research_interest || "Research interests not added"}

</p>

<p>

    wants to collaborate with you.

</p> 

                        <p>

                            Status :
                            {" "}
                            {request.status}

                        </p>

                        {

                            request.status === "Pending" && (

                                <>
<button

    onClick={() =>

        navigate(`/researcher/${request.sender_id}`)

    }

>

    View Profile

</button>
                                    <button

                                        onClick={() =>

                                            accept(request.request_id)

                                        }

                                    >

                                        Accept

                                    </button>

                                    <button

                                        onClick={() =>

                                            reject(request.request_id)

                                        }

                                        style={{

                                            marginLeft: "10px"

                                        }}

                                    >

                                        Reject

                                    </button>

                                </>

                            )

                        }

                    </div>

                ))

            }

        </div>

    );

}

export default Notifications;
