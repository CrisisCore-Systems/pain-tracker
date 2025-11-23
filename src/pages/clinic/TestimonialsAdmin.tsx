import React, { useEffect, useState, useCallback } from 'react';
import { ClinicProtectedRoute } from '../../components/clinic/ClinicProtectedRoute';
import { useClinicAuth } from '../../contexts/ClinicAuthContext';
import { Button } from '../../design-system/components/Button';

export const TestimonialsAdmin: React.FC = () => {
  const { user } = useClinicAuth();
  const [loading, setLoading] = useState(false);
  const [testimonials, setTestimonials] = useState<Array<{ id: number; name?: string; anonymized: boolean; quote: string; role?: string; created_at: string }>>([]);
  // Do not support ADMIN API key fallback in the client; require clinic access token
  // Not using ADMIN_API_KEY in client. Rely on clinic_access_token from localStorage

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
    // Toggle anonymize
    const t = testimonials.find(tt => tt.id === id);
    if (!t) return;
  const token = localStorage.getItem('clinic_access_token');
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  const res = await fetch(`/api/landing/testimonials/${id}`, { method: 'PATCH', headers, body: JSON.stringify({ anonymized: !t.anonymized }) });
    if (res.ok) fetchTestimonials();
  };

  return (
    <ClinicProtectedRoute requiredRole="admin">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Testimonials Admin</h1>
        {!localStorage.getItem('clinic_access_token') && (
          <div className="mb-4 p-4 border rounded bg-yellow-50 text-yellow-900">
            <p>Please log in with your clinic account (admin role) to manage testimonials.</p>
          </div>
        )}

        <div className="grid gap-4">
          {loading && <div>Loading...</div>}
          {!loading && testimonials.length === 0 && <div>No testimonials found.</div>}
          {!loading && testimonials.map(t => (
            <div key={t.id} className="p-4 border rounded flex items-start justify-between">
              <div className="flex-1">
                <div className="font-semibold">{t.anonymized ? 'Anonymous' : t.name} — <span className="text-xs text-muted-foreground">{t.role}</span></div>
                <div className="mt-2 text-sm text-muted-foreground break-words">{t.quote}</div>
                <div className="mt-3 text-xs text-muted-foreground">Submitted: {new Date(t.created_at).toLocaleString()}</div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Button onClick={() => handleVerify(t.id)}>Verify</Button>
                <Button variant="outline" onClick={() => handleAnonymize(t.id)}>{t.anonymized ? 'Un-anonymize' : 'Anonymize'}</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ClinicProtectedRoute>
  );
};

export default TestimonialsAdmin;
