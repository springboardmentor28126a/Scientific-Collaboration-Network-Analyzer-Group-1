import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

import DashboardLayout from "../layouts/DashboardLayout";
import { fetchAnalyticsSummary } from "../services/analyticsService";

const COLORS = ["#2FB8A6", "#E8A33D", "#0F1B2E", "#6B7280", "#D14343"];

function AnalyticsDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const summary = await fetchAnalyticsSummary();
      setData(summary);
    } catch (err) {
      toast.error("Could not load analytics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <DashboardLayout>
        <p>Loading...</p>
      </DashboardLayout>
    );
  }

  const stats = [
    ["Researchers", data.total_researchers],
    ["Publications", data.total_publications],
    ["Conferences", data.total_conferences],
    ["Collaborations", data.total_collaborations],
    ["Citations", data.total_citations],
    ["Institutions", data.total_institutions],
  ];

  const pieData = data.top_institutions.map((i) => ({
    name: i.institution_name,
    value: i.publication_count,
  }));

  return (
    <DashboardLayout>
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body">
          <h4 className="fw-bold mb-1">Analytics</h4>
          <p className="text-muted mb-0">Platform-wide statistics and trends.</p>
        </div>
      </div>

      <div className="row mb-4">
        {stats.map(([label, value]) => (
          <div className="col-md-2 col-6 mb-3" key={label}>
            <div className="card shadow-sm border-0 rounded-4 text-center h-100">
              <div className="card-body">
                <div style={{ fontSize: "2rem", fontWeight: 700, color: "#2FB8A6" }}>{value}</div>
                <div className="text-muted small">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row mb-4">
        <div className="col-md-7 mb-3">
          <div className="card shadow-sm border-0 rounded-4 h-100">
            <div className="card-body">
              <h5 className="fw-bold mb-3">Top Researchers by Publications</h5>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.top_researchers.map(r => ({
                  name: `${r.first_name} ${r.last_name}`,
                  publications: r.publication_count,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="publications" fill="#2FB8A6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {pieData.length > 0 && (
          <div className="col-md-5 mb-3">
            <div className="card shadow-sm border-0 rounded-4 h-100">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Top Institutions by Publications</h5>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">Recent Publications</h5>
          {data.recent_publications.length === 0 ? (
            <p className="text-muted mb-0">No publications yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr><th>Title</th><th>Type</th><th>Status</th><th>Author</th></tr>
                </thead>
                <tbody>
                  {data.recent_publications.map((p) => (
                    <tr key={p.id}>
                      <td>{p.title}</td>
                      <td>{p.publication_type?.replaceAll("_", " ")}</td>
                      <td>{p.status}</td>
                      <td>{p.owner_first_name} {p.owner_last_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AnalyticsDashboardPage;