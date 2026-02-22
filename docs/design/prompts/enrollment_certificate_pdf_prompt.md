# Claude Prompt: Generate School Enrollment Certificate PDF

## Purpose
Generate an HTML template for a school enrollment certificate (attestation d'inscription) for the Groupe Scolaire Privé N’Diolou, to be rendered as a PDF. The template will be used to automate certificate generation upon student enrollment.

## Requirements
- The certificate must closely match the provided sample (see attached screenshot and letterhead image).
- All text must be in French.
- The letterhead image (provided) must be used at the top of the certificate.
- The layout must include:
  - School header with logo and crest (from the letterhead image)
  - Title: "ATTESTATION D’INSCRIPTION"
  - Salutation with student name or parent/tutor
  - Confirmation paragraph with placeholders for school year and level
  - Details table:
    - Identifiant (student ID)
    - Niveau (level/program)
    - Début des cours (start date)
  - Payment summary table:
    - Reçu de paiement (receipt number)
    - Total de la scolarité (total amount)
    - Payé au jour (amount paid)
    - Restant (remaining amount)
  - Signature section for accountant/secretary and parent/tutor
  - Date field

## Placeholders
Use double curly braces for dynamic fields, e.g.:
- {{studentName}}
- {{studentId}}
- {{level}}
- {{schoolYear}}
- {{startDate}}
- {{receiptNumber}}
- {{totalAmount}}
- {{paidAmount}}
- {{remainingAmount}}
- {{date}}
- {{letterheadImageUrl}}

## Example Prompt

```
Génère un modèle HTML pour une attestation d'inscription scolaire conforme à l'exemple fourni. Le modèle doit :
- Utiliser l'image d'en-tête fournie ({{letterheadImageUrl}}) en haut du document.
- Afficher le titre "ATTESTATION D’INSCRIPTION".
- Inclure une salutation avec {{studentName}} (ou Parents/Tuteurs).
- Ajouter un paragraphe de confirmation d'inscription pour l'année {{schoolYear}} en {{level}}.
- Présenter un tableau de détails (Identifiant, Niveau, Début des cours).
- Présenter un tableau récapitulatif de paiement (Reçu de paiement, Total de la scolarité, Payé au jour, Restant).
- Ajouter une section de signature pour le comptable/secrétaire et le parent/tuteur, avec la date ({{date}}).
- Tous les textes doivent être en français.
- Utiliser des placeholders entre {{...}} pour les champs dynamiques.
```

## Visual References

- **Letterhead Image:**  
  Use `docs\template\Template_Letter_Head.png` as the official letterhead at the top of the certificate. This image should be included in the generated HTML using the `{{letterheadImageUrl}}` placeholder (as a URL or base64 string).

- **Enrollment Certificate Example:**  
  Refer to `docs\template\Template_Fiche_inscription.png` for the expected layout, structure, and design of the certificate. The generated HTML should closely match this example in terms of formatting, tables, and signature areas.

## Notes
- The letterhead image should be referenced by a URL or base64 string in `{{letterheadImageUrl}}`.
- The HTML should be styled to closely match the provided sample, including tables and signature layout.
- This prompt is intended for use with Claude or similar LLMs to generate or update the HTML template for PDF generation.
