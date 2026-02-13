import React, { useEffect, useState, useCallback } from 'react';
import { ClinicProtectedRoute } from '../../components/clinic/ClinicProtectedRoute';
import { useClinicAuth } from '../../contexts/ClinicAuthContext';
import { MessageSquare, CheckCircle2, EyeOff, Eye, AlertCircle, Loader2 } from 'lucide-react';
export const TestimonialsAdmin: React.FC = () => {
  const { user } = useClinicAuth();
  const [loading, setLoading] = useState(false);
  const [testimonials, setTestimonials] = useState<Array<{ id: number; name?: string; anonymized: boolean; quote: string; role?: string; created_at: string }>>([]);
  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('clinic_access_token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/landing/testimonials?verified=false', { headers });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setTestimonials(data.testimonials || []);
    } catch (e) {
      console.error('Failed to fetch testimonials', e);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { fetchTestimonials(); }, [fetchTestimonials]);
  const handleVerify = async (id: number) => {
    const date = new Date().toISOString();
    const token = localStorage.getItem('clinic_access_token');
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}`, 'x-admin-user': user?.email || user?.name || 'admin' } : { 'Content-Type': 'application/json' };
    const res = await fetch('/api/landing/testimonials_verify', { method: 'POST', headers, body: JSON.stringify({ id, verified: true, publication_date: date }) });
    if (res.ok) fetchTestimonials();
  };
  const handleAnonymize = async (id: number) => {
    const t = testimonials.find(tt => tt.id === id);
    if (!t) return;
    const token = localStorage.getItem('clinic_access_token');
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
    const res = await fetch(`/api/landing/testimonials/${id}`, { method: 'PATCH', headers, body: JSON.stringify({ anonymized: !t.anonymized }) });
    if (res.ok) fetchTestimonials();
  };
  return (
    <ClinicProtectedRoute requiredRole="admin">
      <div className="p-6 bg-background text-foreground min-h-screen">
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl" />
        </div>
        {/* Header */}
        <div className="relative mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
              <MessageSquare className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Testimonials Admin
              </h1>
              <p className="text-muted-foreground">
                Review and manage user-submitted stories
              </p>
            </div>
          </div>
        </div>
        {!localStorage.getItem('clinic_access_token') && (
          <div className="relative mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-300">Please log in with your clinic account (admin role) to manage testimonials.</p>
          </div>
        )}
        <div className="relative grid gap-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
          )}
          {!loading && testimonials.length === 0 && (
            <div 
              className="p-8 rounded-2xl border border-border text-center"
              style={{
              }}
            >
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-muted-foreground">No testimonials pending review.</p>
            </div>
          )}
          {!loading && testimonials.map(t => (
            <div 
              key={t.id} 
              className="p-6 rounded-2xl border border-border flex items-start justify-between gap-6"
              style={{
                boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-foreground">
                    {t.anonymized ? 'Anonymous' : t.name || 'Unknown'}
                  </span>
                  {t.role && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30">
                      {t.role}
                    </span>
                  )}
                  {t.anonymized && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
                      <EyeOff className="w-3 h-3 inline mr-1" />
                      Anonymous
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mb-3 break-words leading-relaxed">"{t.quote}"</p>
                <p className="text-xs text-muted-foreground">
                  Submitted: {new Date(t.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => handleVerify(t.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-foreground font-medium transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-500/25"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Verify
                </button>
                <button
                  onClick={() => handleAnonymize(t.id)}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-muted-foreground border border-slate-600 hover:bg-muted transition-all"
                >
                  {t.anonymized ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {t.anonymized ? 'Reveal' : 'Anonymize'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ClinicProtectedRoute>
  );
};
export default TestimonialsAdmin;