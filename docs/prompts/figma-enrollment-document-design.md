# Figma Design Prompt: Enrollment Document (PDF)

## Project Context

**School:** Groupe Scolaire Privé N'Diolou (GSPN)  
**Location:** Quartier de Tata, Labe, Guinea  
**Document Type:** Student Enrollment Form (Print-ready PDF)  
**Purpose:** Official enrollment document that parents/guardians and school administration sign. Contains all student information, payment schedules, and payment history.

**Technical Implementation:** This document is generated programmatically using React PDF (@react-pdf/renderer) and must fit on a single A4 page (210mm × 297mm / 8.27" × 11.69").

---

## Design Requirements

### Page Specifications
- **Format:** A4 Portrait (210mm × 297mm / 8.27" × 11.69")
- **Layout:** Single page (must fit all content)
- **Margins:** 25mm (1 inch) on all sides
- **Background:** White (#FFFFFF)
- **Print Quality:** High resolution, suitable for official documents

### Brand Colors
- **Primary (Maroon):** `#8B2332` - Used for headers, borders, accents, school name
- **Accent (Gold):** `#D4AF37` - Used for highlights, important information
- **Success (Green):** `#16a34a` - Used for paid amounts, completed status
- **Warning (Yellow):** `#ca8a04` - Used for pending status
- **Danger (Red):** `#dc2626` - Used for rejected/cancelled status, outstanding balance
- **Text (Dark Gray):** `#1f2937` - Main text color
- **Text Light (Gray):** `#6b7280` - Secondary text, labels
- **Border (Light Gray):** `#e5e7eb` - Table borders, dividers
- **Background (Light Gray):** `#f9fafb` - Section backgrounds, table alternate rows

### Typography
- **Primary Font:** Helvetica (or similar sans-serif)
- **Bold Variant:** Helvetica-Bold (for headers, labels, important values)
- **Font Sizes:**
  - Document Title: 14pt (Bold)
  - Section Titles: 10pt (Bold)
  - Body Text: 9pt (Regular)
  - Labels: 8pt (Bold)
  - Small Text/Footer: 8pt (Regular)
  - Table Headers: 8pt (Bold, white text on maroon background)

---

## Document Structure & Content

### 1. Letterhead (Top Section)
**Compact horizontal layout:**
- **Left:** School logo (40×40mm placeholder - circular with "GSPN" text, maroon background)
- **Center:** 
  - School name: "Groupe Scolaire Privé N'Diolou" (14pt, Bold, Maroon)
  - Address/Contact: "Quartier de Tata, Labe | groupescolaireprivendioloulabe@gmail.com" (8pt, Gray)
- **Right:** School year badge (e.g., "2025-2026") - Maroon background, white text, rounded corners
- **Bottom Border:** 2pt maroon line separating letterhead from content

### 2. Document Header (Below Letterhead)
**Gray background box (#f3f4f6) with rounded corners:**
- **Left Side (Centered):**
  - Main Title: "Fiche d'Inscription" (14pt, Bold, Maroon, centered)
  - Subtitle: "Enrollment Form" (9pt, Gray, centered)
- **Right Side (Right-aligned):**
  - Enrollment Number: "No. Inscription: ENR-2025-00001" (8pt, Gray label + 9pt Bold value)
  - Student Number: "No. Élève: STD-2025-08082018-0002" (8pt, Gray label + 9pt Bold value)
  - Status Badge: "Terminée" (8pt, Bold, Green for completed status)

### 3. Student & Academic Information Section
**Section Title:** "Informations de l'Élève / Informations Académiques" (10pt, Bold, Maroon, centered, with bottom border)

**3-column grid layout:**
- **Column 1:** Last Name, Date of Birth, Grade
- **Column 2:** First Name, Gender, Student Type
- **Format:** Label (8pt Bold, Gray) : Value (9pt Regular, Black)

**Example Data:**
- Nom: DIALLO
- Prénom: Amadou
- Date de Naissance: 08 août 2018
- Sexe: Masculin
- Classe: 7ème Année
- Type d'Élève: Nouvel Élève

### 4. Parent/Guardian Information Section
**Section Title:** "Informations des Parents/Tuteurs" (10pt, Bold, Maroon, centered, with bottom border)

**3-column layout:**
- **Column 1 (Father):**
  - Label: "Nom du Père" (8pt Bold, Gray)
  - Value: "Mamadou DIALLO" (9pt Regular)
  - Phone: "+224 612 345 678" (8pt Gray)
- **Column 2 (Mother):**
  - Label: "Nom de la Mère" (8pt Bold, Gray)
  - Value: "Aissatou BAH" (9pt Regular)
  - Phone: "+224 623 456 789" (8pt Gray)
- **Column 3 (Address):**
  - Label: "Adresse" (8pt Bold, Gray)
  - Value: "Quartier de Tata, Labe, Guinée" (9pt Regular, may wrap)

### 5. Payment Schedule Section
**Section Title:** "Échéancier de Paiement" (10pt, Bold, Maroon, centered, with bottom border)

**Header Row (Right-aligned):**
- "Frais de Scolarité: 2,500,000 GNF" (8pt Gray label + 9pt Bold value)

**Table with 5 columns:**
- **Header Row:** Maroon background (#8B2332), white text, 8pt Bold
  - Column 1: "#" (50mm width)
  - Column 2: "Mois" (flexible width)
  - Column 3: "Montant" (80mm width, right-aligned)
  - Column 4: "Date Limite" (80mm width)
  - Column 5: "Statut" (50mm width)
- **Data Rows:** 
  - Even rows: White background
  - Odd rows: Light gray background (#f9fafb)
  - Border: 1pt light gray (#e5e7eb) between rows
  - Status: "✓" (Green) for paid, "○" (Yellow) for pending

**Example Data:**
| # | Mois | Montant | Date Limite | Statut |
|---|------|---------|-------------|--------|
| 1 | Septembre, Octobre, Mai | 833,333 GNF | 15 sept. 2025 | ○ |
| 2 | Novembre, Décembre, Janvier | 833,333 GNF | 15 nov. 2025 | ○ |
| 3 | Février, Mars, Avril | 833,334 GNF | 15 fév. 2026 | ○ |

### 6. Payment History & Summary Section
**Two-column layout (if payments exist) or single column (if no payments):**

**Left Column (if payments exist):**
- **Section Title:** "Historique des Paiements" (10pt, Bold, Maroon, centered, with bottom border)
- **Table with 4 columns:**
  - Header: Maroon background, white text
    - "No. Reçu" (flexible)
    - "Montant" (70mm, right-aligned)
    - "Mode" (50mm) - Shows 💵 for Cash, 📱 for Orange Money
    - "Date" (70mm)
  - Shows up to 4 recent payments
  - If more than 4: "+X more payments" text below (7pt Gray)

**Right Column (or Full Width if no payments):**
- **Summary Box:** Light gray background (#f9fafb), 1pt border, rounded corners, 10mm padding
- **Title:** "Résumé" (10pt, Bold, Maroon)
- **Rows:**
  - "Total Frais: 2,500,000 GNF" (9pt Gray label + 9pt Bold value)
  - "Total Payé: 500,000 GNF" (9pt Gray label + 9pt Bold Green value)
  - **Divider line** (1pt light gray)
  - "Solde: 2,000,000 GNF" (10pt Bold Maroon label + 10pt Bold Red value if balance > 0, Green if balance = 0)

### 7. Signatures Section
**Two-column layout, equal width (45% each):**

**Left Box:**
- Label: "Signature Parent/Tuteur" (9pt Bold)
- Signature line: Horizontal line (1pt black)
- Below line: "Date: ________________" (8pt Gray, centered)

**Right Box:**
- Label: "Administration Scolaire" (9pt Bold)
- Signature line: Horizontal line (1pt black)
- Below line: "Date: ________________" (8pt Gray, centered)

### 8. Footer
**Bottom of page, full width:**
- **Left:** "Imprimé le: 02 janv. 2025" (8pt Gray)
- **Right:** "Page 1/1" (8pt Gray)
- **Top Border:** 1pt light gray line

---

## Design Guidelines

### Spacing & Layout
- **Section Spacing:** 8mm between major sections
- **Row Spacing:** 3mm between information rows
- **Table Cell Padding:** 4mm (horizontal and vertical)
- **Box Padding:** 10mm for summary box, signature boxes
- **Margins:** Consistent 25mm on all sides

### Visual Hierarchy
1. **Primary:** Document title, section titles (Maroon, Bold)
2. **Secondary:** Labels, table headers (Gray, Bold)
3. **Tertiary:** Values, body text (Black, Regular)
4. **Accent:** Important numbers, status indicators (Color-coded)

### Data Presentation
- **Currency:** Always formatted as "X,XXX,XXX GNF" (French number format with spaces as thousand separators)
- **Dates:** Format as "DD MMM YYYY" (e.g., "08 août 2018", "15 sept. 2025")
- **Status Indicators:** Use checkmarks (✓) for completed, circles (○) for pending
- **Payment Methods:** Use emoji icons (💵 Cash, 📱 Orange Money) or text abbreviations

### Bilingual Support
- **Primary Language:** French (default)
- **Secondary Language:** English (shown as subtitle in header)
- All labels should work in both languages
- Design should accommodate longer French text

---

## Sample Data for Design

Use this realistic data to populate the design:

**Student:**
- Name: Amadou DIALLO
- DOB: August 8, 2018
- Gender: Male
- Grade: 7ème Année (7th Grade)
- Type: New Student
- Enrollment Number: ENR-2025-00001
- Student Number: STD-2025-08082018-0002

**Parents:**
- Father: Mamadou DIALLO, +224 612 345 678
- Mother: Aissatou BAH, +224 623 456 789
- Address: Quartier de Tata, Labe, Guinée

**Financial:**
- Tuition Fee: 2,500,000 GNF
- Total Paid: 500,000 GNF
- Balance: 2,000,000 GNF
- Payment Method: Cash
- Receipt Number: GSPN-2025-CASH-00001

**Payment Schedule:**
- Schedule 1: Sep, Oct, May - 833,333 GNF - Due: Sep 15, 2025
- Schedule 2: Nov, Dec, Jan - 833,333 GNF - Due: Nov 15, 2025
- Schedule 3: Feb, Mar, Apr - 833,334 GNF - Due: Feb 15, 2026

---

## Technical Constraints

1. **Single Page:** All content must fit on one A4 page
2. **Print-Ready:** Design must work in grayscale printing (test color contrast)
3. **Font Limitations:** Limited to Helvetica family (or system equivalents)
4. **Image Support:** Logo should be provided as PNG/SVG (70×70mm for standard, 40×40mm for compact)
5. **Dynamic Content:** Design must accommodate variable-length text (names, addresses may vary)
6. **Table Flexibility:** Payment schedule may have 3 rows, payment history may have 0-4+ rows

---

## Expected Deliverables

1. **Figma File** with:
   - Complete A4 page design
   - All sections properly laid out
   - Brand colors applied correctly
   - Typography styles defined
   - Component variants (with/without payments, different statuses)

2. **Design System:**
   - Color palette with hex codes
   - Typography scale
   - Spacing system
   - Component styles (tables, boxes, badges)

3. **Assets:**
   - Logo file (PNG/SVG, transparent background)
   - Style guide document
   - Spacing/measurement annotations

4. **Variations (Optional but Recommended):**
   - Design with payment history
   - Design without payment history
   - Design with different enrollment statuses
   - English version layout (if significantly different)

---

## Design Goals

1. **Professional:** Official document appearance suitable for school records
2. **Readable:** Clear hierarchy, good contrast, appropriate font sizes
3. **Organized:** Logical flow of information, easy to scan
4. **Branded:** Consistent use of school colors and identity
5. **Practical:** Fits on single page, print-friendly, accommodates variable content
6. **Bilingual:** Works for both French and English text

---

## Questions to Consider

- How can we make the payment schedule table more scannable?
- Should we use icons or text for payment methods?
- How to handle very long names or addresses gracefully?
- What's the best way to highlight important financial information?
- Should the signature section be more prominent?

---

## Additional Notes

- This document is generated programmatically, so the design should be implementable in a code-based layout system
- Consider accessibility: good contrast ratios, readable font sizes
- The design should feel official and trustworthy
- Keep in mind this is for a West African school context - design should be culturally appropriate
- Consider both digital PDF viewing and physical printing scenarios

---

**Contact/Questions:** If you need clarification on any requirements, data formats, or technical constraints, please ask before starting the design.

