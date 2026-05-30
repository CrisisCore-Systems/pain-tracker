# Data Dictionary

## Purpose

This data dictionary defines the fields collected during the Local First Pain Tracking Usability and Trust Study.

The study is designed to collect the minimum data necessary to evaluate usability, trust, privacy understanding, cognitive load, and routine logging potential.

No full medical records, legal records, diagnostic records, or unnecessary identifying information should be collected.

## Participant Metadata

| Field | Type | Required | Allowed Values / Format | Description | Sensitivity |
|---|---:|---:|---|---|---|
| participant_id | string | Yes | P001, P002, P003 | Unique anonymized participant identifier | Low |
| session_date | date | Yes | YYYY-MM-DD | Date of research session | Low |
| session_mode | categorical | Yes | remote, in_person | Whether session was remote or in person | Low |
| recruitment_channel | categorical | Yes | community, social_media, referral, clinic, advocacy_group, other | How participant heard about the study | Low |
| consent_completed | boolean | Yes | true, false | Whether participant completed consent | Medium |
| audio_consent | boolean | Yes | true, false | Whether participant agreed to audio recording | Medium |
| quote_consent | boolean | Yes | true, false | Whether participant agreed to deidentified quote use | Medium |
| future_contact_consent | boolean | Yes | true, false | Whether participant agreed to future contact | Medium |

## Minimal Context Fields

Collect only if needed for analysis. Do not collect detailed medical history.

| Field | Type | Required | Allowed Values / Format | Description | Sensitivity |
|---|---:|---:|---|---|---|
| prior_pain_tracking_experience | categorical | No | none, paper, spreadsheet, app, wearable, other | Whether participant has tracked pain before | Medium |
| current_tracking_frequency | categorical | No | never, rarely, weekly, daily, multiple_times_daily | How often participant currently tracks symptoms | Medium |
| privacy_concern_level | integer | No | 1 to 5 | Baseline concern about health data privacy | Medium |
| accessibility_needs_reported | free_text | No | Short deidentified note | Optional participant reported access needs | Medium |
| device_type_used | categorical | Yes | desktop, laptop, tablet, phone | Device used during study | Low |
| browser_or_platform | string | No | Chrome, Firefox, Safari, Edge, Android, iOS, etc. | Platform used during testing | Low |

## Task Data

Each task should be recorded as one row per participant per task.

| Field | Type | Required | Allowed Values / Format | Description | Sensitivity |
|---|---:|---:|---|---|---|
| participant_id | string | Yes | P001, P002, P003 | Links task record to anonymized participant | Low |
| task_id | string | Yes | T01, T02, T03 | Identifier for each study task | Low |
| task_name | string | Yes | create_entry, find_privacy_info, generate_report | Short task label | Low |
| task_start_time | timestamp | Yes | ISO timestamp or session relative time | Time task began | Low |
| task_end_time | timestamp | Yes | ISO timestamp or session relative time | Time task ended | Low |
| task_duration_seconds | integer | Yes | 0 or greater | Time taken to complete task | Low |
| task_completed | boolean | Yes | true, false | Whether participant completed the task | Low |
| completion_status | categorical | Yes | completed_without_help, completed_with_help, failed, skipped | More detailed task outcome | Low |
| moderator_assists | integer | Yes | 0 or greater | Number of times researcher helped participant | Low |
| error_count | integer | Yes | 0 or greater | Number of observable errors | Low |
| task_errors | free_text | No | Deidentified note | Description of errors or obstacles | Medium |
| hesitation_points | free_text | No | Deidentified note | Where participant paused or seemed unsure | Medium |
| abandonment_reason | categorical | No | confusion, technical_error, discomfort, time, accessibility, other | Reason task was stopped or failed | Medium |

## Task List

