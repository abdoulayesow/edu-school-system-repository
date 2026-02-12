import React, { useState } from "react";

const roles = {
  dg: {
    title: "Directeur Général",
    subtitle: "Propriétaire — Direction Suprême",
    color: "#8B6914",
    bg: "#FDF8EE",
    desc: "Fondateur et dirigeant suprême. Seul rôle transversal avec visibilité sur les branches Académique ET Financière. Accès au compte bancaire.",
    persona: "— (nouveau rôle à créer)",
    systemRole: "Owner / Super Admin",
    branch: "Transversal",
    missions: [
      "Vision et stratégie globale",
      "Représentation officielle (MENA, DCE, DPE)",
      "Supervision du Proviseur et du Coordinateur",
      "Validation du budget et investissements",
      "Accès au compte bancaire (avec Coordinateur)",
      "Recrutement et gestion du personnel",
      "Sanctions majeures et exceptions",
    ],
  },
  proviseur: {
    title: "Proviseur",
    subtitle: "N°2 — Collège & Lycée",
    color: "#1A3C6E",
    bg: "#EEF2F8",
    desc: "Chef d'établissement du secondaire et N°2 du GSPN. Même personne pour le collège et le lycée. Supervise le Censeur et le Surveillant Général. Aucun accès financier.",
    persona: "— (nouveau rôle à créer)",
    systemRole: "Admin Section Secondaire",
    branch: "Académique",
    missions: [
      "Direction collège & lycée",
      "N°2 de l'école, relais du DG",
      "Conseils de classe & discipline",
      "Supervision Censeur & Surveillant Général",
      "Validation emplois du temps",
      "Relations parents secondaire & APEAE",
      "Signatures documents officiels",
    ],
  },
  censeur: {
    title: "Censeur",
    subtitle: "Adjoint pédagogique — Collège & Lycée",
    color: "#2B5EA7",
    bg: "#EEF4FC",
    desc: "Adjoint du Proviseur pour l'organisation pédagogique du collège et du lycée. Supervise les Professeurs Principaux et les enseignants. Remplace le Proviseur en cas d'absence.",
    persona: "Fatoumata (Academic Director)",
    systemRole: "Responsable Pédagogique",
    branch: "Académique",
    missions: [
      "Emplois du temps collège & lycée",
      "Organisation DS / compositions / examens blancs",
      "Préparation BEPC et BAC",
      "Encadrement des Professeurs Principaux",
      "Contrôle assiduité enseignants",
      "Analyse des résultats et correctifs",
      "Rapports pédagogiques périodiques",
    ],
  },
  surveillant: {
    title: "Surveillant Général",
    subtitle: "Discipline — Collège & Lycée",
    color: "#3A75C4",
    bg: "#EFF5FC",
    desc: "Chargé de la discipline et de la vie scolaire pour le collège et le lycée. Même personne pour les deux cycles.",
    persona: "— (nouveau rôle à créer)",
    systemRole: "Resp. Vie Scolaire",
    branch: "Académique",
    missions: [
      "Discipline générale collège & lycée",
      "Contrôle absences / retards élèves",
      "Gestion entrées / sorties",
      "Supervision des surveillants",
      "Règlement intérieur",
      "Registre de discipline",
      "Liaison parents (questions disciplinaires)",
    ],
  },
  pp: {
    title: "Professeur Principal",
    subtitle: "Référent unique par classe",
    color: "#5B7BA5",
    bg: "#F0F4F9",
    desc: "Enseignant référent d'une classe. Interface entre enseignants, élèves, parents et direction. Un PP par classe au collège et au lycée.",
    persona: "— (extension Enseignant)",
    systemRole: "Enseignant (droits étendus)",
    branch: "Académique",
    missions: [
      "Suivi notes et progrès de chaque élève",
      "Bulletins trimestriels",
      "Coordination enseignants de la classe",
      "Discipline de la classe",
      "Communication avec les parents",
      "Identification élèves en difficulté",
      "Préparation conseils de classe",
    ],
  },
  enseignant: {
    title: "Enseignant",
    subtitle: "Transmission du savoir",
    color: "#7D8FA8",
    bg: "#F3F5F8",
    desc: "Transmet le savoir selon le programme MENA. Présent à tous les niveaux (maternelle, primaire, collège, lycée).",
    persona: "Amadou (Teacher)",
    systemRole: "Enseignant",
    branch: "Académique",
    missions: [
      "Cours selon le programme MENA",
      "Devoirs / DS / examens",
      "Cahier d'appel et cahier journal",
      "Discipline en classe",
      "Collaboration avec le PP",
      "Réunions et conseils de classe",
    ],
  },
  directeur_primaire: {
    title: "Directeur du Primaire",
    subtitle: "Maternelle & Primaire (→ 6ème année)",
    color: "#1B8A5A",
    bg: "#EDF8F2",
    desc: "Responsable de la maternelle et du primaire (jusqu'à la 6ème année). Direction administrative et pédagogique. Rend compte directement au DG.",
    persona: "— (nouveau rôle)",
    systemRole: "Admin Section Primaire",
    branch: "Académique",
    missions: [
      "Direction maternelle & primaire",
      "Supervision des enseignants",
      "Inscriptions et admissions",
      "Programmes du Ministère",
      "Évaluations et CEPE (6ème)",
      "Relations parents",
      "Discipline et bien-être",
    ],
  },
  secretariat: {
    title: "Secrétariat",
    subtitle: "Support Admin — Maternelle & Primaire",
    color: "#3BAF7A",
    bg: "#F0FAF5",
    desc: "Support administratif de la maternelle et du primaire. Premier point de contact pour les parents.",
    persona: "Mariama (Secretary)",
    systemRole: "Gestionnaire Inscriptions",
    branch: "Académique",
    missions: [
      "Accueil parents",
      "Inscriptions et dossiers élèves",
      "Registres de présence",
      "Attestations et certificats",
      "Communication école-familles",
    ],
  },
  coordinateur: {
    title: "Coordinateur Général",
    subtitle: "Service Financier — Banque & Coffre",
    color: "#6C3483",
    bg: "#F6F0FA",
    desc: "Dirige la branche financière. Accès au compte bancaire (avec le DG). Supervise la Comptable. Aucun accès aux données académiques.",
    persona: "— (nouveau rôle)",
    systemRole: "Responsable Financier",
    branch: "Financière",
    missions: [
      "Transactions bancaires",
      "Accès au compte bancaire (avec DG)",
      "Gestion du coffre",
      "Supervision de la Comptable",
      "Validation dépôts & retraits",
      "Réconciliation bancaire",
      "Rapports financiers au DG",
    ],
  },
  comptable: {
    title: "Comptable",
    subtitle: "Caisse & Coffre (pas de banque)",
    color: "#8E6DB0",
    bg: "#F8F3FC",
    desc: "Tenue des comptes. Accès à la caisse (registre) et au coffre, mais PAS au compte bancaire. Sous supervision du Coordinateur.",
    persona: "Ibrahima (Accountant)",
    systemRole: "Gestionnaire Comptable",
    branch: "Financière",
    missions: [
      "Comptabilité générale",
      "Caisse (registre encaissements)",
      "Opérations du coffre",
      "❌ Pas d'accès bancaire",
      "États financiers périodiques",
      "Gestion de la paie",
      "Clôtures de périodes",
    ],
  },
  recouvrement: {
    title: "Agent de Recouvrement",
    subtitle: "Relance paiements (non managérial)",
    color: "#B07D3A",
    bg: "#FBF6EE",
    desc: "Personne dédiée à la relance des familles en retard de paiement. Aucun pouvoir de décision, aucun rôle managérial. Accès minimal au système.",
    persona: "— (rôle opérationnel dédié)",
    systemRole: "Accès limité",
    branch: "Aucune",
    missions: [
      "Relance des familles en retard",
      "Consultation statut paiement par élève",
      "Liste des retards uniquement",
      "❌ Pas d'accès académique",
      "❌ Pas d'accès financier complet",
      "Registre des relances effectuées",
    ],
  },
  gardiens: {
    title: "Gardiens",
    subtitle: "Jour & Nuit",
    color: "#626E7B",
    bg: "#F2F3F5",
    desc: "Sécurité physique des locaux et des biens du GSPN. Hors système.",
    persona: "— (hors système)",
    systemRole: "Non utilisateur",
    branch: "—",
    missions: [
      "Surveillance des accès",
      "Contrôle entrées / sorties",
      "Rondes de surveillance",
      "Signalement incidents",
      "Registre visiteurs",
    ],
  },
};

