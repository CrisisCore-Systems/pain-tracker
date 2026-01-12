# Mini Architecture Overview

```mermaid
flowchart TD
  subgraph Client
    UI[React UI Components] --> State[Local State / Hooks]
    State --> SecureStore[secureStorage Abstraction]
    SecureStore --> LocalStorage[(Browser Storage)]
    SecureStore --> (FutureIndexedDB)[IndexedDB Layer (Planned)]
  end

  subgraph Reporting
    DataExport[Export Modules] --> CSV[CSV Generator]
    DataExport --> JSON[JSON Export]
    DataExport --> PDF[PDF (Planned)]
    DataExport --> WCB[WorkSafe BC Report Formatter]
  end

  UI --> DataExport

  subgraph Tooling
    GitHooks[Pre-Commit Hooks] --> Repo[GitHub Repo]
    Repo --> CI[CI Pipelines]
    CI --> Security[Security Scans & SBOM]
    CI --> Coverage[Coverage & Test Reports]
    CI --> DocsCheck[Docs Validation]
  end

  Security --> SBOM[(CycloneDX SBOM)]
  Coverage --> Badge[(Coverage Badge)]
  DocsCheck --> Status[(Docs Status Badge)]
```

This diagram complements the full [ARCHITECTURE_DEEP_DIVE.md](ARCHITECTURE_DEEP_DIVE.md) with a concise operational + data flow snapshot.
