import DashboardLayout from "../layouts/DashboardLayout";

function UserManagementPage() {
  return (
    <DashboardLayout>
      <div className="container-fluid">

        <div className="card shadow-sm border-0">

          <div className="card-body p-5 text-center">

            <i
              className="bi bi-people-fill"
              style={{
                fontSize: "4rem",
                color: "#2563EB",
              }}
            ></i>

            <h2 className="mt-4">

              User Management

            </h2>

            <p className="text-muted mt-3">

              This module will be available in
              Milestone 2.

            </p>

            <hr />

            <div className="row mt-4">

              <div className="col-md-6">

                <div className="border rounded p-4">

                  <h5>

                    System Administrator

                  </h5>

                  <ul className="text-start">

                    <li>Create Institution Admins</li>

                    <li>Assign Roles</li>

                    <li>Manage Users</li>

                    <li>Activate / Deactivate Users</li>

                  </ul>

                </div>

              </div>

              <div className="col-md-6">

                <div className="border rounded p-4">

                  <h5>

                    Institution Administrator

                  </h5>

                  <ul className="text-start">

                    <li>Approve Researchers</li>

                    <li>Reject Registrations</li>

                    <li>Manage Institution Users</li>

                  </ul>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}

export default UserManagementPage;