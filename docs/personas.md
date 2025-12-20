# Personas & Empathy Maps - GSPN School Management System

| **Document Info** | |
|-------------------|---|
| **Product** | GSPN School Management System |
| **Version** | 1.0 |
| **Date** | December 19, 2025 |
| **Status** | Draft |

---

## Table of Contents

1. [Persona Overview](#1-persona-overview)
2. [Primary Personas (MVP)](#2-primary-personas-mvp)
   - [Mariama - Secretary / Student Affairs](#21-mariama---secretary--student-affairs)
   - [Ibrahima - Accountant](#22-ibrahima---accountant)
   - [Fatoumata - Academic Director](#23-fatoumata---academic-director)
   - [Amadou - Teacher](#24-amadou---teacher)
   - [Ousmane - School Director / Leadership](#25-ousmane---school-director--leadership)
3. [Secondary Personas (Future Releases)](#3-secondary-personas-future-releases)
   - [Aissatou - Parent](#31-aissatou---parent)
   - [Mamadou - Student](#32-mamadou---student)

---

## 1. Persona Overview

{panel:title=Persona Summary|borderStyle=solid|borderColor=#0747A6|bgColor=#DEEBFF}

| Persona | Role | Priority | Release |
|---------|------|----------|---------|
| 👩‍💼 **Mariama** | Secretary / Student Affairs | Primary | MVP |
| 👨‍💼 **Ibrahima** | Accountant | Primary | MVP |
| 👩‍🏫 **Fatoumata** | Academic Director | Primary | MVP |
| 👨‍🏫 **Amadou** | Teacher | Primary | MVP |
| 👔 **Ousmane** | School Director / Leadership | Primary | MVP |
| 👩 **Aissatou** | Parent | Secondary | Release 2 |
| 👦 **Mamadou** | Student | Secondary | Release 2 |

{panel}

---

## 2. Primary Personas (MVP)

---

### 2.1 Mariama - Secretary / Student Affairs

{panel:title=Persona Card|borderStyle=solid|borderColor=#00875A|bgColor=#E3FCEF}

| | |
|---|---|
| **Photo** | 👩‍💼 |
| **Name** | Mariama Camara |
| **Age** | 34 |
| **Role** | Secretary / Head of Student Affairs |
| **Education** | Diploma in Business Administration |
| **Experience** | 8 years in school administration |
| **Tech Comfort** | Moderate - uses smartphones daily, basic computer skills |

{panel}

#### Background

Mariama is the primary point of contact for all student and parent inquiries at GSPN. She handles enrollment, manages student records, and coordinates with teachers for extracurricular activities. She works long hours during enrollment periods and often stays late to ensure all paperwork is complete.

#### Goals

- ✅ Process enrollments quickly and accurately
- ✅ Send confirmation messages to parents promptly
- ✅ Keep student records organized and accessible
- ✅ Coordinate activity registrations with teachers
- ✅ Avoid errors that cause parent complaints

#### Frustrations

- ❌ Paper forms get lost or damaged
- ❌ No easy way to track which students paid for which activities
- ❌ Parents call repeatedly asking for status updates
- ❌ End of period means scrambling to compile enrollment numbers
- ❌ When teachers don't report attendance, she can't update records

#### Quote

> *"I just want to be able to tell parents 'yes, your child is enrolled' and know for certain that everything is in order."*

---

#### Empathy Map - Mariama

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         MARIAMA - EMPATHY MAP                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐        │
│  │           SAYS              │ │          THINKS             │        │
│  ├─────────────────────────────┤ ├─────────────────────────────┤        │
│  │ • "I need the enrollment    │ │ • "Did I already process    │        │
│  │    form and payment receipt"│ │    this student's form?"    │        │
│  │ • "Let me check my records" │ │ • "I hope I don't make a    │        │
│  │ • "The teacher hasn't       │ │    mistake with the money"  │        │
│  │    confirmed yet"           │ │ • "There must be a better   │        │
│  │ • "Come back tomorrow,      │ │    way to do this"          │        │
│  │    we're still processing"  │ │ • "I can't find that file"  │        │
│  └─────────────────────────────┘ └─────────────────────────────┘        │
│                                                                          │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐        │
│  │           DOES              │ │          FEELS              │        │
│  ├─────────────────────────────┤ ├─────────────────────────────┤        │
│  │ • Fills paper forms by hand │ │ • 😰 Stressed during        │        │
│  │ • Searches through stacks   │ │    enrollment periods       │        │
│  │    of documents             │ │ • 😤 Frustrated when info   │        │
│  │ • Calls teachers to confirm │ │    is missing               │        │
│  │    student attendance       │ │ • 😊 Satisfied when parents │        │
│  │ • Manually calculates       │ │    thank her                │        │
│  │    enrollment totals        │ │ • 😟 Worried about errors   │        │
│  │ • Writes receipts by hand   │ │ • 😓 Overwhelmed by volume  │        │
│  └─────────────────────────────┘ └─────────────────────────────┘        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Key System Needs

| Need | Feature |
|------|---------|
| Quick enrollment processing | Digital enrollment form with auto-confirmation |
| Payment tracking | Link payments to enrollments and activities |
| Activity management | Assign students to activities, track participation |
| Communication | Automatic confirmation messages to parents |
| Reporting | One-click enrollment reports for any period |

---

### 2.2 Ibrahima - Accountant

{panel:title=Persona Card|borderStyle=solid|borderColor=#00875A|bgColor=#E3FCEF}

| | |
|---|---|
| **Photo** | 👨‍💼 |
| **Name** | Ibrahima Diallo |
| **Age** | 42 |
| **Role** | Accountant |
| **Education** | Bachelor's in Accounting |
| **Experience** | 15 years in financial management |
| **Tech Comfort** | Good - proficient in Excel, basic accounting software |

{panel}

#### Background

Ibrahima manages all financial operations at GSPN. He tracks tuition payments, activity fees, and operational expenses. He's responsible for bank deposits, reconciliation, and producing financial reports for leadership. He's meticulous but struggles with the volume of cash transactions.

#### Goals

- ✅ Record every transaction with proper documentation
- ✅ Reconcile bank deposits accurately
- ✅ Produce clear financial reports for each period
- ✅ Minimize cash handling risks
- ✅ Close periods on time with clean books

#### Frustrations

- ❌ Cash payments without proper receipts
- ❌ Reconciliation takes days due to missing information
- ❌ No clear audit trail for exceptions
- ❌ Student affairs and accounting records don't match
- ❌ Mobile money transactions are hard to track

#### Quote

> *"Every franc must be accounted for. I need receipts, I need validation, I need to sleep at night knowing the books are clean."*

---

#### Empathy Map - Ibrahima

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         IBRAHIMA - EMPATHY MAP                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐        │
│  │           SAYS              │ │          THINKS             │        │
│  ├─────────────────────────────┤ ├─────────────────────────────┤        │
│  │ • "Where is the supporting  │ │ • "This doesn't add up"     │        │
│  │    document for this?"      │ │ • "Who approved this        │        │
│  │ • "I need the receipt       │ │    expense?"                │        │
│  │    before I can record it"  │ │ • "I'll be blamed if        │        │
│  │ • "The bank deposit doesn't │ │    there's a shortfall"     │        │
│  │    match our records"       │ │ • "Cash is dangerous,       │        │
│  │ • "I can't close the period │ │    I prefer mobile money"   │        │
│  │    until everything matches"│ │ • "The audit will find      │        │
│  └─────────────────────────────┘ │    these gaps"              │        │
│                                  └─────────────────────────────┘        │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐        │
│  │           DOES              │ │          FEELS              │        │
│  ├─────────────────────────────┤ ├─────────────────────────────┤        │
│  │ • Cross-checks every        │ │ • 😰 Anxious about missing  │        │
│  │    payment manually         │ │    transactions             │        │
│  │ • Makes bank deposits       │ │ • 😤 Frustrated by          │        │
│  │    regularly                │ │    undocumented cash        │        │
│  │ • Spends hours reconciling  │ │ • 😊 Relieved when books    │        │
│  │ • Creates Excel reports     │ │    balance                  │        │
│  │ • Tracks down missing       │ │ • 😟 Worried about audits   │        │
│  │    documentation            │ │ • 🙂 Proud of accurate      │        │
│  │ • Requests approvals for    │ │    financial reports        │        │
│  │    exceptions               │ │                             │        │
│  └─────────────────────────────┘ └─────────────────────────────┘        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Key System Needs

| Need | Feature |
|------|---------|
| Transaction documentation | Mandatory receipt/document attachment |
| Reconciliation | Auto-match payments with bank deposits |
| Audit trail | Complete journal with timestamps and approvers |
| Period management | Structured period close with summary reports |
| Exception handling | Documented approval workflow for exceptions |

---

### 2.3 Fatoumata - Academic Director

{panel:title=Persona Card|borderStyle=solid|borderColor=#00875A|bgColor=#E3FCEF}

| | |
|---|---|
| **Photo** | 👩‍🏫 |
| **Name** | Fatoumata Barry |
| **Age** | 48 |
| **Role** | Academic Director |
| **Education** | Master's in Education |
| **Experience** | 20 years in education, 10 in administration |
| **Tech Comfort** | Moderate - uses email and basic office tools |

{panel}

#### Background

Fatoumata oversees all pedagogical matters at GSPN. She manages the curriculum, coordinates with teachers, and ensures academic quality. She's passionate about education but finds administrative tasks distracting from her core mission.

#### Goals

- ✅ Ensure quality of curricular and extracurricular programs
- ✅ Support teachers in their pedagogical work
- ✅ Track student participation in activities
- ✅ Distinguish clearly between academic and extracurricular work
- ✅ Have visibility into attendance and participation

#### Frustrations

- ❌ Time spent on administrative tasks instead of pedagogy
- ❌ No clear view of which students participate in which activities
- ❌ Difficulty tracking teacher confirmations
- ❌ Extracurricular activities sometimes poorly documented

#### Quote

> *"Education is about nurturing minds, not shuffling papers. I need systems that work so I can focus on what matters."*

---

#### Empathy Map - Fatoumata

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FATOUMATA - EMPATHY MAP                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐        │
│  │           SAYS              │ │          THINKS             │        │
│  ├─────────────────────────────┤ ├─────────────────────────────┤        │
│  │ • "Is this curricular or    │ │ • "I should be in           │        │
│  │    extracurricular?"        │ │    classrooms, not offices" │        │
│  │ • "Which students are in    │ │ • "Are teachers actually    │        │
│  │    the English club?"       │ │    running these clubs?"    │        │
│  │ • "Did the teacher confirm  │ │ • "Our extracurricular      │        │
│  │    attendance?"             │ │    programs should be       │        │
│  │ • "Let's focus on learning  │ │    better documented"       │        │
│  │    outcomes"                │ │ • "The students need more   │        │
│  └─────────────────────────────┘ │    enrichment activities"   │        │
│                                  └─────────────────────────────┘        │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐        │
│  │           DOES              │ │          FEELS              │        │
│  ├─────────────────────────────┤ ├─────────────────────────────┤        │
│  │ • Reviews curriculum        │ │ • 😊 Passionate about       │        │
│  │ • Meets with teachers       │ │    education                │        │
│  │ • Approves extracurricular  │ │ • 😤 Frustrated by admin    │        │
│  │    activities               │ │    burden                   │        │
│  │ • Checks activity reports   │ │ • 😟 Concerned about        │        │
│  │ • Coordinates with student  │ │    activity quality         │        │
│  │    affairs on enrollments   │ │ • 🙂 Satisfied when         │        │
│  │ • Observes classes          │ │    students succeed         │        │
│  └─────────────────────────────┘ └─────────────────────────────┘        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Key System Needs

| Need | Feature |
|------|---------|
| Activity oversight | Dashboard showing all curricular/extracurricular activities |
| Participation tracking | View which students enrolled in which activities |
| Teacher coordination | See teacher confirmations and attendance reports |
| Classification | Clear distinction between activity types |
| Quality monitoring | Activity completion and participation rates |

---

### 2.4 Amadou - Teacher

{panel:title=Persona Card|borderStyle=solid|borderColor=#00875A|bgColor=#E3FCEF}

| | |
|---|---|
| **Photo** | 👨‍🏫 |
| **Name** | Amadou Bah |
| **Age** | 29 |
| **Role** | English Teacher & English Club Facilitator |
| **Education** | Bachelor's in English Education |
| **Experience** | 5 years teaching |
| **Tech Comfort** | High - uses smartphone apps daily, comfortable with technology |

{panel}

#### Background

Amadou teaches English classes and runs the English Club as an extracurricular activity. He's enthusiastic about his work but finds the administrative requirements burdensome. He wants to focus on teaching, not paperwork.

#### Goals

- ✅ Teach effectively and engage students
- ✅ Confirm attendance quickly and easily
- ✅ Know which students are officially enrolled in his activities
- ✅ Minimize time spent on administrative tasks
- ✅ Report participation to student affairs without hassle

#### Frustrations

- ❌ Unclear who has actually paid for the club
- ❌ Paper attendance sheets get lost
- ❌ Manual reporting to student affairs takes time
- ❌ No easy way to communicate with enrolled students' parents

#### Quote

> *"Just tell me who's supposed to be here, let me mark them present, and let me teach."*

---

#### Empathy Map - Amadou

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          AMADOU - EMPATHY MAP                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐        │
│  │           SAYS              │ │          THINKS             │        │
│  ├─────────────────────────────┤ ├─────────────────────────────┤        │
│  │ • "Who is on my class list?"│ │ • "Is this student          │        │
│  │ • "Did this student pay?"   │ │    actually enrolled?"      │        │
│  │ • "I marked attendance,     │ │ • "I wish I could just      │        │
│  │    where do I submit it?"   │ │    focus on teaching"       │        │
│  │ • "Can I get an updated     │ │ • "The paperwork never      │        │
│  │    enrollment list?"        │ │    ends"                    │        │
│  │ • "I confirmed, check with  │ │ • "There should be an app   │        │
│  │    student affairs"         │ │    for this"                │        │
│  └─────────────────────────────┘ └─────────────────────────────┘        │
│                                                                          │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐        │
│  │           DOES              │ │          FEELS              │        │
│  ├─────────────────────────────┤ ├─────────────────────────────┤        │
│  │ • Takes attendance on paper │ │ • 😊 Energized when         │        │
│  │ • Walks to office to submit │ │    teaching                 │        │
│  │    attendance reports       │ │ • 😤 Annoyed by admin       │        │
│  │ • Asks student affairs for  │ │    tasks                    │        │
│  │    updated student lists    │ │ • 😕 Confused about who     │        │
│  │ • Teaches classes and clubs │ │    actually paid            │        │
│  │ • Answers parent questions  │ │ • 🙂 Proud of student       │        │
│  │    about their children     │ │    progress                 │        │
│  └─────────────────────────────┘ └─────────────────────────────┘        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Key System Needs

| Need | Feature |
|------|---------|
| Class lists | Real-time list of enrolled students per activity |
| Attendance | Quick digital attendance marking (mobile-friendly) |
| Payment visibility | See payment status of students in activities |
| One-click reporting | Automatic submission to student affairs |
| Communication | Easy way to notify enrolled students |

---

### 2.5 Ousmane - School Director / Leadership

{panel:title=Persona Card|borderStyle=solid|borderColor=#00875A|bgColor=#E3FCEF}

| | |
|---|---|
| **Photo** | 👔 |
| **Name** | Ousmane Sylla |
| **Age** | 55 |
| **Role** | School Director |
| **Education** | Master's in Educational Administration |
| **Experience** | 25 years in education, 12 as director |
| **Tech Comfort** | Low-Moderate - delegates most tech tasks |

{panel}

#### Background

Ousmane is responsible for the overall management and strategic direction of GSPN. He needs visibility into operations without getting into the details. He approves exceptions, handles escalations, and ensures the school runs smoothly and ethically.

#### Goals

- ✅ Have real-time visibility into school operations
- ✅ Ensure fair and consistent treatment of all students
- ✅ Approve exceptions with proper documentation
- ✅ Maintain financial accountability and compliance
- ✅ Make informed decisions quickly

#### Frustrations

- ❌ Surprises about financial issues
- ❌ Decisions made without proper documentation
- ❌ No easy way to see overall school status
- ❌ Audit findings due to process gaps
- ❌ Staff unclear on approval workflows

#### Quote

> *"I need to trust our systems. When I approve something, I need to know exactly what I'm approving and why."*

---

#### Empathy Map - Ousmane

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OUSMANE - EMPATHY MAP                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐        │
│  │           SAYS              │ │          THINKS             │        │
│  ├─────────────────────────────┤ ├─────────────────────────────┤        │
│  │ • "What's the status of     │ │ • "Are we following proper  │        │
│  │    enrollments this month?" │ │    procedures?"             │        │
│  │ • "Who approved this        │ │ • "I shouldn't be surprised │        │
│  │    exception?"              │ │    by financial issues"     │        │
│  │ • "Show me the supporting   │ │ • "We need systems that     │        │
│  │    documents"               │ │    enforce accountability"  │        │
│  │ • "Is this fair to all      │ │ • "The school's reputation  │        │
│  │    students?"               │ │    depends on our integrity"│        │
│  │ • "Let's document this      │ │ • "I trust my team but need │        │
│  │    decision"                │ │    visibility"              │        │
│  └─────────────────────────────┘ └─────────────────────────────┘        │
│                                                                          │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐        │
│  │           DOES              │ │          FEELS              │        │
│  ├─────────────────────────────┤ ├─────────────────────────────┤        │
│  │ • Reviews reports from      │ │ • 😊 Confident when systems │        │
│  │    accountant               │ │    work well                │        │
│  │ • Approves exceptions and   │ │ • 😰 Anxious about unknown  │        │
│  │    special cases            │ │    issues                   │        │
│  │ • Meets with department     │ │ • 😤 Frustrated by gaps     │        │
│  │    heads                    │ │    in documentation         │        │
│  │ • Handles escalations from  │ │ • 🙂 Proud of school's      │        │
│  │    parents                  │ │    reputation               │        │
│  │ • Makes strategic decisions │ │ • 😟 Worried about audits   │        │
│  │ • Represents school         │ │    and compliance           │        │
│  │    externally               │ │                             │        │
│  └─────────────────────────────┘ └─────────────────────────────┘        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Key System Needs

| Need | Feature |
|------|---------|
| Dashboard | Real-time overview of enrollments, payments, activities |
| Approval workflow | Clear exception approval with documentation |
| Audit trail | Complete history of all decisions and approvals |
| Reports | Period summaries, anomaly reports, financial statements |
| Alerts | Notifications for items requiring attention |

---

## 3. Secondary Personas (Future Releases)

---

### 3.1 Aissatou - Parent

{panel:title=Persona Card - Release 2|borderStyle=dashed|borderColor=#FF5630|bgColor=#FFEBE6}

| | |
|---|---|
| **Photo** | 👩 |
| **Name** | Aissatou Balde |
| **Age** | 38 |
| **Role** | Parent of two GSPN students |
| **Occupation** | Small business owner |
| **Tech Comfort** | Moderate - uses WhatsApp and Orange Money daily |

{panel}

#### Background

Aissatou has two children at GSPN. She's busy with her business and needs quick, reliable ways to pay school fees and track her children's activities. She prefers mobile money (Orange Money) over cash.

#### Goals

- ✅ Pay school fees quickly via mobile money
- ✅ Receive confirmation of payments immediately
- ✅ Know what activities her children are enrolled in
- ✅ Track her children's progress and attendance
- ✅ Communicate with teachers when needed

#### Frustrations

- ❌ Uncertainty about whether payments were received
- ❌ Having to visit school in person for routine matters
- ❌ Not knowing what activities are available
- ❌ Late notifications about school events

#### Quote

> *"I just want to pay, get a receipt, and know my children are taken care of."*

---

#### Empathy Map - Aissatou

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AISSATOU - EMPATHY MAP                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐        │
│  │           SAYS              │ │          THINKS             │        │
│  ├─────────────────────────────┤ ├─────────────────────────────┤        │
│  │ • "Did my payment go        │ │ • "Did the school receive   │        │
│  │    through?"                │ │    my money?"               │        │
│  │ • "What activities can my   │ │ • "I hope my children are   │        │
│  │    child join?"             │ │    doing well"              │        │
│  │ • "When is the next payment │ │ • "I wish I didn't have to  │        │
│  │    due?"                    │ │    go to school for this"   │        │
│  │ • "Can I pay via Orange     │ │ • "I want to be involved    │        │
│  │    Money?"                  │ │    but I'm so busy"         │        │
│  └─────────────────────────────┘ └─────────────────────────────┘        │
│                                                                          │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐        │
│  │           DOES              │ │          FEELS              │        │
│  ├─────────────────────────────┤ ├─────────────────────────────┤        │
│  │ • Visits school to pay      │ │ • 😰 Anxious about payment  │        │
│  │ • Calls school for updates  │ │    confirmation             │        │
│  │ • Pays via Orange Money     │ │ • 😤 Frustrated by lack of  │        │
│  │    when possible            │ │    information              │        │
│  │ • Asks children about       │ │ • 😊 Happy when children    │        │
│  │    school activities        │ │    are engaged              │        │
│  │ • Keeps paper receipts      │ │ • 😟 Worried about missing  │        │
│  │    carefully                │ │    important deadlines      │        │
│  └─────────────────────────────┘ └─────────────────────────────┘        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Key System Needs (Release 2)

| Need | Feature |
|------|---------|
| Mobile payment | Orange Money integration |
| Payment confirmation | Instant receipt via SMS/app |
| Activity visibility | View available and enrolled activities |
| Progress tracking | View attendance and grades |
| Notifications | Payment reminders, school announcements |

---

### 3.2 Mamadou - Student

{panel:title=Persona Card - Release 2|borderStyle=dashed|borderColor=#FF5630|bgColor=#FFEBE6}

| | |
|---|---|
| **Photo** | 👦 |
| **Name** | Mamadou Sow |
| **Age** | 15 |
| **Role** | Student (10th grade) |
| **Tech Comfort** | High - uses smartphone, social media, games |

{panel}

#### Background

Mamadou is a 10th grader at GSPN. He's interested in joining the IT study group and English Club but isn't sure how enrollment works. He relies on his parents for payments but wants to manage his own schedule.

#### Goals

- ✅ Enroll in extracurricular activities easily
- ✅ Know his schedule for classes and clubs
- ✅ Track his own attendance and grades
- ✅ Receive notifications about activities

#### Frustrations

- ❌ Unclear how to sign up for clubs
- ❌ Doesn't know his own schedule sometimes
- ❌ Has to ask parents for payment status

#### Quote

> *"I just want to sign up for clubs and know when and where to show up."*

---

#### Empathy Map - Mamadou

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          MAMADOU - EMPATHY MAP                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐        │
│  │           SAYS              │ │          THINKS             │        │
│  ├─────────────────────────────┤ ├─────────────────────────────┤        │
│  │ • "How do I join the IT     │ │ • "This should be simpler"  │        │
│  │    club?"                   │ │ • "I hope my parents paid   │        │
│  │ • "What time is the         │ │    for this"                │        │
│  │    English club?"           │ │ • "I want to join more      │        │
│  │ • "Did I miss anything?"    │ │    activities"              │        │
│  │ • "Mom, did you pay for     │ │ • "Why can't I just see     │        │
│  │    this?"                   │ │    my schedule on my phone?"│        │
│  └─────────────────────────────┘ └─────────────────────────────┘        │
│                                                                          │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐        │
│  │           DOES              │ │          FEELS              │        │
│  ├─────────────────────────────┤ ├─────────────────────────────┤        │
│  │ • Asks classmates about     │ │ • 😊 Excited about clubs    │        │
│  │    club enrollment          │ │ • 😕 Confused by enrollment │        │
│  │ • Goes to office to sign up │ │    process                  │        │
│  │ • Asks parents about        │ │ • 😤 Frustrated when        │        │
│  │    payment                  │ │    information is unclear   │        │
│  │ • Writes schedule by hand   │ │ • 🙂 Happy when activities  │        │
│  │ • Attends classes and clubs │ │    are fun                  │        │
│  └─────────────────────────────┘ └─────────────────────────────┘        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Key System Needs (Release 2)

| Need | Feature |
|------|---------|
| Activity enrollment | Self-service enrollment (with parent approval/payment) |
| Schedule | View personal schedule for classes and activities |
| Notifications | Activity reminders, schedule changes |
| Progress | View own attendance and grades |

---

## 4. Persona-Feature Matrix

{panel:title=Who Uses What?|borderStyle=solid|borderColor=#0747A6|bgColor=#DEEBFF}

| Feature | Mariama | Ibrahima | Fatoumata | Amadou | Ousmane | Aissatou | Mamadou |
|---------|:-------:|:--------:|:---------:|:------:|:-------:|:--------:|:-------:|
| **Enrollment Processing** | ✅ Primary | View | View | | Approve | R2 | R2 |
| **Payment Recording** | Entry | ✅ Primary | | | Approve | R2 | |
| **Activity Management** | ✅ Primary | | View | View | | R2 | R2 |
| **Attendance Confirmation** | View | | View | ✅ Primary | | R2 | R2 |
| **Reconciliation** | | ✅ Primary | | | Approve | | |
| **Reporting** | Generate | Generate | View | | ✅ Primary | R2 | R2 |
| **Exception Handling** | Create | Create | | | ✅ Primary | | |
| **Dashboards** | | | View | | ✅ Primary | R2 | R2 |

*R2 = Release 2 (Future)*

{panel}

---

## 5. Journey Touchpoints

| Touchpoint | Mariama | Ibrahima | Fatoumata | Amadou | Ousmane |
|------------|---------|----------|-----------|--------|---------|
| **Start of Year** | Mass enrollments | Budget setup | Curriculum planning | Class prep | Strategic planning |
| **Daily** | Student inquiries | Payment entry | Teacher support | Teaching | Oversight |
| **Weekly** | Activity reports | Bank deposits | Activity review | Attendance reports | Review meetings |
| **Monthly** | Enrollment summaries | Reconciliation | Progress review | | Period review |
| **Period End** | Close enrollments | Close books | Academic review | Submit reports | Approval of reports |

---

{info:title=Document History}
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | December 19, 2025 | Product Team | Initial draft with 7 personas |
{info}
