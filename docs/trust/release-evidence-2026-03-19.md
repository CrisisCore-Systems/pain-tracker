# Release Evidence - 2026-03-19

Release: degraded-functionality evidence packet
Date: 2026-03-19
Owner: Kay + Copilot execution pass

## Scope

- Objective: capture a repo-local evidence packet for degraded-functionality claims covering low bandwidth, constrained runtime, keyboard-only use, accessibility evidence, and no-media-autoload behavior during essential flows.
- Evidence source: Playwright packet generated under `evidence/degraded-functionality/2026-03-19/`.
- Essential workflow exercised: open app shell, enter the `new-entry` flow, set pain level, choose a location, and save.

## Artifact Index

- Packet root: `evidence/degraded-functionality/2026-03-19/README.md`
- Low bandwidth: `evidence/degraded-functionality/2026-03-19/01-low-bandwidth/`
- Constrained runtime: `evidence/degraded-functionality/2026-03-19/02-constrained-runtime/`
- Keyboard only: `evidence/degraded-functionality/2026-03-19/03-keyboard-only/`
- Accessibility: `evidence/degraded-functionality/2026-03-19/04-accessibility/`
- Network trace: `evidence/degraded-functionality/2026-03-19/05-network/`
- Host tooling / Android retry: `evidence/degraded-functionality/2026-03-19/06-host-tooling-checks.md`, `evidence/degraded-functionality/2026-03-19/07-android-provisioning-attempt.md`, `evidence/degraded-functionality/2026-03-19/07-emulator-runtime/`

## Execution Snapshot

- Evidence suite result: packet capture completed successfully for all five targeted scenarios.
- Important interpretation note: suite success means the artifacts were captured. It does not, by itself, prove that every claimed signoff criterion passed.
- Packet README already records two explicit limitations:
  - true 512MB-class proof is not established by browser-only low-end emulation
  - manual screen-reader walkthrough is still required for full screen-reader evidence

## Observed Results

### 1. Low Bandwidth

- Artifacts: HAR, timings, screenshot, and video saved under `01-low-bandwidth/`.
- Test posture: 2G throttling was applied after the app shell loaded so the measurement reflects the essential workflow rather than Vite dev bootstrap overhead.
- Recorded timings from `01-low-bandwidth/timings.json`:
  - `newEntryReadyMs`: 424
  - `throttledWorkflowMs`: 2146
  - `DomContentLoaded`: about 1195 ms after navigation start
  - `load`: about 1255 ms after navigation start
- Evidence status: supports the narrower claim that the essential entry flow remained usable under post-load 2G throttling in this browser test setup.

### 2. Constrained Runtime

- Artifacts: profile JSON, screenshot, limitation note, and video saved under `02-constrained-runtime/`.
- Emulation profile from `02-constrained-runtime/profile.json`:
  - browser: Chromium
  - device profile: Pixel 5
  - launch args: `--enable-low-end-device-mode`, `--js-flags=--max-old-space-size=256`
  - CPU throttle rate: 4x
- Recorded timings:
  - `appReadyMs`: 10468
  - `newEntryReadyMs`: 1480
  - `totalFlowMs`: 6621
- Memory/process snapshot:
  - `JSHeapUsedSize`: 16278996
  - `JSHeapTotalSize`: 19595264
- Evidence status: partially supports the claim that the essential workflow remained usable under a browser-emulated low-end runtime. It does not establish full 512MB-class device proof.

### 3. Keyboard-Only Workflow

- Artifacts: timing JSON, screenshot, and video saved under `03-keyboard-only/`.
- Recorded workflow details from `03-keyboard-only/keyboard-flow.json`:
  - `newEntryReadyMs`: 297
  - `tabStopsToSlider`: 23
  - `tabStopsToLocation`: 12
  - `tabStopsToSave`: 32
  - `totalFlowMs`: 5189
  - `blockedControls`: []
- Evidence status: supports the claim that the essential quick-entry workflow was operable without pointer input in the exercised browser path.

### 4. Accessibility Evidence

