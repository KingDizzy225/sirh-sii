/**
 * Générateur & Seeder du Dataset de Référence Enterprise SII (248 Collaborateurs)
 * Répartis sur les 5 Agences Officielles de Côte d'Ivoire :
 * - Abidjan Plateau (74 pers)
 * - Cocody Deux-Plateaux (56 pers)
 * - Yopougon Siporex (48 pers)
 * - San Pedro Port (38 pers)
 * - Grand-Bassam (32 pers)
 * Total : 248 collaborateurs conformes aux indicateurs BDESE, SWP & Pyramide des Âges.
 */

const fs = require('fs');
const path = require('path');

const AGENCES_CONFIG = [
  { name: 'Agence Abidjan Plateau', code: 'PLT', count: 74, prefix: '01' },
  { name: 'Agence Cocody Deux-Plateaux', code: 'CDY', count: 56, prefix: '02' },
  { name: 'Agence Yopougon Siporex', code: 'YOP', count: 48, prefix: '03' },
  { name: 'Agence San Pedro Port', code: 'SPD', count: 38, prefix: '04' },
  { name: 'Agence Grand-Bassam', code: 'BSM', count: 32, prefix: '05' }
];

const PRENOMS_HOMMES = [
  'Kouassi', 'Yao', 'Koffi', 'Konan', 'Bakayoko', 'Diarra', 'Coulibaly', 'Ouattara',
  'Traoré', 'Fofana', 'Bamba', 'Touré', 'Sanogo', 'Kone', 'Gbagbo', 'Dadié', 'Aké',
  'N’Guessan', 'Kouamé', 'Cissé', 'Meïté', 'Diallo', 'Sangaré', 'Sylla', 'Gnamien'
];

const PRENOMS_FEMMES = [
  'Aya', 'Akissi', 'Affoué', 'Amenan', 'Adjoua', 'Ahou', 'Bintou', 'Fatou',
  'Mariam', 'Fatimata', 'Aïcha', 'Kady', 'Salimata', 'Saran', 'Tenin', 'Rokiatou',
  'Patricia', 'Véronique', 'Monique', 'Estelle', 'Christelle', 'Sarah', 'Marie-Paule'
];

const NOMS_FAMILLE = [
  'Kouamé', 'Koné', 'Ouattara', 'Coulibaly', 'Traoré', 'Bamba', 'Bakayoko', 'Cissé',
  'Fofana', 'Touré', 'Diallo', 'Sylla', 'Koffi', 'Yao', 'N’Goran', 'Kouassi', 'Diarra',
  'Sangaré', 'Sanogo', 'Meïté', 'Soro', 'Yeo', 'Silué', 'Tuho', 'Gnagne', 'Brou'
];

const METIERS_PAR_DEPARTEMENT = {
  'Opérations & Guichets': [
    { title: 'Chef de Caisse Senior', minSal: 650000, maxSal: 950000, cadre: true },
    { title: 'Caissier Principal', minSal: 420000, maxSal: 600000, cadre: false },
    { title: 'Guichetier Réseau Polyvalent', minSal: 320000, maxSal: 450000, cadre: false },
    { title: 'Agent d’Accueil & Orientation', minSal: 280000, maxSal: 380000, cadre: false }
  ],
  'Développement Commercial': [
    { title: 'Responsable Commercial B2B', minSal: 900000, maxSal: 1500000, cadre: true },
    { title: 'Chargé de Clientèle Entreprises', minSal: 600000, maxSal: 950000, cadre: true },
    { title: 'Conseiller Commercial Boutique', minSal: 350000, maxSal: 550000, cadre: false },
    { title: 'Animateur Vente Nomade', minSal: 320000, maxSal: 480000, cadre: false }
  ],
  'Support, IT & Monétique': [
    { title: 'Ingénieur Systèmes & Télécoms', minSal: 850000, maxSal: 1400000, cadre: true },
    { title: 'Technicien Support Réseau & Monétique', minSal: 450000, maxSal: 700000, cadre: false },
    { title: 'Gestionnaire Flotte & Terminaux TPE', minSal: 400000, maxSal: 600000, cadre: false }
  ],
  'Moyens Généraux & Sécurité': [
    { title: 'Superviseur Logistique & Sécurité', minSal: 650000, maxSal: 1100000, cadre: true },
    { title: 'Gestionnaire des Stocks & Coffres', minSal: 400000, maxSal: 620000, cadre: false },
    { title: 'Chauffeur Flotte & Liaisons Agences', minSal: 280000, maxSal: 420000, cadre: false }
  ],
  'Direction, Audit & RH': [
    { title: 'Chef d’Agence Régionale', minSal: 1400000, maxSal: 2400000, cadre: true },
    { title: 'Auditeur Risques & Conformité', minSal: 800000, maxSal: 1300000, cadre: true },
    { title: 'Chargé des Ressources Humaines Agence', minSal: 600000, maxSal: 950000, cadre: true }
  ]
};

