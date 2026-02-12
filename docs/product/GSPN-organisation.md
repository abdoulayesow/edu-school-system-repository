# GSPN — Organisation, Hiérarchie & Rôles

> Groupe Scolaire Privé Ndiolou (Guinée) — Référence produit v1.3 — Février 2026

---

## 1. Contexte

Le système éducatif guinéen comprend : la maternelle, le primaire (1ère–6ème année), le collège (7ème–10ème année, sanctionné par le BEPC) et le lycée (11ème–13ème année, sanctionné par le baccalauréat). Le GSPN couvre tous ces niveaux.

Les paiements se font principalement en espèces et par mobile money (Orange Money).

---

## 2. Principes structurants

1. **Deux branches sous le DG** : la branche **Académique** et la branche **Financière**.
2. **Séparation stricte** : le personnel académique n'a aucun accès aux données ou modules financiers, et inversement. Cette muraille est un principe de conception fondamental du système.
3. **Le Proviseur est le N°2** du GSPN (côté académique). Il est le relais principal du DG pour toute la vie scolaire.
4. **Collège & Lycée partagent les mêmes personnes** pour les rôles de Proviseur, Censeur et Surveillant Général. Ces rôles couvrent les deux cycles (7ème–13ème).
5. **Le Primaire inclut la Maternelle** : le Directeur du Primaire gère la maternelle et le primaire (jusqu'à la 6ème année).
6. **L'Agent de Recouvrement** n'est pas un rôle hiérarchique. C'est une personne dédiée dont la seule fonction est de relancer les familles en retard de paiement. Il n'a pas de pouvoir de décision ni de rôle managérial.
7. **Le Comptable** a accès à la caisse (registre) et au coffre de l'école, mais PAS au compte bancaire. Seuls le DG et le Coordinateur Général ont accès au compte bancaire.

---

## 3. Hiérarchie

```
DIRECTEUR GÉNÉRAL (Propriétaire)
  │
  ├─── BRANCHE ACADÉMIQUE
  │      │
  │      ├── PROVISEUR (N°2 — Collège & Lycée)
  │      │     ├── Censeur (adjoint pédagogique — Collège & Lycée)
  │      │     │     ├── Professeurs Principaux
  │      │     │     └── Enseignants secondaire
  │      │     └── Surveillant Général (discipline — Collège & Lycée)
  │      │
  │      └── DIRECTEUR DU PRIMAIRE (Maternelle & Primaire)
  │            ├── Secrétariat (support administratif)
  │            └── Enseignants maternelle & primaire
  │
  ├─── BRANCHE FINANCIÈRE
  │      │
  │      └── COORDINATEUR GÉNÉRAL (Banque & Coffre)
  │            └── Comptable (Caisse & Coffre — pas de banque)
  │
  ├─── Agent de Recouvrement (relance paiements — rôle dédié, non managérial)
  │
  └─── PERSONNEL D'APPUI : Gardiens jour & nuit (hors système)
```

### Liens hiérarchiques résumés

| Rôle | Reporte à | Supervise |
|------|-----------|-----------|
| Directeur Général | — | Proviseur, Directeur Primaire, Coordinateur Général |
| **BRANCHE ACADÉMIQUE** | | |
| Proviseur (N°2) | DG | Censeur, Surveillant Général |
| Censeur | Proviseur | Professeurs Principaux, Enseignants secondaire |
| Surveillant Général | Proviseur | Surveillants, Élèves (discipline) |
| Professeur Principal | Censeur | Enseignants de sa classe (coordination), Élèves (suivi) |
| Directeur Primaire | DG | Secrétariat, Enseignants maternelle & primaire |
| Secrétariat | Directeur Primaire | — |
| **BRANCHE FINANCIÈRE** | | |
| Coordinateur Général | DG | Comptable |
| Comptable | Coordinateur Général | — |
| **HORS BRANCHES** | | |
| Agent de Recouvrement | DG | — (aucune supervision) |
| Gardiens | DG | — |

### Mur de séparation Académique / Financier

| | Données académiques | Données financières | Compte bancaire |
|---|---|---|---|
| DG | ✅ Tout | ✅ Tout | ✅ Accès |
| Proviseur, Censeur, Surv. Gén. | ✅ Leur périmètre | ❌ Aucun accès | ❌ |
| Directeur Primaire, Secrétariat | ✅ Leur périmètre | ❌ Aucun accès | ❌ |
| Enseignants, PP | ✅ Leur périmètre | ❌ Aucun accès | ❌ |
| Coordinateur Général | ❌ Aucun accès | ✅ Tout | ✅ Accès |
| Comptable | ❌ Aucun accès | ✅ Caisse & Coffre | ❌ Pas de banque |
| Agent de Recouvrement | ❌ (sauf liste retards) | ❌ (sauf statut paiement) | ❌ |

### Changements par rapport à la v1.2

| Avant (v1.2) | Maintenant (v1.3) | Raison |
|---|---|---|
| Agent de Recouvrement = N°2 hiérarchique | Rôle dédié non managérial (relance uniquement) | Clarification client |
| Censeur (Lycée) + Principal (Collège) séparés | Proviseur + Censeur + Surv. Gén. couvrent Collège ET Lycée (mêmes personnes) | Réalité terrain : mêmes personnes pour les deux cycles |
| Proviseur absent | Proviseur = N°2 de l'école | Clarification client |
| Primaire seul | Primaire + Maternelle | Le Directeur du Primaire gère aussi la maternelle |
| Comptable = accès financier complet | Comptable = caisse + coffre, PAS de banque | Seuls DG et Coordinateur accèdent à la banque |
| Pas de séparation formelle | Mur strict académique / financier | Principe de conception fondamental |

---

## 4. Description des rôles

### 4.1 Directeur Général (Propriétaire)

- **Position :** Plus haute autorité — Direction suprême
- **Rôle système :** Owner / Super Admin
- **Persona produit :** — (nouveau rôle à créer)
- **Branche :** Transversal (seul rôle à cheval sur les deux branches)

Fondateur et dirigeant suprême du GSPN. Seul rôle ayant une visibilité complète sur les branches académique ET financière. Chef d'orchestre qui coordonne tous les services.

**Missions :**
- **Stratégique :** vision à long terme, objectifs annuels, priorités de développement, pilotage des grands projets.
- **Institutionnel :** représentation officielle (MENA, DCE, DPE, autorités locales, partenaires, associations de parents), signature de tous les documents officiels.
- **Pédagogique :** supervision du Proviseur et du Directeur du Primaire, contrôle de la qualité des enseignements, stratégies de réussite au BEPC et BAC.
- **Financier :** validation du budget annuel, supervision des recettes et dépenses, accès au compte bancaire (avec le Coordinateur), décisions d'investissement, contrôle de la comptabilité.
- **RH :** recrutement, formation, évaluation de tout le personnel, gestion des contrats, promotions, sanctions.
- **Disciplinaire :** validation des sanctions majeures, conseils disciplinaires, exclusions.

---

### 4.2 Proviseur (N°2 — Collège & Lycée)

- **Position :** Chef d'établissement du secondaire, N°2 du GSPN
- **Rôle système :** Admin Section Secondaire
- **Persona produit :** — (nouveau rôle à créer)
- **Branche :** Académique

Premier responsable administratif, pédagogique et disciplinaire de l'enseignement secondaire (collège ET lycée). Relais principal du DG. Supervise le Censeur et le Surveillant Général.

**Missions :** direction et coordination de l'ensemble des activités du collège et du lycée, présidence des conseils de classe et de discipline, supervision du Censeur et du Surveillant Général, validation des emplois du temps et programmes, relations parents du secondaire et APEAE, approbation des inscriptions au secondaire, signature des documents officiels (bulletins, attestations, certificats).

---

### 4.3 Censeur (Collège & Lycée)

- **Position :** Adjoint pédagogique du Proviseur
- **Rôle système :** Responsable Pédagogique
- **Persona produit :** Fatoumata (Academic Director)
- **Branche :** Académique

Chargé de l'organisation pédagogique et du suivi de l'enseignement pour le collège et le lycée. Supervise le travail des enseignants et des Professeurs Principaux. Remplace le Proviseur en cas d'absence.

**Missions :**
- **Pédagogique :** emplois du temps (collège + lycée), répartition des matières et charges horaires, contrôle présence/ponctualité/assiduité des enseignants, vérification de la progression des programmes, organisation et supervision des DS/compositions/examens blancs (BEPC et BAC), analyse des résultats et propositions de correctifs.
- **Coordination :** encadrement des Professeurs Principaux, animation des réunions pédagogiques, remontée des problèmes au Proviseur.
- **Examens :** préparation des candidats au BEPC et au BAC, tenue des dossiers officiels MENA, conformité des programmes.
- **Administratif :** validation des cahiers de texte, supervision des cahiers d'appel, collecte des notes et bulletins, rapports périodiques.

---

### 4.4 Surveillant Général (Collège & Lycée)

- **Position :** Discipline & Vie scolaire
- **Rôle système :** Resp. Vie Scolaire
- **Persona produit :** — (nouveau rôle à créer)
- **Branche :** Académique

Chargé de la discipline et de la vie scolaire des élèves du secondaire (collège et lycée). Assure l'ordre et la sécurité dans l'établissement.

**Missions :** discipline générale, contrôle absences/retards des élèves, gestion entrées/sorties, supervision des surveillants et du personnel d'encadrement, application du règlement intérieur, gestion des conflits entre élèves, organisation des mouvements d'élèves (récréations, déplacements), tenue du registre de discipline, liaison parents-école sur les questions disciplinaires, préparation des dossiers pour les conseils disciplinaires.

---

### 4.5 Professeur Principal (PP)

- **Position :** Référent unique d'une classe
- **Rôle système :** Enseignant (droits étendus sur sa classe)
- **Persona produit :** — (nouveau rôle ou extension Enseignant)
- **Branche :** Académique

Enseignant qui assume en plus la responsabilité globale d'une classe. Interface directe entre les enseignants de la classe, les élèves, les parents et la direction (Censeur / Proviseur). Un PP par classe.

**Missions :** suivi des notes/progrès/difficultés de chaque élève, compilation des résultats et bulletins trimestriels, coordination avec les enseignants de la classe, discipline de la classe, communication régulière avec les parents, identification des élèves en difficulté, propositions de remédiation, préparation des conseils de classe.

---

### 4.6 Enseignant

- **Rôle système :** Enseignant
- **Persona produit :** Amadou (Teacher)
- **Branche :** Académique

Professionnel chargé de transmettre le savoir selon le programme MENA. Présent à tous les niveaux (maternelle, primaire, collège, lycée). Au secondaire, il travaille en lien avec le Professeur Principal.

**Missions :** préparation et dispensation des cours, conception et correction des devoirs/DS/examens, tenue du cahier d'appel et cahier journal, discipline dans sa salle de classe, collaboration avec le PP, participation aux réunions et conseils de classe, suivi individualisé des élèves en difficulté.

---

### 4.7 Directeur du Primaire (Maternelle & Primaire)

- **Position :** Responsable de la maternelle et du primaire (jusqu'à la 6ème année)
- **Rôle système :** Admin Section Primaire
- **Persona produit :** — (nouveau rôle)
- **Branche :** Académique

Direction administrative et pédagogique de la maternelle et du primaire. Rend compte directement au DG.

**Missions :** direction de la section maternelle et primaire, supervision des enseignants, inscriptions et admissions, application des programmes du Ministère, organisation des évaluations et du CEPE (6ème année), relations parents, discipline et bien-être des jeunes élèves, activités parascolaires.

---

### 4.8 Secrétariat (Maternelle & Primaire)

- **Position :** Support administratif
- **Rôle système :** Gestionnaire Inscriptions
- **Persona produit :** Mariama (Secretary)
- **Branche :** Académique

Premier point de contact pour les parents de la maternelle et du primaire. Gestion des inscriptions et de la documentation quotidienne.

**Missions :** accueil parents, gestion des inscriptions et dossiers élèves, tenue des registres d'inscription et de présence, émission d'attestations et certificats de scolarité, gestion du courrier, communication école-familles, archivage des documents administratifs, rapports administratifs périodiques.

---

### 4.9 Coordinateur Général (Service Financier)

- **Position :** Responsable financier — Banque & Coffre
- **Rôle système :** Responsable Financier
- **Persona produit :** — (nouveau rôle)
- **Branche :** Financière

Dirige la branche financière. Responsable des transactions bancaires et du coffre. Supervise la Comptable. Périmètre strictement financier — aucun accès aux données académiques. Accès au compte bancaire (avec le DG).

**Missions :** gestion des transactions bancaires, gestion du coffre et fonds en caisse, supervision de la Comptable, validation des dépôts et retraits bancaires, réconciliation bancaire, approbation des dépenses et décaissements (dans les limites autorisées), rapports financiers au DG, sécurité et traçabilité des opérations, relations avec les banques, préparation des budgets prévisionnels.

---

### 4.10 Comptable

- **Position :** Tenue des comptes — Caisse & Coffre (pas de banque)
- **Rôle système :** Gestionnaire Comptable
- **Persona produit :** Ibrahima (Accountant)
- **Branche :** Financière

Tenue des comptes et production des états financiers. A accès à la caisse (registre) et au coffre de l'école, mais PAS au compte bancaire. Sous supervision du Coordinateur Général.

**Accès financier :**
- ✅ Caisse (registre des encaissements/décaissements)
- ✅ Coffre de l'école
- ❌ Compte bancaire (réservé au DG et au Coordinateur)

**Missions :** comptabilité générale, enregistrement des recettes (frais de scolarité, activités, etc.) et dépenses, gestion de la caisse quotidienne, opérations du coffre, états financiers périodiques (mensuel, trimestriel, annuel), gestion de la paie, documentation des exceptions financières avec justificatifs, clôtures de périodes comptables, archivage des pièces comptables. Les rapprochements bancaires sont effectués par le Coordinateur Général.

---

### 4.11 Agent de Recouvrement

- **Position :** Relance des paiements en retard (rôle dédié, non managérial)
- **Rôle système :** Accès limité (consultation statut paiement + liste retards)
- **Persona produit :** — (rôle opérationnel dédié)
- **Branche :** Aucune (rattaché directement au DG)

Personne dédiée dont la seule mission est de relancer les familles en retard de paiement. N'a aucun pouvoir de décision, aucun rôle managérial, aucune supervision. Ne fait pas partie de la chaîne hiérarchique.

**Accès système :**
- ✅ Liste des élèves avec paiements en retard
- ✅ Statut de paiement par élève (payé / en retard / plan de paiement)
- ❌ Données académiques (notes, discipline, etc.)
- ❌ Données financières complètes (comptabilité, coffre, banque)

**Missions :** contacter les familles en retard de paiement, rappeler les échéances, informer le DG des situations critiques, tenir un registre des relances effectuées.

---

### 4.12 Chef de Classe (Élève)

- **Rôle système :** Non utilisateur (futur portail R2)
- **Persona produit :** — (rôle élève)
- **Branche :** Académique

Élève élu ou désigné pour représenter sa classe. Lien entre les élèves, le PP et la direction. Non utilisateur du système MVP.

**Missions :** représentation de la classe, maintien de la discipline, communication élèves ↔ enseignants, aide au PP pour l'appel et l'assiduité, encouragement de l'entraide.

---

### 4.13 Gardiens (Jour & Nuit)

- **Rôle système :** Non utilisateur (hors système)
- **Persona produit :** —

Sécurité physique des locaux. Surveillance des accès, rondes, registre des visiteurs.

---

## 5. Correspondance Rôles ↔ Personas produit

| Rôle école | Persona produit | Rôle système | Branche | Priorité MVP |
|---|---|---|---|---|
| Directeur Général | — (à créer) | Owner / Super Admin | Transversal | Critique |
| Proviseur (N°2) | — (à créer) | Admin Section Sec. | Académique | Critique |
| Censeur | Fatoumata (Acad. Dir.)* | Resp. Pédagogique | Académique | Haute |
| Surveillant Général | — (à créer) | Resp. Vie Scolaire | Académique | Moyenne |
| Professeur Principal | — (extension Enseignant) | Enseignant (droits étendus) | Académique | Haute |
| Directeur Primaire | — (à créer) | Admin Section Primaire | Académique | Haute |
| Secrétariat | Mariama (Secretary) | Gest. Inscriptions | Académique | Critique |
| Coordinateur Général | — (à créer) | Resp. Financier | Financière | Critique |
| Comptable | Ibrahima (Accountant)* | Gest. Comptable | Financière | Critique |
| Agent de Recouvrement | — (rôle dédié) | Accès limité | Aucune | Moyenne |
| Enseignant | Amadou (Teacher) | Enseignant | Académique | Moyenne |
| Chef de Classe | — (rôle élève) | Non utilisateur | Académique | R2 |
| Parent | Aissatou | Portail Parent | — | R2 |
| Élève | Mamadou | Portail Élève | — | R2 |
| Gardiens | — (hors système) | Non utilisateur | — | — |

---

## 6. Notes de conception pour le système

- **Mur académique/financier** : c'est le principe de conception le plus important. Les modules financiers et académiques doivent être complètement cloisonnés. Le DG est le seul rôle transversal.
- **Accès bancaire** : seuls le DG et le Coordinateur Général peuvent voir/gérer le compte bancaire. Le Comptable ne voit que la caisse et le coffre.
- **Agent de Recouvrement** : rôle à accès minimal. Ne voit que le statut de paiement et la liste des retards. Pas de données académiques, pas de données financières détaillées.
- **Proviseur, Censeur, Surveillant Général** : une seule personne par rôle couvre à la fois le collège et le lycée. Le système ne doit pas forcer une séparation collège/lycée pour ces rôles.
- **Directeur du Primaire** : son périmètre inclut la maternelle. Le système doit permettre de gérer des classes de maternelle sous cette section.
- **Professeur Principal** : enseignant avec droits étendus sur sa classe. Le système doit gérer la relation PP ↔ Classe (accès aux notes de tous les enseignants de la classe, communication parents, bulletins).
