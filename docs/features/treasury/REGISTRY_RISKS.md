# Registry-Based Cash Management - Risk Assessment

**Document Status**: Phase 0 - Planning
**Last Updated**: 2026-01-11
**Feature**: Registry-Based Cash Management

## Overview

This document identifies, analyzes, and provides mitigation strategies for risks associated with implementing the registry-based cash management system. Risks are categorized by type and severity to prioritize mitigation efforts.

## Risk Matrix

### Severity Levels

- **Critical**: Could cause data loss, financial discrepancies, or system failure
- **High**: Significant impact on operations or user experience
- **Medium**: Moderate impact, workarounds available
- **Low**: Minor inconvenience, minimal impact

### Likelihood Levels

- **Very Likely**: >70% chance of occurring
- **Likely**: 40-70% chance
- **Possible**: 20-40% chance
- **Unlikely**: <20% chance

## Technical Risks

### RISK-T001: Data Migration Failure

**Category**: Technical - Database
**Severity**: Critical
**Likelihood**: Possible

**Description**:
Database migration could fail mid-process, leaving the system in an inconsistent state with partially migrated data.

**Impact**:
- Data corruption
- Financial records inaccurate
- System unusable
- Potential financial loss

**Mitigation Strategies**:

1. **Pre-Migration**:
   - Create comprehensive database backup
   - Test migration on production copy
   - Validate migration script in staging
   - Prepare rollback procedure

2. **During Migration**:
   - Execute during off-hours (minimal users)
   - Use database transactions (ACID compliance)
   - Implement checkpoints for verification
   - Monitor migration progress in real-time

3. **Post-Migration**:
   - Run extensive validation queries
   - Compare pre/post balances
   - Keep backup for 30 days
   - Have rollback plan ready

**Contingency Plan**:
If migration fails:
1. Immediately halt migration
2. Restore from backup
3. Analyze failure cause
4. Fix migration script
5. Reschedule migration

**Status**: Mitigated (comprehensive migration strategy in place)

---

### RISK-T002: Balance Calculation Errors

**Category**: Technical - Logic
**Severity**: Critical
**Likelihood**: Possible

**Description**:
Incorrect balance calculations could lead to discrepancies between expected and actual cash amounts, causing financial errors.

**Impact**:
- Incorrect financial reports
- Lost or unaccounted cash
- Audit failures
- Trust issues

**Mitigation Strategies**:

1. **Code Quality**:
   - Comprehensive unit tests for all calculation functions
   - Integration tests for transaction flows
   - Code review by multiple developers
   - Use integer arithmetic (avoid floating point)

2. **Validation**:
   - Real-time balance verification after each transaction
   - Daily reconciliation checks
   - Alert system for negative balances
   - Automatic discrepancy detection

3. **Testing**:
   - Test with production-scale data volumes
   - Edge case testing (zero, negative, overflow)
   - Load testing for concurrent transactions
   - Manual verification during UAT

**Contingency Plan**:
If calculation errors detected:
1. Immediately alert administrators
2. Freeze affected operations
3. Run manual reconciliation
4. Fix calculation logic
5. Audit all recent transactions

**Status**: Active mitigation required

---

### RISK-T003: Concurrent Transaction Conflicts

**Category**: Technical - Concurrency
**Severity**: High
**Likelihood**: Likely

**Description**:
Multiple users recording payments or expenses simultaneously could cause race conditions, leading to incorrect balance updates.

**Impact**:
- Balance discrepancies
- Lost transactions
- Data inconsistency
- User frustration

**Mitigation Strategies**:

1. **Database Level**:
   - Use row-level locking on TreasuryBalance
   - Wrap all balance updates in transactions
   - Implement optimistic locking with version numbers
   - Use SELECT FOR UPDATE on balance reads

2. **Application Level**:
   - Queue system for balance-modifying operations
   - Retry logic with exponential backoff
   - Clear error messages for conflicts
   - Transaction isolation level: READ COMMITTED

3. **Monitoring**:
   - Log all concurrent access attempts
   - Alert on high conflict rates
   - Track transaction retry counts

