import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { useAuth } from "../hooks/useAuth";

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  assignProjectMember,
  removeProjectMember,
} from "../api/projects";

import {
  getResearchers,
  getInstitutions,
} from "../api/researchers";

import {
  FolderKanban,
  Search,
  Plus,
  Users,
  Building2,
  WalletCards,
  CalendarDays,
  Globe2,
  LockKeyhole,
  Pencil,
  Trash2,
  UserPlus,
  X,
  Check,
  Clock3,
  CircleAlert,
  ArrowUpRight,
} from "lucide-react";

import "./Projects.css";


const emptyForm = {
  title: "",
  description: "",
  funding_agency: "",
  budget: 0,
  status: "Proposed",
  start_date: "",
  end_date: "",
  institution_id: "",
  visible_to_others: false,
};


export default function Projects() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  const [assignForms, setAssignForms] = useState({});


  /* =========================================================
     LOAD PROJECTS
     ========================================================= */

  const loadProjects = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const response = await getProjects();

      console.log("PROJECT API RESPONSE:", response.data);

      if (Array.isArray(response.data)) {
        setProjects(response.data);
      } else {
        setProjects([]);
      }

      setError("");
    } catch (err) {
      console.error("PROJECT LOADING ERROR:", err);

      setProjects([]);

      setError(
        err.response?.data?.detail ||
          "Unable to load research projects."
      );
    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     LOAD RESEARCHERS
     ========================================================= */

  const loadResearchers = async () => {
    try {
      const response = await getResearchers();

      console.log(
        "RESEARCHERS API RESPONSE:",
        response.data
      );

      setResearchers(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "RESEARCHERS LOADING ERROR:",
        err
      );

      setResearchers([]);
    }
  };


  /* =========================================================
     LOAD INSTITUTIONS
     ========================================================= */

  const loadInstitutions = async () => {
    try {
      const response = await getInstitutions();

      console.log(
        "INSTITUTIONS API RESPONSE:",
        response.data
      );

      setInstitutions(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (err) {
      console.error(
        "INSTITUTIONS LOADING ERROR:",
        err
      );

      setInstitutions([]);
    }
  };


  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(() => {
    loadProjects();
    loadResearchers();
    loadInstitutions();
  }, []);


  /* =========================================================
     REFRESH EVERYTHING
     ========================================================= */

  const loadData = async (showLoading = false) => {
    await Promise.allSettled([
      loadProjects(showLoading),
      loadResearchers(),
      loadInstitutions(),
    ]);
  };


  /* =========================================================
     FORM HANDLERS
     ========================================================= */

  const handleFormChange = (e) => {
    const value =
      e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value;

    setForm((previous) => ({
      ...previous,
      [e.target.name]: value,
    }));
  };


  const handleEditFormChange = (e) => {
    const value =
      e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value;

    setEditForm((previous) => ({
      ...previous,
      [e.target.name]: value,
    }));
  };


  /* =========================================================
     CREATE PROJECT
     ========================================================= */

  const handleCreate = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        title: form.title.trim(),

        description:
          form.description.trim() || null,

        funding_agency:
          form.funding_agency.trim() || null,

        budget:
          form.budget === "" ||
          form.budget === null ||
          form.budget === undefined
            ? 0
            : Number(form.budget),

        status:
          form.status || "Proposed",

        start_date:
          form.start_date || null,

        end_date:
          form.end_date || null,

        institution_id:
          form.institution_id !== "" &&
          form.institution_id !== null &&
          form.institution_id !== undefined
            ? Number(form.institution_id)
            : null,

        visible_to_others:
          Boolean(form.visible_to_others),
      };

      console.log(
        "CREATING PROJECT:",
        payload
      );

      await createProject(payload);

      setForm(emptyForm);
      setShowCreateForm(false);

      await loadData(false);
    } catch (err) {
      console.error(
        "CREATE PROJECT ERROR:",
        err
      );

      const detail =
        err.response?.data?.detail;

      if (Array.isArray(detail)) {
        setError(
          detail
            .map((item) => {
              const location =
                Array.isArray(item.loc)
                  ? item.loc.join(" → ")
                  : "field";

              return `${location}: ${item.msg}`;
            })
            .join(" | ")
        );
      } else {
        setError(
          typeof detail === "string"
            ? detail
            : "Failed to create research project."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };


  /* =========================================================
     EDIT PROJECT
     ========================================================= */

  const handleStartEdit = (project) => {
    setEditingProjectId(project.id);

    const formatDateForInput = (value) => {
      if (!value) {
        return "";
      }

      const stringValue = String(value);

      if (
        /^\d{4}-\d{2}-\d{2}$/.test(
          stringValue
        )
      ) {
        return stringValue;
      }

      if (stringValue.includes("T")) {
        return stringValue.split("T")[0];
      }

      return stringValue;
    };

    setEditForm({
      title: project.title || "",

      description:
        project.description || "",

      funding_agency:
        project.funding_agency || "",

      budget:
        project.budget !== null &&
        project.budget !== undefined
          ? project.budget
          : 0,

      status:
        project.status || "Proposed",

      start_date:
        formatDateForInput(
          project.start_date
        ),

      end_date:
        formatDateForInput(
          project.end_date
        ),

      institution_id:
        project.institution_id !== null &&
        project.institution_id !== undefined
          ? String(project.institution_id)
          : "",

      visible_to_others:
        Boolean(project.visible_to_others),
    });
  };


  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setEditForm(emptyForm);
    setError("");
  };


  /* =========================================================
     SAVE EDITED PROJECT
     ========================================================= */

  const handleSaveEdit = async (id) => {
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        title: editForm.title.trim(),

        description:
          editForm.description.trim() || null,

        funding_agency:
          editForm.funding_agency.trim() || null,

        budget:
          editForm.budget === "" ||
          editForm.budget === null ||
          editForm.budget === undefined
            ? null
            : Number(editForm.budget),

        status:
          editForm.status || null,

        start_date:
          editForm.start_date &&
          String(editForm.start_date).trim()
            ? String(editForm.start_date).trim()
            : null,

        end_date:
          editForm.end_date &&
          String(editForm.end_date).trim()
            ? String(editForm.end_date).trim()
            : null,

        institution_id:
          editForm.institution_id !== "" &&
          editForm.institution_id !== null &&
          editForm.institution_id !== undefined
            ? Number(editForm.institution_id)
            : null,

        visible_to_others:
          Boolean(editForm.visible_to_others),
      };

      console.log(
        "================================="
      );

      console.log(
        "UPDATING PROJECT ID:",
        id
      );

      console.log(
        "UPDATE PAYLOAD:",
        payload
      );

      console.log(
        "================================="
      );

      await updateProject(id, payload);

      setEditingProjectId(null);
      setEditForm(emptyForm);

      await loadData(false);
    } catch (err) {
      console.error(
        "================================="
      );

      console.error(
        "UPDATE PROJECT ERROR:",
        err
      );

      console.error(
        "STATUS:",
        err.response?.status
      );

      console.error(
        "RESPONSE DATA:",
        err.response?.data
      );

      console.error(
        "VALIDATION DETAIL:",
        err.response?.data?.detail
      );

      console.error(
        "================================="
      );

      const detail =
        err.response?.data?.detail;

      let message =
        "Failed to save project updates.";

      if (Array.isArray(detail)) {
        message = detail
          .map((item) => {
            const location =
              Array.isArray(item.loc)
                ? item.loc.join(" → ")
                : "field";

            return `${location}: ${item.msg}`;
          })
          .join("\n");
      } else if (
        typeof detail === "string"
      ) {
        message = detail;
      } else if (detail) {
        message = JSON.stringify(
          detail,
          null,
          2
        );
      }

      setError(message);

      alert(message);
    } finally {
      setSubmitting(false);
    }
  };


  /* =========================================================
     VISIBILITY
     ========================================================= */

  const handleToggleVisibility = async (
    project
  ) => {
    try {
      await updateProject(project.id, {
        visible_to_others:
          !project.visible_to_others,
      });

      await loadProjects(false);
    } catch (err) {
      console.error(err);

      const detail =
        err.response?.data?.detail;

      let message =
        "Failed to update project visibility.";

      if (Array.isArray(detail)) {
        message = detail
          .map((item) => item.msg)
          .join(" | ");
      } else if (
        typeof detail === "string"
      ) {
        message = detail;
      }

      alert(message);
    }
  };


  /* =========================================================
     DELETE
     ========================================================= */

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this project?"
      )
    ) {
      return;
    }

    try {
      await deleteProject(id);

      await loadProjects(false);
    } catch (err) {
      console.error(err);

      const detail =
        err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Failed to delete project."
      );
    }
  };


  /* =========================================================
     MEMBER ASSIGNMENT
     ========================================================= */

  const handleAssignChange = (
    projectId,
    field,
    value
  ) => {
    setAssignForms((previous) => ({
      ...previous,

      [projectId]: {
        ...previous[projectId],
        [field]: value,
      },
    }));
  };


  const handleAssignMember = async (
    e,
    projectId
  ) => {
    e.preventDefault();

    const assignForm =
      assignForms[projectId];

    if (!assignForm?.researcher_id) {
      alert(
        "Please select a researcher."
      );

      return;
    }

    try {
      await assignProjectMember(
        projectId,
        {
          researcher_id: Number(
            assignForm.researcher_id
          ),

          role:
            assignForm.role ||
            "Contributor",
        }
      );

      setAssignForms((previous) => ({
        ...previous,

        [projectId]: {
          researcher_id: "",
          role: "Contributor",
        },
      }));

      await loadProjects(false);
    } catch (err) {
      console.error(err);

      const detail =
        err.response?.data?.detail;

      alert(
        typeof detail === "string"
          ? detail
          : "Failed to assign project member."
      );
    }
  };


  /* =========================================================
     REMOVE MEMBER
     ========================================================= */

  const handleRemoveMember = async (
    projectId,
    researcherId
  ) => {
    if (
      !window.confirm(
        "Remove this researcher from the project?"
      )
    ) {
      return;
    }

    try {
      await removeProjectMember(
        projectId,
        researcherId
      );

      await loadProjects(false);
    } catch (err) {
      console.error(err);

      const detail =
        err.response?.data?.detail;

      alert(
        typeof detail === "string"
          ? detail
          : "Failed to remove project member."
      );
    }
  };


  /* =========================================================
     HELPERS
     ========================================================= */

  const getInstitutionName = (id) => {
    if (
      id === null ||
      id === undefined ||
      id === ""
    ) {
      return "Independent project";
    }

    const institution =
      institutions.find(
        (item) =>
          Number(item.id) === Number(id)
      );

    return institution
      ? institution.name
      : "Institution not found";
  };


  const getResearcherName = (id) => {
    const researcher =
      researchers.find(
        (item) =>
          Number(item.id) === Number(id)
      );

    if (!researcher) {
      return `Researcher #${id}`;
    }

    return (
      researcher.full_name ||
      researcher.name ||
      researcher.username ||
      `Researcher #${id}`
    );
  };


  const currentUserResearcher =
    researchers.find(
      (researcher) =>
        Number(researcher.user_id) ===
        Number(user?.id)
    );


  const currentUserResearcherId =
    currentUserResearcher?.id;


  const currentUserInstitutionId =
    currentUserResearcher?.institution_id ||
    (user?.role === "InstitutionAdmin"
      ? institutions[0]?.id
      : null);


  /* =========================================================
     PERMISSION
     ========================================================= */

  const canManageProject = (project) => {
    if (user?.role === "SystemAdmin") {
      return true;
    }

    if (
      Number(project.created_by) ===
      Number(user?.id)
    ) {
      return true;
    }

    if (
      user?.role === "InstitutionAdmin" &&
      currentUserInstitutionId &&
      Number(project.institution_id) ===
        Number(currentUserInstitutionId)
    ) {
      return true;
    }

    const isLead =
      Array.isArray(project.members) &&
      project.members.some(
        (member) =>
          Number(member.researcher_id) ===
            Number(
              currentUserResearcherId
            ) &&
          member.role ===
            "Lead Investigator"
      );

    return Boolean(isLead);
  };


  /* =========================================================
     FILTERING
     ========================================================= */

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      if (activeTab === "mine") {
        const isCreator =
          Number(project.created_by) ===
          Number(user?.id);

        const isMember =
          Array.isArray(project.members) &&
          project.members.some(
            (member) =>
              Number(
                member.researcher_id
              ) ===
              Number(
                currentUserResearcherId
              )
          );

        if (!isCreator && !isMember) {
          return false;
        }
      }

      if (activeTab === "institutional") {
        if (
          !currentUserInstitutionId ||
          Number(project.institution_id) !==
            Number(
              currentUserInstitutionId
            )
        ) {
          return false;
        }
      }

      if (
        statusFilter !== "all" &&
        (project.status || "")
          .toLowerCase() !==
          statusFilter.toLowerCase()
      ) {
        return false;
      }

      if (search.trim()) {
        const query =
          search.toLowerCase();

        const searchableText = `
          ${project.title || ""}
          ${project.description || ""}
          ${project.funding_agency || ""}
          ${getInstitutionName(
            project.institution_id
          )}
        `.toLowerCase();

        if (
          !searchableText.includes(query)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    projects,
    activeTab,
    statusFilter,
    search,
    user,
    currentUserResearcherId,
    currentUserInstitutionId,
    institutions,
  ]);


  /* =========================================================
     STATISTICS
     ========================================================= */

  const totalProjects =
    projects.length;


  const activeProjects =
    projects.filter(
      (project) =>
        (project.status || "")
          .toLowerCase() === "active"
    ).length;


  const completedProjects =
    projects.filter(
      (project) =>
        (project.status || "")
          .toLowerCase() === "completed"
    ).length;


  const totalBudget =
    projects.reduce(
      (total, project) =>
        total +
        (Number(project.budget) || 0),
      0
    );


  /* =========================================================
     STATUS CLASS
     ========================================================= */

  const getStatusClass = (status) => {
    switch (
      (status || "").toLowerCase()
    ) {
      case "active":
        return "project-status project-status--active";

      case "completed":
        return "project-status project-status--completed";

      case "suspended":
        return "project-status project-status--suspended";

      default:
        return "project-status project-status--proposed";
    }
  };


  /* =========================================================
     JSX
     ========================================================= */

  return (
    <AppShell>
      <main className="projects-page">

        {/* =================================================
            HERO
            ================================================= */}

        <section className="projects-hero">

          <div className="projects-hero-content">

            <div className="projects-eyebrow">

              <span className="projects-badge">
                Collaboration Network
              </span>

              <span className="projects-context">
                Research Workspace
              </span>

            </div>

            <p className="projects-kicker">
              PROJECT MANAGEMENT
            </p>

            <h1>
              Research <span>Projects</span>
            </h1>

            <p className="projects-description">
              Coordinate multidisciplinary
              research initiatives, manage
              project teams, monitor funding,
              and track collaboration progress
              from one workspace.
            </p>

            <div className="projects-hero-actions">

              <button
                className="projects-primary-btn"
                onClick={() =>
                  setShowCreateForm(true)
                }
              >
                <Plus size={16} />
                New Research Project
              </button>

              <div className="projects-hero-note">
                <FolderKanban size={15} />
                {totalProjects} registered
                projects
              </div>

            </div>

          </div>


          <div className="projects-hero-panel">

            <div className="hero-panel-icon">
              <FolderKanban size={22} />
            </div>

            <span>
              WORKSPACE STATUS
            </span>

            <strong>
              {activeProjects} Active
            </strong>

            <small>
              projects currently in
              progress
            </small>

            <div className="hero-panel-divider" />

            <div className="hero-panel-row">
              <span>Completed</span>
              <b>{completedProjects}</b>
            </div>

          </div>

        </section>


        {/* =================================================
            STATISTICS
            ================================================= */}

        <section className="projects-section">

          <div className="projects-section-heading">

            <div>
              <span className="section-label">
                PROJECT OVERVIEW
              </span>

              <h2>
                Research Portfolio
              </h2>
            </div>

            <span className="section-caption">
              Current workspace metrics
            </span>

          </div>


          <div className="project-stats-grid">

            <div className="project-stat-card">

              <div className="project-stat-icon">
                <FolderKanban size={19} />
              </div>

              <div>
                <span>
                  Total Projects
                </span>

                <strong>
                  {totalProjects}
                </strong>

                <small>
                  Research initiatives
                </small>
              </div>

            </div>


            <div className="project-stat-card">

              <div className="project-stat-icon">
                <Clock3 size={19} />
              </div>

              <div>
                <span>
                  Active Projects
                </span>

                <strong>
                  {activeProjects}
                </strong>

                <small>
                  Currently in progress
                </small>
              </div>

            </div>


            <div className="project-stat-card">

              <div className="project-stat-icon">
                <Check size={19} />
              </div>

              <div>
                <span>
                  Completed
                </span>

                <strong>
                  {completedProjects}
                </strong>

                <small>
                  Finished initiatives
                </small>
              </div>

            </div>


            <div className="project-stat-card">

              <div className="project-stat-icon">
                <WalletCards size={19} />
              </div>

              <div>
                <span>
                  Portfolio Budget
                </span>

                <strong>
                  $
                  {totalBudget.toLocaleString()}
                </strong>

                <small>
                  Combined project funding
                </small>
              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            FILTER
            ================================================= */}

        <section className="projects-toolbar">

          <div className="projects-tabs">

            <button
              onClick={() =>
                setActiveTab("all")
              }
              className={
                activeTab === "all"
                  ? "project-tab project-tab--active"
                  : "project-tab"
              }
            >
              All Projects
            </button>


            <button
              onClick={() =>
                setActiveTab("mine")
              }
              className={
                activeTab === "mine"
                  ? "project-tab project-tab--active"
                  : "project-tab"
              }
            >
              My Projects
            </button>


            {currentUserInstitutionId && (
              <button
                onClick={() =>
                  setActiveTab(
                    "institutional"
                  )
                }
                className={
                  activeTab ===
                  "institutional"
                    ? "project-tab project-tab--active"
                    : "project-tab"
                }
              >
                Institutional
              </button>
            )}

          </div>


          <div className="project-search-area">

            <div className="project-search">

              <Search size={16} />

              <input
                type="text"
                placeholder="Search projects, funding, institutions..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

              {search && (
                <button
                  onClick={() =>
                    setSearch("")
                  }
                  className="clear-search"
                >
                  <X size={14} />
                </button>
              )}

            </div>


            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="project-filter"
            >
              <option value="all">
                All Status
              </option>

              <option value="proposed">
                Proposed
              </option>

              <option value="active">
                Active
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="suspended">
                Suspended
              </option>
            </select>

          </div>

        </section>


        {/* =================================================
            CREATE FORM
            ================================================= */}

        {showCreateForm && (
          <section className="project-create-panel">

            <div className="create-panel-header">

              <div>

                <span className="section-label">
                  NEW INITIATIVE
                </span>

                <h2>
                  Create Research Project
                </h2>

                <p>
                  Add a research initiative
                  to the collaboration
                  workspace.
                </p>

              </div>


              <button
                className="close-create-btn"
                onClick={() =>
                  setShowCreateForm(false)
                }
              >
                <X size={18} />
              </button>

            </div>


            <form
              onSubmit={handleCreate}
              className="project-form"
            >

              <div className="form-field form-field--wide">

                <label>
                  Project Title
                </label>

                <input
                  name="title"
                  value={form.title}
                  onChange={
                    handleFormChange
                  }
                  placeholder="Enter research project title"
                  required
                />

              </div>


              <div className="form-field form-field--wide">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Describe the research objectives, scope and expected outcomes..."
                  rows={4}
                />

              </div>


              <div className="form-grid">

                <div className="form-field">

                  <label>
                    Funding Agency
                  </label>

                  <input
                    name="funding_agency"
                    value={
                      form.funding_agency
                    }
                    onChange={
                      handleFormChange
                    }
                    placeholder="e.g. Research Council"
                  />

                </div>


                <div className="form-field">

                  <label>
                    Budget
                  </label>

                  <input
                    name="budget"
                    type="number"
                    min="0"
                    value={form.budget}
                    onChange={
                      handleFormChange
                    }
                    placeholder="Project budget"
                  />

                </div>


                <div className="form-field">

                  <label>
                    Start Date
                  </label>

                  <input
                    name="start_date"
                    type="date"
                    value={
                      form.start_date
                    }
                    onChange={
                      handleFormChange
                    }
                  />

                </div>


                <div className="form-field">

                  <label>
                    End Date
                  </label>

                  <input
                    name="end_date"
                    type="date"
                    value={
                      form.end_date
                    }
                    onChange={
                      handleFormChange
                    }
                  />

                </div>


                <div className="form-field">

                  <label>
                    Project Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={
                      handleFormChange
                    }
                  >
                    <option value="Proposed">
                      Proposed
                    </option>

                    <option value="Active">
                      Active
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Suspended">
                      Suspended
                    </option>
                  </select>

                </div>


                <div className="form-field">

                  <label>
                    Institution
                  </label>

                  <select
                    name="institution_id"
                    value={
                      form.institution_id
                    }
                    onChange={
                      handleFormChange
                    }
                  >
                    <option value="">
                      Independent Project
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
                      )
                    )}

                  </select>

                </div>

              </div>


              <label className="visibility-control">

                <input
                  type="checkbox"
                  name="visible_to_others"
                  checked={
                    form.visible_to_others
                  }
                  onChange={
                    handleFormChange
                  }
                />

                <span>
                  <Globe2 size={15} />
                  Make this project visible
                  to other researchers
                </span>

              </label>


              {error && (
                <div className="project-error">
                  <CircleAlert size={16} />
                  {error}
                </div>
              )}


              <div className="create-form-actions">

                <button
                  type="button"
                  className="project-secondary-btn"
                  onClick={() =>
                    setShowCreateForm(false)
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={submitting}
                  className="projects-primary-btn"
                >
                  <Plus size={16} />

                  {submitting
                    ? "Creating..."
                    : "Create Project"}
                </button>

              </div>

            </form>

          </section>
        )}


        {/* =================================================
            PROJECT DIRECTORY
            ================================================= */}

        <section className="projects-section project-results">

          <div className="projects-section-heading">

            <div>

              <span className="section-label">
                PROJECT DIRECTORY
              </span>

              <h2>
                {filteredProjects.length}{" "}
                Research{" "}
                {filteredProjects.length === 1
                  ? "Project"
                  : "Projects"}
              </h2>

            </div>

            <span className="section-caption">
              Search and manage collaborative
              initiatives
            </span>

          </div>


          {loading ? (

            <div className="project-empty-state">

              <div className="project-loader" />

              <strong>
                Loading research projects
              </strong>

              <span>
                Retrieving project workspace
                data...
              </span>

            </div>

          ) : filteredProjects.length === 0 ? (

            <div className="project-empty-state">

              <div className="empty-project-icon">
                <FolderKanban size={23} />
              </div>

              <strong>
                No projects found
              </strong>

              <span>
                Try changing your filters or
                create a new research project.
              </span>

            </div>

          ) : (

            <div className="project-list">

              {filteredProjects.map(
                (project) => {

                  const editable =
                    canManageProject(
                      project
                    );

                  const isEditing =
                    editingProjectId ===
                    project.id;

                  const members =
                    Array.isArray(
                      project.members
                    )
                      ? project.members
                      : [];


                  return (
                    <article
                      key={project.id}
                      className="project-card"
                    >

                      {/* =================================================
                          EDIT PANEL
                          ================================================= */}

                      {isEditing ? (

                        <div className="project-edit-panel">

                          <div className="edit-panel-heading">

                            <div>

                              <span className="section-label">
                                PROJECT EDITOR
                              </span>

                              <h3>
                                Update Project Details
                              </h3>

                            </div>


                            <button
                              type="button"
                              className="close-create-btn"
                              onClick={
                                handleCancelEdit
                              }
                            >
                              <X size={17} />
                            </button>

                          </div>


                          <div className="form-field">

                            <label>
                              Project Title
                            </label>

                            <input
                              name="title"
                              value={
                                editForm.title
                              }
                              onChange={
                                handleEditFormChange
                              }
                              required
                            />

                          </div>


                          <div className="form-field">

                            <label>
                              Description
                            </label>

                            <textarea
                              name="description"
                              value={
                                editForm.description
                              }
                              onChange={
                                handleEditFormChange
                              }
                              rows={4}
                            />

                          </div>


                          <div className="form-grid">

                            <div className="form-field">

                              <label>
                                Funding Agency
                              </label>

                              <input
                                name="funding_agency"
                                value={
                                  editForm.funding_agency
                                }
                                onChange={
                                  handleEditFormChange
                                }
                              />

                            </div>


                            <div className="form-field">

                              <label>
                                Budget
                              </label>

                              <input
                                name="budget"
                                type="number"
                                min="0"
                                value={
                                  editForm.budget
                                }
                                onChange={
                                  handleEditFormChange
                                }
                              />

                            </div>


                            <div className="form-field">

                              <label>
                                Start Date
                              </label>

                              <input
                                name="start_date"
                                type="date"
                                value={
                                  editForm.start_date
                                }
                                onChange={
                                  handleEditFormChange
                                }
                              />

                            </div>


                            <div className="form-field">

                              <label>
                                End Date
                              </label>

                              <input
                                name="end_date"
                                type="date"
                                value={
                                  editForm.end_date
                                }
                                onChange={
                                  handleEditFormChange
                                }
                              />

                            </div>


                            <div className="form-field">

                              <label>
                                Status
                              </label>

                              <select
                                name="status"
                                value={
                                  editForm.status
                                }
                                onChange={
                                  handleEditFormChange
                                }
                              >

                                <option value="Proposed">
                                  Proposed
                                </option>

                                <option value="Active">
                                  Active
                                </option>

                                <option value="Completed">
                                  Completed
                                </option>

                                <option value="Suspended">
                                  Suspended
                                </option>

                              </select>

                            </div>


                            <div className="form-field">

                              <label>
                                Institution
                              </label>

                              <select
                                name="institution_id"
                                value={
                                  editForm.institution_id
                                }
                                onChange={
                                  handleEditFormChange
                                }
                              >

                                <option value="">
                                  Independent Project
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
                                      {
                                        institution.name
                                      }
                                    </option>
                                  )
                                )}

                              </select>

                            </div>

                          </div>


                          <label className="visibility-control">

                            <input
                              type="checkbox"
                              name="visible_to_others"
                              checked={
                                editForm.visible_to_others
                              }
                              onChange={
                                handleEditFormChange
                              }
                            />

                            <span>
                              <Globe2 size={15} />
                              Make project visible
                              to other researchers
                            </span>

                          </label>


                          {error && (
                            <div className="project-error">
                              <CircleAlert size={16} />
                              <span
                                style={{
                                  whiteSpace:
                                    "pre-line",
                                }}
                              >
                                {error}
                              </span>
                            </div>
                          )}


                          <div className="edit-actions">

                            <button
                              type="button"
                              className="project-secondary-btn"
                              onClick={
                                handleCancelEdit
                              }
                            >
                              Cancel
                            </button>


                            <button
                              type="button"
                              className="projects-primary-btn"
                              disabled={submitting}
                              onClick={() =>
                                handleSaveEdit(
                                  project.id
                                )
                              }
                            >
                              <Check size={16} />

                              {submitting
                                ? "Saving..."
                                : "Save Changes"}
                            </button>

                          </div>

                        </div>

                      ) : (

                        /* =================================================
                           NORMAL PROJECT
                           ================================================= */

                        <>

                          <div className="project-card-top">

                            <div className="project-title-area">

                              <div className="project-icon">
                                <FolderKanban size={20} />
                              </div>


                              <div>

                                <div className="project-labels">

                                  <span
                                    className={getStatusClass(
                                      project.status
                                    )}
                                  >
                                    {project.status ||
                                      "Proposed"}
                                  </span>


                                  <span
                                    className={
                                      project.visible_to_others
                                        ? "visibility-badge visibility-badge--public"
                                        : "visibility-badge visibility-badge--private"
                                    }
                                  >

                                    {project.visible_to_others ? (
                                      <>
                                        <Globe2 size={11} />
                                        Public
                                      </>
                                    ) : (
                                      <>
                                        <LockKeyhole
                                          size={11}
                                        />
                                        Private
                                      </>
                                    )}

                                  </span>

                                </div>


                                <h3>
                                  {project.title}
                                </h3>

                              </div>

                            </div>


                            {editable && (
                              <div className="project-quick-actions">

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleStartEdit(
                                      project
                                    )
                                  }
                                  title="Edit project"
                                >
                                  <Pencil size={15} />
                                </button>


                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      project.id
                                    )
                                  }
                                  title="Delete project"
                                  className="danger-action"
                                >
                                  <Trash2 size={15} />
                                </button>

                              </div>
                            )}

                          </div>


                          {project.description && (
                            <p className="project-description">
                              {project.description}
                            </p>
                          )}


                          {/* INFORMATION */}

                          <div className="project-information">

                            <div className="project-info-item">

                              <Building2 size={15} />

                              <div>

                                <span>
                                  Institution
                                </span>

                                <strong>
                                  {getInstitutionName(
                                    project.institution_id
                                  )}
                                </strong>

                              </div>

                            </div>


                            <div className="project-info-item">

                              <WalletCards size={15} />

                              <div>

                                <span>
                                  Funding
                                </span>

                                <strong>
                                  {project.funding_agency ||
                                    "Not specified"}
                                </strong>

                              </div>

                            </div>


                            <div className="project-info-item">

                              <CalendarDays size={15} />

                              <div>

                                <span>
                                  Timeline
                                </span>

                                <strong>
                                  {project.start_date ||
                                    "Not set"}{" "}
                                  →{" "}
                                  {project.end_date ||
                                    "Ongoing"}
                                </strong>

                              </div>

                            </div>


                            <div className="project-info-item">

                              <WalletCards size={15} />

                              <div>

                                <span>
                                  Budget
                                </span>

                                <strong>
                                  $
                                  {Number(
                                    project.budget ||
                                      0
                                  ).toLocaleString()}
                                </strong>

                              </div>

                            </div>

                          </div>


                          {/* TEAM */}

                          <div className="project-team">

                            <div className="team-heading">

                              <div>

                                <span className="section-label">
                                  COLLABORATORS
                                </span>

                                <h4>
                                  Project Team
                                </h4>

                              </div>


                              <span className="team-count">
                                {members.length}{" "}
                                {members.length === 1
                                  ? "member"
                                  : "members"}
                              </span>

                            </div>


                            {members.length === 0 ? (

                              <div className="no-members">

                                <Users size={15} />

                                <span>
                                  No researchers
                                  have been
                                  assigned yet.
                                </span>

                              </div>

                            ) : (

                              <div className="member-list">

                                {members.map(
                                  (member) => {

                                    const name =
                                      getResearcherName(
                                        member.researcher_id
                                      );


                                    return (
                                      <div
                                        key={
                                          member.id
                                        }
                                        className="member-chip"
                                      >

                                        <div className="member-avatar">
                                          {name
                                            .charAt(0)
                                            .toUpperCase()}
                                        </div>


                                        <div className="member-details">

                                          <strong>
                                            {name}
                                          </strong>

                                          <span>
                                            {member.role}
                                          </span>

                                        </div>


                                        {editable && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRemoveMember(
                                                project.id,
                                                member.researcher_id
                                              )
                                            }
                                            className="remove-member"
                                            title="Remove researcher"
                                          >
                                            <X size={13} />
                                          </button>
                                        )}

                                      </div>
                                    );
                                  }
                                )}

                              </div>
                            )}


                            {/* ASSIGN RESEARCHER */}

                            {editable && (
                              <form
                                className="assign-form"
                                onSubmit={(e) =>
                                  handleAssignMember(
                                    e,
                                    project.id
                                  )
                                }
                              >

                                <UserPlus size={16} />


                                <select
                                  value={
                                    assignForms[
                                      project.id
                                    ]?.researcher_id ||
                                    ""
                                  }
                                  onChange={(e) =>
                                    handleAssignChange(
                                      project.id,
                                      "researcher_id",
                                      e.target.value
                                    )
                                  }
                                  required
                                >

                                  <option value="">
                                    Add researcher...
                                  </option>

                                  {researchers.map(
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
                                          researcher.full_name ||
                                          researcher.name ||
                                          researcher.username ||
                                          `Researcher #${researcher.id}`
                                        }
                                      </option>
                                    )
                                  )}

                                </select>


                                <select
                                  value={
                                    assignForms[
                                      project.id
                                    ]?.role ||
                                    "Contributor"
                                  }
                                  onChange={(e) =>
                                    handleAssignChange(
                                      project.id,
                                      "role",
                                      e.target.value
                                    )
                                  }
                                >

                                  <option value="Lead Investigator">
                                    Lead Investigator
                                  </option>

                                  <option value="Researcher">
                                    Researcher
                                  </option>

                                  <option value="Contributor">
                                    Contributor
                                  </option>

                                </select>


                                <button
                                  type="submit"
                                  className="assign-button"
                                >
                                  Add Member
                                </button>

                              </form>
                            )}

                          </div>


                          {/* FOOTER */}

                          {editable && (
                            <div className="project-card-footer">

                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleVisibility(
                                    project
                                  )
                                }
                                className="footer-action"
                              >

                                {project.visible_to_others ? (
                                  <>
                                    <LockKeyhole
                                      size={14}
                                    />
                                    Make Private
                                  </>
                                ) : (
                                  <>
                                    <Globe2
                                      size={14}
                                    />
                                    Make Public
                                  </>
                                )}

                              </button>


                              <button
                                type="button"
                                onClick={() =>
                                  handleStartEdit(
                                    project
                                  )
                                }
                                className="footer-action"
                              >
                                <Pencil size={14} />
                                Edit Project
                              </button>


                              <span className="project-footer-link">
                                Manage initiative
                                <ArrowUpRight
                                  size={13}
                                />
                              </span>

                            </div>
                          )}

                        </>

                      )}

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>

      </main>
    </AppShell>
  );
}