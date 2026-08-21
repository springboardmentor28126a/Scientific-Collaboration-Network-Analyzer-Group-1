import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FolderKanban,
  Link2,
  Plus,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import AppShell from "../components/AppShell";
import { useAuth } from "../hooks/useAuth";

import {
  getCollaborations,
  createCollaboration,
  deleteCollaboration,
} from "../api/collaborations";

import {
  addAuthor,
  getPublications,
  removeAuthor,
} from "../api/publications";

import {
  assignProjectMember,
  getProjects,
  removeProjectMember,
} from "../api/projects";

import {
  getInstitutions,
  getResearchers,
} from "../api/researchers";

import "./Collaborations.css";

const COLLAB_TYPES = [
  "Institutional Partnership",
  "Joint Venture",
  "Research Initiative",
  "Exchange Program",
];

const COLLAB_STATUSES = ["Active", "Completed", "Terminated"];

const PROJECT_ROLES = [
  "Lead Investigator",
  "Researcher",
  "Contributor",
];

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

  const [collaborationForm, setCollaborationForm] = useState(
    emptyCollaborationForm,
  );

  const [authorForms, setAuthorForms] = useState({});
  const [assignmentForms, setAssignmentForms] = useState({});

  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const [
        collabRes,
        pubRes,
        projRes,
        resRes,
        instRes,
      ] = await Promise.all([
        getCollaborations(),
        getPublications(),
        getProjects(),
        getResearchers(),
        getInstitutions(),
      ]);

      setCollaborations(collabRes.data || []);
      setPublications(pubRes.data || []);
      setProjects(projRes.data || []);
      setResearchers(resRes.data || []);
      setInstitutions(instRes.data || []);

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load collaboration management data.",
      );
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
      .then(
        ([
          collabRes,
          pubRes,
          projRes,
          resRes,
          instRes,
        ]) => {
          if (!active) return;

          setCollaborations(collabRes.data || []);
          setPublications(pubRes.data || []);
          setProjects(projRes.data || []);
          setResearchers(resRes.data || []);
          setInstitutions(instRes.data || []);

          setError("");
        },
      )
      .catch((err) => {
        if (!active) return;

        setError(
          err.response?.data?.detail ||
            "Failed to load collaboration management data.",
        );
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const researcherById = useMemo(
    () =>
      new Map(
        researchers.map((researcher) => [
          researcher.id,
          researcher,
        ]),
      ),
    [researchers],
  );

  const institutionById = useMemo(
    () =>
      new Map(
        institutions.map((institution) => [
          institution.id,
          institution,
        ]),
      ),
    [institutions],
  );

  const currentUserResearcher = researchers.find(
    (researcher) => researcher.user_id === user?.id,
  );

  const currentUserResearcherId =
    currentUserResearcher?.id;

  const currentUserInstitutionId =
    currentUserResearcher?.institution_id ||
    (user?.role === "InstitutionAdmin"
      ? institutions[0]?.id
      : null);

  const publicationAuthorCount = publications.reduce(
    (total, publication) =>
      total + (publication.authors?.length || 0),
    0,
  );

  const projectAssignmentCount = projects.reduce(
    (total, project) =>
      total + (project.members?.length || 0),
    0,
  );

  const activeProjects = projects.filter(
    (project) => project.status === "Active",
  ).length;

  const activeCollaborations = collaborations.filter(
    (collaboration) =>
      collaboration.status === "Active",
  ).length;

  const getResearcherName = (id) =>
    researcherById.get(id)?.full_name ||
    `Researcher #${id}`;

  const getInstitutionName = (id) =>
    institutionById.get(id)?.name ||
    "Not assigned";

  const getResearcherInstitution = (id) => {
    const researcher = researcherById.get(id);

    return researcher
      ? getInstitutionName(researcher.institution_id)
      : "Unknown institution";
  };

  const canManagePublication = (publication) => {
    if (user?.role === "SystemAdmin") return true;

    if (publication.uploaded_by === user?.id) {
      return true;
    }

    if (user?.role === "InstitutionAdmin") {
      const uploader = researchers.find(
        (researcher) =>
          researcher.user_id === publication.uploaded_by,
      );

      if (
        uploader?.institution_id ===
        currentUserInstitutionId
      ) {
        return true;
      }
    }

    return publication.authors?.some(
      (author) =>
        author.researcher_id ===
        currentUserResearcherId,
    );
  };

  const canManageProject = (project) => {
    if (user?.role === "SystemAdmin") return true;

    if (project.created_by === user?.id) {
      return true;
    }

    if (
      user?.role === "InstitutionAdmin" &&
      project.institution_id ===
        currentUserInstitutionId
    ) {
      return true;
    }

    return project.members?.some(
      (member) =>
        member.researcher_id ===
          currentUserResearcherId &&
        member.role === "Lead Investigator",
    );
  };

  const handleCollaborationChange = (e) => {
    setCollaborationForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateCollaboration = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !collaborationForm.institution_1_id ||
      !collaborationForm.institution_2_id
    ) {
      setError(
        "Please select both collaborating institutions.",
      );
      return;
    }

    if (
      collaborationForm.institution_1_id ===
      collaborationForm.institution_2_id
    ) {
      setError(
        "Collaboration must be between two different institutions.",
      );
      return;
    }

    setSubmittingAction("collaboration");

    try {
      await createCollaboration({
        ...collaborationForm,
        institution_1_id: parseInt(
          collaborationForm.institution_1_id,
          10,
        ),
        institution_2_id: parseInt(
          collaborationForm.institution_2_id,
          10,
        ),
        start_date:
          collaborationForm.start_date || null,
        end_date:
          collaborationForm.end_date || null,
      });

      setCollaborationForm(emptyCollaborationForm);

      await loadData(false);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to create collaboration record.",
      );
    } finally {
      setSubmittingAction("");
    }
  };

  const handleDeleteCollaboration = async (id) => {
    if (
      !window.confirm(
        "Delete this institutional collaboration record?",
      )
    ) {
      return;
    }

    try {
      await deleteCollaboration(id);
      await loadData(false);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to delete collaboration record.",
      );
    }
  };

  const handleAuthorFormChange = (
    publicationId,
    field,
    value,
  ) => {
    setAuthorForms((current) => ({
      ...current,
      [publicationId]: {
        ...current[publicationId],
        [field]: value,
      },
    }));
  };

  const handleAddAuthor = async (e, publication) => {
    e.preventDefault();

    const form = authorForms[publication.id] || {};

    if (!form.researcher_id) {
      setError(
        "Please select a researcher to add as a co-author.",
      );
      return;
    }

    setSubmittingAction(`author-${publication.id}`);
    setError("");

    try {
      await addAuthor(publication.id, {
        researcher_id: parseInt(
          form.researcher_id,
          10,
        ),
        author_order: form.author_order
          ? parseInt(form.author_order, 10)
          : (publication.authors?.length || 0) + 1,
        is_corresponding_author: Boolean(
          form.is_corresponding_author,
        ),
      });

      setAuthorForms((current) => ({
        ...current,
        [publication.id]: {
          researcher_id: "",
          author_order: "",
          is_corresponding_author: false,
        },
      }));

      await loadData(false);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to add co-author.",
      );
    } finally {
      setSubmittingAction("");
    }
  };

  const handleRemoveAuthor = async (
    publicationId,
    researcherId,
  ) => {
    if (
      !window.confirm(
        "Remove this co-author from the publication?",
      )
    ) {
      return;
    }

    try {
      await removeAuthor(
        publicationId,
        researcherId,
      );

      await loadData(false);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to remove co-author.",
      );
    }
  };

  const handleAssignmentFormChange = (
    projectId,
    field,
    value,
  ) => {
    setAssignmentForms((current) => ({
      ...current,
      [projectId]: {
        ...current[projectId],
        [field]: value,
      },
    }));
  };

  const handleAssignProjectMember = async (
    e,
    project,
  ) => {
    e.preventDefault();

    const form =
      assignmentForms[project.id] || {};

    if (!form.researcher_id) {
      setError(
        "Please select a researcher to assign to the project.",
      );
      return;
    }

    setSubmittingAction(`project-${project.id}`);
    setError("");

    try {
      await assignProjectMember(project.id, {
        researcher_id: parseInt(
          form.researcher_id,
          10,
        ),
        role: form.role || "Contributor",
      });

      setAssignmentForms((current) => ({
        ...current,
        [project.id]: {
          researcher_id: "",
          role: "Contributor",
        },
      }));

      await loadData(false);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to assign project member.",
      );
    } finally {
      setSubmittingAction("");
    }
  };

  const handleRemoveProjectMember = async (
    projectId,
    researcherId,
  ) => {
    if (
      !window.confirm(
        "Remove this researcher from the project team?",
      )
    ) {
      return;
    }

    try {
      await removeProjectMember(
        projectId,
        researcherId,
      );

      await loadData(false);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to remove project member.",
      );
    }
  };

  const getAvailableAuthors = (publication) => {
    const assignedIds = new Set(
      publication.authors?.map(
        (author) => author.researcher_id,
      ),
    );

    return researchers.filter(
      (researcher) =>
        !assignedIds.has(researcher.id),
    );
  };

  const getAvailableProjectMembers = (project) => {
    const assignedIds = new Set(
      project.members?.map(
        (member) => member.researcher_id,
      ),
    );

    return researchers.filter(
      (researcher) =>
        !assignedIds.has(researcher.id),
    );
  };

  const filteredPublications = publications.filter(
    (publication) =>
      publication.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const filteredProjects = projects.filter(
    (project) =>
      project.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const filteredCollaborations =
    collaborations.filter((collaboration) =>
      collaboration.title
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );

  const visiblePublications =
    activeView === "overview"
      ? filteredPublications.slice(0, 4)
      : filteredPublications;

  const visibleProjects =
    activeView === "overview"
      ? filteredProjects.slice(0, 4)
      : filteredProjects;

  const visibleCollaborations =
    activeView === "overview"
      ? filteredCollaborations.slice(0, 4)
      : filteredCollaborations;

  const tabs = [
    {
      id: "overview",
      label: "Overview",
      icon: Activity,
    },
    {
      id: "coauthors",
      label: "Co-authors",
      icon: BookOpen,
    },
    {
      id: "projects",
      label: "Projects & Teams",
      icon: FolderKanban,
    },
    {
      id: "institutions",
      label: "Institutional Links",
      icon: Building2,
    },
  ];

  return (
    <AppShell>
      <main className="collab-page">
        {/* HERO */}
        <section className="collab-hero">
          <div className="collab-hero-glow" />

          <div className="collab-hero-content">
            <div className="collab-eyebrow">
              <span className="collab-eyebrow-line" />
              Collaboration Workspace
            </div>

            <h1>
              Research collaboration,
              <span> organized.</span>
            </h1>

            <p>
              Coordinate researchers, publication teams,
              projects, and institutional partnerships from
              one centralized workspace.
            </p>

            <div className="collab-hero-stats">
              <div>
                <strong>{activeProjects}</strong>
                <span>Active projects</span>
              </div>

              <div>
                <strong>{activeCollaborations}</strong>
                <span>Active links</span>
              </div>

              <div>
                <strong>{researchers.length}</strong>
                <span>Researchers</span>
              </div>
            </div>
          </div>

          <div className="collab-hero-mark">
            <Link2 size={92} strokeWidth={1.1} />
          </div>
        </section>

        {/* SUMMARY */}
        <section className="collab-summary">
          <div className="collab-summary-card">
            <div className="collab-summary-icon">
              <Users size={19} />
            </div>
            <div>
              <span>Co-author records</span>
              <strong>{publicationAuthorCount}</strong>
            </div>
          </div>

          <div className="collab-summary-card">
            <div className="collab-summary-icon">
              <FolderKanban size={19} />
            </div>
            <div>
              <span>Research projects</span>
              <strong>{projects.length}</strong>
            </div>
          </div>

          <div className="collab-summary-card">
            <div className="collab-summary-icon">
              <Building2 size={19} />
            </div>
            <div>
              <span>Institutional links</span>
              <strong>{collaborations.length}</strong>
            </div>
          </div>

          <div className="collab-summary-card">
            <div className="collab-summary-icon">
              <UserPlus size={19} />
            </div>
            <div>
              <span>Team assignments</span>
              <strong>{projectAssignmentCount}</strong>
            </div>
          </div>

          <div className="collab-summary-card collab-summary-card--accent">
            <div className="collab-summary-icon">
              <CheckCircle2 size={19} />
            </div>
            <div>
              <span>Active work</span>
              <strong>
                {activeProjects +
                  activeCollaborations}
              </strong>
            </div>
          </div>
        </section>

        {/* TOOLBAR */}
        <section className="collab-toolbar">
          <nav
            className="collab-tabs"
            aria-label="Collaboration management areas"
          >
            {tabs.map(
              ({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() =>
                    setActiveView(id)
                  }
                  className={`collab-tab ${
                    activeView === id
                      ? "collab-tab--active"
                      : ""
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ),
            )}
          </nav>

          <div className="collab-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Search collaborations..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                <X size={15} />
              </button>
            )}
          </div>
        </section>

        {error && (
          <div className="collab-alert">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="collab-loading">
            <div className="collab-spinner" />
            <p>
              Loading collaboration workspace...
            </p>
          </div>
        ) : (
          <>
            {/* CO-AUTHORS */}
            {(activeView === "overview" ||
              activeView === "coauthors") && (
              <section className="collab-section">
                <div className="collab-section-heading">
                  <div>
                    <span className="collab-section-kicker">
                      Publication network
                    </span>

                    <h2>Publication author teams</h2>

                    <p>
                      Manage researchers connected to
                      each publication.
                    </p>
                  </div>

                  <span className="collab-count">
                    {filteredPublications.length}{" "}
                    publications
                  </span>
                </div>

                <div className="collab-list">
                  {visiblePublications.length ===
                    0 && (
                    <EmptyState
                      icon={BookOpen}
                      title="No publications found"
                      text="Publications available for co-author management will appear here."
                    />
                  )}

                  {visiblePublications.map(
                    (publication) => {
                      const editable =
                        canManagePublication(
                          publication,
                        );

                      const availableAuthors =
                        getAvailableAuthors(
                          publication,
                        );

                      return (
                        <article
                          key={publication.id}
                          className="collab-card"
                        >
                          <div className="collab-card-top">
                            <div className="collab-card-heading">
                              <div className="collab-card-icon">
                                <BookOpen size={19} />
                              </div>

                              <div>
                                <div className="collab-badge-row">
                                  <span className="collab-status">
                                    {publication.status ||
                                      "Draft"}
                                  </span>

                                  <span className="collab-type">
                                    {publication.type ||
                                      "Publication"}
                                  </span>
                                </div>

                                <h3>
                                  {publication.title}
                                </h3>
                              </div>
                            </div>

                            <ChevronRight
                              size={18}
                              className="collab-arrow"
                            />
                          </div>

                          <div className="collab-card-divider" />

                          <div className="collab-members">
                            {publication.authors
                              ?.length ? (
                              publication.authors
                                .slice()
                                .sort(
                                  (a, b) =>
                                    (a.author_order ||
                                      99) -
                                    (b.author_order ||
                                      99),
                                )
                                .map((author) => (
                                  <div
                                    key={author.id}
                                    className="collab-member-chip"
                                  >
                                    <div className="collab-mini-avatar">
                                      {getResearcherName(
                                        author.researcher_id,
                                      )
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                        "R"}
                                    </div>

                                    <div className="collab-member-info">
                                      <span>
                                        {author.author_order
                                          ? `${author.author_order}. `
                                          : ""}
                                        {
                                          getResearcherName(
                                            author.researcher_id,
                                          )
                                        }
                                      </span>

                                      {author.is_corresponding_author && (
                                        <small>
                                          Corresponding
                                        </small>
                                      )}
                                    </div>

                                    {editable && (
                                      <button
                                        type="button"
                                        className="collab-remove"
                                        title="Remove co-author"
                                        onClick={() =>
                                          handleRemoveAuthor(
                                            publication.id,
                                            author.researcher_id,
                                          )
                                        }
                                      >
                                        <X size={13} />
                                      </button>
                                    )}
                                  </div>
                                ))
                            ) : (
                              <span className="collab-empty-inline">
                                No co-authors recorded yet.
                              </span>
                            )}
                          </div>

                          {editable && (
                            <form
                              className="collab-action-panel"
                              onSubmit={(e) =>
                                handleAddAuthor(
                                  e,
                                  publication,
                                )
                              }
                            >
                              <div className="collab-action-title">
                                <UserPlus size={16} />
                                Add researcher
                              </div>

                              <select
                                value={
                                  authorForms[
                                    publication.id
                                  ]?.researcher_id ||
                                  ""
                                }
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
                                <option value="">
                                  Select co-author...
                                </option>

                                {availableAuthors.map(
                                  (researcher) => (
                                    <option
                                      key={
                                        researcher.id
                                      }
                                      value={
                                        researcher.id
                                      }
                                    >
                                      {
                                        researcher.full_name
                                      }{" "}
                                      —{" "}
                                      {getInstitutionName(
                                        researcher.institution_id,
                                      )}
                                    </option>
                                  ),
                                )}
                              </select>

                              <input
                                type="number"
                                min="1"
                                placeholder="Order"
                                value={
                                  authorForms[
                                    publication.id
                                  ]?.author_order ||
                                  ""
                                }
                                onChange={(e) =>
                                  handleAuthorFormChange(
                                    publication.id,
                                    "author_order",
                                    e.target.value,
                                  )
                                }
                                className="collab-input collab-input--order"
                              />

                              <label className="collab-check">
                                <input
                                  type="checkbox"
                                  checked={
                                    authorForms[
                                      publication.id
                                    ]
                                      ?.is_corresponding_author ||
                                    false
                                  }
                                  onChange={(e) =>
                                    handleAuthorFormChange(
                                      publication.id,
                                      "is_corresponding_author",
                                      e.target.checked,
                                    )
                                  }
                                />
                                Corresponding
                              </label>

                              <button
                                type="submit"
                                className="collab-primary-btn"
                                disabled={
                                  submittingAction ===
                                    `author-${publication.id}` ||
                                  availableAuthors.length ===
                                    0
                                }
                              >
                                <Plus size={16} />
                                {submittingAction ===
                                `author-${publication.id}`
                                  ? "Adding..."
                                  : "Add Co-author"}
                              </button>
                            </form>
                          )}
                        </article>
                      );
                    },
                  )}
                </div>
              </section>
            )}

            {/* PROJECTS */}
            {(activeView === "overview" ||
              activeView === "projects") && (
              <section className="collab-section">
                <div className="collab-section-heading">
                  <div>
                    <span className="collab-section-kicker">
                      Project network
                    </span>

                    <h2>Team management</h2>

                    <p>
                      Build project teams and assign
                      researchers to specific roles.
                    </p>
                  </div>

                  <span className="collab-count">
                    {filteredProjects.length} projects
                  </span>
                </div>

                <div className="collab-list">
                  {visibleProjects.length === 0 && (
                    <EmptyState
                      icon={FolderKanban}
                      title="No research projects found"
                      text="Create research projects to start building collaborative teams."
                    />
                  )}

                  {visibleProjects.map(
                    (project) => {
                      const editable =
                        canManageProject(project);

                      const availableMembers =
                        getAvailableProjectMembers(
                          project,
                        );

                      return (
                        <article
                          key={project.id}
                          className="collab-card"
                        >
                          <div className="collab-card-top">
                            <div className="collab-card-heading">
                              <div className="collab-card-icon">
                                <FolderKanban
                                  size={19}
                                />
                              </div>

                              <div>
                                <div className="collab-badge-row">
                                  <span className="collab-status">
                                    {project.status ||
                                      "Proposed"}
                                  </span>

                                  <span className="collab-type">
                                    {getInstitutionName(
                                      project.institution_id,
                                    )}
                                  </span>
                                </div>

                                <h3>
                                  {project.title}
                                </h3>
                              </div>
                            </div>
                          </div>

                          {project.description && (
                            <p className="collab-description">
                              {project.description}
                            </p>
                          )}

                          <div className="collab-card-divider" />

                          <div className="collab-members">
                            {project.members
                              ?.length ? (
                              project.members.map(
                                (member) => (
                                  <div
                                    key={member.id}
                                    className="collab-member-chip"
                                  >
                                    <div className="collab-mini-avatar">
                                      {getResearcherName(
                                        member.researcher_id,
                                      )
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                        "R"}
                                    </div>

                                    <div className="collab-member-info">
                                      <span>
                                        {getResearcherName(
                                          member.researcher_id,
                                        )}
                                      </span>

                                      <small>
                                        {member.role}
                                      </small>
                                    </div>

                                    {editable && (
                                      <button
                                        type="button"
                                        className="collab-remove"
                                        title="Remove project member"
                                        onClick={() =>
                                          handleRemoveProjectMember(
                                            project.id,
                                            member.researcher_id,
                                          )
                                        }
                                      >
                                        <X size={13} />
                                      </button>
                                    )}
                                  </div>
                                ),
                              )
                            ) : (
                              <span className="collab-empty-inline">
                                No project team members
                                assigned yet.
                              </span>
                            )}
                          </div>

                          {editable && (
                            <form
                              className="collab-action-panel"
                              onSubmit={(e) =>
                                handleAssignProjectMember(
                                  e,
                                  project,
                                )
                              }
                            >
                              <div className="collab-action-title">
                                <UserPlus size={16} />
                                Assign team member
                              </div>

                              <select
                                value={
                                  assignmentForms[
                                    project.id
                                  ]?.researcher_id ||
                                  ""
                                }
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
                                <option value="">
                                  Select researcher...
                                </option>

                                {availableMembers.map(
                                  (researcher) => (
                                    <option
                                      key={
                                        researcher.id
                                      }
                                      value={
                                        researcher.id
                                      }
                                    >
                                      {
                                        researcher.full_name
                                      }{" "}
                                      —{" "}
                                      {getInstitutionName(
                                        researcher.institution_id,
                                      )}
                                    </option>
                                  ),
                                )}
                              </select>

                              <select
                                value={
                                  assignmentForms[
                                    project.id
                                  ]?.role ||
                                  "Contributor"
                                }
                                onChange={(e) =>
                                  handleAssignmentFormChange(
                                    project.id,
                                    "role",
                                    e.target.value,
                                  )
                                }
                                className="collab-input collab-input--role"
                              >
                                {PROJECT_ROLES.map(
                                  (role) => (
                                    <option
                                      key={role}
                                      value={role}
                                    >
                                      {role}
                                    </option>
                                  ),
                                )}
                              </select>

                              <button
                                type="submit"
                                className="collab-primary-btn"
                                disabled={
                                  submittingAction ===
                                    `project-${project.id}` ||
                                  availableMembers.length ===
                                    0
                                }
                              >
                                <UserPlus size={16} />
                                {submittingAction ===
                                `project-${project.id}`
                                  ? "Assigning..."
                                  : "Assign"}
                              </button>
                            </form>
                          )}
                        </article>
                      );
                    },
                  )}
                </div>
              </section>
            )}

            {/* INSTITUTIONAL COLLABORATIONS */}
            {(activeView === "overview" ||
              activeView === "institutions") && (
              <section className="collab-section">
                <div className="collab-section-heading">
                  <div>
                    <span className="collab-section-kicker">
                      Institutional network
                    </span>

                    <h2>Formal collaboration records</h2>

                    <p>
                      Establish and track partnerships
                      between participating institutions.
                    </p>
                  </div>

                  <span className="collab-count">
                    {filteredCollaborations.length}{" "}
                    links
                  </span>
                </div>

                <form
                  className="collab-create-form"
                  onSubmit={
                    handleCreateCollaboration
                  }
                >
                  <div className="collab-form-heading">
                    <div className="collab-form-icon">
                      <Plus size={20} />
                    </div>

                    <div>
                      <h3>
                        Create institutional
                        collaboration
                      </h3>

                      <p>
                        Add a new formal relationship
                        between two institutions.
                      </p>
                    </div>
                  </div>

                  <div className="collab-form-grid">
                    <div className="collab-field collab-field--full">
                      <label>
                        Collaboration title
                      </label>

                      <input
                        name="title"
                        placeholder="e.g. Joint AI Research Initiative"
                        value={
                          collaborationForm.title
                        }
                        onChange={
                          handleCollaborationChange
                        }
                        required
                        className="collab-input"
                      />
                    </div>

                    <div className="collab-field collab-field--full">
                      <label>
                        Agreement details
                      </label>

                      <textarea
                        name="description"
                        placeholder="Describe the purpose and scope of the collaboration..."
                        value={
                          collaborationForm.description
                        }
                        onChange={
                          handleCollaborationChange
                        }
                        className="collab-input"
                        rows={4}
                      />
                    </div>

                    <div className="collab-field">
                      <label>
                        Collaboration type
                      </label>

                      <select
                        name="type"
                        value={
                          collaborationForm.type
                        }
                        onChange={
                          handleCollaborationChange
                        }
                        className="collab-input"
                      >
                        {COLLAB_TYPES.map(
                          (type) => (
                            <option
                              key={type}
                              value={type}
                            >
                              {type}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="collab-field">
                      <label>Status</label>

                      <select
                        name="status"
                        value={
                          collaborationForm.status
                        }
                        onChange={
                          handleCollaborationChange
                        }
                        className="collab-input"
                      >
                        {COLLAB_STATUSES.map(
                          (status) => (
                            <option
                              key={status}
                              value={status}
                            >
                              {status}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="collab-field">
                      <label>
                        First institution
                      </label>

                      <select
                        name="institution_1_id"
                        value={
                          collaborationForm.institution_1_id
                        }
                        onChange={
                          handleCollaborationChange
                        }
                        required
                        className="collab-input"
                      >
                        <option value="">
                          Select institution...
                        </option>

                        {institutions.map(
                          (institution) => (
                            <option
                              key={
                                institution.id
                              }
                              value={
                                institution.id
                              }
                            >
                              {institution.name}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="collab-field">
                      <label>
                        Second institution
                      </label>

                      <select
                        name="institution_2_id"
                        value={
                          collaborationForm.institution_2_id
                        }
                        onChange={
                          handleCollaborationChange
                        }
                        required
                        className="collab-input"
                      >
                        <option value="">
                          Select institution...
                        </option>

                        {institutions.map(
                          (institution) => (
                            <option
                              key={
                                institution.id
                              }
                              value={
                                institution.id
                              }
                            >
                              {institution.name}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <div className="collab-field">
                      <label>Start date</label>

                      <input
                        name="start_date"
                        type="date"
                        value={
                          collaborationForm.start_date
                        }
                        onChange={
                          handleCollaborationChange
                        }
                        className="collab-input"
                      />
                    </div>

                    <div className="collab-field">
                      <label>End date</label>

                      <input
                        name="end_date"
                        type="date"
                        value={
                          collaborationForm.end_date
                        }
                        onChange={
                          handleCollaborationChange
                        }
                        className="collab-input"
                      />
                    </div>
                  </div>

                  <div className="collab-form-actions">
                    <button
                      type="submit"
                      disabled={
                        submittingAction ===
                        "collaboration"
                      }
                      className="collab-primary-btn"
                    >
                      <Plus size={17} />

                      {submittingAction ===
                      "collaboration"
                        ? "Saving..."
                        : "Create Collaboration"}
                    </button>
                  </div>
                </form>

                <div className="collab-list">
                  {visibleCollaborations.length ===
                    0 && (
                    <EmptyState
                      icon={Building2}
                      title="No institutional collaborations"
                      text="Create your first institutional partnership using the form above."
                    />
                  )}

                  {visibleCollaborations.map(
                    (collaboration) => (
                      <article
                        key={collaboration.id}
                        className="collab-card collab-institution-card"
                      >
                        <div className="collab-card-top">
                          <div className="collab-card-heading">
                            <div className="collab-card-icon">
                              <Building2
                                size={19}
                              />
                            </div>

                            <div>
                              <div className="collab-badge-row">
                                <span className="collab-status">
                                  {
                                    collaboration.status
                                  }
                                </span>

                                <span className="collab-type">
                                  {
                                    collaboration.type
                                  }
                                </span>
                              </div>

                              <h3>
                                {
                                  collaboration.title
                                }
                              </h3>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteCollaboration(
                                collaboration.id,
                              )
                            }
                            className="collab-delete-btn"
                            title="Delete collaboration"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>

                        <div className="collab-partner-box">
                          <div className="collab-partner">
                            <span>
                              Institution 01
                            </span>
                            <strong>
                              {getInstitutionName(
                                collaboration.institution_1_id,
                              )}
                            </strong>
                          </div>

                          <div className="collab-partner-arrow">
                            <ArrowRight
                              size={18}
                            />
                          </div>

                          <div className="collab-partner">
                            <span>
                              Institution 02
                            </span>
                            <strong>
                              {getInstitutionName(
                                collaboration.institution_2_id,
                              )}
                            </strong>
                          </div>
                        </div>

                        {collaboration.description && (
                          <p className="collab-description">
                            {
                              collaboration.description
                            }
                          </p>
                        )}

                        {(collaboration.start_date ||
                          collaboration.end_date) && (
                          <div className="collab-date-row">
                            <ClipboardList
                              size={15}
                            />
                            <span>
                              Duration:
                            </span>
                            <strong>
                              {collaboration.start_date ||
                                "Open"}
                            </strong>
                            <ArrowRight
                              size={13}
                            />
                            <strong>
                              {collaboration.end_date ||
                                "Open"}
                            </strong>
                          </div>
                        )}
                      </article>
                    ),
                  )}
                </div>
              </section>
            )}

            {/* RESEARCHER DIRECTORY */}
            {(activeView === "overview" ||
              activeView === "projects") && (
              <section className="collab-section">
                <div className="collab-section-heading">
                  <div>
                    <span className="collab-section-kicker">
                      Research network
                    </span>

                    <h2>Researcher directory</h2>

                    <p>
                      Browse researchers available for
                      collaborative work.
                    </p>
                  </div>

                  <span className="collab-count">
                    {researchers.length} researchers
                  </span>
                </div>

                <div className="collab-directory">
                  {researchers.length === 0 && (
                    <EmptyState
                      icon={Users}
                      title="No researchers registered"
                      text="Researchers will appear here once they are added to the system."
                    />
                  )}

                  {researchers.map(
                    (researcher) => (
                      <article
                        key={researcher.id}
                        className="collab-person"
                      >
                        <div className="collab-avatar">
                          {researcher.full_name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "R"}
                        </div>

                        <div className="collab-person-content">
                          <div className="collab-person-top">
                            <div>
                              <h3>
                                {
                                  researcher.full_name
                                }
                              </h3>

                              <p>
                                {getResearcherInstitution(
                                  researcher.id,
                                )}
                              </p>
                            </div>

                            <span className="collab-person-id">
                              #{researcher.id}
                            </span>
                          </div>

                          {(researcher.research_interests ||
                            researcher.skills) && (
                            <div className="collab-interest">
                              {researcher.research_interests ||
                                researcher.skills}
                            </div>
                          )}
                        </div>
                      </article>
                    ),
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </AppShell>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="collab-empty-state">
      <div className="collab-empty-icon">
        <Icon size={25} />
      </div>

      <h3>{title}</h3>

      <p>{text}</p>
    </div>
  );
}