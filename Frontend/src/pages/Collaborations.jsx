import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { useAuth } from "../hooks/useAuth";
import {
  getCollaborations,
  createCollaboration,
  deleteCollaboration,
} from "../api/collaborations";
import { addAuthor, getPublications, removeAuthor } from "../api/publications";
import {
  assignProjectMember,
  getProjects,
  removeProjectMember,
} from "../api/projects";
import { getInstitutions, getResearchers } from "../api/researchers";
import "./Collaborations.css";

const COLLAB_TYPES = [
  "Institutional Partnership",
  "Joint Venture",
  "Research Initiative",
  "Exchange Program",
];

const COLLAB_STATUSES = ["Active", "Completed", "Terminated"];
const PROJECT_ROLES = ["Lead Investigator", "Researcher", "Contributor"];

const emptyCollaborationForm = {
  title: "",
  description: "",
  type: "Institutional Partnership",
  status: "Active",
  start_date: "",
  end_date: "",
  institution_1_id: "",
  institution_2_id: "",
};

export default function Collaborations() {
  const { user } = useAuth();
  const [collaborations, setCollaborations] = useState([]);
  const [publications, setPublications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState("overview");
  const [submittingAction, setSubmittingAction] = useState("");

  const [collaborationForm, setCollaborationForm] = useState(emptyCollaborationForm);
  const [authorForms, setAuthorForms] = useState({});
  const [assignmentForms, setAssignmentForms] = useState({});

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [collabRes, pubRes, projRes, resRes, instRes] = await Promise.all([
        getCollaborations(),
        getPublications(),
        getProjects(),
        getResearchers(),
        getInstitutions(),
      ]);
      setCollaborations(collabRes.data);
      setPublications(pubRes.data);
      setProjects(projRes.data);
      setResearchers(resRes.data);
      setInstitutions(instRes.data);
      setError("");
    } catch {
      setError("Failed to load collaboration management data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    Promise.all([
      getCollaborations(),
      getPublications(),
      getProjects(),
      getResearchers(),
      getInstitutions(),
    ])
      .then(([collabRes, pubRes, projRes, resRes, instRes]) => {
        if (!active) return;
        setCollaborations(collabRes.data);
        setPublications(pubRes.data);
        setProjects(projRes.data);
        setResearchers(resRes.data);
        setInstitutions(instRes.data);
        setError("");
      })
      .catch(() => {
        if (!active) return;
        setError("Failed to load collaboration management data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const researcherById = useMemo(
    () => new Map(researchers.map((researcher) => [researcher.id, researcher])),
    [researchers],
  );

  const institutionById = useMemo(
    () => new Map(institutions.map((institution) => [institution.id, institution])),
    [institutions],
  );

  const currentUserResearcher = researchers.find((researcher) => researcher.user_id === user?.id);
  const currentUserResearcherId = currentUserResearcher?.id;
  const currentUserInstitutionId =
    currentUserResearcher?.institution_id ||
    (user?.role === "InstitutionAdmin" ? institutions[0]?.id : null);

  const publicationAuthorCount = publications.reduce(
    (total, publication) => total + (publication.authors?.length || 0),
    0,
  );

  const projectAssignmentCount = projects.reduce(
    (total, project) => total + (project.members?.length || 0),
    0,
  );

  const activeProjects = projects.filter((project) => project.status === "Active").length;
  const activeCollaborations = collaborations.filter(
    (collaboration) => collaboration.status === "Active",
  ).length;

  const getResearcherName = (id) => researcherById.get(id)?.full_name || `Researcher #${id}`;
  const getInstitutionName = (id) => institutionById.get(id)?.name || "Not assigned";

  const getResearcherInstitution = (id) => {
    const researcher = researcherById.get(id);
    return researcher ? getInstitutionName(researcher.institution_id) : "Unknown institution";
  };

  const canManagePublication = (publication) => {
    if (user?.role === "SystemAdmin") return true;
    if (publication.uploaded_by === user?.id) return true;

    if (user?.role === "InstitutionAdmin") {
      const uploader = researchers.find((researcher) => researcher.user_id === publication.uploaded_by);
      if (uploader?.institution_id === currentUserInstitutionId) return true;
    }

    return publication.authors?.some(
      (author) => author.researcher_id === currentUserResearcherId,
    );
  };

  const canManageProject = (project) => {
    if (user?.role === "SystemAdmin") return true;
    if (project.created_by === user?.id) return true;
    if (user?.role === "InstitutionAdmin" && project.institution_id === currentUserInstitutionId) {
      return true;
    }

    return project.members?.some(
      (member) =>
        member.researcher_id === currentUserResearcherId &&
        member.role === "Lead Investigator",
    );
  };

  const handleCollaborationChange = (e) => {
    setCollaborationForm({
      ...collaborationForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateCollaboration = async (e) => {
    e.preventDefault();
    setError("");

    if (!collaborationForm.institution_1_id || !collaborationForm.institution_2_id) {
      setError("Please select both collaborating institutions.");
      return;
    }

    if (collaborationForm.institution_1_id === collaborationForm.institution_2_id) {
      setError("Collaboration must be between two different institutions.");
      return;
    }

    setSubmittingAction("collaboration");
    try {
      await createCollaboration({
        ...collaborationForm,
        institution_1_id: parseInt(collaborationForm.institution_1_id, 10),
        institution_2_id: parseInt(collaborationForm.institution_2_id, 10),
        start_date: collaborationForm.start_date || null,
        end_date: collaborationForm.end_date || null,
      });
      setCollaborationForm(emptyCollaborationForm);
      await loadData(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create collaboration record.");
    } finally {
      setSubmittingAction("");
    }
  };

  const handleDeleteCollaboration = async (id) => {
    if (!window.confirm("Delete this institutional collaboration record?")) return;

    try {
      await deleteCollaboration(id);
      await loadData(false);
    } catch {
      setError("Failed to delete collaboration record.");
    }
  };

  const handleAuthorFormChange = (publicationId, field, value) => {
    setAuthorForms({
      ...authorForms,
      [publicationId]: {
        ...authorForms[publicationId],
        [field]: value,
      },
    });
  };

  const handleAddAuthor = async (e, publication) => {
    e.preventDefault();
    const form = authorForms[publication.id] || {};
    if (!form.researcher_id) {
      setError("Please select a researcher to add as a co-author.");
      return;
    }

    setSubmittingAction(`author-${publication.id}`);
    setError("");

    try {
      await addAuthor(publication.id, {
        researcher_id: parseInt(form.researcher_id, 10),
        author_order: form.author_order
          ? parseInt(form.author_order, 10)
          : (publication.authors?.length || 0) + 1,
        is_corresponding_author: Boolean(form.is_corresponding_author),
      });
      setAuthorForms({
        ...authorForms,
        [publication.id]: {
          researcher_id: "",
          author_order: "",
          is_corresponding_author: false,
        },
      });
      await loadData(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add co-author.");
    } finally {
      setSubmittingAction("");
    }
  };

  const handleRemoveAuthor = async (publicationId, researcherId) => {
    if (!window.confirm("Remove this co-author from the publication?")) return;

    try {
      await removeAuthor(publicationId, researcherId);
      await loadData(false);
    } catch {
      setError("Failed to remove co-author.");
    }
  };

  const handleAssignmentFormChange = (projectId, field, value) => {
    setAssignmentForms({
      ...assignmentForms,
      [projectId]: {
        ...assignmentForms[projectId],
        [field]: value,
      },
    });
  };

  const handleAssignProjectMember = async (e, project) => {
    e.preventDefault();
    const form = assignmentForms[project.id] || {};
    if (!form.researcher_id) {
      setError("Please select a researcher to assign to the project.");
      return;
    }

    setSubmittingAction(`project-${project.id}`);
    setError("");

    try {
      await assignProjectMember(project.id, {
        researcher_id: parseInt(form.researcher_id, 10),
        role: form.role || "Contributor",
      });
      setAssignmentForms({
        ...assignmentForms,
        [project.id]: { researcher_id: "", role: "Contributor" },
      });
      await loadData(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to assign project member.");
    } finally {
      setSubmittingAction("");
    }
  };

  const handleRemoveProjectMember = async (projectId, researcherId) => {
    if (!window.confirm("Remove this researcher from the project team?")) return;

    try {
      await removeProjectMember(projectId, researcherId);
      await loadData(false);
    } catch {
      setError("Failed to remove project member.");
    }
  };

  const getAvailableAuthors = (publication) => {
    const assignedIds = new Set(publication.authors?.map((author) => author.researcher_id));
    return researchers.filter((researcher) => !assignedIds.has(researcher.id));
  };

  const getAvailableProjectMembers = (project) => {
    const assignedIds = new Set(project.members?.map((member) => member.researcher_id));
    return researchers.filter((researcher) => !assignedIds.has(researcher.id));
  };

  const visiblePublications =
    activeView === "overview"
      ? publications.slice(0, 4)
      : publications;

  const visibleProjects =
    activeView === "overview"
      ? projects.slice(0, 4)
      : projects;

  const visibleCollaborations =
    activeView === "overview"
      ? collaborations.slice(0, 4)
      : collaborations;

  return (
    <AppShell>
      <main className="collab-page">
        <header className="collab-header">
          <div>
            <p className="dashboard-badge">Collaboration Management</p>
            <h1 className="collab-title">Collaboration Management</h1>
            <p className="collab-subtitle">
              Coordinate co-author records, research projects, institutional collaborations,
              team management, and project assignments in one workspace.
            </p>
          </div>
        </header>

        <section className="collab-summary" aria-label="Collaboration summary">
          <div className="collab-summary-card">
            <span>Co-author records</span>
            <strong>{publicationAuthorCount}</strong>
          </div>
          <div className="collab-summary-card">
            <span>Research projects</span>
            <strong>{projects.length}</strong>
          </div>
          <div className="collab-summary-card">
            <span>Institutional links</span>
            <strong>{collaborations.length}</strong>
          </div>
          <div className="collab-summary-card">
            <span>Team assignments</span>
            <strong>{projectAssignmentCount}</strong>
          </div>
          <div className="collab-summary-card">
            <span>Active work</span>
            <strong>{activeProjects + activeCollaborations}</strong>
          </div>
        </section>

        <nav className="collab-tabs" aria-label="Collaboration management areas">
          {[
            ["overview", "Overview"],
            ["coauthors", "Co-authors"],
            ["projects", "Projects and Teams"],
            ["institutions", "Institutional Collaborations"],
          ].map(([view, label]) => (
            <button
              key={view}
              type="button"
              onClick={() => setActiveView(view)}
              className={`collab-tab-btn ${activeView === view ? "collab-tab-btn--active" : ""}`}
            >
              {label}
            </button>
          ))}
        </nav>

        {error && <p className="pub-error">{error}</p>}

        {loading ? (
          <p className="pub-loading">Loading collaboration management data...</p>
        ) : (
          <>
            {(activeView === "overview" || activeView === "coauthors") && (
              <section className="collab-section" aria-labelledby="coauthors-heading">
                <div className="collab-section-header">
                  <div>
                    <p className="pub-section-label">Co-author records</p>
                    <h2 id="coauthors-heading">Publication author teams</h2>
                  </div>
                </div>

                <div className="collab-list">
                  {visiblePublications.length === 0 && (
                    <p className="pub-empty">No publications available for co-author management.</p>
                  )}
                  {visiblePublications.map((publication) => {
                    const editable = canManagePublication(publication);
                    const availableAuthors = getAvailableAuthors(publication);

                    return (
                      <article key={publication.id} className="collab-record">
                        <div className="collab-record-header">
                          <div>
                            <div className="collab-badge-row">
                              <span className="collab-badge">{publication.status || "Draft"}</span>
                              <span className="collab-badge collab-badge--soft">
                                {publication.type || "Publication"}
                              </span>
                            </div>
                            <h3>{publication.title}</h3>
                          </div>
                        </div>

                        <div className="collab-chip-list">
                          {publication.authors?.length ? (
                            publication.authors
                              .slice()
                              .sort((a, b) => (a.author_order || 99) - (b.author_order || 99))
                              .map((author) => (
                                <span key={author.id} className="collab-chip">
                                  <span>
                                    {author.author_order ? `${author.author_order}. ` : ""}
                                    {getResearcherName(author.researcher_id)}
                                    {author.is_corresponding_author ? " - corresponding" : ""}
                                  </span>
                                  {editable && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveAuthor(publication.id, author.researcher_id)
                                      }
                                      className="collab-chip-remove"
                                      title="Remove co-author"
                                    >
                                      x
                                    </button>
                                  )}
                                </span>
                              ))
                          ) : (
                            <p className="collab-muted">No co-authors recorded yet.</p>
                          )}
                        </div>

                        {editable && (
                          <form
                            className="collab-inline-form"
                            onSubmit={(e) => handleAddAuthor(e, publication)}
                          >
                            <select
                              value={authorForms[publication.id]?.researcher_id || ""}
                              onChange={(e) =>
                                handleAuthorFormChange(
                                  publication.id,
                                  "researcher_id",
                                  e.target.value,
                                )
                              }
                              className="collab-input"
                              required
                            >
                              <option value="">Select co-author...</option>
                              {availableAuthors.map((researcher) => (
                                <option key={researcher.id} value={researcher.id}>
                                  {researcher.full_name} - {getInstitutionName(researcher.institution_id)}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              min="1"
                              placeholder="Order"
                              value={authorForms[publication.id]?.author_order || ""}
                              onChange={(e) =>
                                handleAuthorFormChange(
                                  publication.id,
                                  "author_order",
                                  e.target.value,
                                )
                              }
                              className="collab-input collab-input--small"
                            />
                            <label className="collab-check">
                              <input
                                type="checkbox"
                                checked={
                                  authorForms[publication.id]?.is_corresponding_author || false
                                }
                                onChange={(e) =>
                                  handleAuthorFormChange(
                                    publication.id,
                                    "is_corresponding_author",
                                    e.target.checked,
                                  )
                                }
                              />
                              <span>Corresponding</span>
                            </label>
                            <button
                              type="submit"
                              className="collab-button"
                              disabled={
                                submittingAction === `author-${publication.id}` ||
                                availableAuthors.length === 0
                              }
                            >
                              {submittingAction === `author-${publication.id}`
                                ? "Adding..."
                                : "Add Co-author"}
                            </button>
                          </form>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {(activeView === "overview" || activeView === "projects") && (
              <section className="collab-section" aria-labelledby="projects-heading">
                <div className="collab-section-header">
                  <div>
                    <p className="pub-section-label">Research projects</p>
                    <h2 id="projects-heading">Team management and assignments</h2>
                  </div>
                </div>

                <div className="collab-list">
                  {visibleProjects.length === 0 && (
                    <p className="pub-empty">No research projects available for assignment.</p>
                  )}
                  {visibleProjects.map((project) => {
                    const editable = canManageProject(project);
                    const availableMembers = getAvailableProjectMembers(project);

                    return (
                      <article key={project.id} className="collab-record">
                        <div className="collab-record-header">
                          <div>
                            <div className="collab-badge-row">
                              <span className="collab-badge">{project.status || "Proposed"}</span>
                              <span className="collab-badge collab-badge--soft">
                                {getInstitutionName(project.institution_id)}
                              </span>
                            </div>
                            <h3>{project.title}</h3>
                          </div>
                        </div>

                        {project.description && (
                          <p className="collab-description">{project.description}</p>
                        )}

                        <div className="collab-chip-list">
                          {project.members?.length ? (
                            project.members.map((member) => (
                              <span key={member.id} className="collab-chip">
                                <span>
                                  {getResearcherName(member.researcher_id)}
                                  <small>{member.role}</small>
                                </span>
                                {editable && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveProjectMember(project.id, member.researcher_id)
                                    }
                                    className="collab-chip-remove"
                                    title="Remove project member"
                                  >
                                    x
                                  </button>
                                )}
                              </span>
                            ))
                          ) : (
                            <p className="collab-muted">No project team members assigned yet.</p>
                          )}
                        </div>

                        {editable && (
                          <form
                            className="collab-inline-form"
                            onSubmit={(e) => handleAssignProjectMember(e, project)}
                          >
                            <select
                              value={assignmentForms[project.id]?.researcher_id || ""}
                              onChange={(e) =>
                                handleAssignmentFormChange(
                                  project.id,
                                  "researcher_id",
                                  e.target.value,
                                )
                              }
                              className="collab-input"
                              required
                            >
                              <option value="">Assign researcher...</option>
                              {availableMembers.map((researcher) => (
                                <option key={researcher.id} value={researcher.id}>
                                  {researcher.full_name} - {getInstitutionName(researcher.institution_id)}
                                </option>
                              ))}
                            </select>
                            <select
                              value={assignmentForms[project.id]?.role || "Contributor"}
                              onChange={(e) =>
                                handleAssignmentFormChange(project.id, "role", e.target.value)
                              }
                              className="collab-input collab-input--medium"
                            >
                              {PROJECT_ROLES.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                            <button
                              type="submit"
                              className="collab-button"
                              disabled={
                                submittingAction === `project-${project.id}` ||
                                availableMembers.length === 0
                              }
                            >
                              {submittingAction === `project-${project.id}`
                                ? "Assigning..."
                                : "Assign"}
                            </button>
                          </form>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            )}

            {(activeView === "overview" || activeView === "institutions") && (
              <section className="collab-section" aria-labelledby="institutions-heading">
                <div className="collab-section-header">
                  <div>
                    <p className="pub-section-label">Institutional collaborations</p>
                    <h2 id="institutions-heading">Formal collaboration records</h2>
                  </div>
                </div>

                <form className="collab-form" onSubmit={handleCreateCollaboration}>
                  <input
                    name="title"
                    placeholder="Collaboration title"
                    value={collaborationForm.title}
                    onChange={handleCollaborationChange}
                    required
                    className="collab-input"
                  />
                  <textarea
                    name="description"
                    placeholder="Agreement details"
                    value={collaborationForm.description}
                    onChange={handleCollaborationChange}
                    className="collab-input"
                    rows={3}
                  />
                  <div className="collab-row">
                    <select
                      name="type"
                      value={collaborationForm.type}
                      onChange={handleCollaborationChange}
                      className="collab-input"
                    >
                      {COLLAB_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <select
                      name="status"
                      value={collaborationForm.status}
                      onChange={handleCollaborationChange}
                      className="collab-input"
                    >
                      {COLLAB_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="collab-row">
                    <select
                      name="institution_1_id"
                      value={collaborationForm.institution_1_id}
                      onChange={handleCollaborationChange}
                      required
                      className="collab-input"
                    >
                      <option value="">First institution...</option>
                      {institutions.map((institution) => (
                        <option key={institution.id} value={institution.id}>
                          {institution.name}
                        </option>
                      ))}
                    </select>
                    <select
                      name="institution_2_id"
                      value={collaborationForm.institution_2_id}
                      onChange={handleCollaborationChange}
                      required
                      className="collab-input"
                    >
                      <option value="">Second institution...</option>
                      {institutions.map((institution) => (
                        <option key={institution.id} value={institution.id}>
                          {institution.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="collab-row">
                    <input
                      name="start_date"
                      type="date"
                      value={collaborationForm.start_date}
                      onChange={handleCollaborationChange}
                      className="collab-input"
                    />
                    <input
                      name="end_date"
                      type="date"
                      value={collaborationForm.end_date}
                      onChange={handleCollaborationChange}
                      className="collab-input"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingAction === "collaboration"}
                    className="collab-button"
                  >
                    {submittingAction === "collaboration"
                      ? "Saving..."
                      : "Add Collaboration"}
                  </button>
                </form>

                <div className="collab-list">
                  {visibleCollaborations.length === 0 && (
                    <p className="pub-empty">No institutional collaborations recorded yet.</p>
                  )}
                  {visibleCollaborations.map((collaboration) => (
                    <article key={collaboration.id} className="collab-record">
                      <div className="collab-record-header">
                        <div>
                          <div className="collab-badge-row">
                            <span className="collab-badge">{collaboration.status}</span>
                            <span className="collab-badge collab-badge--soft">
                              {collaboration.type}
                            </span>
                          </div>
                          <h3>{collaboration.title}</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteCollaboration(collaboration.id)}
                          className="collab-danger-button"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="collab-partners">
                        <strong>{getInstitutionName(collaboration.institution_1_id)}</strong>
                        <span>to</span>
                        <strong>{getInstitutionName(collaboration.institution_2_id)}</strong>
                      </div>
                      {collaboration.description && (
                        <p className="collab-description">{collaboration.description}</p>
                      )}
                      {(collaboration.start_date || collaboration.end_date) && (
                        <p className="collab-meta">
                          Duration: {collaboration.start_date || "Open"} to{" "}
                          {collaboration.end_date || "Open"}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}

            {(activeView === "overview" || activeView === "projects") && (
              <section className="collab-section" aria-labelledby="researchers-heading">
                <div className="collab-section-header">
                  <div>
                    <p className="pub-section-label">Team management</p>
                    <h2 id="researchers-heading">Researcher directory</h2>
                  </div>
                </div>
                <div className="collab-directory">
                  {researchers.length === 0 && (
                    <p className="pub-empty">No researchers are registered yet.</p>
                  )}
                  {researchers.map((researcher) => (
                    <article key={researcher.id} className="collab-person">
                      <div className="collab-avatar">{researcher.full_name?.[0] || "R"}</div>
                      <div>
                        <h3>{researcher.full_name}</h3>
                        <p>{getResearcherInstitution(researcher.id)}</p>
                        {(researcher.research_interests || researcher.skills) && (
                          <span>
                            {researcher.research_interests || researcher.skills}
                          </span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </AppShell>
  );
}
