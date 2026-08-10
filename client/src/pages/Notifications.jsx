import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Pagination from "../components/Pagination";
import { getAuthUser } from "../utils/authStorage";

function Notifications() {

    const navigate = useNavigate();
    const user = getAuthUser();

    const [requests, setRequests] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [notificationPage, setNotificationPage] = useState(1);
    const notificationPageSize = 8;
    const [search, setSearch] = useState("");
    const [readFilter, setReadFilter] = useState("all");
    const [sort, setSort] = useState("newest");

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

    const markAllRead = async () => {
        try {
            await api.put("/dashboard/notifications/read-all");
            setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
        } catch (error) {
            console.error(error);
        }
    };

    const removeNotification = async (id) => {
        try {
            await api.delete(`/dashboard/notifications/${id}`);
            setNotifications((current) => current.filter((notification) => notification.id !== id));
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

    const openNotification = async (notification) => {
        if (!notification.is_read) await markRead(notification.id);
        const routes = {
            publication: `/publication/${notification.resource_id}`,
            conference: `/conference/${notification.resource_id}`,
            verification: "/verification",
            group_invitation: "/invitations",
            research_group: `/groups/${notification.resource_id}`,
            meeting: "/groups",
            friend_request: "/collaborations",
            user: `/researcher/${notification.resource_id}`,
        };
        navigate(routes[notification.resource_type] || "/notifications");
    };

    const filteredNotifications = [...notifications]
        .filter((notification) => {
            const matchesText = `${notification.title} ${notification.message}`.toLowerCase().includes(search.toLowerCase());
            const matchesRead = readFilter === "all" || (readFilter === "read" ? notification.is_read : !notification.is_read);
            return matchesText && matchesRead;
        })
        .sort((a, b) => sort === "oldest"
            ? new Date(a.created_at) - new Date(b.created_at)
            : new Date(b.created_at) - new Date(a.created_at));
    const notificationPageCount = Math.max(1, Math.ceil(filteredNotifications.length / notificationPageSize));
    const paginatedNotifications = filteredNotifications.slice((notificationPage - 1) * notificationPageSize, notificationPage * notificationPageSize);

    return (

        <div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                <h1>Notifications</h1>
                <button type="button" onClick={markAllRead}>Mark all as read</button>
            </div>

            <div className="page-toolbar">
                <input className="search-input" placeholder="Search notifications" value={search} onChange={(event) => { setSearch(event.target.value); setNotificationPage(1); }} />
                <select className="filter-select" value={readFilter} onChange={(event) => { setReadFilter(event.target.value); setNotificationPage(1); }}><option value="all">All notifications</option><option value="unread">Unread</option><option value="read">Read</option></select>
                <select className="filter-select" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select>
            </div>

            {paginatedNotifications.map((notification) => (
                <div
                    key={notification.id}
                    onClick={() => openNotification(notification)}
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
                    <button type="button" onClick={(event) => { event.stopPropagation(); removeNotification(notification.id); }} style={{ marginLeft: "12px" }}>Delete</button>

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
            <Pagination page={Math.min(notificationPage, notificationPageCount)} pageCount={notificationPageCount} onChange={setNotificationPage} />

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

    {request.sender_name}

</h3>

                       <p>

    {request.institution || "Institution not added"}

</p>

<p>

    {request.department || "Department not added"}

</p>

<p>

    {request.research_interest || "Research interests not added"}

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
