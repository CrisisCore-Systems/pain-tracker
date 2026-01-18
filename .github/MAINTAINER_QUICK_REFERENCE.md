# Quick Reference: Good First Issues for Maintainers

**Last Updated**: 2026-01-18  
**Purpose**: Quick guide for creating and managing good first issues

---

## 🚀 Quick Start (3 Steps)

### 1. Create Issues from Templates

Visit: `https://github.com/CrisisCore-Systems/pain-tracker/issues/new/choose`

You'll see 4 templates:
- ✅ Add repo topics + About blurb
- ✅ Verify CONTRIBUTING setup instructions
- ✅ Improve README badge alt text
- ✅ Add keyboard-focus a11y smoke test

Click each template → Review → **Create issue**

### 2. Apply Labels

For each issue created, add:
- **Required**: `good first issue`
- **Recommended**: Category label (`documentation`, `accessibility`, `testing`)
- **Optional**: `help wanted` if actively seeking contributors

### 3. Welcome Contributors

When someone comments "I'd like to work on this!":
1. Acknowledge them quickly (< 24 hours if possible)
2. Answer any questions they have
3. Link to relevant docs (CONTRIBUTING.md, GOOD_FIRST_ISSUES.md)
4. Offer to help if they get stuck

---

## 📋 Template Overview

| Template | Time | Difficulty | Skills | Code Changes |
|----------|------|------------|--------|--------------|
| **Repo Metadata** | 10 min | Easy | GitHub settings | ❌ None |
| **Setup Verification** | 15 min | Easy | Testing, docs | ❌ None |
| **Badge Alt Text** | 15 min | Easy | Markdown, a11y | ❌ None |
| **A11y Smoke Test** | 30-45 min | Medium | TypeScript, React | ✅ Yes |

---

## 🎯 What Makes a Good First Issue?

✅ **DO:**
- Clear acceptance criteria (checkboxes)
- Step-by-step instructions
- Links to examples in codebase
- Time estimate and skill requirements
- Friendly, encouraging tone
- Help/support information

❌ **DON'T:**
- Assume contributor knowledge
- Skip prerequisite information
- Use jargon without explanation
- Leave acceptance criteria vague
- Forget to link to resources

---

## 💬 Response Templates

### When someone claims an issue:
```markdown
Thanks for your interest, @username! 🎉

This issue is yours. Feel free to ask questions in the comments as you work through it.

Quick tips:
- Read through the entire issue template first
- Follow the step-by-step instructions
- Check out [CONTRIBUTING.md](../CONTRIBUTING.md) for setup help
- Don't hesitate to ask for clarification

Looking forward to your contribution!
```

### When someone asks a question:
```markdown
Great question, @username!

[Answer their question clearly]

Does that help? Let me know if you need any clarification.
```

### When someone submits a PR:
```markdown
Thanks for the PR, @username! 🙏

I'll review this soon. In the meantime, please ensure:
- [ ] All acceptance criteria from the issue are met
- [ ] You've tested your changes
- [ ] The PR description references the issue (e.g., "Closes #123")

Appreciate your contribution to the project!
```

---

## 🔍 Monitoring Good First Issues

### Weekly Check
- [ ] Any unclaimed issues? Consider promoting them
- [ ] Any claimed issues with no activity? Check in with contributor
- [ ] Any questions needing answers? Respond promptly
- [ ] Any completed issues? Celebrate and close

### Monthly Review
- [ ] Which issues were completed most often?
- [ ] Which issues had the most questions?
- [ ] What was the average time to completion?
- [ ] Did contributors submit more PRs after their first one?

### Template Improvements
Based on feedback, update templates with:
- Clearer instructions
- Better examples
- Additional resources
- Common pitfalls to avoid

---

## 🎓 Common Questions from Contributors

**Q: Do I need to ask permission to work on an issue?**  
A: Just comment that you'd like to work on it! No formal permission needed.

**Q: Can I work on multiple good first issues?**  
A: We recommend completing one first to learn the workflow, then feel free to do more!

**Q: I'm stuck. What should I do?**  
A: Comment on the issue with your specific question. We're here to help!

**Q: How long should this take?**  
A: Check the time estimate in the issue template, but don't stress if it takes longer.

**Q: My environment is different. Will this work?**  
A: The setup should work on Windows/Mac/Linux. If you hit issues, document them!

---

## 📊 Success Metrics

Track these to improve the contributor experience:

- **Time to first claim**: How long issues sit unclaimed
- **Time to completion**: How long from claim to PR merged
- **Question count**: How many questions per issue (lower is better)
- **Completion rate**: % of claimed issues that result in merged PRs
- **Repeat contributors**: % who do more than one issue

---

## 🛠️ Troubleshooting

### Issue sits unclaimed for weeks
- Promote it in Discussions or social media
- Consider if it's too complex (might not be a "good first issue")
- Check if instructions are clear enough

### Contributor claims but doesn't progress
- Check in after 3-5 days with a friendly message
- Offer help if they're stuck
- If no response after 2 weeks, consider unclaiming

### Multiple contributors want the same issue
- First come, first served (based on comment timestamp)
- Encourage the second person to try a different issue
- If first person abandons, offer to second person

---

## 📚 Related Documents

- **[GOOD_FIRST_ISSUES.md](.//GOOD_FIRST_ISSUES.md)** - Comprehensive guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Full implementation details
- **[SETUP_VERIFICATION_REPORT.md](./SETUP_VERIFICATION_REPORT.md)** - Setup testing results
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - Contribution guidelines
- **[Issue Templates](./ISSUE_TEMPLATE/)** - All templates

---

## ✅ Checklist for Maintainers

**Initial Setup:**
- [ ] Create 4 issues from templates
- [ ] Apply `good first issue` label to each
- [ ] Add repository topics (from template #1)
- [ ] Update About section (from template #1)

**Ongoing Management:**
- [ ] Respond to questions within 24-48 hours
- [ ] Review PRs from good first issues promptly
- [ ] Celebrate completed contributions publicly
- [ ] Update templates based on feedback

**Monthly Review:**
- [ ] Check success metrics
- [ ] Identify bottlenecks or confusion
- [ ] Update templates and docs
- [ ] Create new good first issues if needed

---

**Need Help?** Ask in GitHub Discussions or open an issue.  
**Questions?** Contact the maintainer team.

Happy mentoring! 🎉
