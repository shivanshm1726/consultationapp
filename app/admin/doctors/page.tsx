"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, UserCheck } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function PendingDoctorsPage() {
  const { userData } = useAuth();
  const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    setLoading(true);
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;      
      const response = await axios.get(`${API_BASE_URL}/api/admin/pending-doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingDoctors(response.data);
    } catch (error) {
      console.error("Error fetching pending doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveDoctor = async (id: string, name: string) => {
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;
      await axios.put(`${API_BASE_URL}/api/admin/approve-doctor/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Approved", description: `${name} has been approved.` });
      setPendingDoctors(prev => prev.filter(doc => doc._id !== id));
    } catch (error) {
      console.error("Error approving:", error);
      toast({ title: "Error", description: "Failed to approve doctor.", variant: "destructive" });
    }
  };

  const rejectDoctor = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to completely reject and delete the application for ${name}?`)) return;
    try {
      const tokenMatch = document.cookie.match(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/);
      const token = tokenMatch ? tokenMatch[1] : null;
      await axios.put(`${API_BASE_URL}/api/admin/reject-doctor/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: "Rejected", description: `${name}'s application was rejected.` });
      setPendingDoctors(prev => prev.filter(doc => doc._id !== id));
    } catch (error) {
      console.error("Error rejecting:", error);
      toast({ title: "Error", description: "Failed to reject doctor.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
          <UserCheck className="w-8 h-8 text-indigo-500" />
          Pending Doctor Approvals
        </h1>
      </div>

      <Card className="border-0 shadow-lg dark:bg-slate-800">
        <CardHeader>
          <CardTitle>Applications Awaiting Review</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : pendingDoctors.length === 0 ? (
            <div className="text-center p-8 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
              No pending applications found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700/50 dark:text-slate-300">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-lg">Name</th>
                    <th className="px-6 py-4">Specialization</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4 rounded-tr-lg text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDoctors.map(doc => (
                    <tr key={doc._id} className="border-b dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4 font-medium dark:text-white">
                        {doc.fullName}
                      </td>
                      <td className="px-6 py-4 text-indigo-600 dark:text-indigo-400 font-medium">
                        {doc.specialization || "General"}
                      </td>
                      <td className="px-6 py-4 tracking-tight">
                        {doc.email}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          size="sm"
                          onClick={() => approveDoctor(doc._id, doc.fullName)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                        >
                          <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectDoctor(doc._id, doc.fullName)}
                        >
                          <XCircle className="w-4 h-4 mr-1.5" /> Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
