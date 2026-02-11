# Feature: Teacher Salary Management

## Overview

This feature introduces salary management to the GSPN school management system. It covers two interconnected workflows: (1) tracking teacher work hours and (2) processing salary payments through accounting. It also handles the special case of salary advances and their recoupment.

---

## Context & Current Process

Around the **20th of each month**, the academic leadership (Censeur for lycee, Principal for college, Directeur du Primaire for primaire) determines how many hours each teacher has been present and working at the school during that month. They leverage information such as missed classes, absences, and other attendance data to calculate the total hours worked per teacher.

Once that calculation is complete, the academic director passes this information to the **accounting team** (Comptable / Coordinateur General), who is responsible for computing and disbursing salary payments based on those hours.

---

## Workflow Summary

```
ACADEMIC DIRECTOR (Censeur / Principal / Dir. Primaire)
  |  Around the 20th of each month
  |  Determines hours worked per teacher
  |  Considers: missed classes, absences, attendance records
  |
  |  Submits hours worked report
  v
ACCOUNTING TEAM (Comptable / Coordinateur General)
  |  Receives hours worked data
  |  Calculates salary based on hours
  |  Manages salary advances & recoupment
  |  Processes salary payment
  v
SALARY PAID
```

---

## Part 1: Hours Worked Tracking

### Who
- **Censeur** (lycee teachers)
- **Principal** (college teachers)
- **Directeur du Primaire** (primary teachers)

### What
Enable each academic director to determine and record the number of hours each teacher under their supervision has worked during a given month.

### How It Works Today
1. Around the 20th of the month, the academic director reviews teacher attendance and class records.
2. They account for missed classes, absences, and any other factors affecting hours worked.
3. They calculate total hours worked per teacher for that month.
4. They pass this information to the accounting team (currently done manually/on paper).

### What the System Should Enable
- Record hours worked per teacher, per month.
- Allow the academic director to factor in missed classes and absences when determining hours.
- Generate a monthly hours-worked report that can be submitted to the accounting team.
- Maintain a historical record of hours worked per teacher across months.

---

## Part 2: Salary Payment Processing (Accounting)

### Who
- **Comptable** (Ibrahima) — performs salary calculations and payments
- **Coordinateur General** — supervises and approves

### What
A dedicated **Salaries section** within the accounting module — positioned below the existing Expenses section — where the accounting team manages all salary-related operations.

### What the System Should Enable
- Receive the hours-worked data submitted by academic directors.
- Calculate salary amounts based on hours worked (and applicable rates).
- Set up and process salary payments for each teacher.
- Track payment status (pending, paid, etc.).
- Maintain a complete salary payment history per teacher.

### UI Placement
- A new **"Salaries"** section should appear **below the Expenses section** in the accounting module.
- This section is dedicated exclusively to salary management — separate from general expenses.

---

## Part 3: Salary Advances & Recoupment

### What
Sometimes the school pays certain teachers or staff a salary advance — typically due to social conditions, personal hardships, or other compassionate reasons. These advances must then be recouped from future salary payments.

### What the System Should Enable
- Record a salary advance given to a staff member, including the reason/justification.
- **Define flexible recoupment terms per advance** — the school decides whether to deduct in full from the next salary, spread across multiple months, or any other arrangement.
- Track the outstanding advance balance per staff member.
- Apply recoupment deductions to subsequent salary payments based on the defined terms.
- Provide visibility into how much has been advanced, how much has been recouped, and the remaining balance.

---

## Part 4: Rate Management (Admin)

### Who
- **Directeur General** (Owner) — defines and approves rates
- **Comptable** (Ibrahima) / **Coordinateur General** — manages rate configuration

### What
A dedicated **Rate Management section under `/admin`** where authorized users can define and maintain salary rates for all staff.

### What the System Should Enable
- Define salary rates that can vary per individual, role, level, or any criteria the school chooses.
- Distinguish between **hourly rates** (for part-time/hourly staff like college and lycee teachers) and **fixed monthly salaries** (for full-time staff).
- Update rates over time while maintaining history of past rates.
- Rates feed directly into the salary calculation in the accounting module.

### Key Distinction: Full-Time vs. Hourly Staff
- **College & Lycee teachers**: Not full-time. Paid based on hours worked -> requires hours tracking (Part 1).
- **Primary teachers & other staff** (Surveillants, Secretariat, Gardiens, etc.): May be full-time with fixed monthly salaries -> hours tracking may not be required, but the system should be flexible enough to handle either arrangement.