| Task ID | Task Name | Success Criteria |
|---|---|---|
| T01 | open_app | Participant opens the app and understands basic purpose |
| T02 | create_pain_entry | Participant creates a complete pain entry |
| T03 | review_entry | Participant finds or reviews a previous entry |
| T04 | find_privacy_info | Participant locates privacy or data storage explanation |
| T05 | explain_data_storage | Participant explains where they believe data is stored |
| T06 | generate_report | Participant previews or creates an exportable report |
| T07 | describe_trust | Participant explains whether they would trust the tool |

## Ratings and Survey Responses

Use 1 to 5 scales unless otherwise stated.

| Field | Type | Required | Allowed Values / Format | Description | Sensitivity |
|---|---:|---:|---|---|---|
| ease_of_use_rating | integer | Yes | 1 to 5 | Overall usability rating | Low |
| privacy_confidence_rating | integer | Yes | 1 to 5 | Confidence that participant controls their data | Medium |
| local_storage_understanding_rating | integer | Yes | 1 to 5 | How clearly participant understood local storage | Medium |
| trust_rating | integer | Yes | 1 to 5 | Overall trust in the app | Medium |
| privacy_anxiety_rating | integer | Yes | 1 to 5 | Level of anxiety about data exposure | Medium |
| cognitive_load_rating | integer | Yes | 1 to 5 | Mental effort required to use the app | Medium |
| export_confidence_rating | integer | Yes | 1 to 5 | Confidence using the report for appointments or documentation | Medium |
| likelihood_to_use | integer | Yes | 1 to 5 | Likelihood participant would use the app again | Medium |
| routine_logging_support_rating | integer | Yes | 1 to 5 | Whether the app supports repeated logging | Medium |
| perceived_safety_rating | integer | Yes | 1 to 5 | Whether the app felt safe to use | Medium |

## Rating Scale

| Value | Meaning |
|---:|---|
| 1 | Strongly disagree / very poor / very low |
| 2 | Disagree / poor / low |
| 3 | Neutral / acceptable / moderate |
| 4 | Agree / good / high |
| 5 | Strongly agree / excellent / very high |

## Protective Experience Questionnaire Fields

| Field | Type | Required | Allowed Values / Format | Description | Sensitivity |
|---|---:|---:|---|---|---|
| peq_data_location_clear | integer | Yes | 1 to 5 | I understood where my data was stored | Medium |
| peq_control_over_data | integer | Yes | 1 to 5 | I felt in control of my data | Medium |
| peq_not_pressured_to_share | integer | Yes | 1 to 5 | I did not feel pressured to share more than I wanted | Medium |
| peq_failure_clear | integer | Yes | 1 to 5 | I understood what would happen if something failed | Medium |
| peq_export_clear | integer | Yes | 1 to 5 | I understood what was included in the export | Medium |
| peq_safe_when_overwhelmed | integer | Yes | 1 to 5 | I felt the app would still be usable if I was tired or overwhelmed | Medium |
| peq_exit_without_penalty | integer | Yes | 1 to 5 | I felt able to stop using the app without penalty | Medium |

## Qualitative Feedback

| Field | Type | Required | Allowed Values / Format | Description | Sensitivity |
|---|---:|---:|---|---|---|
| notable_feedback | free_text | No | Deidentified summary | Participant comments about overall experience | Medium |
| confusion_points | free_text | No | Deidentified summary | Areas where participant struggled | Medium |
| positive_findings | free_text | No | Deidentified summary | Features or patterns participant liked | Medium |
| suggested_improvements | free_text | No | Deidentified summary | Participant ideas for improvement | Medium |
| privacy_comments | free_text | No | Deidentified summary | Comments about privacy, trust, storage, or exposure | Medium |
| routine_use_comments | free_text | No | Deidentified summary | Comments about whether participant would use it regularly | Medium |
| export_comments | free_text | No | Deidentified summary | Comments about report generation or external use | Medium |
| distress_or_discomfort_notes | free_text | No | Deidentified summary only | Notes if participant became uncomfortable or stopped | High |

## Qualitative Coding Fields

