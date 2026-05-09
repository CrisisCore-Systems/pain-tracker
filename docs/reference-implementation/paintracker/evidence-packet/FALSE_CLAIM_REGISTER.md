# False Claim Register

Unsupported or over-broad claims are recorded here to prevent public overclaim.

| Unsupported claim | Why unsupported | Safe replacement |
|---|---|---|
| Zero-knowledge sync | No end-to-end sync implementation and proof packet here. | `encrypted backup architecture under review` or `zero operator plaintext access claimed; metadata visibility not zero`. |
| CRDT / operational transform sync | No shipped CRDT/OT implementation is linked. | `default no sync; optional explicit sync may be added later`. |
| Mutual TLS (mTLS) | TLS does not imply mTLS; no mTLS deploy proof linked. | `TLS in use where deployed; mTLS not claimed`. |
| Grant funding awarded | No public award evidence is linked. | `funding path includes sponsors; grant status unclaimed`. |
| Native mobile keychain/Android Keystore for current PWA | PWA path does not prove native secure enclave bindings. | `browser/Web Crypto/local storage boundary for PWA`. |
| Complete version history with point-in-time rollback | No complete per-entry history proof is linked. | `versioning evidence exists where linked`. |
| Certified compliance | No independent certification evidence. | `self-attested conformance draft` or `candidate reference implementation`. |
