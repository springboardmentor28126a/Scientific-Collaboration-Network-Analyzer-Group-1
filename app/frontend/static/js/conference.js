// =========================================================================
// SCNA - Conference Module
// =========================================================================

const CONF_PAGE_SIZE = 6;

let confCurrentPage = 1;
let editingConferenceId = null;
let editingParticipationId = null;


// ========================================================================
// COMMON HELPERS
// ========================================================================

function conferenceAuthHeaders(extra = {}) {
    const token = localStorage.getItem("access_token");

    return token
        ? {
            Authorization: `Bearer ${token}`,
            ...extra
        }
        : {
            ...extra
        };
}


async function conferenceApi(path, options = {}) {

    const response = await fetch(path, {
        headers: {
            "Content-Type": "application/json",
            ...conferenceAuthHeaders(),
            ...(options.headers || {})
        },
        ...options
    });

    if (!response.ok) {

        let message = "Request failed";

        try {
            const error = await response.json();
            message = error.detail || message;
        } catch {
            message = response.statusText;
        }

        const err = new Error(message);
        err.status = response.status;
        throw err;
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}


function confEscape(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function confDebounce(fn, delay = 350) {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(
            () => fn(...args),
            delay
        );
    };
}


function confFormToJson(form) {

    const data = Object.fromEntries(
        new FormData(form).entries()
    );

    const numericFields = [
        "conference_id",
        "researcher_id",
        "publication_id"
    ];

    for (const [key, value] of Object.entries(data)) {

        if (value === "") {

            data[key] = null;

        } else if (
            numericFields.includes(key)
        ) {

            data[key] = Number(value);
        }
    }

    return data;
}


function conferenceToast(
    title,
    message,
    type = "success"
) {

    if (typeof window.showToast === "function") {

        window.showToast(
            title,
            message,
            type
        );

    } else {

        alert(message);
    }
}


function conferenceSkeleton() {

    return `
        <div class="col-md-4">
            <div class="card h-100 placeholder-glow">
                <div class="card-body">
                    <h5 class="placeholder col-8"></h5>
                    <p class="placeholder col-10"></p>
                    <p class="placeholder col-7"></p>
                    <p class="placeholder col-6"></p>
                </div>
            </div>
        </div>
    `;
}


function conferenceStatusBadge(status) {

    const classes = {
        Upcoming: "bg-primary",
        Ongoing: "bg-success",
        Completed: "bg-secondary"
    };

    return `
        <span class="badge ${classes[status] || "bg-dark"}">
            ${confEscape(status || "Unknown")}
        </span>
    `;
}


// ========================================================================
// DATE HELPERS
// ========================================================================

function conferenceStatus(conf) {

    if (!conf.start_date) {
        return "Upcoming";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(conf.start_date);
    start.setHours(0, 0, 0, 0);

    if (conf.end_date) {

        const end = new Date(conf.end_date);
        end.setHours(0, 0, 0, 0);

        if (today < start) {
            return "Upcoming";
        }

        if (
            today >= start &&
            today <= end
        ) {
            return "Ongoing";
        }

        return "Completed";
    }

    return today < start
        ? "Upcoming"
        : "Completed";
}


function formatDate(value) {

    if (!value) {
        return "-";
    }

    try {

        return new Date(value)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

    } catch {

        return value;
    }
}


// ========================================================================
// STATISTICS
// ========================================================================

async function loadConferenceStats() {

    try {

        const stats = await conferenceApi(
            "/conferences/summary/stats"
        );

        const values = {
            confTotal:
                stats.total_conferences ?? 0,

            confOrganizers:
                stats.total_organizers ?? 0,

            confLocations:
                stats.total_locations ?? 0,

            confParticipants:
                stats.total_participants ?? 0,

            confUpcoming:
                stats.upcoming_conferences ?? 0,

            confOngoing:
                stats.ongoing_conferences ?? 0,

            confCompleted:
                stats.completed_conferences ?? 0,

            confPresenters:
                stats.total_presenters ?? 0
        };

        Object.entries(values)
            .forEach(([id, value]) => {

                const el =
                    document.getElementById(id);

                if (el) {
                    el.textContent = value;
                }
            });

    } catch (error) {

        conferenceToast(
            "Error",
            error.message,
            "error"
        );
    }
}


// ========================================================================
// CONFERENCE CARD
// ========================================================================

function renderConferenceCard(conf) {

    const status =
        conferenceStatus(conf);

    return `
        <div class="col-md-4 mb-3">

            <div class="card h-100 shadow-sm">

                <div class="card-body d-flex flex-column">

                    <div class="d-flex justify-content-between align-items-start gap-2">

                        <h5 class="card-title mb-2">
                            ${confEscape(conf.name)}
                        </h5>

                        ${conferenceStatusBadge(status)}

                    </div>

                    <p class="small text-muted mb-2">
                        ${confEscape(
                            conf.conference_type
                            || "Conference"
                        )}
                    </p>

                    <p class="card-text small mb-1">
                        <strong>Organizer:</strong>
                        ${confEscape(
                            conf.organizer || "-"
                        )}
                    </p>

                    <p class="card-text small mb-1">
                        <strong>Location:</strong>
                        ${confEscape(
                            conf.location || "-"
                        )}
                    </p>

                    <p class="card-text small mb-3">
                        <strong>Dates:</strong>
                        ${formatDate(conf.start_date)}
                        -
                        ${formatDate(conf.end_date)}
                    </p>

                    <div class="mt-auto d-flex flex-wrap gap-2">

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-dark"
                            onclick="window.viewConference(${conf.id})">
                            <i class="bi bi-eye me-1"></i>
                            View Details
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-primary"
                            onclick="window.registerForConference(${conf.id})">
                            <i class="bi bi-person-plus me-1"></i>
                            Register
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-secondary"
                            data-requires="conferences:edit"
                            onclick="window.editConference(${conf.id})">
                            Edit
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-danger"
                            data-requires="conferences:delete"
                            onclick="window.deleteConference(${conf.id})">
                            Delete
                        </button>

                    </div>

                </div>

            </div>

        </div>
    `;
}


// ========================================================================
// LOAD CONFERENCES
// ========================================================================

async function loadConferences(
    page = confCurrentPage
) {

    const container =
        document.getElementById("conferenceList");

    if (!container) {
        return;
    }

    // Store current page
    confCurrentPage = page;


    // ================================================================
    // READ FILTER VALUES
    // ================================================================

    const query =
        document.getElementById("confSearch")
            ?.value
            .trim() || "";

    const status =
        document.getElementById("confStatus")
            ?.value || "";

    const conferenceType =
        document.getElementById("confType")
            ?.value || "";

    const sortBy =
        document.getElementById("confSortBy")
            ?.value || "name";

    const order =
        document.getElementById("confSortOrder")
            ?.value || "asc";


    // ================================================================
    // SHOW LOADING STATE
    // ================================================================

    container.innerHTML =
        conferenceSkeleton().repeat(
            CONF_PAGE_SIZE
        );


    try {

        // ============================================================
        // BUILD QUERY PARAMETERS
        // ============================================================

        const params =
            new URLSearchParams({
                query: query,
                status: status,
                conference_type: conferenceType,
                sort_by: sortBy,
                order: order,
                page: String(page),
                limit: String(CONF_PAGE_SIZE)
            });


        // ============================================================
        // LOAD CONFERENCES
        // ============================================================

        const conferences =
            await conferenceApi(
                `/conferences/search/filter?${params.toString()}`
            );


        // ============================================================
        // PAGINATION ELEMENTS
        // ============================================================

        const prevBtn =
            document.getElementById(
                "confPrevPage"
            );

        const nextBtn =
            document.getElementById(
                "confNextPage"
            );

        const pageNum =
            document.getElementById(
                "confPageNum"
            );


        // ============================================================
        // PREVIOUS BUTTON
        // ============================================================

        if (prevBtn) {

            prevBtn.disabled =
                page <= 1;
        }


        // ============================================================
        // NEXT BUTTON
        // ============================================================

        if (nextBtn) {

            nextBtn.disabled =
                conferences.length < CONF_PAGE_SIZE;
        }


        // ============================================================
        // PAGE NUMBER
        // ============================================================

        if (pageNum) {

            pageNum.textContent =
                `Page ${page}`;
        }


        // ============================================================
        // NO RESULTS
        // ============================================================

        if (
            !Array.isArray(conferences) ||
            conferences.length === 0
        ) {

            container.innerHTML = `
                <div class="col-12">

                    <div class="text-center py-5 text-muted">

                        <i class="bi bi-calendar-x fs-1"></i>

                        <p class="mt-2 mb-0">
                            No conferences found.
                        </p>

                        <small>
                            Try changing your search or filters.
                        </small>

                    </div>

                </div>
            `;

            return;
        }


        // ============================================================
        // RENDER CONFERENCE CARDS
        // ============================================================

        container.innerHTML =
            conferences
                .map(
                    conference =>
                        renderConferenceCard(conference)
                )
                .join("");


        // ============================================================
        // APPLY ROLE-BASED PERMISSIONS
        // ============================================================

        if (
            typeof window.applyPermissionGating ===
            "function"
        ) {

            window.applyPermissionGating(
                container
            );
        }


    } catch (error) {

        console.error(
            "Conference loading error:",
            error
        );


        container.innerHTML = `
            <div class="col-12">

                <div class="alert alert-danger">

                    <div class="d-flex align-items-center">

                        <i class="bi bi-exclamation-triangle me-2"></i>

                        <div>

                            <strong>
                                Unable to load conferences
                            </strong>

                            <div class="small mt-1">
                                ${confEscape(
                                    error.message ||
                                    "Something went wrong."
                                )}
                            </div>

                        </div>

                    </div>

                </div>

            </div>
        `;


        conferenceToast(
            "Error",
            error.message ||
            "Unable to load conferences.",
            "error"
        );
    }
}

// ========================================================================
// CONFERENCE DETAILS
// ========================================================================

window.viewConference = async function (conferenceId) {

    window.showDetailsLoading?.("Conference Details");
    window.setDetailsModalWide?.(true);

    try {

        const details = await conferenceApi(
            `/conferences/${conferenceId}/details`
        );

        const modal = document.getElementById(
            "viewDetailsModal"
        );

        const title = document.getElementById(
            "viewDetailsTitle"
        );

        const body = document.getElementById(
            "viewDetailsBody"
        );

        const subtitle = document.getElementById(
            "viewDetailsSubtitle"
        );

        if (!modal || !title || !body) {

            throw new Error(
                "Conference details modal elements were not found."
            );
        }


        // ================================================================
        // MODAL TITLE
        // ================================================================

        title.textContent =
            details.name || "Conference Details";


        // ================================================================
        // SUBTITLE
        // ================================================================

        if (subtitle) {

            subtitle.style.display = "block";

            subtitle.textContent =
                `${details.status || "Unknown"} • ${
                    details.conference_type || "Conference"
                }`;
        }


        // ================================================================
        // PARTICIPANTS
        // ================================================================

        const participants =
            details.participants || [];


        let participantsHtml = "";


        if (participants.length === 0) {

            participantsHtml = `
                <div class="alert alert-light border mt-3 mb-0">
                    <i class="bi bi-people me-2"></i>
                    No participants registered for this conference.
                </div>
            `;

        } else {

            participantsHtml = `
                <div class="mt-4">

                    <div class="d-flex justify-content-between align-items-center mb-2">

                        <h6 class="mb-0 fw-bold">
                            <i class="bi bi-people me-1"></i>
                            Participants
                        </h6>

                        <span class="badge bg-dark">
                            ${participants.length}
                        </span>

                    </div>


                    <div class="table-responsive">

                        <table class="table table-sm table-bordered align-middle">

                            <thead class="table-light">

                                <tr>

                                    <th>Researcher</th>

                                    <th>Participation</th>

                                    <th>Status</th>

                                    <th>Presentation</th>

                                </tr>

                            </thead>


                            <tbody>

                                ${participants.map(
                                    participant => {

                                        return `

                                            <tr>

                                                <td>

                                                    <strong>
                                                        ${confEscape(
                                                            participant.researcher_name
                                                            || "Unknown"
                                                        )}
                                                    </strong>

                                                </td>


                                                <td>

                                                    <span class="badge bg-primary">

                                                        ${confEscape(
                                                            participant.participation_type
                                                            || "-"
                                                        )}

                                                    </span>

                                                </td>


                                                <td>

                                                    ${confEscape(
                                                        participant.status
                                                        || "-"
                                                    )}

                                                </td>


                                                <td>

                                                    ${confEscape(
                                                        participant.presentation_title
                                                        || "-"
                                                    )}

                                                </td>

                                            </tr>

                                        `;
                                    }
                                ).join("")}

                            </tbody>

                        </table>

                    </div>

                </div>
            `;
        }


        // ================================================================
        // MAIN DETAILS
        // ================================================================

        body.innerHTML = `

            <div class="row g-3">

                <div class="col-md-6">

                    <div class="card h-100 border-0 bg-light">

                        <div class="card-body">

                            <h6 class="fw-bold mb-3">
                                <i class="bi bi-calendar-event me-1"></i>
                                Conference Information
                            </h6>


                            <dl class="detail-list mb-0">

                                <div class="detail-row">
                                    <dt>Status</dt>
                                    <dd>
                                        ${conferenceStatusBadge(
                                            details.status
                                        )}
                                    </dd>
                                </div>


                                <div class="detail-row">
                                    <dt>Type</dt>
                                    <dd>
                                        ${confEscape(
                                            details.conference_type
                                            || "-"
                                        )}
                                    </dd>
                                </div>


                                <div class="detail-row">
                                    <dt>Organizer</dt>
                                    <dd>
                                        ${confEscape(
                                            details.organizer
                                            || "-"
                                        )}
                                    </dd>
                                </div>


                                <div class="detail-row">
                                    <dt>Location</dt>
                                    <dd>
                                        ${confEscape(
                                            details.location
                                            || "-"
                                        )}
                                    </dd>
                                </div>


                                <div class="detail-row">
                                    <dt>Start Date</dt>
                                    <dd>
                                        ${formatDate(
                                            details.start_date
                                        )}
                                    </dd>
                                </div>


                                <div class="detail-row">
                                    <dt>End Date</dt>
                                    <dd>
                                        ${formatDate(
                                            details.end_date
                                        )}
                                    </dd>
                                </div>

                            </dl>

                        </div>

                    </div>

                </div>


                <div class="col-md-6">

                    <div class="card h-100 border-0 bg-light">

                        <div class="card-body">

                            <h6 class="fw-bold mb-3">
                                <i class="bi bi-bar-chart me-1"></i>
                                Conference Statistics
                            </h6>


                            <div class="row g-2">

                                <div class="col-4">

                                    <div class="text-center border rounded p-2 bg-white">

                                        <div class="fs-4 fw-bold">
                                            ${details.total_participants ?? 0}
                                        </div>

                                        <small class="text-muted">
                                            Participants
                                        </small>

                                    </div>

                                </div>


                                <div class="col-4">

                                    <div class="text-center border rounded p-2 bg-white">

                                        <div class="fs-4 fw-bold">
                                            ${details.total_presenters ?? 0}
                                        </div>

                                        <small class="text-muted">
                                            Presenters
                                        </small>

                                    </div>

                                </div>


                                <div class="col-4">

                                    <div class="text-center border rounded p-2 bg-white">

                                        <div class="fs-4 fw-bold">
                                            ${details.total_attendees ?? 0}
                                        </div>

                                        <small class="text-muted">
                                            Attendees
                                        </small>

                                    </div>

                                </div>

                            </div>


                            <hr>


                            <dl class="detail-list mb-0">

                                <div class="detail-row">

                                    <dt>Registration Deadline</dt>

                                    <dd>
                                        ${formatDate(
                                            details.registration_deadline
                                        )}
                                    </dd>

                                </div>


                                <div class="detail-row">

                                    <dt>Submission Deadline</dt>

                                    <dd>
                                        ${formatDate(
                                            details.submission_deadline
                                        )}
                                    </dd>
                                </div>
                                <div class="detail-row">
                                    <dt>Contact Email</dt>
                                    <dd>
                                        ${confEscape(
                                            details.contact_email
                                            || "-"
                                        )}
                                    </dd>
                                </div>
                                <div class="detail-row">
                                    <dt>Website</dt>
                                    <dd>
                                        ${
                                            details.website
                                                ? `
                                                    <a
                                                        href="${confEscape(details.website)}"
                                                        target="_blank"
                                                        rel="noopener noreferrer">
                                                        Visit Website
                                                    </a>
                                                  `
                                          : "-"
                                        }
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
            ${participantsHtml}
        `;
        // ================================================================
        // SHOW BOOTSTRAP MODAL
        // ================================================================

        bootstrap.Modal
            .getOrCreateInstance(modal)
            .show();


    } catch (error) {

        console.error(
            "Conference details error:",
            error
        );

        if (error.status === 404) {
            window.showDetailsNotFound?.("conference");
        } else {
            window.showDetailsError?.(error.message);
        }
        window.setDetailsModalWide?.(true);
    }
};


// ========================================================================
// QUICK REGISTER
// ========================================================================

window.registerForConference = function(
    conferenceId
) {

    const form =
        document.getElementById(
            "registerParticipationForm"
        );

    if (!form) {
        return;
    }

    form.querySelector(
        "[name='conference_id']"
    ).value = conferenceId;

    bootstrap.Modal
        .getOrCreateInstance(
            document.getElementById(
                "registerParticipationModal"
            )
        )
        .show();
};


// ========================================================================
// EDIT CONFERENCE
// ========================================================================

window.editConference = async function(
    conferenceId
) {

    try {

        const conference =
            await conferenceApi(
                `/conferences/${conferenceId}`
            );

        editingConferenceId =
            conference.id;

        const form =
            document.getElementById(
                "addConferenceForm"
            );

        form.querySelector(
            "[name='name']"
        ).value =
            conference.name || "";

        form.querySelector(
            "[name='organizer']"
        ).value =
            conference.organizer || "";

        form.querySelector(
            "[name='location']"
        ).value =
            conference.location || "";

        form.querySelector(
            "[name='start_date']"
        ).value =
            conference.start_date || "";

        form.querySelector(
            "[name='end_date']"
        ).value =
            conference.end_date || "";

        form.querySelector(
            "[name='website']"
        ).value =
            conference.website || "";

        form.querySelector(
            "[name='conference_type']"
        ).value =
            conference.conference_type
            || "Conference";

        form.querySelector(
            "[name='registration_deadline']"
        ).value =
            conference.registration_deadline
            || "";

        form.querySelector(
            "[name='submission_deadline']"
        ).value =
            conference.submission_deadline
            || "";

        form.querySelector(
            "[name='contact_email']"
        ).value =
            conference.contact_email
            || "";

        document.querySelector(
            "#addConferenceModal .modal-title"
        ).textContent =
            "Edit Conference";

        document.querySelector(
            "#addConferenceForm button[type='submit']"
        ).textContent =
            "Save Changes";

        bootstrap.Modal
            .getOrCreateInstance(
                document.getElementById(
                    "addConferenceModal"
                )
            )
            .show();

    } catch (error) {

        conferenceToast(
            "Error",
            error.message,
            "error"
        );
    }
};


// ========================================================================
// DELETE
// ========================================================================

window.deleteConference = async function(
    conferenceId
) {

    if (
        !confirm(
            "Delete this conference and its participation records?"
        )
    ) {
        return;
    }

    try {

        await conferenceApi(
            `/conferences/${conferenceId}`,
            {
                method: "DELETE"
            }
        );

        conferenceToast(
            "Success",
            "Conference deleted successfully.",
            "success"
        );

        await loadConferences(
            confCurrentPage
        );

        await loadConferenceStats();

    } catch (error) {

        conferenceToast(
            "Error",
            error.message,
            "error"
        );
    }
};


// ========================================================================
// CONFERENCE FORM
// ========================================================================

function bindConferenceForm() {

    const form =
        document.getElementById(
            "addConferenceForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const button =
                form.querySelector(
                    "button[type='submit']"
                );

            const originalText =
                button.textContent;

            button.disabled = true;
            button.textContent = "Saving...";

            try {

                const data =
                    confFormToJson(form);

                if (
                    editingConferenceId === null
                ) {

                    await conferenceApi(
                        "/conferences/",
                        {
                            method: "POST",
                            body: JSON.stringify(data)
                        }
                    );

                    conferenceToast(
                        "Saved",
                        "Conference added successfully.",
                        "success"
                    );

                } else {

                    await conferenceApi(
                        `/conferences/${editingConferenceId}`,
                        {
                            method: "PUT",
                            body: JSON.stringify(data)
                        }
                    );

                    conferenceToast(
                        "Saved",
                        "Conference updated successfully.",
                        "success"
                    );

                    editingConferenceId = null;
                }

                form.reset();

                bootstrap.Modal
                    .getInstance(
                        document.getElementById(
                            "addConferenceModal"
                        )
                    )
                    ?.hide();

                await loadConferences(1);
                await loadConferenceStats();

            } catch (error) {

                conferenceToast(
                    "Error",
                    error.message,
                    "error"
                );

            } finally {

                button.disabled = false;

                button.textContent =
                    editingConferenceId === null
                        ? "Create Conference"
                        : originalText;
            }
        }
    );

    document
        .getElementById(
            "addConferenceModal"
        )
        ?.addEventListener(
            "hidden.bs.modal",
            () => {

                editingConferenceId = null;

                form.reset();

                document.querySelector(
                    "#addConferenceModal .modal-title"
                ).textContent =
                    "Add New Conference";

                document.querySelector(
                    "#addConferenceForm button[type='submit']"
                ).textContent =
                    "Create Conference";
            }
        );
}


// ========================================================================
// PARTICIPATION FORM
// ========================================================================

function bindParticipationForm() {

    const form =
        document.getElementById(
            "registerParticipationForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            const button =
                form.querySelector(
                    "button[type='submit']"
                );

            button.disabled = true;

            try {

                const data =
                    confFormToJson(form);

                await conferenceApi(
                    "/conferences/participations",
                    {
                        method: "POST",
                        body: JSON.stringify(data)
                    }
                );

                form.reset();

                bootstrap.Modal
                    .getInstance(
                        document.getElementById(
                            "registerParticipationModal"
                        )
                    )
                    ?.hide();

                conferenceToast(
                    "Success",
                    "Conference participation registered.",
                    "success"
                );

                await loadConferences(
                    confCurrentPage
                );

                await loadConferenceStats();

            } catch (error) {

                conferenceToast(
                    "Error",
                    error.message,
                    "error"
                );

            } finally {

                button.disabled = false;
            }
        }
    );
}


// ========================================================================
// FILTER EVENTS
// ========================================================================

document
    .getElementById("confSearch")
    ?.addEventListener(
        "input",
        confDebounce(
            () => loadConferences(1)
        )
    );

document
    .getElementById("confStatus")
    ?.addEventListener(
        "change",
        () => loadConferences(1)
    );

document
    .getElementById("confType")
    ?.addEventListener(
        "change",
        () => loadConferences(1)
    );

document
    .getElementById("confSortBy")
    ?.addEventListener(
        "change",
        () => loadConferences(1)
    );

document
    .getElementById("confSortOrder")
    ?.addEventListener(
        "change",
        () => loadConferences(1)
    );


// ========================================================================
// PAGINATION
// ========================================================================

document
    .getElementById("confPrevPage")
    ?.addEventListener(
        "click",
        () => {

            if (confCurrentPage > 1) {

                loadConferences(
                    confCurrentPage - 1
                );
            }
        }
    );
document
    .getElementById("confNextPage")
    ?.addEventListener(
        "click",
        () => {

            loadConferences(
                confCurrentPage + 1
            );
        }
    );
// ========================================================================
// INITIAL LOAD
// ========================================================================
bindConferenceForm();
bindParticipationForm();
loadConferenceStats();
loadConferences(1);