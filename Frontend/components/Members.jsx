import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { Link, useLocation, useParams } from "react-router-dom";

const Members = () => {
  const location = useLocation();
  const { clubId } = useParams();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manualFetchLoading, setManualFetchLoading] = useState(false);

  console.log('Members component rendered');

  // Fetch members from backend
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Please log in to view members');
        setLoading(false);
        return;
      }

      if (!clubId) {
        setError('No club selected');
        setLoading(false);
        return;
      }

      // Fetch members for the specific club
      const membersResponse = await fetch(`${import.meta.env.VITE_APP_API_BASE}/clubs/${clubId}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Members response status:', membersResponse.status);

      if (!membersResponse.ok) {
        if (membersResponse.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          return;
        }
        throw new Error('Failed to fetch members');
      }

      const membersData = await membersResponse.json();
      console.log('Fetched members data:', membersData);

      // Transform the data to match the expected format
      const transformedMembers = membersData.map(member => ({
        name: `${member.userId.firstName} ${member.userId.lastName}`,
        email: member.userId.email,
        role: member.role,
        contribution: `$${member.contributionAmount || 0}.00`,
        limit: '$1,000.00', // This would come from club settings
        avatar: `https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 10) + 1}`,
        userId: member.userId._id,
        joinDate: member.joinDate
      }));

      setMembers(transformedMembers);
      setError(null);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load members. Please try again later.');
      setMembers([]); // Clear members on error
    } finally {
      setLoading(false);
    }
  };

  // Manual fetch function
  const handleManualFetch = async () => {
    setManualFetchLoading(true);
    await fetchMembers();
    setManualFetchLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, [clubId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen bg-[#131712] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d0d0d] p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold mb-8">InvestiClub</h1>
          <nav className="space-y-4 text-gray-300">
            <Link
              to="/dashboard"
              className={`block hover:text-green-500 ${location.pathname === '/dashboard' ? 'text-green-500' : ''}`}
            >
              Dashboard
            </Link>
            <Link
              to={`/club/${clubId}/members`}
              className={`block hover:text-green-500 ${location.pathname === `/club/${clubId}/members` || location.pathname.startsWith(`/club/${clubId}/members`) ? 'text-green-500' : ''}`}
            >
              Members
            </Link>
            <Link
              to={`/club/${clubId}/portfolio`}
              className={`block hover:text-green-500 ${location.pathname === `/club/${clubId}/portfolio` ? 'text-green-500' : ''}`}
            >
              Portfolio
            </Link>
            <Link
              to={`/club/${clubId}/proposals`}
              className={`block hover:text-green-500 ${location.pathname === `/club/${clubId}/proposals` ? 'text-green-500' : ''}`}
            >
              Proposals
            </Link>
          </nav>
        </div>
        <button className="bg-green-500 hover:bg-green-600 text-black py-2 rounded font-medium">
          Contact Support
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Members</h2>
            <p className="text-gray-400 text-sm">
              Manage your club members and their roles.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleManualFetch}
              disabled={manualFetchLoading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-black px-4 py-2 rounded font-medium"
            >
              {manualFetchLoading ? 'Fetching...' : 'Refresh Members'}
            </button>
            <button>🔔</button>
            <span>User</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Add Member Button */}
        <div className="mb-6">
          <button className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-md font-medium">
            + Add Member
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-[#0d0d0d] rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="bg-[#0d0d0d] rounded-xl p-8 text-center">
            <p className="text-gray-400 mb-4">No members found in this club.</p>
            <p className="text-gray-500 text-sm">Members will appear here once they join the club.</p>
          </div>
        ) : (
          /* Members Table */
          <div className="bg-[#0d0d0d] rounded-xl overflow-hidden shadow-md">
            <table className="w-full text-sm">
              <thead className="bg-[#1a1a1a] text-gray-400 text-left">
                <tr>
                  <th className="p-4">Member</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Contribution</th>
                  <th className="p-4">Contribution Limit</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, i) => (
                  <tr
                    key={i}
                    className="border-t border-gray-800 hover:bg-[#1a1a1a]"
                  >
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-gray-400 text-xs">{member.email}</p>
                      </div>
                    </td>
                    <td className="p-4">{member.role}</td>
                    <td className="p-4">{member.contribution}</td>
                    <td className="p-4">{member.limit}</td>
                    <td className="p-4 flex gap-3 text-gray-400">
                      <button className="hover:text-green-500">
                        <FaEye />
                      </button>
                      <button className="hover:text-blue-500">
                        <FaEdit />
                      </button>
                      <button className="hover:text-red-500">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Members;
