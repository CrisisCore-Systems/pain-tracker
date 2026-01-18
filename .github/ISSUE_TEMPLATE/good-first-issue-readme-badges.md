---
name: "Good First Issue: README — Badge alt text + link check"
about: Improve accessibility and accuracy of README badges
title: "[Good First Issue] Improve README badge alt text and verify links"
labels: ["good first issue", "documentation", "accessibility"]
assignees: ''
---

## 🎯 Goal

Improve the accessibility and accuracy of badges in `README.md` by ensuring all badges have descriptive alt text and working links.

## 📋 Background

Badges provide quick visual indicators of project health, but they need proper alt text for screen readers and must link to useful destinations. This improves accessibility (WCAG 2.2 AA target) and user experience.

## ✅ Acceptance Criteria

1. **Audit Current Badges** (lines 5-16 in README.md):
   - [ ] List all badges currently in the README
   - [ ] Check that each badge has alt text
   - [ ] Verify alt text is descriptive (not just "badge" or generic)
   - [ ] Verify each badge's link goes somewhere useful

2. **Improve Alt Text**:
   - [ ] Replace generic alt text (e.g., "Tests") with descriptive text
   - [ ] Use format: "[Purpose] Status" or "[Purpose] - [Current Value]"
   - [ ] Examples of good alt text:
     - ❌ Bad: `![Tests](./badges/test-badge.svg)`
     - ✅ Good: `![Test Suite Status](./badges/test-badge.svg)`
     - ✅ Good: `![Code Coverage Percentage](./badges/coverage-badge.svg)`
     - ✅ Good: `![Security Vulnerabilities Count](./badges/security-badge.svg)`

3. **Verify Links**:
   - [ ] Check that GitHub Actions badge links go to the correct workflow
   - [ ] Ensure Codecov badge links to the coverage report
   - [ ] Verify static badges (in `./badges/`) render correctly
   - [ ] Test that clicking each badge takes you somewhere useful
   - [ ] Note any broken or circular links

4. **Document Findings**:
   - [ ] Create a table of current vs improved alt text
   - [ ] List any broken links with suggested fixes
   - [ ] Note any missing badges that would be useful

## 🛠️ How to Complete

### Step 1: Audit Current Badges
```bash
# 1. Open README.md in an editor
# 2. Locate the badges section (lines 5-16)
# 3. Create a spreadsheet or markdown table:

| Badge | Current Alt Text | Proposed Alt Text | Link | Link Works? |
|-------|------------------|-------------------|------|-------------|
| Tests | Tests | Test Suite Status | ./badges/test-badge.svg | ✅ |
| ...   | ...  | ...               | ...  | ... |
```

### Step 2: Propose Changes
Create a markdown file or comment with:
```markdown
## Badge Audit Results

### Badges Requiring Alt Text Improvements

1. **Test Badge**
   - Current: `![Tests](./badges/test-badge.svg)`
   - Proposed: `![Test Suite Status - Latest Results](./badges/test-badge.svg)`
   - Reason: More descriptive for screen readers

2. **Coverage Badge**
   - Current: `![Coverage](./badges/coverage-badge.svg)`
   - Proposed: `![Code Coverage Percentage](./badges/coverage-badge.svg)`
   - Reason: Clarifies what the percentage represents

### Broken Links
- [List any broken links and suggested fixes]

### Additional Suggestions
- [Any other improvements to the badges section]
```

### Step 3: Test Changes (Optional)
If you want to see your changes:
```bash
# 1. Fork the repository
# 2. Make your changes to README.md
# 3. Preview on GitHub (GitHub renders Markdown automatically)
# 4. Test with a screen reader if available
# 5. Submit a PR with your improvements
```

## 📚 Resources

- [README.md](../../README.md) - The file we're improving
- [WCAG 2.2 Guidelines on Images](https://www.w3.org/WAI/WCAG22/Understanding/images-of-text)
- [Shields.io Documentation](https://shields.io/) - Badge service used
- [Writing Good Alt Text](https://axesslab.com/alt-texts/)
- Current badge files: `./badges/*.svg` and `./badges/*.json`

## 💡 Tips

- Alt text should describe the badge's purpose, not just repeat the visible text
- "Status" badges should indicate what they're checking
- "Metric" badges (coverage, LOC) should indicate what's being measured
- Links should go to detailed info (workflow runs, coverage reports, etc.)
- Test your changes by reading them aloud—do they make sense without seeing the badge?

## 📋 Badge Improvement Checklist

For each badge, ask:
- [ ] Does the alt text describe what the badge indicates?
- [ ] Would a screen reader user understand the badge's purpose?
- [ ] Does the link go somewhere useful (not circular)?
- [ ] Is the badge still relevant and accurate?

## 🎁 Bonus Points

- Use a screen reader to test the current badges
- Check if any badges are redundant
- Suggest new badges that would be helpful
- Verify the badge generation scripts work (`npm run badge:all`)
- Check badges in other markdown files (`CONTRIBUTING.md`, etc.)

## 🤝 Need Help?

- Review other well-documented projects for badge inspiration
- Ask in issue comments if you're unsure about alt text wording
- Check the `scripts/` directory to see how badges are generated
- Test changes in a fork before submitting a PR
