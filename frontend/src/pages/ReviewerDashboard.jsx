import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaHome,
  FaClipboardCheck,
  FaQuoteRight,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
  FaSyncAlt,
  FaCalendarAlt,
  FaSignOutAlt,
  FaFlask,
} from "react-icons/fa";

function ReviewerDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    pendingPublicationReviews: 0,
    pendingCitationVerifications: 0,
    approvedPublications: 0,
    rejectedPublications: 0,
    verifiedCitations: 0,
    rejectedCitations: 0,
  });

  const [publications, setPublications] = useState([]);
  const [citations, setCitations] = useState([]);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [activity, setActivity] = useState([]);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  // =====================================================
  // FETCH DASHBOARD STATS
  // =====================================================

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:8000/dashboard/reviewer",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load reviewer dashboard");
      }

      const data = await response.json();

      setStats({
        pendingPublicationReviews:
          data.pending_publication_reviews || 0,

        pendingCitationVerifications:
          data.pending_citation_verifications || 0,

        approvedPublications:
          data.approved_publications || 0,

        rejectedPublications:
          data.rejected_publications || 0,

        verifiedCitations:
          data.verified_citations || 0,

        rejectedCitations:
          data.rejected_citations || 0,
      });
    } catch (error) {
      console.error("Reviewer Dashboard Error:", error);
    }
  };

  // =====================================================
  // FETCH PUBLICATIONS FOR REVIEW
  // =====================================================

  const fetchPublications = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:8000/papers/reviewer/publications",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load publications");
      }

      const data = await response.json();

      setPublications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Reviewer Publications Error:", error);
      setPublications([]);
    }
  };

  // =====================================================
  // FETCH PENDING CITATIONS
  // =====================================================

  const fetchCitations = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://127.0.0.1:8000/citations/pending",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load pending citations");
      }

      const data = await response.json();

      setCitations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Pending Citations Error:", error);
      setCitations([]);
    }
  };

  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  const loadReviewerDashboard = async () => {
    setLoading(true);

    await Promise.all([
      fetchStats(),
      fetchPublications(),
      fetchCitations(),
    ]);

    setLoading(false);
  };

  // =====================================================
  // APPROVE PUBLICATION
  // =====================================================

  const handleApprove = async (paperId, title) => {
    try {
      setActionLoading(`paper-${paperId}`);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://127.0.0.1:8000/papers/reviewer/approve/${paperId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          errorData.detail ||
            "Failed to approve publication"
        );
      }

      setActivity((prev) => [
        {
          id: Date.now(),
          title: title,
          action: "Approved",
        },
        ...prev,
      ]);

      await loadReviewerDashboard();
    } catch (error) {
      console.error("Approve Error:", error);
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // REJECT PUBLICATION
  // =====================================================

  const handleReject = async (paperId, title) => {
    try {
      setActionLoading(`paper-${paperId}`);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://127.0.0.1:8000/papers/reviewer/reject/${paperId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          errorData.detail ||
            "Failed to reject publication"
        );
      }

      setActivity((prev) => [
        {
          id: Date.now(),
          title: title,
          action: "Rejected",
        },
        ...prev,
      ]);

      await loadReviewerDashboard();
    } catch (error) {
      console.error("Reject Error:", error);
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // VERIFY CITATION
  // =====================================================

  const handleVerifyCitation = async (citationId) => {
    try {
      setActionLoading(`citation-${citationId}`);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://127.0.0.1:8000/citations/${citationId}/verify`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          errorData.detail ||
            "Failed to verify citation"
        );
      }

      setActivity((prev) => [
        {
          id: Date.now(),
          title: "Citation #" + citationId,
          action: "Verified",
        },
        ...prev,
      ]);

      await loadReviewerDashboard();
    } catch (error) {
      console.error("Verify Citation Error:", error);
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // REJECT CITATION
  // =====================================================

  const handleRejectCitation = async (citationId) => {
    try {
      setActionLoading(`citation-${citationId}`);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://127.0.0.1:8000/citations/${citationId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({}));

        throw new Error(
          errorData.detail ||
            "Failed to reject citation"
        );
      }

      setActivity((prev) => [
        {
          id: Date.now(),
          title: "Citation #" + citationId,
          action: "Rejected",
        },
        ...prev,
      ]);

      await loadReviewerDashboard();
    } catch (error) {
      console.error("Reject Citation Error:", error);
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadReviewerDashboard();
  }, []);

  // =====================================================
  // CARD DATA
  // =====================================================

  const cards = [
    {
      title: "Pending Publication Reviews",
      subtitle: "Publications Awaiting Review",
      value: stats.pendingPublicationReviews,
      icon: <FaClipboardCheck />,
    },

    {
      title: "Pending Citation Verifications",
      subtitle: "Citations Awaiting Verification",
      value: stats.pendingCitationVerifications,
      icon: <FaQuoteRight />,
    },

    {
      title: "Approved Publications",
      subtitle: "Approved Research Papers",
      value: stats.approvedPublications,
      icon: <FaCheckCircle />,
    },

    {
      title: "Rejected Publications",
      subtitle: "Rejected Research Papers",
      value: stats.rejectedPublications,
      icon: <FaTimesCircle />,
    },

    {
      title: "Verified Citations",
      subtitle: "Verified Research Citations",
      value: stats.verifiedCitations,
      icon: <FaCheckCircle />,
    },

    {
      title: "Rejected Citations",
      subtitle: "Rejected Research Citations",
      value: stats.rejectedCitations,
      icon: <FaTimesCircle />,
    },
  ];

  // =====================================================
  // MENU STYLE
  // =====================================================

  const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "14px 20px",
    marginBottom: "6px",
    color: "#ffffff",
    textDecoration: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "15px",
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#090d14",
        color: "#fff",
        display: "flex",
      }}
    >
      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        style={{
          width: "220px",
          minHeight: "100vh",
          background: "#111111",
          borderRight: "1px solid #252525",
          padding: "25px 15px",
          boxSizing: "border-box",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#4da3ff",
            padding: "10px 15px 30px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FaFlask />
          SCNA
        </div>

        <div
          style={{
            color: "#ff3038",
            fontWeight: "700",
            fontSize: "13px",
            padding: "0 20px 15px",
            letterSpacing: "1px",
          }}
        >
          REVIEWER MENU
        </div>

        <div
          onClick={() => navigate("/dashboard")}
          style={{
            ...menuItemStyle,
            background: "#182b4d",
            color: "#4da3ff",
          }}
        >
          <FaHome />
          <span>Dashboard</span>
        </div>

        <div
          onClick={() =>
            document
              .getElementById("publication-reviews")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          style={menuItemStyle}
        >
          <FaClipboardCheck />
          <span>Publication Reviews</span>
        </div>

        <div
          onClick={() =>
            document
              .getElementById("citation-verifications")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          style={menuItemStyle}
        >
          <FaQuoteRight />
          <span>Citation Verifications</span>
        </div>

        <div
          onClick={() => navigate("/conferences")}
          style={menuItemStyle}
        >
          <FaCalendarAlt />
          <span>Conferences</span>
        </div>

        <div
          onClick={() =>
            document
              .getElementById("review-activity")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          style={menuItemStyle}
        >
          <FaHistory />
          <span>Review Activity</span>
        </div>

        <div
          onClick={handleLogout}
          style={{
            ...menuItemStyle,
            marginTop: "30px",
            color: "#ff4b4b",
          }}
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </div>
      </aside>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main
        style={{
          marginLeft: "220px",
          width: "calc(100% - 220px)",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            background:
              "linear-gradient(135deg, #111a2e, #16264d)",
            border: "1px solid #243a63",
            borderRadius: "16px",
            padding: "38px",
            marginBottom: "22px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "2px",
              color: "#4da3ff",
              fontWeight: "700",
              marginBottom: "12px",
            }}
          >
            REVIEWER WORKSPACE
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "38px",
              lineHeight: "1.2",
            }}
          >
            Scientific Collaboration
            <br />
            Network Analyzer
          </h1>

          <p
            style={{
              color: "#8ea4c7",
              marginTop: "14px",
              marginBottom: 0,
            }}
          >
            Reviewer Dashboard
          </p>
        </div>

        {/* BUTTONS */}

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "28px",
          }}
        >
          <button
            onClick={loadReviewerDashboard}
            disabled={loading}
            style={{
              background: "#ff3038",
              color: "#fff",
              border: "none",
              borderRadius: "7px",
              padding: "11px 25px",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: "600",
            }}
          >
            <FaSyncAlt
              style={{
                marginRight: "7px",
              }}
            />

            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: "#ff3038",
              color: "#fff",
              border: "none",
              borderRadius: "7px",
              padding: "11px 25px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            <FaSignOutAlt
              style={{
                marginRight: "7px",
              }}
            />

            Logout
          </button>
        </div>

        {/* OVERVIEW */}

        <div
          style={{
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              color: "#4da3ff",
              fontSize: "11px",
              letterSpacing: "2px",
              fontWeight: "700",
            }}
          >
            REVIEW OVERVIEW
          </div>

          <h2
            style={{
              margin: "7px 0 0",
            }}
          >
            Publication & Citation Review
          </h2>
        </div>

        {/* CARDS */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "20px",
            marginBottom: "30px",
          }}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              style={{
                background: "#181818",
                border: "1px solid #392323",
                borderRadius: "16px",
                padding: "24px",
                minHeight: "175px",
              }}
            >
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "10px",
                  background: "#102344",
                  color: "#4da3ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "18px",
                }}
              >
                {card.icon}
              </div>

              <div
                style={{
                  color: "#b8c4d8",
                  fontSize: "14px",
                }}
              >
                {card.title}
              </div>

              <div
                style={{
                  color: "#8795a9",
                  fontSize: "12px",
                  marginTop: "5px",
                }}
              >
                {card.subtitle}
              </div>

              <div
                style={{
                  color: "#ff3038",
                  fontSize: "36px",
                  fontWeight: "700",
                  marginTop: "15px",
                }}
              >
                {card.value}
              </div>

              <div
                style={{
                  color: "#18d26e",
                  fontSize: "11px",
                }}
              >
                • Live Count
              </div>
            </div>
          ))}
        </div>

        {/* =================================================
            PUBLICATION REVIEW LIST
        ================================================= */}

        <div
          id="publication-reviews"
          style={{
            background: "#181818",
            border: "1px solid #392323",
            borderRadius: "16px",
            padding: "25px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <h3 style={{ margin: 0 }}>
              Publications Awaiting Review
            </h3>

            <span
              style={{
                color: "#8795a9",
                fontSize: "12px",
              }}
            >
              Review publications assigned to you
            </span>
          </div>

          {publications.length === 0 ? (
            <p
              style={{
                color: "#8795a9",
                textAlign: "center",
                padding: "30px 0",
              }}
            >
              No publications are currently awaiting review.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              {publications.map((paper) => (
                <div
                  key={paper.id}
                  style={{
                    background: "#111111",
                    border: "1px solid #2c2c2c",
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 8px",
                      color: "#ffffff",
                    }}
                  >
                    {paper.title || "Untitled Publication"}
                  </h3>

                  <div
                    style={{
                      color: "#8795a9",
                      fontSize: "13px",
                      marginBottom: "8px",
                    }}
                  >
                    Year:{" "}
                    {paper.publication_year || "N/A"}
                    {"  "} | {"  "}
                    Journal:{" "}
                    {paper.journal || "N/A"}
                  </div>

                  <p
                    style={{
                      color: "#b8c4d8",
                      fontSize: "13px",
                      lineHeight: "1.6",
                    }}
                  >
                    {paper.abstract
                      ? paper.abstract
                      : "No abstract available."}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "15px",
                    }}
                  >
                    <button
                      onClick={() =>
                        handleApprove(
                          paper.id,
                          paper.title
                        )
                      }
                      disabled={
                        actionLoading ===
                        `paper-${paper.id}`
                      }
                      style={{
                        background: "#18a957",
                        color: "#fff",
                        border: "none",
                        borderRadius: "7px",
                        padding: "10px 18px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      <FaCheckCircle
                        style={{
                          marginRight: "7px",
                        }}
                      />

                      {actionLoading ===
                      `paper-${paper.id}`
                        ? "Processing..."
                        : "Approve"}
                    </button>

                    <button
                      onClick={() =>
                        handleReject(
                          paper.id,
                          paper.title
                        )
                      }
                      disabled={
                        actionLoading ===
                        `paper-${paper.id}`
                      }
                      style={{
                        background: "#d9363e",
                        color: "#fff",
                        border: "none",
                        borderRadius: "7px",
                        padding: "10px 18px",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      <FaTimesCircle
                        style={{
                          marginRight: "7px",
                        }}
                      />

                      {actionLoading ===
                      `paper-${paper.id}`
                        ? "Processing..."
                        : "Reject"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =================================================
            CITATION VERIFICATIONS
        ================================================= */}

        <div
          id="citation-verifications"
          style={{
            background: "#181818",
            border: "1px solid #392323",
            borderRadius: "16px",
            padding: "25px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <h3 style={{ margin: 0 }}>
              Citation Verifications
            </h3>

            <span
              style={{
                color: "#8795a9",
                fontSize: "12px",
              }}
            >
              Review citations awaiting verification
            </span>
          </div>

          {citations.length === 0 ? (
            <p
              style={{
                color: "#8795a9",
                textAlign: "center",
                padding: "30px 0",
                margin: 0,
              }}
            >
              No citations are currently awaiting
              verification.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              {citations.map((citation) => (
                <div
                  key={citation.id}
                  style={{
                    background: "#111111",
                    border: "1px solid #2c2c2c",
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 12px",
                      color: "#ffffff",
                    }}
                  >
                    {citation.cited_paper_title ||
                      "Untitled Citation"}
                  </h3>

                  <div
                    style={{
                      color: "#b8c4d8",
                      fontSize: "13px",
                      lineHeight: "1.8",
                    }}
                  >
                    <div>
                      <strong>Authors:</strong>{" "}
                      {citation.authors || "N/A"}
                    </div>

                    <div>
                      <strong>Publication Year:</strong>{" "}
                      {citation.publication_year || "N/A"}
                    </div>

                    <div>
                      <strong>DOI:</strong>{" "}
                      {citation.doi || "N/A"}
                    </div>

                    <div>
                      <strong>Citation Count:</strong>{" "}
                      {citation.citation_count || 0}
                    </div>

                    <div>
                      <strong>Status:</strong>{" "}
                      {citation.verification_status ||
                        "Pending"}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      marginTop: "18px",
                    }}
                  >
                    {/* VERIFY */}

                    <button
                      onClick={() =>
                        handleVerifyCitation(
                          citation.id
                        )
                      }
                      disabled={
                        actionLoading ===
                        `citation-${citation.id}`
                      }
                      style={{
                        background: "#18a957",
                        color: "#fff",
                        border: "none",
                        borderRadius: "7px",
                        padding: "10px 18px",
                        cursor:
                          actionLoading ===
                          `citation-${citation.id}`
                            ? "not-allowed"
                            : "pointer",
                        fontWeight: "600",
                        opacity:
                          actionLoading ===
                          `citation-${citation.id}`
                            ? 0.7
                            : 1,
                      }}
                    >
                      <FaCheckCircle
                        style={{
                          marginRight: "7px",
                        }}
                      />

                      {actionLoading ===
                      `citation-${citation.id}`
                        ? "Processing..."
                        : "Verify"}
                    </button>

                    {/* REJECT */}

                    <button
                      onClick={() =>
                        handleRejectCitation(
                          citation.id
                        )
                      }
                      disabled={
                        actionLoading ===
                        `citation-${citation.id}`
                      }
                      style={{
                        background: "#d9363e",
                        color: "#fff",
                        border: "none",
                        borderRadius: "7px",
                        padding: "10px 18px",
                        cursor:
                          actionLoading ===
                          `citation-${citation.id}`
                            ? "not-allowed"
                            : "pointer",
                        fontWeight: "600",
                        opacity:
                          actionLoading ===
                          `citation-${citation.id}`
                            ? 0.7
                            : 1,
                      }}
                    >
                      <FaTimesCircle
                        style={{
                          marginRight: "7px",
                        }}
                      />

                      {actionLoading ===
                      `citation-${citation.id}`
                        ? "Processing..."
                        : "Reject"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =================================================
            RECENT REVIEW ACTIVITY
        ================================================= */}

        <div
          id="review-activity"
          style={{
            background: "#181818",
            border: "1px solid #392323",
            borderRadius: "16px",
            padding: "25px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <FaHistory
              style={{
                color: "#4da3ff",
                fontSize: "22px",
              }}
            />

            <div>
              <h3 style={{ margin: 0 }}>
                Recent Review Activity
              </h3>

              <span
                style={{
                  color: "#8795a9",
                  fontSize: "12px",
                }}
              >
                Latest Publication & Citation Reviews
              </span>
            </div>
          </div>

          {activity.length === 0 ? (
            <p
              style={{
                color: "#8795a9",
                textAlign: "center",
                padding: "30px 0",
              }}
            >
              No review activity in this session.
            </p>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {activity.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: "#111111",
                    borderRadius: "8px",
                    padding: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color: "#d7deea",
                    }}
                  >
                    {item.title}
                  </span>

                  <span
                    style={{
                      color:
                        item.action === "Approved" ||
                        item.action === "Verified"
                          ? "#18d26e"
                          : "#ff4b4b",
                      fontWeight: "600",
                      fontSize: "13px",
                    }}
                  >
                    {item.action}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default ReviewerDashboard;