function Node({ id, selected, onClick, compact = false, dimmed = false }) {
  const role = roles[id];
  const isSelected = selected === id;
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        background: isSelected
          ? `linear-gradient(135deg, ${role.color}, ${role.color}CC)`
          : "#fff",
        borderLeft: isSelected ? "none" : `3px solid ${role.color}`,
        borderRight: "none",
        borderTop: "none",
        borderBottom: "none",
        boxShadow: isSelected
          ? `0 4px 20px ${role.color}44`
          : "0 1px 3px rgba(0,0,0,0.06)",
        padding: compact ? "5px 10px" : "8px 14px",
        cursor: "pointer",
        borderRadius: 6,
        transition: "all 0.15s ease",
        width: "100%",
        textAlign: "left",
        opacity: dimmed ? 0.6 : 1,
      }}
    >
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          fontSize: compact ? 11 : 12.5,
          color: isSelected ? "#fff" : role.color,
          lineHeight: 1.2,
        }}
      >
        {role.title}
      </div>
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: compact ? 9 : 10.5,
          color: isSelected ? "rgba(255,255,255,0.8)" : "#999",
          marginTop: 1,
          lineHeight: 1.2,
        }}
      >
        {role.subtitle}
      </div>
    </button>
  );
}

function VLine({ h = 20 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", height: h }}>
      <div style={{ width: 2, height: "100%", background: "#D5D8DC" }} />
    </div>
  );
}

