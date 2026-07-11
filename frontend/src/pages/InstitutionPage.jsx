import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import DashboardLayout from "../layouts/DashboardLayout";

import InstitutionToolbar from "../components/institution/InstitutionToolbar";
import InstitutionForm from "../components/institution/InstitutionForm";
import InstitutionTable from "../components/institution/InstitutionTable";

import {
  fetchInstitutions,
  createInstitution,
  updateInstitution,
  deleteInstitution,
} from "../services/institutionService";

function InstitutionPage() {

  const initialInstitution = {
    institution_name: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "",
  };

  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedInstitution, setSelectedInstitution] = useState(null);

  useEffect(() => {
    loadInstitutions();
  }, []);

  const loadInstitutions = async () => {
    try {

      setLoading(true);

      const data = await fetchInstitutions();

      setInstitutions(data);

    } catch (error) {

      console.error(error);

      toast.error("Unable to load institutions.");

    } finally {

      setLoading(false);

    }
  };

  //--------------------------------------
  // CREATE / UPDATE
  //--------------------------------------

  const handleSubmitInstitution = async (institution) => {

    try {

      if (selectedInstitution) {

        await updateInstitution(
          selectedInstitution.id,
          institution
        );

        toast.success(
          "Institution updated successfully."
        );

      } else {

        await createInstitution(institution);

        toast.success(
          "Institution created successfully."
        );

      }

      setSelectedInstitution(null);

      await loadInstitutions();

    } catch (error) {

      console.error(error);

      toast.error(
        "Unable to save institution."
      );

    }

  };

  //--------------------------------------
  // DELETE
  //--------------------------------------

  const handleDeleteInstitution = async (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this institution?"
    );

    if (!confirmed) return;

    try {

      await deleteInstitution(id);

      toast.success(
        "Institution deleted successfully."
      );

      if (
        selectedInstitution &&
        selectedInstitution.id === id
      ) {
        setSelectedInstitution(null);
      }

      await loadInstitutions();

    } catch (error) {

      console.error(error);

      toast.error(
        "Unable to delete institution."
      );

    }

  };

  //--------------------------------------
  // EDIT
  //--------------------------------------

  const handleEditInstitution = (institution) => {

    setSelectedInstitution(institution);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };

  //--------------------------------------
  // CANCEL EDIT
  //--------------------------------------

  const handleCancelEdit = () => {

    setSelectedInstitution(null);

  };

  return (

    <DashboardLayout>

      <InstitutionToolbar />

      <InstitutionForm
        key={selectedInstitution?.id ?? "new"}
        institution={
          selectedInstitution ??
          initialInstitution
        }
        onSubmit={handleSubmitInstitution}
        onCancel={handleCancelEdit}
        isEditing={
          selectedInstitution !== null
        }
      />

      <InstitutionTable
        institutions={institutions}
        loading={loading}
        onEdit={handleEditInstitution}
        onDelete={handleDeleteInstitution}
      />

    </DashboardLayout>

  );

}

export default InstitutionPage;