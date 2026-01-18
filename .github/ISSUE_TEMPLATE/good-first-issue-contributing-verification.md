---
name: "Good First Issue: CONTRIBUTING — Local dev in 5 minutes verification"
about: Verify and improve the local development setup instructions
title: "[Good First Issue] Verify CONTRIBUTING.md setup instructions"
labels: ["good first issue", "documentation", "developer-experience"]
assignees: ''
---

## 🎯 Goal

Test the local development setup instructions in `CONTRIBUTING.md` from scratch and document any pain points or missing steps.

## 📋 Background

Clear, accurate setup instructions are critical for new contributors. This issue helps ensure the documented setup process actually works and can be completed in ~5 minutes as intended.

## ✅ Acceptance Criteria

1. **Test Setup Instructions** (from a fresh environment if possible):
   - [ ] Follow the setup steps in `CONTRIBUTING.md` line-by-line
   - [ ] Time yourself—should complete in 5-10 minutes
   - [ ] Document each command and its result
   - [ ] Note any errors, warnings, or unexpected behavior
   - [ ] Test on your OS (Windows/Mac/Linux)

2. **Verify Core Commands Work**:
   - [ ] `npm install` (or `npm ci`) completes successfully
   - [ ] `npm run dev` starts the dev server without errors
   - [ ] `npm run test` runs tests successfully
   - [ ] `npm run lint` completes (warnings are OK, errors are not)
   - [ ] `npm run doctor` shows environment status

3. **Document Findings**:
   - [ ] Create a checklist of what worked
   - [ ] List any issues encountered with error messages
   - [ ] Note any missing prerequisites or unclear instructions
   - [ ] Suggest improvements or clarifications
   - [ ] Include your environment details:
     - OS and version
     - Node.js version (`node --version`)
     - npm version (`npm --version`)

4. **Submit Improvements** (optional but encouraged):
   - [ ] Propose specific wording improvements
   - [ ] Add missing troubleshooting steps
   - [ ] Suggest additional "Quick Start" commands
   - [ ] Update prerequisites section if needed

## 🛠️ How to Complete

### Option A: Fresh Test (Recommended)
```bash
# 1. Clone to a new directory
git clone https://github.com/CrisisCore-Systems/pain-tracker.git test-setup
cd test-setup

# 2. Follow CONTRIBUTING.md steps exactly as written
# 3. Document each step's outcome
# 4. Note the total time taken
```

### Option B: Existing Clone
```bash
# 1. Clean your existing clone
rm -rf node_modules package-lock.json

# 2. Follow setup instructions from scratch
# 3. Document any differences from a fresh clone
```

### Reporting Your Findings
Create a comment on this issue with:
```markdown
## Setup Test Results

**Environment:**
- OS: [e.g., Windows 11, macOS 14.1, Ubuntu 22.04]
- Node.js: [version]
- npm: [version]

**Time Taken:** [X minutes]

**Steps Tested:**
- [ ] npm install - [SUCCESS/FAILED + notes]
- [ ] npm run dev - [SUCCESS/FAILED + notes]
- [ ] npm run test - [SUCCESS/FAILED + notes]
- [ ] npm run doctor - [SUCCESS/FAILED + notes]

**Issues Found:**
1. [Description of any issues]
2. [Include error messages if applicable]

**Suggestions:**
1. [Improvements to documentation]
2. [Missing steps or prerequisites]
```

## 📚 Resources

- `CONTRIBUTING.md` - The file we're testing
- `README.md` - General project setup info
- `package.json` - Available npm scripts
- `Makefile` - Alternative command reference
- `.nvmrc` - Expected Node.js version

## 💡 Tips

- Use a fresh terminal session to avoid environment pollution
- Take screenshots of errors if helpful
- Check if `.env.example` exists and if `.env` is needed
- Verify that the dev server actually loads in a browser
- On Windows, note if PowerShell vs Command Prompt matters
- Test both `npm` and `make` commands where applicable

## 🎁 Bonus Points

- Test the setup on multiple OSes if you have access
- Create a video walkthrough of the setup process
- Test the optional Canvas setup for Windows (see `docs/ops/CANVAS_WINDOWS_PREREQS.md`)
- Suggest improvements to `make setup` or `npm run doctor`

## 🤝 Need Help?

- Ask questions in the issue comments
- Check existing closed issues for similar problems
- Review the GitHub Actions CI workflows to see what CI expects
- The `npm run doctor` script shows what's expected to be present
