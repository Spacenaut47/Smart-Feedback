import React, { useEffect, useState } from 'react';
import API from '../api/api';
import { FaClock, FaUserShield } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface AuditLog {
  id: number;
  adminId: number;
  adminName: string;
  action: string;
  timestamp: string;
}

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await API.get('/admin/audit-logs');
        setLogs(res.data);
      } catch (err) {
        console.error('Error fetching logs:', err);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Audit Logs</h2>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/');
            }}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md">
        {logs.length === 0 ? (
          <p className="text-gray-500">No audit logs found.</p>
        ) : (
          <ul className="space-y-4">
            {logs.map((log) => (
              <li
                key={log.id}
                className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded shadow-sm"
              >
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <FaClock className="text-blue-500" />
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 font-semibold text-gray-800">
                  <FaUserShield className="text-blue-600" />
                  {log.adminName}
                </div>
                <p className="text-sm text-gray-700 mt-1">{log.action}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
