import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const ProposalsVoting = () => {
  const location = useLocation();
  const { clubId } = useParams();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    assetType: '',
    assetSymbol: '',
    deadline: '',
    executionMethod: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [voting, setVoting] = useState(false);

  // Fetch proposals from backend
  const fetchProposals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setError('Please log in to view proposals');
        setLoading(false);
        return;
      }

      if (!clubId) {
        setError('No club selected');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:3000/api/clubs/${clubId}/proposals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          return;
        }
        throw new Error('Failed to fetch proposals');
      }

      const proposalsData = await response.json();
      setProposals(proposalsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError('Failed to load proposals. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/clubs/${clubId}/proposals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create proposal');
      }

      const result = await response.json();
      console.log('Proposal created:', result);

      // Reset form
      setFormData({
        title: '',
        description: '',
        amount: '',
        assetType: '',
        assetSymbol: '',
        deadline: '',
        executionMethod: ''
      });

      // Refresh proposals
      fetchProposals();
    } catch (error) {
      console.error('Error creating proposal:', error);
      setError('Failed to create proposal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle voting
  const handleVote = async (proposalId, vote) => {
    setVoting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/clubs/${clubId}/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote }),
      });

      if (!response.ok) {
        throw new Error('Failed to cast vote');
      }

      const result = await response.json();
      console.log('Vote cast:', result);

      // Refresh proposals
      fetchProposals();
    } catch (error) {
      console.error('Error casting vote:', error);
      setError('Failed to cast vote. Please try again.');
    } finally {
      setVoting(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchProposals();
  }, [clubId]);

  // Vote Distribution for selected proposal
  const getVoteData = (proposal) => {
    if (!proposal) return null;

    const yesPercentage = proposal.weightSnapshotTotal > 0
      ? Math.round((proposal.yesWeight / proposal.weightSnapshotTotal) * 100)
      : 0;
    const noPercentage = 100 - yesPercentage;

    return {
      labels: [`Yes (${yesPercentage}%)`, `No (${noPercentage}%)`],
      datasets: [
        {
          data: [yesPercentage, noPercentage],
          backgroundColor: ["#22c55e", "#ef4444"],
          borderWidth: 0,
        },
      ],
    };
  };

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
              className={`block hover:text-green-500 ${location.pathname === `/club/${clubId}/members` ? 'text-green-500' : ''}`}
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
          <h2 className="text-2xl font-bold">Proposals & Voting</h2>
          <div className="flex gap-4">
            <button>🔔</button>
            <span>User</span>
          </div>
        </div>

        {/* Create Proposal Form */}
        <div className="bg-[#0d0d0d] p-6 rounded-xl mb-8">
          <h3 className="font-semibold mb-4">Create New Proposal</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              placeholder="Proposal Title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full bg-[#1a1a1a] p-3 rounded-md text-sm focus:ring-2 focus:ring-green-500"
              required
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="w-full bg-[#1a1a1a] p-3 rounded-md text-sm focus:ring-2 focus:ring-green-500"
              required
            />
            <textarea
              name="description"
              placeholder="Describe the proposal"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full bg-[#1a1a1a] p-3 rounded-md text-sm h-24 focus:ring-2 focus:ring-green-500 md:col-span-2"
            />
            <select
              name="assetType"
              value={formData.assetType}
              onChange={handleInputChange}
              className="w-full bg-[#1a1a1a] p-3 rounded-md text-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select an asset type</option>
              <option value="stock">Stock</option>
              <option value="crypto">Cryptocurrency</option>
              <option value="bond">Bond</option>
              <option value="etf">ETF</option>
            </select>
            <input
              type="text"
              name="assetSymbol"
              placeholder="Symbol e.g. AAPL"
              value={formData.assetSymbol}
              onChange={handleInputChange}
              className="w-full bg-[#1a1a1a] p-3 rounded-md text-sm focus:ring-2 focus:ring-green-500"
            />
            <input
              type="datetime-local"
              name="deadline"
              value={formData.deadline}
              onChange={handleInputChange}
              className="w-full bg-[#1a1a1a] p-3 rounded-md text-sm focus:ring-2 focus:ring-green-500"
              required
            />
            <select
              name="executionMethod"
              value={formData.executionMethod}
              onChange={handleInputChange}
              className="w-full bg-[#1a1a1a] p-3 rounded-md text-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select execution method</option>
              <option value="market">Market Order</option>
              <option value="limit">Limit Order</option>
              <option value="manual">Manual Execution</option>
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-black py-2 rounded-md font-medium md:col-span-2"
            >
              {submitting ? 'Creating...' : 'Create Proposal'}
            </button>
          </form>
        </div>

        {/* Active Proposals */}
        <div className="mb-8">
          <h3 className="font-semibold mb-3">Active Proposals</h3>
          {loading ? (
            <div className="bg-[#0d0d0d] rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading proposals...</p>
            </div>
          ) : (
            <table className="w-full text-sm bg-[#0d0d0d] rounded-xl overflow-hidden">
              <thead className="text-gray-400 text-left">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Votes</th>
                  <th className="p-3">Deadline</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.filter(p => p.status === 'active').map((proposal) => (
                  <tr key={proposal._id} className="border-t border-gray-800">
                    <td className="p-3">{proposal.title}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 text-xs bg-blue-600 rounded">Active</span>
                    </td>
                    <td className="p-3">{proposal.votesCount || 0}</td>
                    <td className="p-3">{new Date(proposal.deadline).toLocaleDateString()}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedProposal(proposal)}
                        className="px-3 py-1 bg-[#131712] hover:bg-[#1a1a1a] rounded-lg text-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {proposals.filter(p => p.status === 'active').length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-3 text-center text-gray-400">
                      No active proposals
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Past Proposals */}
        <div className="mb-8">
          <h3 className="font-semibold mb-3">Past Proposals</h3>
          <table className="w-full text-sm bg-[#0d0d0d] rounded-xl overflow-hidden">
            <thead className="text-gray-400 text-left">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Status</th>
                <th className="p-3">Votes</th>
                <th className="p-3">Result Date</th>
              </tr>
            </thead>
            <tbody>
              {proposals.filter(p => p.status !== 'active').map((proposal) => (
                <tr key={proposal._id} className="border-t border-gray-800">
                  <td className="p-3">{proposal.title}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded ${proposal.status === 'approved' ? 'bg-green-600' :
                      proposal.status === 'rejected' ? 'bg-red-600' : 'bg-gray-600'
                      }`}>
                      {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-3">{proposal.votesCount || 0}</td>
                  <td className="p-3">
                    {proposal.resolvedAt ? new Date(proposal.resolvedAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
              {proposals.filter(p => p.status !== 'active').length === 0 && (
                <tr>
                  <td colSpan="4" className="p-3 text-center text-gray-400">
                    No past proposals
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Proposal Details */}
        {selectedProposal ? (
          <div className="bg-[#0d0d0d] p-6 rounded-xl mb-8">
            <h3 className="font-semibold mb-3">Proposal Details</h3>
            <p className="text-lg font-bold mb-2">{selectedProposal.title}</p>
            <p className="text-gray-400 text-sm mb-4">
              {selectedProposal.description || 'No description provided.'}
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-gray-400">Amount:</span>
                <span className="ml-2">${selectedProposal.amount?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-400">Asset:</span>
                <span className="ml-2">{selectedProposal.assetSymbol || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-400">Created by:</span>
                <span className="ml-2">
                  {selectedProposal.createdBy?.firstName} {selectedProposal.createdBy?.lastName}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Deadline:</span>
                <span className="ml-2">{new Date(selectedProposal.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            {selectedProposal.status === 'active' && (
              <>
                <div className="flex gap-4 mb-4">
                  <button
                    onClick={() => handleVote(selectedProposal._id, 'yes')}
                    disabled={voting}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {voting ? 'Voting...' : 'Vote Yes'}
                  </button>
                  <button
                    onClick={() => handleVote(selectedProposal._id, 'no')}
                    disabled={voting}
                    className="flex-1 bg-[#1a1a1a] hover:bg-[#222] disabled:bg-gray-600 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {voting ? 'Voting...' : 'Vote No'}
                  </button>
                </div>

                <div className="h-40 mb-4">
                  {getVoteData(selectedProposal) && <Pie data={getVoteData(selectedProposal)} />}
                </div>
              </>
            )}

            {selectedProposal.status !== 'active' && (
              <div className="mb-4">
                <span className={`px-3 py-1 text-sm rounded ${selectedProposal.status === 'approved' ? 'bg-green-600' :
                  selectedProposal.status === 'rejected' ? 'bg-red-600' : 'bg-gray-600'
                  }`}>
                  {selectedProposal.status.charAt(0).toUpperCase() + selectedProposal.status.slice(1)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#0d0d0d] p-6 rounded-xl mb-8">
            <h3 className="font-semibold mb-3">Proposal Details</h3>
            <p className="text-gray-400">Select a proposal to view details</p>
          </div>
        )}

        {/* Comments */}
        <div className="bg-[#0d0d0d] p-6 rounded-xl">
          <h3 className="font-semibold mb-3">Comments</h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold">
                Sophia Clark{" "}
                <span className="text-gray-400 text-xs">• Jul 1, 10:00 AM</span>
              </p>
              <p className="text-gray-300">
                I think this is a great opportunity. TechCorp has shown strong
                performance and is well-positioned for future growth.
              </p>
            </div>
            <div>
              <p className="font-semibold">
                Ethan Miller{" "}
                <span className="text-gray-400 text-xs">• Jul 1, 11:30 AM</span>
              </p>
              <p className="text-gray-300">
                I’m not so sure. The tech sector is volatile, and there are
                risks involved.
              </p>
            </div>
            <div>
              <p className="font-semibold">
                You{" "}
                <span className="text-gray-400 text-xs">• Jul 1, 12:15 PM</span>
              </p>
              <p className="text-gray-300">
                Valid point, Ethan. We should consider a stop-loss to mitigate
                potential downside.
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 bg-[#1a1a1a] px-3 py-2 rounded-md text-sm focus:ring-2 focus:ring-green-500"
            />
            <button className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded-md text-sm font-medium">
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProposalsVoting;