**Example Implementation**:
```typescript
await prisma.$transaction(async (tx) => {
  // Lock treasury balance row
  const treasury = await tx.treasuryBalance.findFirst({
    where: { id: treasuryId },
  })

  // Update with new balance
  const updated = await tx.treasuryBalance.update({
    where: { id: treasuryId, updatedAt: treasury.updatedAt }, // Optimistic lock
    data: {
      registryBalance: newRegistryBalance,
      updatedAt: new Date(),
    },
  })

  // Create transaction record
  await tx.safeTransaction.create({ /* ... */ })
})
```

**Status**: Partially mitigated (implementation required)

---

### RISK-T004: PDF Generation Performance

**Category**: Technical - Performance
**Severity**: Medium
**Likelihood**: Likely

**Description**:
PDF receipt/voucher generation could be slow, especially under load, degrading user experience.

**Impact**:
- Slow payment completion
- User frustration
- Server resource exhaustion
- Timeout errors

**Mitigation Strategies**:

1. **Optimization**:
   - Generate PDFs asynchronously (background job)
   - Cache PDF templates
   - Use lightweight PDF library
   - Optimize image/logo sizes

2. **Architecture**:
   - Offload to separate service/worker
   - Implement queue system (Bull, BullMQ)
   - Set reasonable timeouts (30s max)
   - Provide "generating..." feedback to users

3. **Fallback**:
   - Allow users to download later from history
   - Email PDF if generation takes too long
   - Provide simplified text receipt immediately

**Performance Target**: PDF generation < 3 seconds

**Status**: Monitoring required post-deployment

---

### RISK-T005: Session/Authentication Failures During Long Wizards

**Category**: Technical - Authentication
**Severity**: Medium
**Likelihood**: Possible

**Description**:
User sessions could expire while completing multi-step wizards, causing data loss and frustration.

**Impact**:
- Lost form data
- User re-enters information
- Workflow interruption
- Poor user experience

**Mitigation Strategies**:

1. **Session Management**:
   - Extend session timeout to 30+ minutes
   - Implement session refresh on user activity
   - Auto-save draft at each wizard step
   - Persist wizard state in database

2. **UX Improvements**:
   - Show session timeout warning
   - Allow recovery of in-progress wizards
   - Provide "Save Draft" option
   - Clear session expiry messaging

3. **Technical Solution**:
```typescript
// Auto-save wizard state
useEffect(() => {
  const autosave = debounce(() => {
    localStorage.setItem(`wizard-draft-${wizardId}`, JSON.stringify(state))
  }, 1000)

  autosave()
}, [state])

// Recover on mount
useEffect(() => {
  const draft = localStorage.getItem(`wizard-draft-${wizardId}`)
  if (draft) {
    setShowRecoveryPrompt(true)
  }
}, [])
```

**Status**: Mitigated with auto-save implementation

---

## Business/Operational Risks

### RISK-B001: Cash Handling Fraud

**Category**: Business - Security
**Severity**: Critical
**Likelihood**: Possible

**Description**:
Staff could manipulate registry balances, pocket cash, or create fraudulent transactions.

**Impact**:
- Financial loss
- Embezzlement
- Audit failures
- Legal consequences

**Mitigation Strategies**:

1. **Controls**:
   - Dual control for large transactions
   - Daily opening/closing by different staff (4-eyes principle)
   - Mandatory physical count verification
   - Discrepancy investigation workflow

2. **Audit Trail**:
   - Complete transaction history
   - Log all balance modifications with user ID
   - Immutable transaction records
   - Regular audit reports

3. **Monitoring**:
   - Flag unusual transaction patterns
   - Alert on large discrepancies
   - Regular surprise audits
   - Camera surveillance at cash handling areas

4. **Access Control**:
   - Role-based permissions (Director, Accountant, Secretary)
   - Secretary can record payments only (not open/close)
   - Separation of duties
   - Regular permission reviews

**Audit Recommendations**:
- Weekly registry reconciliation by Director
- Monthly financial audit
- Annual external audit
- Investigate all discrepancies >10,000 GNF