- Artifacts: axe JSON reports, screenshots, and manual walkthrough note saved under `04-accessibility/`.
- Automated result: the latest packet rerun cleared the earlier `color-contrast` findings that had blocked WCAG AA evidence in the prior packet revision.
- Remaining automated findings in the saved axe reports are moderate semantic issues, including heading order and landmark structure findings such as `heading-order`, `landmark-banner-is-top-level`, `landmark-main-is-top-level`, and `landmark-unique`.
- Manual result: `04-accessibility/manual-screen-reader-walkthrough.md` now records a completed human-operated NVDA walkthrough on 2026-03-20 with a pass verdict for the exercised dashboard, new-entry, and reports/export paths.
- Retry progress: NVDA was installed and launched on this machine, and the walkthrough gap is now closed by a human-verified pass record.
- Evidence status: automated contrast blocking is cleared, and the manual screen-reader evidence gap is closed for the exercised desktop paths. Moderate semantic accessibility issues still remain in the saved axe reports and should continue to be tracked as structural accessibility debt.

### 6. Real Android Emulator Retry

- Host tooling is now installed and a real Android emulator booted successfully.
- Runtime receipts captured in `07-android-provisioning-attempt.md` include:
  - `adb devices -l` showing `emulator-5554` as a live device
  - `sys.boot_completed=1`
  - `dalvik.vm.heapsize=512m`
  - guest `/proc/meminfo` showing `MemTotal: 2014492 kB`
  - emulator startup log line `Increasing RAM size to 2048MB`
- Device-side emulator artifacts were captured under `07-emulator-runtime/`.
- App-flow result improved during the retry:
  - the first launch still opened Chrome `FirstRunActivity`
  - emulator-side taps cleared the sign-in and notifications prompts
  - the final captured Chrome state showed `ChromeTabbedActivity` with the URL bar set to `10.0.2.2:3000/app?pt_test_mode=1` and a focused `Web View`
- Remaining limitation:
  - the Play Store image still auto-expanded guest RAM to about 2GB
  - the final emulator-side capture is not a trustworthy app-level interaction trace, so it does not prove that the essential workflow rendered and completed on-device
- Evidence status: this now proves a real emulator-backed browser path to the target URL on this host, but it is still not valid proof of a true 512MB-class app workflow.

### 5. No Media Autoload

- Artifacts: network trace JSON and screenshot saved under `05-network/`.
- Recorded trace from `05-network/no-media-autoload.json`:
  - scope: initial app load plus opening `new-entry`, with no explicit user media action
  - `totalRequests`: 237
  - `mediaRequests`: `[]`
- Evidence status: supports the claim that the exercised essential flow did not autoload media resources before an explicit user media action.

## Signoff Decision

- Low-bandwidth essential workflow: supported by packet evidence.
- Keyboard-only essential workflow: supported by packet evidence.
- No-media-autoload during essential workflow: supported by packet evidence.
- Constrained-runtime resilience: partially supported only, because browser emulation is not the same as verified 512MB-class device evidence.
- Real Android retry: partially supported only, because the booted Play Store image auto-increased RAM to about 2GB and the final emulator-side evidence still stops at a Chrome `Web View` container rather than a verified on-device app workflow.
- WCAG / screen-reader criterion: manual exercised-path screen-reader evidence is now supported for the desktop walkthrough. A broader "clean automated accessibility" claim is still not earned because the saved axe reports continue to record moderate semantic findings.
- Overall degraded-functionality signoff: not yet fully earned.

## Required Follow-Up

- Resolve the remaining moderate semantic accessibility findings if the release gate requires a clean automated axe pass rather than a narrower contrast-specific clearance.
- Capture true constrained-device evidence if release criteria require a 512MB-class claim rather than browser-emulated low-end evidence.
- Replace the current Play Store image or browser path with one that both honors a truthful low-RAM ceiling and allows app-level interaction evidence beyond Chrome onboarding and browser chrome.

## Truthfulness Notes

- This packet is strong enough to support narrower claims about essential-flow usability under bandwidth throttling, keyboard-only operation, and no-media-autoload behavior.
- This packet does not justify a broad release claim that degraded-functionality signoff is complete if that claim includes true 512MB-class device proof or a fully clean automated accessibility posture.
- Any release or audit language should preserve the distinction between evidence captured and criteria actually passed.