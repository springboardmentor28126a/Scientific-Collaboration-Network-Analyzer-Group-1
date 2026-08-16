// SCNA Version 2 - Notifications Module (Vanilla JS)

document.addEventListener("DOMContentLoaded", () => {
    initNotifications();
});

async function initNotifications() {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const notifBadge = document.getElementById("notifBadge");
    const notifList = document.getElementById("notifList");
    const markAllBtn = document.getElementById("markAllReadBtn");

    async function fetchUnreadCount() {
        try {
            const res = await fetch("/notifications/unread-count", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.unread_count > 0) {
                    notifBadge.textContent = data.unread_count;
                    notifBadge.classList.remove("d-none");
                } else {
                    notifBadge.classList.add("d-none");
                }
            }
        } catch (e) {
            console.error("Error fetching notification count:", e);
        }
    }

    async function fetchNotifications() {
        try {
            const res = await fetch("/notifications/?limit=5", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const notifications = await res.json();
                if (!notifications || notifications.length === 0) {
                    notifList.innerHTML = `<li class="dropdown-item text-muted text-center py-2" style="font-size: 0.85rem;">No notifications</li>`;
                    return;
                }

                notifList.innerHTML = notifications.map(n => `
                    <li class="dropdown-item p-2 border-bottom ${n.is_read ? 'opacity-75' : 'bg-light'}" style="white-space: normal; cursor: pointer;" onclick="markSingleRead(${n.id})">
                        <div class="d-flex justify-content-between align-items-center">
                            <strong class="text-dark" style="font-size: 0.85rem;">${escapeHtml(n.title)}</strong>
                            <small class="text-muted" style="font-size: 0.7rem;">${n.is_read ? 'Read' : 'New'}</small>
                        </div>
                        <p class="mb-0 text-secondary" style="font-size: 0.8rem;">${escapeHtml(n.message)}</p>
                    </li>
                `).join("");
            }
        } catch (e) {
            console.error("Error fetching notifications list:", e);
        }
    }

    if (markAllBtn) {
        markAllBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            try {
                const res = await fetch("/notifications/read-all", {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    fetchUnreadCount();
                    fetchNotifications();
                }
            } catch (err) {
                console.error("Failed to mark notifications read:", err);
            }
        });
    }

    window.markSingleRead = async function(id) {
        try {
            await fetch(`/notifications/${id}/read`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            fetchUnreadCount();
            fetchNotifications();
        } catch (err) {
            console.error("Failed to mark single read:", err);
        }
    };

    fetchUnreadCount();
    fetchNotifications();
}

function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/[&<>"']/g, function(m) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[m];
    });
}