**Status**: Requires ongoing vigilance

---

### RISK-B002: User Training Gaps

**Category**: Business - Training
**Severity**: High
**Likelihood**: Very Likely

**Description**:
Staff unfamiliar with new registry system could make errors, skip steps, or misuse features.

**Impact**:
- Incorrect data entry
- Missed daily opening/closing
- Balance discrepancies
- Workflow inefficiency

**Mitigation Strategies**:

1. **Pre-Launch Training**:
   - Comprehensive training sessions (2 hours)
   - Hands-on practice in staging environment
   - Written user manual
   - Video tutorials

2. **Post-Launch Support**:
   - On-site support for first week
   - Quick reference guides
   - FAQ documentation
   - Dedicated support contact

3. **In-App Guidance**:
   - Tooltips and help text
   - First-time user onboarding flow
   - Contextual help buttons
   - Error message clarity

**Training Topics**:
- Daily opening procedure
- Recording cash payments
- Recording expenses
- Daily closing procedure
- Handling discrepancies
- Generating reports

**Status**: Training plan required (Week before launch)

---

### RISK-B003: Daily Opening/Closing Skipped

**Category**: Business - Process
**Severity**: High
**Likelihood**: Likely

**Description**:
Staff might forget or skip daily opening/closing procedures, causing registry/safe tracking to become inaccurate.

**Impact**:
- Inaccurate balance tracking
- Lost audit trail
- Cash accountability issues
- Reconciliation difficulties

**Mitigation Strategies**:

1. **Reminders**:
   - Dashboard banner when registry not opened
   - Email/SMS reminders at 8 AM (opening) and 5 PM (closing)
   - Block certain operations if registry not opened
   - Mobile push notifications

2. **Enforcement**:
   - Payments can only be recorded if registry is open
   - Expenses can only be paid if registry is open
   - Warning if closing not done by 7 PM
   - Escalation to Director if skipped

3. **Reporting**:
   - Daily operations compliance report
   - Alert Director if opening/closing missed
   - Track compliance metrics

**Process Checklist**:
```markdown
Morning (8:00 AM):
- [ ] Count safe cash
- [ ] Open registry in system
- [ ] Withdraw float (2M GNF)
- [ ] Verify registry balance

Evening (5:00 PM):
- [ ] Count registry cash
- [ ] Close registry in system
- [ ] Deposit all cash to safe
- [ ] Verify safe balance
```

**Status**: System reminders + process enforcement required

---

### RISK-B004: Incorrect Physical Cash Counts

**Category**: Business - Human Error
**Severity**: Medium
**Likelihood**: Very Likely

**Description**:
Staff could miscount physical cash during opening/closing, leading to discrepancies.

**Impact**:
- False discrepancy alerts
- Time wasted investigating
- Eroded confidence in system
- Actual discrepancies masked

**Mitigation Strategies**:

1. **Counting Procedures**:
   - Use cash counting machines
   - Double-count by two people
   - Count in batches of 500k or 1M GNF
   - Document count process

2. **System Features**:
   - Allow re-count if discrepancy detected
   - Provide denomination breakdown input
   - Show expected vs counted clearly
   - Historical discrepancy trends

3. **Training**:
   - Cash handling best practices
   - Proper counting technique
   - Discrepancy resolution process

**Example UI**:
```tsx
<Card>
  <CardHeader>Count Registry Cash</CardHeader>
  <CardContent>
    <DenominationTable>
      {/* 20,000 GNF notes */}
      <Row>
        <Label>20,000 GNF notes</Label>
        <Input type="number" /> × 20,000 = <Amount />
      </Row>
      {/* Repeat for each denomination */}
    </DenominationTable>
    <Total>Total: {calculatedTotal} GNF</Total>
    <Expected>Expected: {expectedBalance} GNF</Expected>
    <Discrepancy warning={hasDiscrepancy}>
      Discrepancy: {discrepancy} GNF
    </Discrepancy>
  </CardContent>
</Card>
```

**Status**: Denomination counting feature recommended

---

### RISK-B005: Resistance to Change

