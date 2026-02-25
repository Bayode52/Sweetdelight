"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw, FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

interface AutomationLog {
    id: string;
    automation_id: string;
    entity_type: string;
    entity_id: string;
    status: string;
    error_message: string;
    created_at: string;
    automations_config: {
        name: string;
    };
}

export default function AutomationLogsPage() {
    const [logs, setLogs] = useState<AutomationLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filterStatus !== 'all') params.append('status', filterStatus);

            const res = await fetch(`/api/admin/automations/logs?${params.toString()}`);
            const data = await res.json();

            if (data.success) {
                setLogs(data.logs || []);
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Failed to load logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filterStatus]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle size={16} className="text-green-500" />;
            case 'failed': return <XCircle size={16} className="text-red-500" />;
            case 'skipped': return <Clock size={16} className="text-gray-500" />;
            default: return null;
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-playfair font-black text-bakery-primary tracking-tight">Automation Logs</h1>
                    <p className="text-bakery-border mt-2 flex items-center gap-2">
                        <FileText size={16} className="text-bakery-cta" /> Complete execution history
                    </p>
                </div>

                <div className="flex gap-4">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-white border border-bakery-primary/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-bakery-cta"
                    >
                        <option value="all">All Statuses</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                        <option value="skipped">Skipped</option>
                    </select>

                    <Button variant="outline" onClick={fetchLogs} className="rounded-2xl border-bakery-primary/20">
                        <RefreshCw size={16} className="mr-2" /> Refresh
                    </Button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-3xl border border-bakery-primary/10 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-bakery-cta" /></div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center text-bakery-border">No logs found matching criteria.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-bakery-primary/5 text-bakery-primary/60 text-xs uppercase tracking-wider font-bold">
                                    <th className="p-4">Timestamp</th>
                                    <th className="p-4">Automation</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Entity</th>
                                    <th className="p-4">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-bakery-primary/5 text-sm text-bakery-primary">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-bakery-primary/5 transition-colors">
                                        <td className="p-4 whitespace-nowrap text-gray-500">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="p-4 font-bold">
                                            {log.automation_id}
                                            <div className="text-xs font-normal text-bakery-border truncate max-w-[200px]">
                                                {log.automations_config?.name}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 capitalize font-medium">
                                                {getStatusIcon(log.status)}
                                                <span className={
                                                    log.status === 'success' ? 'text-green-600' :
                                                        log.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                                                }>
                                                    {log.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 block w-max">
                                                {log.entity_type}
                                            </span>
                                            {log.entity_id && (
                                                <span className="text-[10px] text-gray-400 block mt-1 font-mono">
                                                    {log.entity_id.substring(0, 8)}...
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-xs text-red-500 max-w-[300px] truncate" title={log.error_message || ''}>
                                            {log.error_message || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