---

## Personas Involved

| Persona | Role in This Feature |
|---|---|
| Directeur General (Owner) | Defines rates in /admin; ultimate authority |
| Censeur (Lycee) | Determines hours worked for lycee teachers |
| Principal (College) | Determines hours worked for college teachers |
| Directeur du Primaire | Determines hours worked / confirms attendance for primary staff |
| Comptable (Ibrahima) | Calculates and processes salary payments; manages rates |
| Coordinateur General | Supervises financial operations, approves payments |
| Agent de Recouvrement (Ousmane) | Oversight of the overall process |
| Enseignant (Amadou) | Recipient of salary; hours-based pay (college/lycee); may receive advances |
| All Staff | Recipients of salary; may be hourly or fixed; may receive advances |

---

## Clarifications

### Rate Structure
Rates **vary by staff member**. The Directeur General (Owner) and accounting team can define and manage rates in a dedicated **Rate Management section under `/admin`**. This allows flexible configuration per individual, role, level, or any criteria the school decides.

### Staff Scope
This feature covers **all staff**, not just teachers. However, teachers — particularly at the college and lycee levels — have a specific distinction: **they are not full-time employees**. They are paid based on hours worked, which is why the hours-tracking workflow exists. Primary teachers and other staff (Surveillants, Secretariat, Gardiens, etc.) may have different employment arrangements (full-time, fixed salary, etc.) that the system must also accommodate.

### Recoupment Terms
Recoupment is **flexible and configurable by the school**. When recording a salary advance, the school can choose how it will be recouped — whether deducted in full from the next salary, spread across multiple months, or any other arrangement. The system should not enforce a rigid recoupment policy but rather let the school define the terms per advance.

---

## Permission Model

### THE WALL Exception
This feature **intentionally crosses THE WALL** — academic directors submit hours data that feeds into the financial salary workflow. This is handled by giving academic directors a scoped permission to submit hours without granting access to any other financial data.

### Permission Mapping

| Action | Roles | Permission Resource |
|---|---|---|
| Submit hours worked | censeur, proviseur, directeur | `salary_hours.create` |
| View own submitted hours | censeur, proviseur, directeur | `salary_hours.view` |
| View all hours (accounting) | comptable, coordinateur | `salary_hours.view` |
| Calculate/process salary | comptable, coordinateur | `salary_payments.create` |
| View salary payments | comptable, coordinateur | `salary_payments.view` |
| Record salary advance | comptable, coordinateur | `salary_advances.create` |
| View advances & recoupment | comptable, coordinateur | `salary_advances.view` |
| Manage salary rates | proprietaire, admin_systeme, coordinateur | `salary_rates.create`, `salary_rates.update` |
| View salary rates | comptable, coordinateur | `salary_rates.view` |

### Route Access
- `/accounting/salaries` — financial roles (comptable, coordinateur) + transversal
- `/admin/salary-rates` — proprietaire, admin_systeme, coordinateur
- Hours submission UI — embedded in academic directors' existing workflow or a dedicated page accessible to academic roles

---

## Open Questions

1. **Approval workflow**: Does the Coordinateur General need to approve each salary payment before disbursement, or is the Comptable authorized to process independently?
2. **Advance approval**: Does someone specific need to approve salary advances (e.g., Directeur General, Coordinateur General)?
3. **Payment method**: Are salaries paid in cash, mobile money (Orange Money), bank transfer, or a combination?
4. **Validation step**: After the academic director submits hours worked, does anyone validate or approve before it reaches accounting?
5. **Deadline enforcement**: Is the 20th a hard deadline, or is there flexibility? What happens if hours aren't submitted on time?
6. **Full-time vs. hourly staff**: For full-time staff (e.g., Surveillants, Gardiens), is salary a fixed monthly amount, or is there still an hours-based component?

---

## GSPN Principles Applied

- **Security First**: Salary data is sensitive financial information — access must be strictly role-based.
- **Complete Traceability**: Every hour recorded, every salary calculated, every advance and recoupment must have a full audit trail.
- **Fair Treatment**: Consistent rules for how hours are calculated and how advances are handled.
- **Real-time Visibility**: Academic directors and accounting should see current status at any time.
- **Confirm Everything**: Confirmations at each handoff — hours submitted, salary calculated, payment processed.
