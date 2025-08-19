import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../../components/layouts/AdminLayout';

export default function UserDetails() {
  const router = useRouter();
  const { userId } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      const data = await response.json();
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvitation = () => {
    router.push(`/admin/users/${userId}/create-invitation`);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="alert alert-danger">{error}</div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="alert alert-warning">User not found</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Begin::User Info Card */}
      <div className="card mb-5 mb-xl-10">
        <div className="card-body pt-9 pb-0">
          {/* Begin::Details */}
          <div className="d-flex flex-wrap flex-sm-nowrap mb-3">
            {/* Begin::Info */}
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
                <div className="d-flex flex-column">
                  <div className="d-flex align-items-center mb-2">
                    <span className="text-gray-900 text-hover-primary fs-2 fw-bold me-1">
                      {user.name}
                    </span>
                    <span className={`badge badge-light-${user.isActive ? 'success' : 'danger'} fw-bold fs-8 px-2 py-1 ms-2`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="d-flex flex-wrap fw-semibold fs-6 mb-4 pe-2">
                    <span className="d-flex align-items-center text-gray-400 me-5 mb-2">
                      <i className="ki-duotone ki-sms fs-4 me-1">
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                      {user.email}
                    </span>
                    {user.phone && (
                      <span className="d-flex align-items-center text-gray-400 mb-2">
                        <i className="ki-duotone ki-phone fs-4 me-1">
                          <span className="path1"></span>
                          <span className="path2"></span>
                        </i>
                        {user.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="d-flex my-4">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary me-3"
                    onClick={handleCreateInvitation}
                  >
                    Create Invitation
                  </button>
                </div>
              </div>
            </div>
            {/* End::Info */}
          </div>
          {/* End::Details */}

          {/* Begin::Stats */}
          <div className="d-flex flex-wrap flex-stack">
            <div className="d-flex flex-column flex-grow-1 pe-8">
              <div className="d-flex flex-wrap">
                <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                  <div className="d-flex align-items-center">
                    <div className="fs-2 fw-bold">{user.activeInvitationsCount}</div>
                  </div>
                  <div className="fw-semibold fs-6 text-gray-400">Active Invitations</div>
                </div>

                <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                  <div className="d-flex align-items-center">
                    <div className="fs-2 fw-bold">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR'
                      }).format(user.totalPurchases)}
                    </div>
                  </div>
                  <div className="fw-semibold fs-6 text-gray-400">Total Purchases</div>
                </div>
              </div>
            </div>
          </div>
          {/* End::Stats */}
        </div>
      </div>
      {/* End::User Info Card */}

      {/* Begin::Row */}
      <div className="row gy-5 g-xl-10">
        {/* Begin::Col */}
        <div className="col-xl-6">
          {/* Begin::Current Package Card */}
          <div className="card card-xl-stretch mb-xl-10">
            <div className="card-header border-0">
              <h3 className="card-title fw-bold text-dark">Current Package</h3>
            </div>
            <div className="card-body pt-0">
              {user.currentPackage ? (
                <>
                  <div className="d-flex align-items-center mb-5">
                    <div className="symbol symbol-40px me-4">
                      <span className="symbol-label" style={{ backgroundColor: user.currentPackage.metadata?.color + '20', color: user.currentPackage.metadata?.color }}>
                        {user.currentPackage.metadata?.icon || '📦'}
                      </span>
                    </div>
                    <div className="d-flex flex-column">
                      <span className="text-gray-800 fw-bold fs-5 mb-1">{user.currentPackage.name}</span>
                      <span className="text-gray-400 fw-semibold fs-7">
                        Valid until {new Date(user.currentPackage.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="separator separator-dashed my-5"></div>
                  <div className="fw-semibold fs-6 text-gray-600">
                    Features:
                    <ul className="py-2">
                      {user.currentPackage.features?.map((feature, index) => (
                        <li key={index} className={feature.included ? '' : 'text-muted text-decoration-line-through'}>
                          <i className={`ki-duotone ki-${feature.included ? 'check' : 'cross'} fs-7 ${feature.included ? 'text-success' : 'text-danger'} me-2`}>
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                          {feature.name}
                          {feature.limit && ` (${feature.limit})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              ) : (
                <div className="text-gray-600 fw-semibold fs-6">
                  No active package
                </div>
              )}
            </div>
          </div>
          {/* End::Current Package Card */}
        </div>
        {/* End::Col */}

        {/* Begin::Col */}
        <div className="col-xl-6">
          {/* Begin::Invitations Card */}
          <div className="card card-xl-stretch mb-5 mb-xl-10">
            <div className="card-header border-0">
              <h3 className="card-title fw-bold text-dark">Invitations</h3>
            </div>
            <div className="card-body pt-0">
              {user.invitations?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table align-middle table-row-dashed fs-6 gy-5">
                    <thead>
                      <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                        <th>Name</th>
                        <th>Template</th>
                        <th>Created</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 fw-semibold">
                      {user.invitations.map((invitation) => (
                        <tr key={invitation._id}>
                          <td>{invitation.mempelai?.pria} & {invitation.mempelai?.wanita}</td>
                          <td>{invitation.template}</td>
                          <td>{new Date(invitation.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge badge-light-${invitation.isExpired ? 'danger' : 'success'}`}>
                              {invitation.isExpired ? 'Expired' : 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-600 fw-semibold fs-6">
                  No invitations created yet
                </div>
              )}
            </div>
          </div>
          {/* End::Invitations Card */}
        </div>
        {/* End::Col */}
      </div>
      {/* End::Row */}

      {/* Begin::Purchase History Card */}
      <div className="card">
        <div className="card-header border-0">
          <h3 className="card-title fw-bold text-dark">Purchase History</h3>
        </div>
        <div className="card-body pt-0">
          {user.purchases?.length > 0 ? (
            <div className="table-responsive">
              <table className="table align-middle table-row-dashed fs-6 gy-5">
                <thead>
                  <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                    <th>Package</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Payment Method</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 fw-semibold">
                  {user.purchases.map((purchase) => (
                    <tr key={purchase._id}>
                      <td>{purchase.packageId?.name || 'Unknown Package'}</td>
                      <td>
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR'
                        }).format(purchase.amount)}
                      </td>
                      <td>{new Date(purchase.purchaseDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-light-${
                          purchase.status === 'completed' ? 'success' :
                          purchase.status === 'pending' ? 'warning' :
                          purchase.status === 'cancelled' ? 'danger' :
                          'info'
                        }`}>
                          {purchase.status}
                        </span>
                      </td>
                      <td>{purchase.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-600 fw-semibold fs-6">
              No purchase history
            </div>
          )}
        </div>
      </div>
      {/* End::Purchase History Card */}
    </AdminLayout>
  );
}
