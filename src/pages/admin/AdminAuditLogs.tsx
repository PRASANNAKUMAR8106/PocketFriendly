import React, { useEffect, useState } from 'react';
import { ShieldAlert, Clock, RefreshCw } from 'lucide-react';
import { auditService } from '../../services/auditService';
import { AuditLog } from '../../types';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    const data = await auditService.getLogs();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            Administrative Audit Trail
          </h1>
          <p className="text-xs text-stone-500">
            Compliance and security records tracking all backend administrative modifications.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-3.5 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Trail
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase font-semibold border-b border-stone-200">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action Executed</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Operator</th>
                <th className="p-3.5">Details Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-3.5 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-maroon-800 bg-maroon-50 px-2 py-0.5 rounded font-mono text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-stone-800">
                    {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 12)}...)` : ''}
                  </td>
                  <td className="p-3.5 text-stone-600">
                    {log.admin_email || 'System / Admin'}
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-stone-500 max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
