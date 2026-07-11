import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import DashboardLayout from "../layouts/DashboardLayout";

import ResearcherToolbar from "../components/researcher/ResearcherToolbar";
import ResearcherForm from "../components/researcher/ResearcherForm";
import ResearcherTable from "../components/researcher/ResearcherTable";

import {
  fetchResearchers,
  createResearcher,
  updateResearcher,
  deleteResearcher,
} from "../services/researcherService";

function ResearcherPage() {
  const initialResearcher = {
    user_id: "",
    institution_id: "",
    department_id: "",
    first_name: "",
    last_name: "",
    designation: "",
    qualification: "",
    research_interests: "",
    skills: "",
    biography: "",
    profile_image: "",
  };

  const [researchers, setResearchers] = useState([]);
  const [loading, setLoading] = useState(false);

  // null = Create Mode
  // researcher object = Edit Mode
  const [selectedResearcher, setSelectedResearcher] = useState(null);

  useEffect(() => {
    loadResearchers();
  }, []);

  //--------------------------------------
  // LOAD RESEARCHERS
  //--------------------------------------

  const loadResearchers = async () => {
    try {
      setLoading(true);

      const data = await fetchResearchers();

      setResearchers(data);
    } catch (error) {
      console.error(error);

      toast.error("Unable to load researchers.");
    } finally {
      setLoading(false);
    }
  };

  //--------------------------------------
  // CREATE / UPDATE
  //--------------------------------------

  const handleSubmitResearcher = async (researcher) => {
    try {
      if (selectedResearcher) {
        await updateResearcher(selectedResearcher.id, researcher);

        toast.success("Researcher updated successfully.");
      } else {
        await createResearcher(researcher);

        toast.success("Researcher created successfully.");
      }

      setSelectedResearcher(null);

      await loadResearchers();
    } catch (error) {
      console.error(error);

      toast.error("Unable to save researcher.");
    }
  };

  //--------------------------------------
  // DELETE
  //--------------------------------------

  const handleDeleteResearcher = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this researcher?"
    );

    if (!confirmed) return;

    try {
      await deleteResearcher(id);

      toast.success("Researcher deleted successfully.");

      if (
        selectedResearcher &&
        selectedResearcher.id === id
      ) {
        setSelectedResearcher(null);
      }

      await loadResearchers();
    } catch (error) {
      console.error(error);

      toast.error("Unable to delete researcher.");
    }
  };

  //--------------------------------------
  // EDIT
  //--------------------------------------

  const handleEditResearcher = (researcher) => {
    setSelectedResearcher(researcher);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  //--------------------------------------
  // CANCEL EDIT
  //--------------------------------------

  const handleCancelEdit = () => {
    setSelectedResearcher(null);
  };

  return (
    <DashboardLayout>
      <ResearcherToolbar />

      <ResearcherForm
        key={selectedResearcher?.id ?? "new"}
        researcher={selectedResearcher ?? initialResearcher}
        onSubmit={handleSubmitResearcher}
        onCancel={handleCancelEdit}
        isEditing={selectedResearcher !== null}
      />

      <ResearcherTable
        researchers={researchers}
        loading={loading}
        onEdit={handleEditResearcher}
        onDelete={handleDeleteResearcher}
      />
    </DashboardLayout>
  );
}

export default ResearcherPage;