**Category**: Business - Change Management
**Severity**: Medium
**Likelihood**: Likely

**Description**:
Staff comfortable with current system may resist adopting new registry workflows.

**Impact**:
- Slow adoption
- Workarounds to old system
- Incomplete migration
- Feature underutilization

**Mitigation Strategies**:

1. **Change Management**:
   - Communicate benefits clearly (better tracking, easier reconciliation)
   - Involve staff in testing phase
   - Gather feedback and address concerns
   - Celebrate early successes

2. **Incentives**:
   - Recognize staff who adopt quickly
   - Show time savings with wizards
   - Demonstrate improved accuracy

3. **Support**:
   - Patient onboarding
   - One-on-one training for struggling users
   - Continuous improvement based on feedback

**Communication Plan**:
- Announcement 2 weeks before launch
- Benefits presentation
- Q&A session
- Feedback collection after 1 week, 1 month

**Status**: Change management plan required

---

## Security Risks

### RISK-S001: Unauthorized Access to Treasury

**Category**: Security - Access Control
**Severity**: Critical
**Likelihood**: Unlikely

**Description**:
Unauthorized users could gain access to treasury management features and manipulate balances.

**Impact**:
- Fraudulent transactions
- Financial loss
- Data breach
- Legal liability

**Mitigation Strategies**:

1. **Access Control**:
   - Role-based permissions (RBAC)
   - Multi-factor authentication for treasury access
   - Session timeout enforcement
   - IP allowlisting for sensitive operations

2. **Permissions Matrix**:

| Role | View Balance | Daily Opening | Daily Closing | Record Payment | Pay Expense | Adjust Balance |
|------|--------------|---------------|---------------|----------------|-------------|----------------|
| Director | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Accountant | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Secretary | ✅ (limited) | ❌ | ❌ | ✅ | ❌ | ❌ |
| Teacher | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

3. **Monitoring**:
   - Log all treasury access attempts
   - Alert on failed authorization
   - Review access logs weekly

**Implementation**:
```typescript
export async function requireTreasuryAccess(role: "view" | "manage" | "admin") {
  const { session, error } = await requireSession()
  if (error) return error

  const hasAccess = checkTreasuryPermission(session.user.role, role)
  if (!hasAccess) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  return { session }
}
```

**Status**: Implementation required

---

### RISK-S002: Data Tampering

**Category**: Security - Integrity
**Severity**: Critical
**Likelihood**: Unlikely

**Description**:
Malicious actors could directly modify database records to alter balances or hide transactions.

**Impact**:
- Financial fraud
- Lost audit trail
- Undetected theft
- Legal consequences

**Mitigation Strategies**:

1. **Database Security**:
   - Restrict direct database access
   - Use application-level access only
   - Database user permissions (read-only for app, write for migrations only)
   - Regular database backups

2. **Audit Trail**:
   - Immutable transaction logs
   - Cryptographic checksums on critical records
   - Change tracking on all treasury tables
   - Tamper detection algorithms

3. **Monitoring**:
   - Alert on direct database modifications
   - Daily integrity checks
   - Compare expected vs actual balances
   - Anomaly detection

**Integrity Check**:
```sql
-- Daily verification query
SELECT
  tb.registryBalance,
  (SELECT st.registryBalanceAfter FROM SafeTransaction st
   ORDER BY st.createdAt DESC LIMIT 1) as last_transaction_balance,
  ABS(tb.registryBalance - (SELECT st.registryBalanceAfter ...)) as discrepancy
FROM TreasuryBalance tb;

-- Should have discrepancy = 0
```

**Status**: Monitoring implementation required

---

### RISK-S003: PDF Receipt Forgery

**Category**: Security - Document Integrity
**Severity**: Medium
**Likelihood**: Possible

**Description**:
Fraudulent receipts could be created outside the system or legitimate receipts could be altered.

**Impact**:
- False payment claims
- Financial disputes
- Reputation damage
- Legal issues

**Mitigation Strategies**:

1. **PDF Security**:
   - Embed QR code with verification URL
   - Digital signature on PDFs
   - Watermark with school logo
   - Sequential receipt numbering (no gaps)

