import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import DashboardLayout from "../layouts/DashboardLayout";

import DepartmentToolbar from "../components/department/DepartmentToolbar";
import DepartmentForm from "../components/department/DepartmentForm";
import DepartmentTable from "../components/department/DepartmentTable";

import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../services/departmentService";

import {
  fetchInstitutions,
} from "../services/institutionService";

function DepartmentPage() {

  const initialDepartment = {
    institution_id: "",
    department_name: "",
    description: "",
  };

  const [departments, setDepartments] = useState([]);
  const [institutions, setInstitutions] = useState([]);

  const [loading, setLoading] = useState(false);

  const [selectedDepartment, setSelectedDepartment] =
    useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {

    try {

      setLoading(true);

      const [
        departmentData,
        institutionData,
      ] = await Promise.all([
        fetchDepartments(),
        fetchInstitutions(),
      ]);

      setDepartments(departmentData);

      setInstitutions(institutionData);

    } catch (error) {

      console.error(error);

      toast.error(
        "Unable to load department data."
      );

    } finally {

      setLoading(false);

    }

  };

  const handleSubmitDepartment = async (
    department
  ) => {

    try {

      if (selectedDepartment) {

        await updateDepartment(
          selectedDepartment.id,
          department
        );

        toast.success(
          "Department updated successfully."
        );

      } else {

        await createDepartment(department);

        toast.success(
          "Department created successfully."
        );

      }

      setSelectedDepartment(null);

      await loadInitialData();

    } catch (error) {

      console.error(error);

      toast.error(
        "Unable to save department."
      );

    }

  };

  const handleDeleteDepartment = async (
    id
  ) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmed) return;

    try {

      await deleteDepartment(id);

      toast.success(
        "Department deleted successfully."
      );

      if (
        selectedDepartment &&
        selectedDepartment.id === id
      ) {
        setSelectedDepartment(null);
      }

      await loadInitialData();

    } catch (error) {

      console.error(error);

      toast.error(
        "Unable to delete department."
      );

    }

  };

  const handleEditDepartment = (
    department
  ) => {

    setSelectedDepartment(department);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };

  const handleCancelEdit = () => {

    setSelectedDepartment(null);

  };

  return (

    <DashboardLayout>

      <DepartmentToolbar />

      <DepartmentForm
        key={selectedDepartment?.id ?? "new"}
        department={
          selectedDepartment ??
          initialDepartment
        }
        institutions={institutions}
        onSubmit={handleSubmitDepartment}
        onCancel={handleCancelEdit}
        isEditing={
          selectedDepartment !== null
        }
      />

      <DepartmentTable
        departments={departments}
        institutions={institutions}
        loading={loading}
        onEdit={handleEditDepartment}
        onDelete={handleDeleteDepartment}
      />

    </DashboardLayout>

  );

}

export default DepartmentPage;