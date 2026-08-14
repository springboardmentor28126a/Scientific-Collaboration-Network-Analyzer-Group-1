import { useState } from "react";
import { toast } from "react-toastify";

import {
  uploadPublicationFile,
  archivePublication,
  downloadPublicationFile,
  generatePublicationSummary,
} from "../../services/publicationService";

import CitationPanel from "./CitationPanel";


const STATUS_STYLES = {
  DRAFT: {
    label: "Draft",
    className: "pub-badge pub-badge-draft",
  },

  SUBMITTED: {
    label: "Submitted",
    className: "pub-badge pub-badge-submitted",
  },

  UNDER_REVIEW: {
    label: "Under review",
    className: "pub-badge pub-badge-review",
  },

  PUBLISHED: {
    label: "Published",
    className: "pub-badge pub-badge-published",
  },

  REJECTED: {
    label: "Rejected",
    className: "pub-badge pub-badge-rejected",
  },

  ARCHIVED: {
    label: "Archived",
    className: "pub-badge pub-badge-draft",
  },
};


function PublicationList({
  publications,
  onEdit,
  onSubmit,
  onDelete,
  onFileUploaded,
}) {
  const [uploadingId, setUploadingId] = useState(null);

  // AI summary state
  const [aiSummary, setAiSummary] = useState({});
  const [generatingSummaryId, setGeneratingSummaryId] =
    useState(null);


  const handleFileChange = async (pubId, e) => {
    const file = e.target.files[0];

    if (!file) return;

    setUploadingId(pubId);

    try {
      await uploadPublicationFile(pubId, file);

      toast.success("File uploaded.");

      onFileUploaded();
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
          "Upload failed."
      );
    } finally {
      setUploadingId(null);
    }
  };


  const handleArchive = async (pubId) => {
    const confirmed = window.confirm(
      "Archive this publication? It will remain visible but marked as archived."
    );

    if (!confirmed) return;

    try {
      await archivePublication(pubId);

      toast.success("Publication archived.");

      onFileUploaded();
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
          "Could not archive publication."
      );
    }
  };


  // Generate AI summary
  const handleGenerateSummary = async (pubId) => {
    setGeneratingSummaryId(pubId);

    try {
      const data = await generatePublicationSummary(
        pubId
      );

      setAiSummary((prev) => ({
        ...prev,
        [pubId]: data.summary,
      }));

      toast.success("AI summary generated.");
    } catch (err) {
      toast.error(
        err?.response?.data?.detail ||
          "Could not generate AI summary."
      );
    } finally {
      setGeneratingSummaryId(null);
    }
  };


  if (publications.length === 0) {
    return (
      <div className="pub-empty">
        <p>
          No publications yet. Add your first one above.
        </p>
      </div>
    );
  }


  return (
    <div className="pub-list">

      {publications.map((pub) => {
        const statusInfo =
          STATUS_STYLES[pub.status] ||
          STATUS_STYLES.DRAFT;

        const canModifyContent =
          pub.status === "DRAFT" ||
          pub.status === "REJECTED";

        const canSubmitOrDelete =
          canModifyContent && pub.is_owner;

        const fileUrl = pub.file_path
          ? `http://127.0.0.1:8000/${pub.file_path.replace(
              /\\/g,
              "/"
            )}`
          : null;


        return (
          <div
            className="pub-item"
            key={pub.id}
          >

            {/* Publication header */}
            <div className="pub-item-header">

              <div>

                <span className="pub-type-label">
                  {pub.publication_type?.replaceAll(
                    "_",
                    " "
                  )}
                </span>

                <h4>{pub.title}</h4>

              </div>


              <div
                style={{
                  display: "flex",
                  gap: "0.4rem",
                  alignItems: "center",
                }}
              >

                {!pub.is_owner && (
                  <span className="pub-badge pub-badge-draft">
                    Co-authored
                  </span>
                )}

                <span
                  className={statusInfo.className}
                >
                  {statusInfo.label}
                </span>

              </div>

            </div>


            {/* Abstract */}
            {pub.abstract && (
              <p className="pub-abstract">
                {pub.abstract}
              </p>
            )}


            {/* Publication metadata */}
            <div className="pub-meta">

              {pub.authors_text && (
                <span>
                  Co-authors: {pub.authors_text}
                </span>
              )}


              {pub.coauthors &&
                pub.coauthors.length > 0 && (
                  <span>
                    Platform co-authors:{" "}
                    {pub.coauthors
                      .map(
                        (c) =>
                          `${c.first_name} ${c.last_name}`
                      )
                      .join(", ")}
                  </span>
                )}


              {pub.doi && (
                <span className="mono">
                  DOI: {pub.doi}
                </span>
              )}


              {pub.publish_date && (
                <span>
                  {new Date(
                    pub.publish_date
                  ).toLocaleDateString()}
                </span>
              )}

            </div>


            {/* Reviewer feedback */}
            {pub.status === "REJECTED" &&
              pub.review_comments && (
                <div className="pub-review-note">

                  <strong>
                    Reviewer feedback:
                  </strong>{" "}
                  {pub.review_comments}

                </div>
              )}


            {/* Published reviewer note */}
            {pub.status === "PUBLISHED" &&
              pub.review_comments && (
                <div className="pub-review-note pub-review-note-positive">

                  <strong>
                    Reviewer note:
                  </strong>{" "}
                  {pub.review_comments}

                </div>
              )}


            {/* File section */}
            {canModifyContent && (
              <div className="pub-file-row">

                {fileUrl ? (
                  <>
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="pub-file-link"
                    >
                      View file
                    </a>


                    <button
                      type="button"
                      className="btn-ghost-outline btn-sm"
                      onClick={async () => {
                        try {
                          await downloadPublicationFile(
                            pub.id
                          );
                        } catch (err) {
                          toast.error(
                            "Could not download file."
                          );
                        }
                      }}
                    >
                      Download
                    </button>
                  </>
                ) : (
                  <span className="pub-file-empty">
                    No file uploaded
                  </span>
                )}


                <label className="btn-ghost-outline btn-sm pub-file-btn">

                  {uploadingId === pub.id
                    ? "Uploading..."
                    : fileUrl
                    ? "Replace file"
                    : "Upload file"}


                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    hidden
                    disabled={
                      uploadingId === pub.id
                    }
                    onChange={(e) =>
                      handleFileChange(
                        pub.id,
                        e
                      )
                    }
                  />

                </label>

              </div>
            )}


            {/* Publication actions */}
            <div className="pub-item-actions">

              {canModifyContent && (
                <button
                  className="btn-ghost-outline"
                  onClick={() =>
                    onEdit(pub)
                  }
                >
                  Edit
                </button>
              )}


              {canSubmitOrDelete && (
                <>
                  <button
                    className="btn-primary btn-sm"
                    onClick={() =>
                      onSubmit(pub.id)
                    }
                  >
                    Submit for review
                  </button>


                  <button
                    className="btn-text-danger"
                    onClick={() =>
                      onDelete(pub.id)
                    }
                  >
                    Delete
                  </button>
                </>
              )}

            </div>


            {/* AI Summary */}
            {pub.file_path && (
              <div className="pub-item-actions">

                <button
                  type="button"
                  className="btn-ghost-outline btn-sm"
                  onClick={() =>
                    handleGenerateSummary(
                      pub.id
                    )
                  }
                  disabled={
                    generatingSummaryId ===
                    pub.id
                  }
                >
                  {generatingSummaryId ===
                  pub.id
                    ? "Generating..."
                    : "✨ AI Summary"}
                </button>

              </div>
            )}


            {/* AI Summary result */}
            {aiSummary[pub.id] && (
              <div className="pub-review-note">

                <strong>
                  AI Summary
                </strong>

                <p
                  style={{
                    whiteSpace: "pre-wrap",
                    marginTop: "0.5rem",
                  }}
                >
                  {aiSummary[pub.id]}
                </p>

              </div>
            )}


            {/* Published publication actions */}
            {pub.status === "PUBLISHED" &&
              pub.is_owner && (

                <div className="pub-item-actions">

                  <button
                    className="btn-ghost-outline btn-sm"
                    onClick={() =>
                      handleArchive(pub.id)
                    }
                  >
                    Archive
                  </button>


                  {fileUrl && (
                    <button
                      className="btn-ghost-outline btn-sm"
                      onClick={async () => {
                        try {
                          await downloadPublicationFile(
                            pub.id
                          );
                        } catch (err) {
                          toast.error(
                            "Could not download file."
                          );
                        }
                      }}
                    >
                      Download
                    </button>
                  )}

                </div>
              )}


            {/* Citation panel */}
            <CitationPanel
              publicationId={pub.id}
              canEdit={
                pub.is_owner !== false
              }
            />

          </div>
        );
      })}

    </div>
  );
}


export default PublicationList;