function BranchHeader({ text, color, icon }) {
  return (
    <div
      style={{
        textAlign: "center",
        fontSize: 10,
        fontWeight: 800,
        fontFamily: "'DM Sans', sans-serif",
        color: "#fff",
        background: `linear-gradient(135deg, ${color}, ${color}DD)`,
        padding: "5px 0 4px",
        borderRadius: "6px 6px 0 0",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}
    >
      {icon} {text}
    </div>
  );
}

function BranchBox({ children, tint }) {
  return (
    <div
      style={{
        background: tint || "#FAFAFA",
        borderRadius: "0 0 8px 8px",
        padding: 8,
        display: "flex",
        flexDirection: "column",
        gap: 5,
        border: "1px solid #EAECED",
        borderTop: "none",
      }}
    >
      {children}
    </div>
  );
}

function Indent({ children }) {
  return <div style={{ paddingLeft: 12 }}>{children}</div>;
}

function WallLabel() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        margin: "8px 0",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ flex: 1, height: 2, background: "#E74C3C33" }} />
      <span
        style={{
          fontSize: 9,
          fontWeight: 800,
          color: "#E74C3C",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "2px 10px",
          background: "#FDEDEC",
          borderRadius: 10,
          whiteSpace: "nowrap",
        }}
      >
        🔒 Mur de séparation Académique / Financier
      </span>
      <div style={{ flex: 1, height: 2, background: "#E74C3C33" }} />
    </div>
  );
}

