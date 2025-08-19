import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayoutJWT from '../../../components/layouts/AdminLayoutJWT';

export default function UserManagement() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/admin/users/index-jwt', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    router.push('/admin/users/new');
  };

  const handleViewDetails = (userId) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle user status');
      }

      // Refresh user list
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredUsers = users
    .filter(user => {
      if (filter === 'active') return user.isActive;
      if (filter === 'inactive') return !user.isActive;
      return true;
    })
    .filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (user.name || '').toLowerCase().includes(searchLower) ||
        (user.email || '').toLowerCase().includes(searchLower) ||
        (user.phone || '').toLowerCase().includes(searchLower)
      );
    });

  return (
    <AdminLayoutJWT>
      <div className="card">
        {/* Begin::Card header */}
        <div className="card-header border-0 pt-6">
          {/* Begin::Card title */}
          <div className="card-title">
            <div className="d-flex align-items-center position-relative my-1">
              <i className="ki-duotone ki-magnifier fs-3 position-absolute ms-5">
                <span className="path1"></span>
                <span className="path2"></span>
              </i>
              <input 
                type="text" 
                className="form-control form-control-solid w-250px ps-13" 
                placeholder="Search user"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {/* End::Card title */}

          {/* Begin::Card toolbar */}
          <div className="card-toolbar">
            {/* Begin::Toolbar */}
            <div className="d-flex justify-content-end" data-kt-user-table-toolbar="base">
              {/* Filter dropdown */}
              <select
                className="form-select form-select-solid w-150px me-5"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Add user button */}
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleCreateUser}
              >
                <i className="ki-duotone ki-plus fs-2"></i>
                Add User
              </button>
            </div>
            {/* End::Toolbar */}
          </div>
          {/* End::Card toolbar */}
        </div>
        {/* End::Card header */}

        {/* Begin::Card body */}
        <div className="card-body py-4">
          {loading ? (
            <div className="d-flex justify-content-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              {error}
            </div>
          ) : (
            <table className="table align-middle table-row-dashed fs-6 gy-5" id="kt_table_users">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                  <th className="min-w-125px">User</th>
                  <th className="min-w-125px">Package</th>
                  <th className="min-w-125px">Invitations</th>
                  <th className="min-w-125px">Status</th>
                  <th className="min-w-125px">Source</th>
                  <th className="min-w-125px">Joined Date</th>
                  <th className="text-end min-w-100px">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 fw-semibold">
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="d-flex align-items-center">
                      <div className="d-flex flex-column">
                        <span className="text-gray-800 mb-1">{user.name}</span>
                        <span className="text-gray-600">{user.email}</span>
                        {user.phone && (
                          <span className="text-gray-600">{user.phone}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {user.currentPackage ? (
                        <div className="d-flex flex-column">
                          <span className="text-gray-800 mb-1">
                            {user.currentPackage.name}
                          </span>
                          <span className="text-gray-600">
                            Until {new Date(user.currentPackage.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-600">No active package</span>
                      )}
                    </td>
                    <td>
                      <span className="text-gray-800">
                        {user.activeInvitationsCount} active
                      </span>
                    </td>
                    <td>
                      <div className={`badge badge-light-${user.isActive ? 'success' : 'danger'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    <td>
                      <div className={`badge badge-light-${
                        user.source === 'website' ? 'primary' :
                        user.source === 'whatsapp' ? 'success' :
                        user.source === 'admin' ? 'warning' : 'info'
                      }`}>
                        {user.source}
                      </div>
                    </td>
                    <td>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
                        onClick={() => handleViewDetails(user._id)}
                      >
                        <i className="ki-duotone ki-eye fs-2">
                          <span className="path1"></span>
                          <span className="path2"></span>
                          <span className="path3"></span>
                        </i>
                      </button>
                      <button
                        className={`btn btn-icon btn-bg-light btn-active-color-${user.isActive ? 'warning' : 'success'} btn-sm me-1`}
                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                      >
                        <i className={`ki-duotone ki-${user.isActive ? 'shield-cross' : 'shield-tick'} fs-2`}>
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* End::Card body */}
      </div>
    </AdminLayoutJWT>
  );
}
