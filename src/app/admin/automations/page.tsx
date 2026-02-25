"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { Loader2, Zap, Settings, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface AutomationConfig {
    id: string;
    automation_id: string;
    name: string;
    description: string;
    is_active: boolean;
    config: any;
    updated_at: string;
}

export default function AutomationsPage() {
    const [configs, setConfigs] = useState<AutomationConfig[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    // Editing State
    const [editingConfig, setEditingConfig] = useState<AutomationConfig | null>(null);
    const [editValues, setEditValues] = useState<string>("");

    const fetchAutomations = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/admin/automations");
            const data = await res.json();
            if (data.success) {
                // Sort naturally by AUTO-1, AUTO-2, etc.
                const sortedConfigs = data.configs.sort((a: any, b: any) => {
                    const numA = parseInt(a.automation_id.replace('AUTO-', ''));
                    const numB = parseInt(b.automation_id.replace('AUTO-', ''));
                    return numA - numB;
                });
                setConfigs(sortedConfigs);
                setLogs(data.logs || []);
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load automations");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAutomations();
    }, []);

    const toggleAutomation = async (id: string, currentStatus: boolean) => {
        try {
            setSaving(id);
            const res = await fetch("/api/admin/automations", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, is_active: !currentStatus }),
            });
            const data = await res.json();
            if (data.success) {
                setConfigs(configs.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
                toast.success(`Automation ${!currentStatus ? 'enabled' : 'disabled'}`);
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Failed to update automation");
        } finally {
            setSaving(null);
        }
    };

    const saveConfig = async () => {
        if (!editingConfig) return;
        try {
            let parsedParams;
            try {
                parsedParams = JSON.parse(editValues);
            } catch (e) {
                toast.error("Invalid JSON format");
                return;
            }

            setSaving(editingConfig.id);
            const res = await fetch("/api/admin/automations", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: editingConfig.id, config: parsedParams }),
            });
            const data = await res.json();
            if (data.success) {
                setConfigs(configs.map(c => c.id === editingConfig.id ? { ...c, config: parsedParams } : c));
                toast.success("Settings saved");
                setEditingConfig(null);
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setSaving(null);
        }
    };

    const getLogCount = (automationId: string) => {
        return logs.filter(l => l.automation_id === automationId).length;
    };


    if (loading) {
        return <div className="p-8 flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-bakery-cta" /></div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-playfair font-black text-bakery-primary tracking-tight">Automation System</h1>
                    <p className="text-bakery-border mt-2 flex items-center gap-2">
                        <Zap size={16} className="text-yellow-500" /> Control the lifecycle and intelligence automations
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={fetchAutomations} className="rounded-2xl border-bakery-primary/20 hover:bg-bakery-primary/5">
                        <RefreshCw size={16} className="mr-2" /> Refresh
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="grid gap-6">
                {configs.map((config) => (
                    <div key={config.id} className="bg-white rounded-3xl p-6 border border-bakery-primary/10 shadow-sm flex flex-col md:flex-row gap-6 md:items-center relative overflow-hidden transition-all hover:shadow-md hover:border-bakery-primary/20">
                        {/* Status Indicator Bar */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${config.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />

                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-1 bg-bakery-primary/5 rounded-lg text-xs font-bold text-bakery-primary/60 tracking-wider">
                                    {config.automation_id}
                                </span>
                                <h3 className="text-xl font-bold text-bakery-primary">{config.name}</h3>
                                {config.is_active ? (
                                    <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full"><CheckCircle size={12} className="mr-1" /> Active</span>
                                ) : (
                                    <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full"><XCircle size={12} className="mr-1" /> Paused</span>
                                )}
                            </div>
                            <p className="text-bakery-border text-sm mt-2 max-w-3xl">{config.description}</p>

                            <div className="mt-4 flex gap-4 text-xs text-bakery-border">
                                <span className="bg-bakery-secondary/20 px-3 py-1.5 rounded-lg font-medium text-bakery-primary">
                                    {getLogCount(config.automation_id)} recent runs
                                </span>
                                {Object.keys(config.config || {}).length > 0 && (
                                    <span className="bg-bakery-primary/5 px-3 py-1.5 rounded-lg font-mono">
                                        {JSON.stringify(config.config)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                className="rounded-xl border-bakery-primary/20 text-bakery-primary hover:bg-bakery-primary hover:text-white"
                                onClick={() => {
                                    setEditingConfig(config);
                                    setEditValues(JSON.stringify(config.config, null, 2));
                                }}
                            >
                                <Settings size={16} className="md:mr-2" />
                                <span className="hidden md:inline">Settings</span>
                            </Button>

                            <div className="flex items-center gap-3 bg-bakery-primary/5 px-4 py-2 rounded-2xl">
                                <Label htmlFor={`toggle-${config.id}`} className="text-sm font-bold text-bakery-primary cursor-pointer w-12 text-right">
                                    {saving === config.id ? '...' : config.is_active ? 'ON' : 'OFF'}
                                </Label>
                                <Switch
                                    id={`toggle-${config.id}`}
                                    checked={config.is_active}
                                    onCheckedChange={() => toggleAutomation(config.id, config.is_active)}
                                    disabled={saving === config.id}
                                    className="data-[state=checked]:bg-bakery-cta"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Editing Modal */}
            {editingConfig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative">
                        <h2 className="text-2xl font-playfair font-black text-bakery-primary mb-2">Configure {editingConfig.automation_id}</h2>
                        <p className="text-bakery-border text-sm mb-6">{editingConfig.name}</p>

                        <div className="space-y-4">
                            <Label className="text-bakery-primary font-bold">Parameters (JSON)</Label>
                            <textarea
                                className="w-full h-48 p-4 rounded-2xl bg-gray-50 border border-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-bakery-cta"
                                value={editValues}
                                onChange={(e) => setEditValues(e.target.value)}
                            />
                            <p className="text-xs text-gray-500">Edit the JSON configuration correctly. Do not use trailing commas.</p>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-2xl"
                                onClick={() => setEditingConfig(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 rounded-2xl bg-bakery-cta hover:bg-bakery-cta/90 text-white"
                                onClick={saveConfig}
                                disabled={saving === editingConfig.id}
                            >
                                {saving === editingConfig.id ? <Loader2 className="animate-spin" /> : "Save Settings"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
