import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { useAuth } from "../hooks/useAuth";
import { getProjects, createProject, updateProject, deleteProject, assignProjectMember, removeProjectMember } from "../api/projects";
import { getResearchers, getInstitutions } from "../api/researchers";
import "./Projects.css";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, mine, institutional

  const [form, setForm] = useState({
    title: "",
    description: "",
    funding_agency: "",
    budget: 0,
    status: "Proposed",
    start_date: "",
    end_date: "",
    institution_id: "",
    visible_to_others: false,
  });

  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    funding_agency: "",
    budget: 0,
    status: "Proposed",
    start_date: "",
    end_date: "",
    institution_id: "",
    visible_to_others: false,
  });

  const [assignForms, setAssignForms] = useState({}); // { [projectId]: { researcher_id: "", role: "Contributor" } }
  const [submitting, setSubmitting] = useState(false);

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [projRes, resRes, instRes] = await Promise.all([
        getProjects(),
        getResearchers(),
        getInstitutions(),
      ]);
      setProjects(projRes.data);
      setResearchers(resRes.data);
      setInstitutions(instRes.data);
      setError("");
    } catch {
      setError("Failed to load projects or reference data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    Promise.all([
      getProjects(),
      getResearchers(),
      getInstitutions(),
    ])
      .then(([projRes, resRes, instRes]) => {
        if (!active) return;
        setProjects(projRes.data);
        setResearchers(resRes.data);
        setInstitutions(instRes.data);
        setError("");
      })
      .catch(() => {
        if (!active) return;
        setError("Failed to load projects or reference data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleFormChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleEditFormChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setEditForm({ ...editForm, [e.target.name]: val });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        ...form,
        budget: parseFloat(form.budget) || 0,
        institution_id: form.institution_id ? parseInt(form.institution_id) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };
      await createProject(payload);
      setForm({
        title: "",
        description: "",
        funding_agency: "",
        budget: 0,
        status: "Proposed",
        start_date: "",
        end_date: "",
        institution_id: "",
        visible_to_others: false,
      });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (proj) => {
    setEditingProjectId(proj.id);
    setEditForm({
      title: proj.title || "",
      description: proj.description || "",
      funding_agency: proj.funding_agency || "",
      budget: proj.budget || 0,
      status: proj.status || "Proposed",
      start_date: proj.start_date || "",
      end_date: proj.end_date || "",
      institution_id: proj.institution_id || "",
      visible_to_others: proj.visible_to_others || false,
    });
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setEditForm({
      title: "",
      description: "",
      funding_agency: "",
      budget: 0,
      status: "Proposed",
      start_date: "",
      end_date: "",
      institution_id: "",
      visible_to_others: false,
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const payload = {
        ...editForm,
        budget: parseFloat(editForm.budget) || 0,
        institution_id: editForm.institution_id ? parseInt(editForm.institution_id) : null,
        start_date: editForm.start_date || null,
        end_date: editForm.end_date || null,
      };
      await updateProject(id, payload);
      setEditingProjectId(null);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to save project updates.");
    }
  };

  const handleToggleVisibility = async (proj) => {
    try {
      await updateProject(proj.id, {
        visible_to_others: !proj.visible_to_others,
      });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update project visibility.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(id);
      await loadData();
    } catch {
      setError("Failed to delete project");
    }
  };

  const handleAssignChange = (projId, field, value) => {
    setAssignForms({
      ...assignForms,
      [projId]: {
        ...assignForms[projId],
        [field]: value,
      },
    });
  };

  const handleAssignMember = async (e, projId) => {
    e.preventDefault();
    const assignForm = assignForms[projId];
    if (!assignForm?.researcher_id) {
      alert("Please select a researcher to assign.");
      return;
    }
    try {
      await assignProjectMember(projId, {
        researcher_id: parseInt(assignForm.researcher_id),
        role: assignForm.role || "Contributor",
      });
      setAssignForms({
        ...assignForms,
        [projId]: { researcher_id: "", role: "Contributor" },
      });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to assign member");
    }
  };

  const handleRemoveMember = async (projId, researcherId) => {
    if (!window.confirm("Remove this member from the project?")) return;
    try {
      await removeProjectMember(projId, researcherId);
      await loadData();
    } catch {
      alert("Failed to remove member");
    }
  };

  const getInstitutionName = (id) => {
    const inst = institutions.find((i) => i.id === id);
    return inst ? inst.name : "N/A";
  };

  const getResearcherName = (id) => {
    const res = researchers.find((r) => r.id === id);
    return res ? res.full_name : `Researcher #${id}`;
  };

  const currentUserResearcher = researchers.find((r) => r.user_id === user?.id);
  const currentUserResearcherId = currentUserResearcher?.id;
  const currentUserInstitutionId = currentUserResearcher?.institution_id || (user?.role === "InstitutionAdmin" ? institutions[0]?.id : null);

  const canManageProject = (proj) => {
    if (user?.role === "SystemAdmin") return true;
    if (proj.created_by === user?.id) return true;
    if (user?.role === "InstitutionAdmin" && proj.institution_id === currentUserInstitutionId) return true;
    
    const isLead = proj.members?.some(
      (m) => m.researcher_id === currentUserResearcherId && m.role === "Lead Investigator"
    );
    return isLead;
  };

  const filteredProjects = projects.filter((proj) => {
    if (activeTab === "mine") {
      const isCreator = proj.created_by === user?.id;
      const isMember = proj.members?.some((m) => m.researcher_id === currentUserResearcherId);
      return isCreator || isMember;
    }
    if (activeTab === "institutional") {
      return proj.institution_id === currentUserInstitutionId;
    }
    return true;
  });

  return (
    <AppShell>
      <main className="projects-page">
        <header className="projects-header">
          <div>
            <p className="dashboard-badge">Collaboration Network</p>
            <h1 className="projects-title">Research Projects</h1>
            <p className="projects-subtitle">
              Manage research proposals, track active grant budgets, and assign investigators and contributors to project teams.
            </p>
          </div>
        </header>

        {/* Dynamic Navigation Tabs */}
        <nav className="projects-tabs" aria-label="Project groups">
          <button
            onClick={() => setActiveTab("all")}
            className={`projects-tab-btn ${activeTab === "all" ? "projects-tab-btn--active" : ""}`}
          >
            All Projects
          </button>
          <button
            onClick={() => setActiveTab("mine")}
            className={`projects-tab-btn ${activeTab === "mine" ? "projects-tab-btn--active" : ""}`}
          >
            My Projects
          </button>
          {currentUserInstitutionId && (
            <button
              onClick={() => setActiveTab("institutional")}
              className={`projects-tab-btn ${activeTab === "institutional" ? "projects-tab-btn--active" : ""}`}
            >
              Institutional Projects
            </button>
          )}
        </nav>

        {/* Add Project Form */}
        <form onSubmit={handleCreate} className="project-form">
          <div className="project-form-header">
            <p className="pub-section-label">Create Project</p>
            <h2>Add Research Project</h2>
          </div>
          <input
            name="title"
            placeholder="Project Title"
            value={form.title}
            onChange={handleFormChange}
            required
            className="proj-input"
          />
          <textarea
            name="description"
            placeholder="Project Description"
            value={form.description}
            onChange={handleFormChange}
            className="proj-input"
            rows={3}
          />
          <div className="proj-row">
            <input
              name="funding_agency"
              placeholder="Funding Agency"
              value={form.funding_agency}
              onChange={handleFormChange}
              className="proj-input"
            />
            <input
              name="budget"
              type="number"
              placeholder="Budget ($)"
              value={form.budget}
              onChange={handleFormChange}
              className="proj-input"
            />
          </div>
          <div className="proj-row">
            <input
              name="start_date"
              type="date"
              placeholder="Start Date"
              value={form.start_date}
              onChange={handleFormChange}
              className="proj-input"
            />
            <input
              name="end_date"
              type="date"
              placeholder="End Date"
              value={form.end_date}
              onChange={handleFormChange}
              className="proj-input"
            />
          </div>
          <div className="proj-row">
            <select name="status" value={form.status} onChange={handleFormChange} className="proj-input">
              <option value="Proposed">Proposed</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Suspended">Suspended</option>
            </select>
            <select
              name="institution_id"
              value={form.institution_id}
              onChange={handleFormChange}
              className="proj-input"
            >
              <option value="">Select Institution (Optional)</option>
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          </div>
          
          <label className="proj-checkbox-container">
            <input
              type="checkbox"
              name="visible_to_others"
              checked={form.visible_to_others}
              onChange={handleFormChange}
            />
            <span>Visible to others (Public Project)</span>
          </label>

          {error && <p className="pub-error">{error}</p>}
          <button type="submit" disabled={submitting} className="proj-button">
            {submitting ? "Creating..." : "Create Project"}
          </button>
        </form>

        {/* Project List */}
        {loading ? (
          <p className="pub-loading">Loading projects...</p>
        ) : (
          <div className="project-list">
            {filteredProjects.length === 0 && (
              <p className="pub-empty">No projects found in this tab.</p>
            )}
            {filteredProjects.map((proj) => {
              const editable = canManageProject(proj);
              const isEditing = editingProjectId === proj.id;

              return (
                <div key={proj.id} className="project-card">
                  {isEditing ? (
                    /* Inline Edit Mode */
                    <div className="proj-edit-form">
                      <h3 style={{ marginBottom: "14px" }}>Edit Project Details</h3>
                      <div className="proj-edit-fields">
                        <input
                          name="title"
                          value={editForm.title}
                          onChange={handleEditFormChange}
                          required
                          className="proj-input"
                          placeholder="Title"
                        />
                        <textarea
                          name="description"
                          value={editForm.description}
                          onChange={handleEditFormChange}
                          className="proj-input"
                          placeholder="Description"
                          rows={3}
                        />
                        <div className="proj-row">
                          <input
                            name="funding_agency"
                            value={editForm.funding_agency}
                            onChange={handleEditFormChange}
                            className="proj-input"
                            placeholder="Funding Agency"
                          />
                          <input
                            name="budget"
                            type="number"
                            value={editForm.budget}
                            onChange={handleEditFormChange}
                            className="proj-input"
                            placeholder="Budget"
                          />
                        </div>
                        <div className="proj-row">
                          <input
                            name="start_date"
                            type="date"
                            value={editForm.start_date}
                            onChange={handleEditFormChange}
                            className="proj-input"
                          />
                          <input
                            name="end_date"
                            type="date"
                            value={editForm.end_date}
                            onChange={handleEditFormChange}
                            className="proj-input"
                          />
                        </div>
                        <div className="proj-row">
                          <select
                            name="status"
                            value={editForm.status}
                            onChange={handleEditFormChange}
                            className="proj-input"
                          >
                            <option value="Proposed">Proposed</option>
                            <option value="Active">Active</option>
                            <option value="Completed">Completed</option>
                            <option value="Suspended">Suspended</option>
                          </select>
                          <select
                            name="institution_id"
                            value={editForm.institution_id}
                            onChange={handleEditFormChange}
                            className="proj-input"
                          >
                            <option value="">Select Institution (Optional)</option>
                            {institutions.map((inst) => (
                              <option key={inst.id} value={inst.id}>{inst.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <label className="proj-checkbox-container">
                          <input
                            type="checkbox"
                            name="visible_to_others"
                            checked={editForm.visible_to_others}
                            onChange={handleEditFormChange}
                          />
                          <span>Visible to others (Public Project)</span>
                        </label>
                      </div>

                      <div className="proj-edit-actions">
                        <button
                          onClick={() => handleSaveEdit(proj.id)}
                          className="proj-action-btn proj-save-btn"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="proj-action-btn proj-cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Regular Display Mode */
                    <>
                      <div className="project-card-header">
                        <div>
                          <div className="proj-badge-row">
                            <span className={`proj-badge ${proj.visible_to_others ? "proj-badge--public" : "proj-badge--private"}`}>
                              {proj.visible_to_others ? "🌐 Public" : "🔒 Private"}
                            </span>
                            <span className="proj-badge proj-badge--status">
                              {proj.status}
                            </span>
                          </div>
                          <h3 style={{ marginTop: "8px" }}>{proj.title}</h3>
                        </div>
                      </div>

                      <p className="proj-meta">
                        Funding: <strong>{proj.funding_agency || "None"}</strong> | Budget: <strong>${proj.budget?.toLocaleString()}</strong> | Institution: <strong>{getInstitutionName(proj.institution_id)}</strong>
                      </p>
                      
                      {proj.description && <p className="proj-description">{proj.description}</p>}
                      
                      {(proj.start_date || proj.end_date) && (
                        <p className="proj-meta" style={{ marginTop: "-10px" }}>
                          Timeline: {proj.start_date || "?"} to {proj.end_date || "?"}
                        </p>
                      )}

                      {/* Team Members Section */}
                      <div className="proj-members-section">
                        <h4>Project Team</h4>
                        <div className="proj-members-list">
                          {proj.members.length === 0 ? (
                            <p className="pub-empty" style={{ fontSize: "0.85rem", margin: "0", textAlign: "left", padding: "0" }}>
                              No team members assigned yet.
                            </p>
                          ) : (
                            proj.members.map((member) => (
                              <span key={member.id} className="proj-member-tag">
                                {getResearcherName(member.researcher_id)} ({member.role})
                                {editable && (
                                  <button
                                    onClick={() => handleRemoveMember(proj.id, member.researcher_id)}
                                    className="proj-remove-member-btn"
                                    title="Remove member"
                                  >
                                    ×
                                  </button>
                                )}
                              </span>
                            ))
                          )}
                        </div>

                        {/* Assign Member Inline Form (only visible if editable) */}
                        {editable && (
                          <form onSubmit={(e) => handleAssignMember(e, proj.id)} className="proj-assign-form">
                            <select
                              value={assignForms[proj.id]?.researcher_id || ""}
                              onChange={(e) => handleAssignChange(proj.id, "researcher_id", e.target.value)}
                              className="proj-assign-input"
                              required
                            >
                              <option value="">Assign Researcher...</option>
                              {researchers.map((r) => (
                                <option key={r.id} value={r.id}>{r.full_name}</option>
                              ))}
                            </select>
                            <select
                              value={assignForms[proj.id]?.role || "Contributor"}
                              onChange={(e) => handleAssignChange(proj.id, "role", e.target.value)}
                              className="proj-assign-input"
                            >
                              <option value="Lead Investigator">Lead Investigator</option>
                              <option value="Researcher">Researcher</option>
                              <option value="Contributor">Contributor</option>
                            </select>
                            <button type="submit" className="proj-assign-btn">Assign</button>
                          </form>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {editable && (
                        <div className="proj-card-actions">
                          <button
                            onClick={() => handleStartEdit(proj)}
                            className="proj-action-btn proj-edit-btn"
                          >
                            ✏️ Edit Project
                          </button>
                          <button
                            onClick={() => handleToggleVisibility(proj)}
                            className="proj-action-btn proj-edit-btn"
                          >
                            {proj.visible_to_others ? "🔒 Make Private" : "🌐 Make Public"}
                          </button>
                          <button
                            onClick={() => handleDelete(proj.id)}
                            className="proj-action-btn proj-delete-btn"
                          >
                            🗑️ Delete Project
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </AppShell>
  );
}
