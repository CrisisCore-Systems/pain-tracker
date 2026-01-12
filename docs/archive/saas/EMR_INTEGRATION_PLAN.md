# EMR/EHR Clinical Integration Plan

**Status**: � Beta Implemented (Phase 1)
**Date Updated**: January 9, 2026
**Context**: "Next Priority" 3 in Roadmap

## 1. Overview
The Pain Tracker implements a secure, local-first integration with EMR/EHR systems using the FHIR R4 standard. 
Phase 1 focuses on a "QR Code Handshake" (Air-Gapped) to avoid network security risks.

## 2. Requirements

### 2.1 Protocols
- **FHIR (Fast Healthcare Interoperability Resources)**: Standard for exchanging healthcare information.
- **HL7 v2/v3**: Legacy standard support may be required for older clinics.

### 2.2 Privacy & Consent ("Clinical Connect")
- **Explicit Consent**: User must explicitly authorize a connection to a specific clinic/provider.
- **Scope Limitation**: Users must select *exactly* what data is shared (e.g., "Only last 30 days of pain levels", "No mood data").
- **Revocation**: Simple "Disconnect" button in settings that immediately stops data flow.

## 3. Architecture Proposal (Local-First)

Unlike cloud-based apps that sync to a server which then talks to Epic/Cerner, this app is local-first.

1.  **Direct-to-Provider Export**:
    *   User generates a clinically-formatted PDF (Existing).
    *   User generates a FHIR JSON bundle (New).

2.  **QR Code Handshake**:
    *   App generates a QR code containing a summary URL or payload.
    *   Clinician scans it to ingest data.

3.  **Patient Portal API**:
    *   If connecting to a portal (e.g., MyChart), the app needs to act as a proper OAuth2 client.
    *   **CONSTRAINT**: Access tokens must be treated as **Class A** secrets (encrypted at rest).

## 4. Implementation Steps

1.  [x] **Add FHIR Type Definitions**: Created `src/types/fhir.ts` (Local definitions to avoid dependency bloat).
2.  [x] **Create FHIR Mapper**: Service to map internal `PainEntry` -> `FHIR Observation` (`FhirMapper.ts`).
3.  [x] **Consent UI**: "Clinical Connect" screen in Settings (`ClinicalIntegrationSettings.tsx`).
4.  [x] **Security Audit**: Review token storage for OAuth flows. (Phase 1 uses QR/Air-gap, no tokens stored).

## 5. Risks
- **Data Leakage**: Improper scope requests could share more than intended.
- **Authentication**: Managing OAuth tokens locally is high-risk.

---
**Note**: Phase 1 (QR Code) is complete. Phase 2 (Direct Connect) requires further security review.
