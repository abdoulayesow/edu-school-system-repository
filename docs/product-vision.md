# Product Vision - Groupe Scolaire Privé Ndiolou (GSPN)

| **Document Info** | |
|-------------------|---|
| **Product** | GSPN School Management System |
| **Version** | 1.0 |
| **Date** | December 19, 2025 |
| **Status** | Draft |
| **Author** | Product Team |

---

## 1. Vision Statement

{panel:title=Vision Statement|borderStyle=solid|borderColor=#0747A6|bgColor=#DEEBFF}

**FOR** Groupe Scolaire Privé Ndiolou (GSPN) staff and administration in Guinea

**WHO** need to manage student enrollment, payments, activities, and academic operations with complete traceability and accountability

**THE** GSPN School Management System **IS A** comprehensive, offline-first school management platform

**THAT** provides secure enrollment processing, transparent payment handling, activity management, and real-time reconciliation with full audit trails

**UNLIKE** manual paper-based processes or fragmented spreadsheet systems

**OUR PRODUCT** ensures security, traceability, fair treatment, and real-time visibility across all school operations while supporting Guinea's infrastructure constraints (low bandwidth, mobile money payments).

{panel}

---

## 2. Problem Statement

### Current Challenges

| Challenge | Impact | Evidence from Stakeholders |
|-----------|--------|---------------------------|
| **Untracked cash transactions** | Financial leakage, audit failures | *"Avoid untracked cash. Favor secure, recorded payments."* |
| **Unclear role responsibilities** | Operational confusion, delays | *"Roles must be clear: leadership, secretariat, student affairs."* |
| **No activity traceability** | Missing enrollment records, payment disputes | *"Every extracurricular activity must be recorded, validated, and traceable."* |
| **Manual reconciliation** | Errors, time-consuming period closes | *"Bank deposits must be made regularly; then we reconcile in accounting."* |
| **Exception handling without documentation** | Compliance risks, unfair treatment | *"Each exception must be justified and approved."* |

### Root Causes

1. **Fragmented processes** — Enrollment, payments, and activities managed in separate systems/papers
2. **No confirmation loop** — Transactions lack systematic validation and receipts
3. **Missing audit trail** — Decisions and exceptions undocumented
4. **Period-end chaos** — No structured close process for financial periods

---

## 3. Target Users

### Primary Users (MVP - Release 1)

| Role | Key Responsibilities | System Needs |
|------|---------------------|--------------|
| **Secretary / Student Affairs** | Enrollment processing, activity registration, student records | Enrollment forms, confirmation messages, activity assignment |
| **Accountant** | Payment recording, reconciliation, financial reports | Payment tracking, bank deposit validation, period summaries |
| **Academic Director** | Pedagogical oversight, curriculum activities | Curricular vs. extracurricular distinction, attendance oversight |
| **Teacher** | Attendance confirmation, activity participation tracking | Participation confirmation interface, reporting to student affairs |
| **School Leadership** | Approvals, exception handling, strategic oversight | Approval workflows, dashboard visibility, audit reports |

### Secondary Users (Future Releases)

| Role | Key Responsibilities | Planned Features |
|------|---------------------|------------------|
| **Parent** | Payment submission, student progress tracking | Payment portal, notifications, grade viewing |
| **Student** | Activity enrollment, schedule access | Self-service enrollment, schedule viewing |

---

## 4. Core Value Proposition

{panel:title=Value Matrix|borderStyle=solid|borderColor=#00875A|bgColor=#E3FCEF}

| Stakeholder | Pain Point | Solution | Benefit |
|-------------|------------|----------|---------|
| **Secretary** | Manual enrollment tracking, lost records | Digital enrollment with automatic confirmation | 50% reduction in administrative errors |
| **Accountant** | Unreconciled payments, cash tracking | Validated payment system with audit trail | 80% reduction in reconciliation errors |
| **Teacher** | No structured way to confirm attendance | Digital participation confirmation | 5 hrs/week saved on administrative tasks |
| **Leadership** | No visibility into operations | Real-time dashboards and approval workflows | Instant oversight, documented exceptions |
| **Parents** | Uncertainty about payment status | Receipt confirmations, payment history | Trust and transparency |

{panel}

---

## 5. Success Metrics

### Key Performance Indicators (KPIs)

| Metric | Baseline | Target (6 months) | Measurement |
|--------|----------|-------------------|-------------|
| **Transaction traceability** | ~40% documented | 100% documented | % of transactions with supporting documents |
| **Enrollment processing time** | 2-3 days | Same day | Average time from enrollment request to confirmation |
| **Reconciliation accuracy** | Manual, error-prone | 95%+ automated match | % of payments auto-reconciled with deposits |
| **Period close time** | 1-2 weeks | 2-3 days | Time to produce period summary reports |
| **Exception documentation** | Rarely documented | 100% documented | % of exceptions with approval records |

### Qualitative Goals

- [ ] Staff confidence in system accuracy
- [ ] Elimination of payment disputes
- [ ] Clear audit trail for all financial decisions
- [ ] Fair and consistent treatment of all students/families

---

## 6. Core Principles

{panel:title=Guiding Principles|borderStyle=solid|borderColor=#6554C0|bgColor=#EAE6FF}

| Principle | Description | Implementation |
|-----------|-------------|----------------|
| **🔒 Security First** | Every transaction secured and validated | Receipts, confirmations, approval workflows |
| **📋 Complete Traceability** | Full audit trail for all operations | Journal logs, document attachments, timestamps |
| **⚖️ Fair Treatment** | Consistent processes, documented exceptions | Standard workflows, exception approval chain |
| **👁️ Real-time Visibility** | Stakeholders see current state instantly | Dashboards, status tracking, notifications |
| **✅ Confirm Everything** | No silent operations | System confirmations, receipt messages |

{panel}

---

## 7. Scope Definition

### In Scope (MVP)

| Module | Features |
|--------|----------|
| **Enrollment** | Student registration, confirmation messages, document upload |
| **Payment Processing** | Payment recording, receipt generation, mobile money support |
| **Activity Management** | Curricular/extracurricular activities, student assignment, teacher confirmation |
| **Reconciliation** | Bank deposit recording, payment-deposit matching, validation workflow |
| **Reporting** | Period summaries, enrollment reports, payment reports, anomaly tracking |
| **Exception Handling** | Ticket creation, approval workflow, documented decisions |

### Out of Scope (Future Releases)

| Module | Planned Release |
|--------|-----------------|
| **Parent Portal** | Release 2 |
| **Student Self-Service** | Release 2 |
| **Grade Management** | Release 3 |
| **Timetable Management** | Release 3 |
| **SMS/Email Notifications** | Release 2 |
| **Multi-school Support** | Release 4 |

---

## 8. Constraints & Assumptions

### Technical Constraints

| Constraint | Mitigation |
|------------|------------|
| **Low bandwidth in Guinea** | Offline-first architecture, data sync when connected |
| **Mobile money preference (Orange Money)** | Integration with local payment providers |
| **Limited IT infrastructure** | Cloud-hosted, low-cost (~$5-10/month), PWA for mobile |

### Business Assumptions

| Assumption | Validation Approach |
|------------|---------------------|
| Staff will adopt digital processes | Phased rollout, training, parallel run with paper |
| Payment documentation improves compliance | Audit comparison before/after |
| Teachers will confirm attendance digitally | Simple interface, minimal clicks |

---

## 9. Release Roadmap

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         RELEASE ROADMAP                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  RELEASE 1 (MVP) ─────────────────────────────────────────────────────  │
│  │ Enrollment → Payment → Validation → Reconciliation → Reporting       │
│  │ Users: Secretary, Accountant, Teacher, Academic Director, Leadership │
│  │ Timeline: Sprints 1-6                                                │
│                                                                          │
│  RELEASE 2 ──────────────────────────────────────────────────────────── │
│  │ Parent Portal, Student Self-Service, Notifications                   │
│  │ Users: + Parents, Students                                           │
│  │ Timeline: Sprints 7-9                                                │
│                                                                          │
│  RELEASE 3 ──────────────────────────────────────────────────────────── │
│  │ Grades, Timetables, Advanced Academic Features                       │
│  │ Timeline: Sprints 10-11                                              │
│                                                                          │
│  RELEASE 4 ──────────────────────────────────────────────────────────── │
│  │ Multi-school, Advanced Analytics                                     │
│  │ Timeline: Future                                                     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Stakeholder Sign-off

| Stakeholder | Role | Date | Signature |
|-------------|------|------|-----------|
| | School Director | | |
| | Academic Director | | |
| | Head of Administration | | |
| | Product Owner | | |

---

{info:title=Document History}
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 19, 2025 | Product Team | Initial draft based on stakeholder recording |
{info}
