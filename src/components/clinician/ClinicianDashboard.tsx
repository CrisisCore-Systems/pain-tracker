import React, { useState } from 'react';
import { Card, Button } from '../../design-system';

// Mock clinician login (local-only, demo)
const CLINICIAN_USERS = [
  { id: 'c1', name: 'Dr. Smith', role: 'full' },
  { id: 'c2', name: 'Dr. Lee', role: 'read' },
];

const INITIAL_PATIENTS = [
  { id: 'p1', name: 'Jane Doe', consented: true },
  { id: 'p2', name: 'John Roe', consented: false },
  { id: 'p3', name: 'Alex Kim', consented: true },
];

// Simple local audit log (in-memory for demo)
const useAuditLog = () => {
  const [log, setLog] = useState([]);
  const addLog = (entry) => setLog(l => [...l, { ...entry, ts: new Date().toISOString() }]);
  return { log, addLog };
};

// Simple local messaging (in-memory for demo)
const useMessaging = () => {
  const [messages, setMessages] = useState([]);
  const sendMessage = (from, to, text) => {
    setMessages(msgs => [...msgs, { from, to, text, ts: new Date().toISOString() }]);
  };
  return { messages, sendMessage };
};

export default function ClinicianDashboard() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(CLINICIAN_USERS[0]);
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const { log: auditLog, addLog } = useAuditLog();
  const { messages, sendMessage } = useMessaging();
  const [msgText, setMsgText] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  function handleLogin(id: string) {
    const found = CLINICIAN_USERS.find(u => u.id === id);
    if (found) {
      setUser(found);
      setLoggedIn(true);
      addLog({ action: 'login', user: found.name });
    }
  }

  function handleLogout() {
    addLog({ action: 'logout', user: user.name });
    setLoggedIn(false);
    setUser(CLINICIAN_USERS[0]);
    setSelectedPatient(null);
  }

  // Permission system: toggle consent per patient
  function toggleConsent(patientId: string) {
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        addLog({ action: p.consented ? 'revoke_consent' : 'grant_consent', patient: p.name, by: user.name });
        return { ...p, consented: !p.consented };
      }
      return p;
    }));
    if (selectedPatient && selectedPatient.id === patientId) {
      setSelectedPatient(prev => prev ? { ...prev, consented: !prev.consented } : prev);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8 p-6">
      <h2 className="text-xl font-bold mb-2">Clinician Dashboard</h2>
      {!loggedIn ? (
        <div className="space-y-3">
          <p className="text-sm">Select clinician to log in (local demo):</p>
          {CLINICIAN_USERS.map(u => (
            <Button key={u.id} onClick={() => handleLogin(u.id)}>{u.name} ({u.role})</Button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-semibold">Logged in as:</span> {user.name} ({user.role})
            </div>
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Patient List</h3>
            <ul className="space-y-2">
              {patients.map(p => (
                <li key={p.id} className="flex items-center gap-2">
                  <Button size="sm" onClick={() => setSelectedPatient(p)}>{p.name}</Button>
                  <span className={`text-xs ${p.consented ? 'text-green-600' : 'text-red-600'}`}>{p.consented ? 'Consented' : 'No Consent'}</span>
                  <Button size="xs" variant="outline" onClick={() => toggleConsent(p.id)}>
                    {p.consented ? 'Revoke' : 'Grant'} Consent
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          {selectedPatient && (
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <h4 className="font-semibold mb-2">Patient: {selectedPatient.name}</h4>
              <div className="mb-2">Consent: {selectedPatient.consented ? 'Granted' : 'Not granted'}</div>
              <div className="mb-2">Role: {user.role === 'full' ? 'Full access' : 'Read-only'}</div>
              {/* Role-based access control: restrict actions */}
              {user.role === 'full' ? (
                <div className="mb-2 flex gap-2 flex-wrap">
                  <Button size="sm" variant="default" disabled={!selectedPatient.consented}>Edit Patient Data</Button>
                  <Button size="sm" variant="default" disabled={!selectedPatient.consented} onClick={() => addLog({ action: 'export_report', patient: selectedPatient.name, by: user.name })}>Export Report</Button>
                </div>
              ) : (
                <div className="mb-2">
                  <Button size="sm" variant="outline" disabled>Read-only: Cannot edit or export</Button>
                </div>
              )}

              {/* Secure Messaging */}
              <div className="mb-2">
                <h5 className="font-semibold mb-1">Secure Messaging</h5>
                <div className="max-h-32 overflow-y-auto border rounded p-2 bg-white mb-2">
                  {messages.filter(m => m.to === selectedPatient.id || m.from === selectedPatient.id).length === 0 && (
                    <div className="text-xs text-muted-foreground">No messages yet.</div>
                  )}
                  {messages.filter(m => m.to === selectedPatient.id || m.from === selectedPatient.id).map((m, i) => (
                    <div key={i} className="text-xs mb-1">
                      <span className="font-semibold">{m.from === user.id ? user.name : selectedPatient.name}:</span> {m.text}
                      <span className="ml-2 text-gray-400">({new Date(m.ts).toLocaleTimeString()})</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="border rounded px-2 py-1 text-xs flex-1"
                    value={msgText}
                    onChange={e => setMsgText(e.target.value)}
                    placeholder="Type a message..."
                    disabled={!selectedPatient.consented}
                  />
                  <Button size="xs" onClick={() => {
                    if (msgText.trim()) {
                      sendMessage(user.id, selectedPatient.id, msgText.trim());
                      addLog({ action: 'send_message', from: user.name, to: selectedPatient.name });
                      setMsgText('');
                    }
                  }} disabled={!selectedPatient.consented}>Send</Button>
                </div>
              </div>

              {/* Provider-side Report Generation (stub) */}
              <div className="mb-2">
                <h5 className="font-semibold mb-1">Provider Reports</h5>
                <Button size="sm" variant="default" disabled={!selectedPatient.consented} onClick={() => addLog({ action: 'generate_report', patient: selectedPatient.name, by: user.name })}>Generate SOAP Note</Button>
                <Button size="sm" variant="default" disabled={!selectedPatient.consented} className="ml-2" onClick={() => addLog({ action: 'generate_wcb', patient: selectedPatient.name, by: user.name })}>WorkSafe BC Form</Button>
              </div>

              {/* Audit Log (per patient) */}
              <div className="mb-2">
                <h5 className="font-semibold mb-1">Audit Log</h5>
                <div className="max-h-24 overflow-y-auto border rounded p-2 bg-white">
                  {auditLog.filter(l => l.patient === selectedPatient.name || l.user === user.name || l.by === user.name).length === 0 && (
                    <div className="text-xs text-muted-foreground">No audit events yet.</div>
                  )}
                  {auditLog.filter(l => l.patient === selectedPatient.name || l.user === user.name || l.by === user.name).map((l, i) => (
                    <div key={i} className="text-xs mb-1">
                      <span className="font-semibold">{l.action}</span> - {l.patient || l.user || ''} <span className="ml-2 text-gray-400">({new Date(l.ts).toLocaleTimeString()})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* Clinician Onboarding/Documentation */}
      <div className="mt-8">
        <Button size="sm" variant="outline" onClick={() => setShowOnboarding(v => !v)}>{showOnboarding ? 'Hide' : 'Show'} Clinician Onboarding</Button>
        {showOnboarding && (
          <div className="mt-2 p-4 border rounded bg-blue-50 text-sm">
            <h4 className="font-semibold mb-1">Clinician Onboarding</h4>
            <ul className="list-disc pl-5">
              <li>Log in as a clinician to view and manage patients.</li>
              <li>Consent is required to access patient data.</li>
              <li>Role-based access: "full" can edit/export, "read" is view-only.</li>
              <li>Send secure messages to patients (local-only, demo).</li>
              <li>Generate provider reports (SOAP, WorkSafe BC) for consented patients.</li>
              <li>All actions are locally audit-logged for compliance.</li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