function generate248Dataset() {
  const dataset = [];
  let globalIndex = 1;

  for (const agence of AGENCES_CONFIG) {
    for (let i = 0; i < agence.count; i++) {
      const isFemale = (globalIndex % 10) < 4; // ~40% femmes (conforme BDESE)
      const prenom = isFemale
        ? PRENOMS_FEMMES[Math.floor(Math.random() * PRENOMS_FEMMES.length)]
        : PRENOMS_HOMMES[Math.floor(Math.random() * PRENOMS_HOMMES.length)];
      const nom = NOMS_FAMILLE[Math.floor(Math.random() * NOMS_FAMILLE.length)];

      const deptKeys = Object.keys(METIERS_PAR_DEPARTEMENT);
      const dept = deptKeys[Math.floor(Math.random() * deptKeys.length)];
      const metiers = METIERS_PAR_DEPARTEMENT[dept];
      const metierInfo = metiers[Math.floor(Math.random() * metiers.length)];

      const matricule = `EMP-${agence.prefix}${String(i + 1).padStart(3, '0')}`;
      const email = `${prenom.toLowerCase().replace(/[^a-z]/g, '')}.${nom.toLowerCase().replace(/[^a-z]/g, '')}@sii-ci.com`;

      const salaireBase = Math.round(
        (metierInfo.minSal + Math.random() * (metierInfo.maxSal - metierInfo.minSal)) / 1000
      ) * 1000;

      // Calcul de l'âge (entre 23 et 59 ans)
      const age = Math.floor(23 + Math.random() * 37);
      const birthYear = 2026 - age;
      const ancienneteAnnees = Math.min(Math.floor(Math.random() * 18) + 1, age - 22);

      dataset.push({
        id: `sii-emp-${globalIndex}`,
        matricule: matricule,
        firstName: prenom,
        lastName: nom,
        fullName: `${prenom} ${nom}`,
        email: email,
        gender: isFemale ? 'Femme' : 'Homme',
        age: age,
        birthDate: `${birthYear}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-15`,
        hireDate: `${2026 - ancienneteAnnees}-03-01`,
        anciennete: `${ancienneteAnnees} ans`,
        positionTitle: metierInfo.title,
        department: dept,
        agence: agence.name,
        role: metierInfo.cadre ? 'Manager' : 'Employee',
        isCadre: metierInfo.cadre,
        status: 'ACTIVE',
        contractType: 'CDI',
        salaireBrutMensuel: salaireBase,
        salaireNetMensuel: Math.round(salaireBase * 0.78),
        cnpsNumber: `CNPS-CI-${String(Math.floor(10000000 + Math.random() * 90000000))}`,
        phone: `+225 07 ${String(Math.floor(10000000 + Math.random() * 90000000))}`
      });

      globalIndex++;
    }
  }

  return dataset;
}

const fullData = generate248Dataset();
const outputPath = path.join(__dirname, '..', 'data', 'mock_248_employees.json');
fs.writeFileSync(outputPath, JSON.stringify(fullData, null, 2), 'utf-8');

console.log(`✅ Succès : Dataset généré avec ${fullData.length} collaborateurs conformes.`);
console.log(`📁 Fichier créé : ${outputPath}`);