2. **Verification System**:
   - Public receipt verification page
   - Scan QR code to verify authenticity
   - Check receipt number against database
   - Display payment details from system

3. **Detection**:
   - Gap detection in receipt numbers
   - Alert on duplicate receipt scans
   - Log all verification attempts

**QR Code Content**:
```
https://gspn.school/verify-receipt?id=GSPN-2026-CASH-00123&hash=abc123...
```

**Verification Endpoint**:
```typescript
// GET /api/verify-receipt?id=...&hash=...
export async function GET(req: NextRequest) {
  const { id, hash } = req.nextUrl.searchParams

  const payment = await prisma.payment.findFirst({
    where: { receiptNumber: id },
  })

  if (!payment || computeHash(payment) !== hash) {
    return NextResponse.json({ valid: false })
  }

  return NextResponse.json({
    valid: true,
    details: { student: ..., amount: ..., date: ... },
  })
}
```

**Status**: QR verification feature recommended

---

## Data Risks

### RISK-D001: Data Loss During Migration

**Category**: Data - Migration
**Severity**: Critical
**Likelihood**: Unlikely

**Description**:
Data could be lost or corrupted during the migration process.

**Impact**:
- Lost financial records
- Historical data unavailable
- Audit trail broken
- Legal/compliance issues

**Mitigation Strategies**:

See RISK-T001 mitigation strategies (same risk, different category).

**Additional Data Protection**:
- Export all data to CSV before migration
- Keep old system accessible (read-only) for 90 days
- Create data reconciliation report
- Verify record counts match

**Status**: Covered by migration strategy

---

### RISK-D002: Insufficient Backup/Recovery

**Category**: Data - Backup
**Severity**: Critical
**Likelihood**: Unlikely

**Description**:
System failure without adequate backups could cause permanent data loss.

**Impact**:
- Financial records lost
- Cannot recover transactions
- Business disruption
- Compliance violations

**Mitigation Strategies**:

1. **Backup Strategy**:
   - Daily automated backups (3 AM)
   - Hourly incremental backups
   - Off-site backup storage
   - 30-day retention policy

2. **Testing**:
   - Monthly backup restoration test
   - Document recovery procedures
   - Measure recovery time objective (RTO < 4 hours)
   - Measure recovery point objective (RPO < 1 hour)

3. **Monitoring**:
   - Verify backup completion daily
   - Alert on backup failures
   - Track backup sizes

**Backup Schedule**:
```bash
# Daily full backup
0 3 * * * /usr/local/bin/backup-database.sh

# Hourly incremental
0 * * * * /usr/local/bin/backup-incremental.sh

# Weekly verification
0 4 * * 0 /usr/local/bin/verify-backup.sh
```

**Status**: Requires infrastructure setup

---

## Compliance Risks

### RISK-C001: Audit Trail Gaps

**Category**: Compliance - Audit
**Severity**: High
**Likelihood**: Possible

**Description**:
Incomplete audit trail could fail financial audits or regulatory reviews.

**Impact**:
- Audit failures
- Regulatory penalties
- Loss of accreditation
- Legal consequences

**Mitigation Strategies**:

1. **Complete Logging**:
   - Log all balance modifications
   - Record user, timestamp, IP for every action
   - Immutable transaction records
   - No delete operations (soft delete only)

2. **Audit Reports**:
   - Daily transaction summary
   - Monthly reconciliation report
   - Annual audit package
   - Exportable to PDF/Excel

3. **Retention**:
   - Keep records for 7 years minimum
   - Archive old data (>2 years)
   - Secure storage

**Audit Trail Requirements**:
- Who: User ID and name
- What: Action performed, data changed
- When: Timestamp (to second precision)
- Where: IP address, device info
- Why: Notes/reason (for manual adjustments)

**Status**: Implementation in progress

---

## Risk Summary Table