function DetailPanel({ id }) {
  const role = roles[id];
  if (!role) return null;

  const branchColors = {
    Académique: "#1A3C6E",
    Financière: "#6C3483",
    Transversal: "#8B6914",
    Aucune: "#B07D3A",
    "—": "#626E7B",
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        borderLeft: `4px solid ${role.color}`,
        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        padding: 20,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: role.color }}>
            {role.title}
          </h3>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "#999" }}>
            {role.subtitle}
          </p>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span
            style={{
              background: branchColors[role.branch] || "#888",
              color: "#fff",
              padding: "3px 12px",
              borderRadius: 16,
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {role.branch}
          </span>
          <span
            style={{
              background: "#F0F1F3",
              color: "#555",
              padding: "3px 12px",
              borderRadius: 16,
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {role.systemRole}
          </span>
        </div>
      </div>

      <p style={{ fontSize: 12.5, color: "#555", lineHeight: 1.6, margin: "0 0 16px" }}>
        {role.desc}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <h4
            style={{
              margin: "0 0 8px",
              fontSize: 9,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#bbb",
            }}
          >
            Missions principales
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {role.missions.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 7,
                  fontSize: 11.5,
                  color: m.startsWith("❌") ? "#C0392B" : "#555",
                  fontWeight: m.startsWith("❌") ? 600 : 400,
                  lineHeight: 1.35,
                }}
              >
                {!m.startsWith("❌") && (
                  <span style={{ color: role.color, fontSize: 7, marginTop: 4, flexShrink: 0 }}>
                    ◆
                  </span>
                )}
                {m}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <h4
              style={{
                margin: "0 0 6px",
                fontSize: 9,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#bbb",
              }}
            >
              Persona produit
            </h4>
            <div style={{ background: role.bg, borderRadius: 6, padding: 10 }}>
              <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: role.color }}>
                {role.persona}
              </p>
            </div>
          </div>
          <div>
            <h4
              style={{
                margin: "0 0 6px",
                fontSize: 9,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#bbb",
              }}
            >
              Rôle système
            </h4>
            <div style={{ background: "#F5F6F7", borderRadius: 6, padding: 10 }}>
              <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: "#444" }}>
                {role.systemRole}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [selected, setSelected] = useState("dg");
  const sel = setSelected;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #EDEEF0 0%, #E4E5E8 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap"
        rel="stylesheet"
      />
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "24px 16px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: "#1A1D23",
              letterSpacing: "-0.02em",
            }}
          >
            Organigramme du GSPN
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#999" }}>
            Groupe Scolaire Privé Ndiolou — v1.3 — Cliquez sur un rôle
          </p>
        </div>

        {/* Org Chart */}
        <div style={{ marginBottom: 20 }}>
          {/* DG */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: 230 }}>
              <Node id="dg" selected={selected} onClick={sel} />
            </div>
          </div>

          <VLine />

          {/* Split into two major branches */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: "70%", height: 2, background: "#D5D8DC" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 0 }}>
            {/* LEFT: ACADÉMIQUE */}
            <div>
              <VLine h={14} />
              <BranchHeader text="Branche Académique" color="#1A3C6E" icon="📚" />
              <BranchBox tint="#F7F8FA">
                {/* Proviseur */}
                <Node id="proviseur" selected={selected} onClick={sel} compact />

                {/* Under Proviseur: Censeur & Surveillant */}
                <Indent>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <Node id="censeur" selected={selected} onClick={sel} compact />
                    <Indent>
                      <Node id="pp" selected={selected} onClick={sel} compact />
                    </Indent>
                    <Indent>
                      <Node id="enseignant" selected={selected} onClick={sel} compact />
                    </Indent>
                    <Node id="surveillant" selected={selected} onClick={sel} compact />
                  </div>
                </Indent>

                {/* Separator */}
                <div
                  style={{
                    height: 1,
                    background: "#E0E2E5",
                    margin: "4px 0",
                  }}
                />

                {/* Directeur Primaire */}
                <Node id="directeur_primaire" selected={selected} onClick={sel} compact />
                <Indent>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <Node id="secretariat" selected={selected} onClick={sel} compact />
                    <Node id="enseignant" selected={selected} onClick={sel} compact dimmed />
                  </div>
                </Indent>
              </BranchBox>
            </div>

            {/* CENTER: Wall */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "30px 12px",
                minWidth: 36,
              }}
            >
              <div
                style={{
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  fontSize: 8,
                  fontWeight: 800,
                  color: "#E74C3C",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  background: "#FDEDEC",
                  padding: "10px 4px",
                  borderRadius: 4,
                }}
              >
                🔒 MUR
              </div>
            </div>

            {/* RIGHT: FINANCIÈRE */}
            <div>
              <VLine h={14} />
              <BranchHeader text="Branche Financière" color="#6C3483" icon="💰" />
              <BranchBox tint="#FAF8FC">
                <Node id="coordinateur" selected={selected} onClick={sel} compact />
                <Indent>
                  <Node id="comptable" selected={selected} onClick={sel} compact />
                </Indent>
              </BranchBox>
            </div>
          </div>

          {/* Below branches: Agent de Recouvrement + Gardiens */}
          <div
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <div style={{ width: 220 }}>
              <Node id="recouvrement" selected={selected} onClick={sel} compact />
            </div>
            <div style={{ width: 180 }}>
              <Node id="gardiens" selected={selected} onClick={sel} compact />
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: 9,
              color: "#AAA",
              marginTop: 4,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Rattachés directement au DG — hors branches
          </div>
        </div>

        {/* Detail Panel */}
        <DetailPanel id={selected} />
      </div>
    </div>
  );
}
