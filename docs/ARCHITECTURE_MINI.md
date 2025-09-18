# Minimal Architecture Overview

## System Architecture & Data Flow

```mermaid
graph TB
    subgraph "User Interface Layer"
        UI[React Frontend]
        PWA[PWA Shell]
        Mobile[Mobile Interface]
    end
    
    subgraph "Core Services"
        Engine[EmpathyIntelligence Engine]
        Metrics[EmpathyMetrics Collector]
        Analytics[Analytics Engine]
        Export[Export Service]
    end
    
    subgraph "Security & Storage"
        Encrypt[Encryption Service]
        SecStore[Secure Storage]
        KeyMgmt[Key Management]
    end
    
    subgraph "External Integration"
        WCB[WorkSafe BC Reports]
        FHIR[FHIR Compliance]
        Emergency[Emergency Services]
    end
    
    subgraph "CI/CD & Security Gates"
        Tests[Automated Testing]
        Security[Security Scanning]
        Coverage[Coverage Reporting]
        Docs[Documentation Validation]
        SBOM[SBOM Generation]
    end
    
    UI --> Engine
    UI --> Metrics
    Engine --> Analytics
    Analytics --> Export
    
    Engine --> Encrypt
    Metrics --> SecStore
    Encrypt --> KeyMgmt
    SecStore --> KeyMgmt
    
    Export --> WCB
    Export --> FHIR
    Engine --> Emergency
    
    Tests --> Security
    Security --> Coverage
    Coverage --> Docs
    Docs --> SBOM
    
    style Engine fill:#e1f5fe
    style Encrypt fill:#fff3e0
    style Tests fill:#f3e5f5
    style WCB fill:#e8f5e8
```

## Data Flow & Security Gates

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant Engine
    participant Security
    participant Storage
    participant CI
    
    User->>UI: Enter Pain Data
    UI->>Engine: Process Assessment
    Engine->>Security: Encrypt Data
    Security->>Storage: Store Encrypted
    
    Note over Storage: Local Browser Storage<br/>AES-256 Encryption
    
    Storage-->>Security: Retrieve Data
    Security-->>Engine: Decrypt Data
    Engine-->>UI: Provide Analytics
    UI-->>User: Display Results
    
    Note over CI: Continuous Security
    CI->>Security: Vulnerability Scan
    CI->>CI: Generate Coverage
    CI->>CI: Validate Documentation
    CI->>CI: Create SBOM
```

## Security Architecture

### Encryption & Key Management
- **Algorithm**: AES-256-GCM for data encryption
- **Key Storage**: Browser secure storage with rotation
- **Scope**: All sensitive pain data and personal information
- **Fallback**: In-memory key cache for storage failures

### Data Classification
- **Sensitive**: Pain assessments, personal identifiers
- **Internal**: Analytics results, usage metrics  
- **Public**: Non-identifying statistical data

### Access Controls
- **Local-only**: No cloud storage by default
- **Encryption**: End-to-end encryption for all data
- **Isolation**: Browser sandbox security model

## Technology Stack Integration

### Frontend Architecture
```
React 18 + TypeScript
├── Design System (Tailwind CSS)
├── State Management (Zustand)
├── Validation Layer (Zod)
└── Testing (Vitest + Testing Library)
```

### Security Layer
```
Security Framework
├── Encryption Service (AES-256)
├── Key Management (Rotation + Storage)
├── Data Validation (Input Sanitization)
└── Audit Logging (Security Events)
```

### CI/CD Pipeline
```
GitHub Actions
├── Code Quality (ESLint + TypeScript)
├── Security Scanning (CodeQL + npm audit)
├── Test Coverage (Vitest + c8)
├── Documentation (Validation + SBOM)
└── Deployment (Multi-environment)
```

---

*Architecture Version: 1.0*
*Last Updated: 2024-09-18*