| Risk ID | Description | Severity | Likelihood | Mitigation Status |
|---------|-------------|----------|------------|-------------------|
| RISK-T001 | Data Migration Failure | Critical | Possible | Mitigated |
| RISK-T002 | Balance Calculation Errors | Critical | Possible | Active |
| RISK-T003 | Concurrent Transaction Conflicts | High | Likely | Partial |
| RISK-T004 | PDF Generation Performance | Medium | Likely | Monitoring |
| RISK-T005 | Session Failures | Medium | Possible | Mitigated |
| RISK-B001 | Cash Handling Fraud | Critical | Possible | Ongoing |
| RISK-B002 | User Training Gaps | High | Very Likely | Required |
| RISK-B003 | Skipped Daily Ops | High | Likely | Required |
| RISK-B004 | Incorrect Cash Counts | Medium | Very Likely | Recommended |
| RISK-B005 | Resistance to Change | Medium | Likely | Required |
| RISK-S001 | Unauthorized Access | Critical | Unlikely | Required |
| RISK-S002 | Data Tampering | Critical | Unlikely | Required |
| RISK-S003 | PDF Receipt Forgery | Medium | Possible | Recommended |
| RISK-D001 | Data Loss Migration | Critical | Unlikely | Mitigated |
| RISK-D002 | Insufficient Backup | Critical | Unlikely | Required |
| RISK-C001 | Audit Trail Gaps | High | Possible | In Progress |

## Risk Monitoring

### Pre-Launch Review

Before deploying to production:

- [ ] All Critical risks have mitigation plans
- [ ] All High risks have mitigation plans
- [ ] Backup/recovery procedures tested
- [ ] Security measures implemented
- [ ] Training materials prepared
- [ ] Audit trail logging verified

### Post-Launch Monitoring

After deployment:

- Week 1: Daily risk review
- Week 2-4: Bi-weekly risk review
- Month 2+: Monthly risk review

### Key Risk Indicators (KRIs)

Monitor these metrics:

1. **Balance Discrepancies**: Count per week (target: <2)
2. **Failed Transactions**: Percentage (target: <1%)
3. **Concurrent Conflicts**: Count per day (target: <5)
4. **User Errors**: Count per day (target: <3)
5. **Security Incidents**: Count per month (target: 0)
6. **Backup Failures**: Count per month (target: 0)

## Incident Response Plan

### Severity 1 (Critical)

Examples: Data loss, security breach, financial fraud

**Response**:
1. Immediate notification to Director and IT lead
2. Freeze affected system operations
3. Assemble incident response team
4. Contain and assess damage
5. Execute recovery procedure
6. Post-incident analysis within 48 hours

### Severity 2 (High)

Examples: Balance discrepancy, system unavailable

**Response**:
1. Notify Director and Accountant
2. Investigate root cause
3. Implement temporary workaround
4. Resolve issue within 24 hours
5. Document lessons learned

### Severity 3 (Medium/Low)

Examples: UI bug, performance issue

**Response**:
1. Log issue in tracking system
2. Prioritize in next sprint
3. Notify affected users
4. Resolve based on priority

## Risk Acceptance

Some risks may be accepted based on cost-benefit analysis:

**Accepted Risks**:
- RISK-T004 (PDF Performance): Accept occasional slow generation, mitigate with async processing
- RISK-B004 (Incorrect Counts): Accept minor discrepancies, mitigate with investigation process

**Risk Owner**: Director
**Review Frequency**: Quarterly

## Continuous Improvement

Risk assessment is ongoing:

1. **Review Schedule**:
   - Monthly: Risk register review
   - Quarterly: Mitigation effectiveness
   - Annually: Comprehensive risk assessment

2. **Feedback Loop**:
   - Incident reports → risk register updates
   - User feedback → new risks identified
   - Audit findings → mitigation improvements

3. **Metrics**:
   - Track risk trends over time
   - Measure mitigation effectiveness
   - Report to stakeholders

## Sign-Off

**Risk Assessment Completed By**: _______________
**Date**: _______________

**Reviewed By (Director)**: _______________
**Date**: _______________

**Approved By (Product Owner)**: _______________
**Date**: _______________

---

**Next Review Date**: 3 months post-deployment
