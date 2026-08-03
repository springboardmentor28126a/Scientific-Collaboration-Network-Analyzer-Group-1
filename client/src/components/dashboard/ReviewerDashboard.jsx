import { useEffect, useState } from "react";
import API from "../../services/api";

export default function ReviewerDashboard() {

    const [publications, setPublications] = useState([]);

    useEffect(() => {

        loadPending();

    }, []);

    const loadPending = async () => {

        try {

            const res = await API.get(
                "/reviewer/publications"
            );

            setPublications(res.data);

        }

        catch (err) {

            console.log(err);

        }

    };

    const reviewPublication = async (publicationId, decision) => {
        const review_comments = window.prompt(
            decision === "approve" ? "Approval comments (optional)" : "Rejection comments",
            ""
        );

        if (review_comments === null) return;

        try {
            await API.put(`/reviewer/${decision}/${publicationId}`, { review_comments });
            await loadPending();
        } catch (err) {
            alert(err.response?.data?.detail || "Unable to submit the review.");
        }
    };

    return (

        <div>

            <h1>📝 Reviewer Dashboard</h1>

            {

                publications.map(pub => (

                    <div
                        key={pub.id}
                        className="card"
                    >

                        <h3>{pub.title}</h3>

                        <p>{pub.authors}</p>

                        <p>Status : {pub.status}</p>

                        <button onClick={() => reviewPublication(pub.id, "approve")}>

                            Approve

                        </button>

                        <button onClick={() => reviewPublication(pub.id, "reject")}>

                            Reject

                        </button>

                    </div>

                ))

            }

        </div>

    );

}
