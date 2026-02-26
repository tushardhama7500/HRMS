import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE;

// --- Layout Wrapper ---
const Layout = ({ children, onAddClick }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white border-b border-gray-200 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-indigo-600">HRMS Lite</Link>
          <div className="flex gap-4">
            <Link to="/" className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Home</Link>
            <button 
              onClick={onAddClick} 
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Add Employee
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center text-gray-500 text-sm">
          <span>© 2026 HRMS Lite Backend System</span>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <button onClick={onAddClick} className="hover:text-indigo-600">Add New</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- Dashboard Component ---
const Dashboard = ({ showModal, setShowModal }) => {
  const [data, setData] = useState({ data: [], total_pages: 1, current_page: 1, today_stats: { present: 0, absent: 0 } });
  const [newEmployee, setNewEmployee] = useState({ employee_id: '', full_name: '', email: '', department: '' });
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); 
  const [attModal, setAttModal] = useState(null); // { employee_id, full_name, date, status }

  useEffect(() => {
    fetchEmployees(1, statusFilter);
  }, [statusFilter]);

  const fetchEmployees = async (page, filter = statusFilter) => {
    try {
      const url = `${API_BASE}/employees/?page=${page}${filter ? `&today_status=${filter}` : ''}`;
      const res = await axios.get(url);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${API_BASE}/employees/`, newEmployee);
      setShowModal(false);
      setNewEmployee({ employee_id: '', full_name: '', email: '', department: '' });
      fetchEmployees(1);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add employee');
    }
  };

  const markAttendance = async (e) => {
    e.preventDefault();
    try {
        await axios.post(`${API_BASE}/attendance/`, {
            employee: attModal.id,
            date: attModal.date,
            status: attModal.status
        });
        setAttModal(null);
        fetchEmployees(data.current_page);
    } catch (err) {
        alert("Error marking attendance");
    }
  };

  const deleteEmployee = async (id) => {
    if (window.confirm('Delete this employee?')) {
      try {
        await axios.delete(`${API_BASE}/employees/${id}/`);
        fetchEmployees(data.current_page);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {statusFilter ? `${statusFilter} Today` : 'Employee Directory'}
        </h1>
        <div className="flex flex-wrap gap-3 items-center">
            <button 
                onClick={() => setStatusFilter('')}
                className={`text-sm px-4 py-2 rounded-lg border transition shadow-sm ${statusFilter === '' ? 'bg-indigo-600 text-white border-indigo-600 font-bold' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
            >
                Total: {data.total_count || 0}
            </button>
            <button 
                onClick={() => setStatusFilter('Present')}
                className={`text-sm px-4 py-2 rounded-lg border transition shadow-sm ${statusFilter === 'Present' ? 'bg-green-600 text-white border-green-600 font-bold' : 'bg-white text-gray-600 border-gray-300 hover:bg-green-50'}`}
            >
                Present Today: {data.today_stats?.present || 0}
            </button>
            <button 
                onClick={() => setStatusFilter('Absent')}
                className={`text-sm px-4 py-2 rounded-lg border transition shadow-sm ${statusFilter === 'Absent' ? 'bg-red-600 text-white border-red-600 font-bold' : 'bg-white text-gray-600 border-gray-300 hover:bg-red-50'}`}
            >
                Absent Today: {data.today_stats?.absent || 0}
            </button>
        </div>
      </div>

      <div className="bg-white shadow-sm overflow-hidden sm:rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.data.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`h-3 w-3 rounded-full shadow-sm ${emp.today_status === 'Present' ? 'bg-green-500' : emp.today_status === 'Absent' ? 'bg-red-500' : 'bg-gray-300'}`} title={emp.today_status || 'No Status'}></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.employee_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{emp.department}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => setAttModal({ id: emp.id, full_name: emp.full_name, date: new Date().toISOString().split('T')[0], status: 'Present' })}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Mark
                  </button>
                  <Link to={`/view/${emp.id}`} className="text-green-600 hover:text-green-900 mr-4">Show</Link>
                  <button onClick={() => deleteEmployee(emp.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
            {data.data.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>

        {data.total_pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-end gap-2">
              <button 
                onClick={() => fetchEmployees(data.current_page - 1)}
                disabled={data.current_page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                onClick={() => fetchEmployees(data.current_page + 1)}
                disabled={data.current_page === data.total_pages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mark Attendance Modal */}
      {attModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                <h2 className="text-lg font-bold mb-4">Mark for {attModal.full_name}</h2>
                <form onSubmit={markAttendance}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" className="w-full border-gray-300 rounded-md border p-2 text-sm" value={attModal.date} onChange={e => setAttModal({ ...attModal, date: e.target.value })} />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select className="w-full border-gray-300 rounded-md border p-2 text-sm" value={attModal.status} onChange={e => setAttModal({ ...attModal, status: e.target.value })}>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 text-sm font-bold">Save</button>
                    <button type="button" onClick={() => setAttModal(null)} className="flex-1 bg-white border border-gray-300 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700">Cancel</button>
                </div>
                </form>
            </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add New Employee</h2>
            {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
            <form onSubmit={handleAddEmployee}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID (Unique)</label>
                <input 
                  required 
                  className="w-full border-gray-300 rounded-md shadow-sm border p-2"
                  value={newEmployee.employee_id} 
                  onChange={e => setNewEmployee({ ...newEmployee, employee_id: e.target.value })} 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  required 
                  className="w-full border-gray-300 rounded-md shadow-sm border p-2"
                  value={newEmployee.full_name} 
                  onChange={e => setNewEmployee({ ...newEmployee, full_name: e.target.value })} 
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  required type="email" 
                  className="w-full border-gray-300 rounded-md shadow-sm border p-2"
                  value={newEmployee.email} 
                  onChange={e => setNewEmployee({ ...newEmployee, email: e.target.value })} 
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input 
                  required 
                  className="w-full border-gray-300 rounded-md shadow-sm border p-2"
                  value={newEmployee.department} 
                  onChange={e => setNewEmployee({ ...newEmployee, department: e.target.value })} 
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 font-medium">Save Profile</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white border border-gray-300 py-2 rounded-md hover:bg-gray-50 text-gray-700 font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- View History Component ---
const ViewHistory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [monthFilter, setMonthFilter] = useState(''); 
  const [page, setPage] = useState(1);

  const getMonths = () => {
    const months = [];
    const date = new Date();
    for (let i = 0; i < 3; i++) {
        const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
        const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
        months.push({ val, label });
    }
    return months;
  };

  useEffect(() => {
    fetchHistory(1);
  }, [id, monthFilter]);

  const fetchHistory = async (pageNumber) => {
    try {
      const url = `${API_BASE}/employees/${id}/?page=${pageNumber}${monthFilter ? `&month=${monthFilter}` : ''}`;
      const res = await axios.get(url);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) return <div className="text-center py-20">Loading History...</div>;

  return (
    <div>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
          <p className="text-gray-500">{data.full_name} • {data.employee_id}</p>
        </div>
        <div className="flex gap-3 items-center">
            <select 
                className="text-sm border border-gray-300 rounded-md p-2 bg-white"
                value={monthFilter}
                onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
            >
                <option value="">Default (Last 30 Days)</option>
                {getMonths().map(m => (
                    <option key={m.val} value={m.val}>{m.label}</option>
                ))}
            </select>
            <button onClick={() => navigate('/')} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Back</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.attendances?.map((record, idx) => (
              <tr key={idx}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${record.status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!data.attendances || data.attendances.length === 0) && (
              <tr>
                <td colSpan="2" className="px-6 py-10 text-center text-gray-500">No records found for this period.</td>
              </tr>
            )}
          </tbody>
        </table>

        {data.total_pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-end gap-2">
              <button 
                onClick={() => fetchHistory(data.current_page - 1)}
                disabled={data.current_page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                onClick={() => fetchHistory(data.current_page + 1)}
                disabled={data.current_page === data.total_pages}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---
function App() {
  const [showModal, setShowModal] = useState(false);

  return (
    <Router>
      <Layout onAddClick={() => setShowModal(true)}>
        <Routes>
          <Route path="/" element={<Dashboard showModal={showModal} setShowModal={setShowModal} />} />
          <Route path="/view/:id" element={<ViewHistory />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