These fields are created during analysis.

| Field | Type | Required | Allowed Values / Format | Description | Sensitivity |
|---|---:|---:|---|---|---|
| theme_navigation_confusion | boolean | No | true, false | Navigation confusion appeared in feedback | Low |
| theme_privacy_uncertainty | boolean | No | true, false | Participant was unsure about privacy or storage | Medium |
| theme_local_trust | boolean | No | true, false | Participant expressed trust due to local control | Medium |
| theme_export_confidence | boolean | No | true, false | Participant trusted or valued export feature | Medium |
| theme_cognitive_overload | boolean | No | true, false | Participant found the interface mentally heavy | Medium |
| theme_accessibility_barrier | boolean | No | true, false | Participant experienced accessibility friction | Medium |
| theme_routine_logging_support | boolean | No | true, false | Participant saw value for repeated use | Medium |
| theme_failure_state_confusion | boolean | No | true, false | Participant was confused about errors, recovery, or failure states | Medium |
| theme_data_exposure_fear | boolean | No | true, false | Participant expressed fear of data exposure | High |

## Severity Coding

| Field | Type | Required | Allowed Values / Format | Description | Sensitivity |
|---|---:|---:|---|---|---|
| issue_id | string | No | I001, I002, I003 | Identifier for usability or safety issue | Low |
| issue_description | free_text | No | Deidentified issue summary | Description of observed problem | Medium |
| issue_location | string | No | screen, task, feature, flow | Where the issue occurred | Low |
| severity_rating | categorical | No | low, medium, high, critical | Severity of issue | Medium |
| protective_computing_principle | categorical | No | local_authority, exposure_minimization, reversible_state, explicit_degradation, consent_clarity, cognitive_protection | Principle affected | Low |
| recommended_fix | free_text | No | Design recommendation | Proposed interface or system improvement | Low |

## Derived Fields

These fields are calculated after collection.

| Field | Type | Required | Formula / Rule | Description |
|---|---:|---:|---|---|
| task_duration_seconds | integer | Yes | task_end_time minus task_start_time | Duration of each task |
| core_logging_success | boolean | Yes | true if T02 completed | Whether core pain logging was successful |
| core_logging_under_5_min | boolean | Yes | true if T02 duration is under 300 seconds | Whether H1 threshold was met |
| total_moderator_assists | integer | Yes | sum of moderator_assists per participant | Total help needed |
| total_errors | integer | Yes | sum of error_count per participant | Total observed errors |
| average_trust_score | decimal | Yes | mean of trust related ratings | Composite trust measure |
| average_privacy_score | decimal | Yes | mean of privacy related ratings | Composite privacy confidence measure |
| average_cognitive_burden | decimal | Yes | mean of cognitive load related ratings | Composite burden measure |

## Missing Data Rules

| Situation | Coding Rule |
|---|---|
| Participant skips a question | Leave blank and mark as skipped where applicable |
| Task not attempted | completion_status = skipped |
| Task attempted but not completed | completion_status = failed |
| Researcher forgets to record a time | Mark as missing, do not estimate unless clearly documented |
| Participant withdraws | Keep only data allowed under withdrawal terms |
| Audio not permitted | Use written notes only |
| Quote use not permitted | Do not include direct quotes in report |

## Data Protection Rules

1. Do not store participant names in the main analysis file.
2. Store consent forms separately from task and survey data.
3. Use participant IDs in all analysis files.
4. Remove direct identifiers from notes.
5. Do not collect full medical histories.
6. Do not collect legal, employment, income, or government file details.
7. Do not include raw personal pain narratives in public reports.
8. Use aggregate summaries wherever possible.
9. Use deidentified quotes only if quote consent was granted.
10. Delete identifiable records according to the retention period in the consent form.

## Recommended Files

```text
participants.csv
task_results.csv
survey_responses.csv
qualitative_notes.csv
coded_themes.csv
issue_log.csv
consent_tracking.csv