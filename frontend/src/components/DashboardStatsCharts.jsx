import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../config/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DashboardStatsCharts = () => {
    const { user } = useContext(AuthContext);
    const [pubStats, setPubStats] = useState(null);
    const [collabStats, setCollabStats] = useState(null);

    useEffect(() => {
        if (user && (user.role === 'institution_admin' || user.role === 'system_admin')) {
            api.get('/reports/publication-stats')
                .then(res => setPubStats(res.data))
                .catch(err => console.error("Error fetching pub stats", err));
            api.get('/reports/collaboration-stats')
                .then(res => setCollabStats(res.data))
                .catch(err => console.error("Error fetching collab stats", err));
        }
    }, [user]);

    const downloadReport = async (format) => {
        try {
            const response = await api.get(`/reports/export?format=${format}&type=publications`, {
                responseType: 'blob',
            });

            const contentDisposition = response.headers['content-disposition'] || '';
            const filenameMatch = contentDisposition.match(/filename="?(.*)"?/i);
            const filename = filenameMatch ? filenameMatch[1] : `publications.${format === 'excel' ? 'xlsx' : format}`;
            const blob = new Blob([response.data], { type: response.data.type || 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download report', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                alert('You are not authenticated or do not have permission to download this report. Please log in and try again.');
            } else {
                alert('Unable to download report. Please try again later.');
            }
        }
    };

    if (!user || (user.role !== 'institution_admin' && user.role !== 'system_admin')) {
        return null;
    }

    if (!pubStats || !collabStats) return <div>Loading charts...</div>;

    return (
        <div className="row mt-4">
            <div className="col-md-3 mb-4">
                <div className="card text-white bg-primary h-100 shadow-sm">
                    <div className="card-body py-4">
                        <h6 className="text-uppercase">Active Collaborations</h6>
                        <h2 className="display-6 mb-0">{collabStats.active_collaborations ?? 0}</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-3 mb-4">
                <div className="card text-white bg-success h-100 shadow-sm">
                    <div className="card-body py-4">
                        <h6 className="text-uppercase">Research Projects</h6>
                        <h2 className="display-6 mb-0">{collabStats.research_projects ?? 0}</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-3 mb-4">
                <div className="card text-white bg-info h-100 shadow-sm">
                    <div className="card-body py-4">
                        <h6 className="text-uppercase">Departments</h6>
                        <h2 className="display-6 mb-0">{pubStats.publications_by_department?.length ?? 0}</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-3 mb-4">
                <div className="card text-white bg-warning h-100 shadow-sm">
                    <div className="card-body py-4">
                        <h6 className="text-uppercase">Top Collaborators</h6>
                        <h2 className="display-6 mb-0">{collabStats.top_collaborators?.length ?? 0}</h2>
                    </div>
                </div>
            </div>

            <div className="col-lg-6 mb-4">
                <div className="card h-100 shadow-sm">
                    <div className="card-header bg-white">
                        <h5 className="mb-0">Publications by Year</h5>
                    </div>
                    <div className="card-body" style={{ height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pubStats.publications_by_year} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => [value, 'Publications']} />
                                <Bar dataKey="count" fill="#4e73df" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="col-lg-6 mb-4">
                <div className="card h-100 shadow-sm">
                    <div className="card-header bg-white">
                        <h5 className="mb-0">Publications by Type</h5>
                    </div>
                    <div className="card-body" style={{ height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pubStats.publications_by_type}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ index, percent }) => `${pubStats.publications_by_type[index]?.type || ''} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="type"
                                >
                                    {pubStats.publications_by_type.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [value, 'Publications']} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="col-lg-6 mb-4">
                <div className="card h-100 shadow-sm">
                    <div className="card-header bg-white">
                        <h5 className="mb-0">Publications by Department</h5>
                    </div>
                    <div className="card-body" style={{ height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pubStats.publications_by_department} margin={{ top: 20, right: 20, bottom: 80, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="department" angle={-30} textAnchor="end" interval={0} height={80} tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => [value, 'Publications']} />
                                <Bar dataKey="count" fill="#17a2b8" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="col-lg-6 mb-4">
                <div className="card h-100 shadow-sm">
                    <div className="card-header bg-white">
                        <h5 className="mb-0">Users by Institution</h5>
                    </div>
                    <div className="card-body" style={{ height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={collabStats.users_by_institution} margin={{ top: 20, right: 20, bottom: 80, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="institution" angle={-30} textAnchor="end" interval={0} height={80} tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip formatter={(value) => [value, 'Users']} />
                                <Bar dataKey="total" fill="#4e73df" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="col-md-12 mb-4">
                <div className="card">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Reports & Exports</h5>
                    </div>
                    <div className="card-body">
                        <p>Export publication data for your institution:</p>
                        <button type="button" className="btn btn-outline-primary me-2" onClick={() => downloadReport('csv')}>Export CSV</button>
                        <button type="button" className="btn btn-outline-success me-2" onClick={() => downloadReport('excel')}>Export Excel</button>
                        <button type="button" className="btn btn-outline-danger" onClick={() => downloadReport('pdf')}>Export PDF</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStatsCharts;
