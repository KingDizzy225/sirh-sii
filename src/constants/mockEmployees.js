/**
 * Base de données de test enrichie : 190 collaborateurs aux compétences et fonctions diversifiées.
 * Conçu pour tester la GPEC, la Skills Matrix, le 9-Box Grid, le vivier de talents et l'annuaire RH.
 * Total : 190 collaborateurs actifs couvrant l'ensemble des départements et compétences métiers.
 */

export const MOCK_190_EMPLOYEES = [
  {
    "id": "emp-001",
    "matricule": "EMP-2023-001",
    "firstName": "Raïssa",
    "lastName": "Fofana",
    "name": "Raïssa Fofana",
    "email": "raissa.fofana@sii-ci.com",
    "phone": "+225 07 45 41 38 27",
    "gender": "Féminin",
    "positionTitle": "Lead Développeur Fullstack (React / Node)",
    "role": "Manager",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1998-09-03",
    "hireDate": "2024-02-22",
    "address": "Abidjan, Yopougon Niangon Sud",
    "cnpsNumber": "CNPS-39345092",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 10136505587 21",
    "childrenCount": 1,
    "annualLeaveBalance": 30,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-001-s1",
        "skillName": "Développement Front-End (React, Vue, Angular)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-001-s2",
        "skillName": "Développement Back-End (Node.js, Java, Python, C#)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-001-s3",
        "skillName": "Architecture Logicielle",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-001-s4",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-001-s5",
        "skillName": "Méthodes Agiles (Scrum, Kanban)",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-001-s6",
        "skillName": "DevOps (Docker, Kubernetes, Jenkins, GitLab CI)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-001-s7",
        "skillName": "Anglais (Technique)",
        "proficiencyLevel": "Avancé",
        "category": "Langues"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-001-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-4257",
        "assignedDate": "2024-02-22"
      },
      {
        "id": "eq-emp-001-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-4611",
        "assignedDate": "2024-02-22"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-002",
    "matricule": "EMP-2023-002",
    "firstName": "Yves",
    "lastName": "Gbané",
    "name": "Yves Gbané",
    "email": "yves.gbane@sii-ci.com",
    "phone": "+225 05 45 29 37 53",
    "gender": "Masculin",
    "positionTitle": "Ingénieur Front-End Senior (React / TypeScript)",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1978-06-28",
    "hireDate": "2019-02-13",
    "address": "Abidjan, Marcory Zone 4C",
    "cnpsNumber": "CNPS-60806024",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 84987658854 25",
    "childrenCount": 0,
    "annualLeaveBalance": 23,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-002-s1",
        "skillName": "Développement Front-End (React, Vue, Angular)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-002-s2",
        "skillName": "UI/UX Design",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-002-s3",
        "skillName": "Tests & QA (Cypress, Selenium, Jest)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-002-s4",
        "skillName": "Résolution de Problèmes",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-002-s5",
        "skillName": "Anglais (Technique)",
        "proficiencyLevel": "Avancé",
        "category": "Langues"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-002-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-6925",
        "assignedDate": "2019-02-13"
      },
      {
        "id": "eq-emp-002-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-1750",
        "assignedDate": "2019-02-13"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-003",
    "matricule": "EMP-2023-003",
    "firstName": "Grâce",
    "lastName": "Diarra",
    "name": "Grâce Diarra",
    "email": "grâce.diarra@sii-ci.com",
    "phone": "+225 05 68 91 56 30",
    "gender": "Féminin",
    "positionTitle": "Ingénieur Back-End Senior (Java / Spring Boot)",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1996-05-23",
    "hireDate": "2021-06-07",
    "address": "Abidjan, Cocody Ambassades",
    "cnpsNumber": "CNPS-95225343",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 21373225387 87",
    "childrenCount": 1,
    "annualLeaveBalance": 21,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-003-s1",
        "skillName": "Développement Back-End (Node.js, Java, Python, C#)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-003-s2",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-003-s3",
        "skillName": "Architecture Logicielle",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-003-s4",
        "skillName": "Résolution de Problèmes",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-003-s5",
        "skillName": "Anglais (Technique)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Langues"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-003-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-7216",
        "assignedDate": "2021-06-07"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-004",
    "matricule": "EMP-2023-004",
    "firstName": "Cheick",
    "lastName": "Mensah",
    "name": "Cheick Mensah",
    "email": "cheick.mensah@sii-ci.com",
    "phone": "+225 05 44 18 37 82",
    "gender": "Masculin",
    "positionTitle": "Développeur Python & Microservices",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1995-08-13",
    "hireDate": "2024-06-07",
    "address": "Abidjan, Cocody Ambassades",
    "cnpsNumber": "CNPS-28740864",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 29150622889 43",
    "childrenCount": 1,
    "annualLeaveBalance": 22,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-004-s1",
        "skillName": "Développement Back-End (Node.js, Java, Python, C#)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-004-s2",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-004-s3",
        "skillName": "DevOps (Docker, Kubernetes, Jenkins, GitLab CI)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-004-s4",
        "skillName": "Résolution de Problèmes",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-004-s5",
        "skillName": "Autonomie",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-004-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-7543",
        "assignedDate": "2024-06-07"
      }
    ],
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-005",
    "matricule": "EMP-2023-005",
    "firstName": "Habiba",
    "lastName": "Bakayoko",
    "name": "Habiba Bakayoko",
    "email": "habiba.bakayoko@sii-ci.com",
    "phone": "+225 01 30 97 64 86",
    "gender": "Féminin",
    "positionTitle": "Développeur Mobile iOS (Swift)",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1994-08-17",
    "hireDate": "2019-07-13",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-82070937",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 25980378553 97",
    "childrenCount": 2,
    "annualLeaveBalance": 24,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-005-s1",
        "skillName": "Développement Mobile (iOS, Android, React Native, Flutter)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-005-s2",
        "skillName": "UI/UX Design",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-005-s3",
        "skillName": "Tests & QA (Cypress, Selenium, Jest)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-005-s4",
        "skillName": "Créativité / Innovation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-005-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-8123",
        "assignedDate": "2019-07-13"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-006",
    "matricule": "EMP-2023-006",
    "firstName": "Ismaël",
    "lastName": "Traoré",
    "name": "Ismaël Traoré",
    "email": "ismael.traore@sii-ci.com",
    "phone": "+225 01 48 91 74 87",
    "gender": "Masculin",
    "positionTitle": "Développeur Mobile Android (Kotlin / Flutter)",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1999-03-18",
    "hireDate": "2020-03-12",
    "address": "Abidjan, Cocody Danga",
    "cnpsNumber": "CNPS-53507489",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 13944899549 86",
    "childrenCount": 4,
    "annualLeaveBalance": 14,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-006-s1",
        "skillName": "Développement Mobile (iOS, Android, React Native, Flutter)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-006-s2",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-006-s3",
        "skillName": "UI/UX Design",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-006-s4",
        "skillName": "Esprit d'Équipe",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-006-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-6038",
        "assignedDate": "2020-03-12"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-007",
    "matricule": "EMP-2023-007",
    "firstName": "Hortense",
    "lastName": "Diabaté",
    "name": "Hortense Diabaté",
    "email": "hortense.diabate@sii-ci.com",
    "phone": "+225 01 26 26 94 70",
    "gender": "Féminin",
    "positionTitle": "Architecte Cloud & Infrastructure (AWS / Azure)",
    "role": "Manager",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1991-10-14",
    "hireDate": "2023-03-09",
    "address": "Abidjan, Cocody Angré 8e Tranche",
    "cnpsNumber": "CNPS-63551839",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 38732762716 49",
    "childrenCount": 2,
    "annualLeaveBalance": 28,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Malienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-007-s1",
        "skillName": "Cloud Computing (AWS, Azure, Google Cloud)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-007-s2",
        "skillName": "Architecture Logicielle",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-007-s3",
        "skillName": "DevOps (Docker, Kubernetes, Jenkins, GitLab CI)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-007-s4",
        "skillName": "Gestion des Risques",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-007-s5",
        "skillName": "Planification Stratégique",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-007-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-2982",
        "assignedDate": "2023-03-09"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-008",
    "matricule": "EMP-2023-008",
    "firstName": "Losseni",
    "lastName": "Soro",
    "name": "Losseni Soro",
    "email": "losseni.soro@sii-ci.com",
    "phone": "+225 01 38 10 19 90",
    "gender": "Masculin",
    "positionTitle": "Ingénieur DevOps & CI/CD (Kubernetes)",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1976-06-03",
    "hireDate": "2019-04-03",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-27758595",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 37854643175 79",
    "childrenCount": 4,
    "annualLeaveBalance": 21,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Togolaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-008-s1",
        "skillName": "DevOps (Docker, Kubernetes, Jenkins, GitLab CI)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-008-s2",
        "skillName": "Cloud Computing (AWS, Azure, Google Cloud)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-008-s3",
        "skillName": "Administration Système (Linux, Windows Server)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-008-s4",
        "skillName": "Réseaux et Télécoms",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-008-s5",
        "skillName": "Autonomie",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-008-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-7669",
        "assignedDate": "2019-04-03"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-009",
    "matricule": "EMP-2023-009",
    "firstName": "Christelle",
    "lastName": "Assi",
    "name": "Christelle Assi",
    "email": "christelle.assi@sii-ci.com",
    "phone": "+225 01 16 96 93 92",
    "gender": "Féminin",
    "positionTitle": "Ingénieur SRE (Site Reliability Engineer)",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1998-06-26",
    "hireDate": "2019-01-13",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-81979055",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 36837774596 34",
    "childrenCount": 4,
    "annualLeaveBalance": 18,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Burkinabé",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-009-s1",
        "skillName": "Cloud Computing (AWS, Azure, Google Cloud)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-009-s2",
        "skillName": "Administration Système (Linux, Windows Server)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-009-s3",
        "skillName": "DevOps (Docker, Kubernetes, Jenkins, GitLab CI)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-009-s4",
        "skillName": "Gestion du Stress",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-009-s5",
        "skillName": "Résolution de Problèmes",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-009-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-5563",
        "assignedDate": "2019-01-13"
      },
      {
        "id": "eq-emp-009-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-8260",
        "assignedDate": "2019-01-13"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "High",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-010",
    "matricule": "EMP-2023-010",
    "firstName": "Amara",
    "lastName": "Bamba",
    "name": "Amara Bamba",
    "email": "amara.bamba@sii-ci.com",
    "phone": "+225 07 31 62 72 71",
    "gender": "Masculin",
    "positionTitle": "Administrateur Systèmes & Réseaux (Linux)",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1980-07-01",
    "hireDate": "2020-07-02",
    "address": "Abidjan, Marcory Résidentiel",
    "cnpsNumber": "CNPS-66775103",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 73501647053 46",
    "childrenCount": 4,
    "annualLeaveBalance": 18,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-010-s1",
        "skillName": "Administration Système (Linux, Windows Server)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-010-s2",
        "skillName": "Réseaux et Télécoms",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-010-s3",
        "skillName": "Support IT / Helpdesk",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-010-s4",
        "skillName": "Cybersécurité",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-010-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-4566",
        "assignedDate": "2020-07-02"
      },
      {
        "id": "eq-emp-010-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-6138",
        "assignedDate": "2020-07-02"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-011",
    "matricule": "EMP-2023-011",
    "firstName": "Irène",
    "lastName": "Brou",
    "name": "Irène Brou",
    "email": "irene.brou@sii-ci.com",
    "phone": "+225 07 17 75 20 33",
    "gender": "Féminin",
    "positionTitle": "Ingénieur Télécoms & Réseaux d'Entreprise",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1996-04-13",
    "hireDate": "2019-10-03",
    "address": "Abidjan, Cocody Riviera Palmeraie",
    "cnpsNumber": "CNPS-15334035",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 88366898196 86",
    "childrenCount": 0,
    "annualLeaveBalance": 27,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-011-s1",
        "skillName": "Réseaux et Télécoms",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-011-s2",
        "skillName": "Administration Système (Linux, Windows Server)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-011-s3",
        "skillName": "Cybersécurité",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-011-s4",
        "skillName": "Gestion de Projet (Classique)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Management & Gestion de Projet"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-011-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-9565",
        "assignedDate": "2019-10-03"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "High",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-012",
    "matricule": "EMP-2023-012",
    "firstName": "Vincent",
    "lastName": "Diop",
    "name": "Vincent Diop",
    "email": "vincent.diop@sii-ci.com",
    "phone": "+225 05 60 26 95 92",
    "gender": "Masculin",
    "positionTitle": "Développeur Fullstack Junior (Vue.js / PHP)",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1999-02-01",
    "hireDate": "2021-08-11",
    "address": "Abidjan, Koumassi Remblais",
    "cnpsNumber": "CNPS-19832887",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 91597740482 22",
    "childrenCount": 1,
    "annualLeaveBalance": 30,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Sénégalaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-012-s1",
        "skillName": "Développement Front-End (React, Vue, Angular)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-012-s2",
        "skillName": "Développement Back-End (Node.js, Java, Python, C#)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-012-s3",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-012-s4",
        "skillName": "Adaptabilité / Flexibilité",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-012-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-6718",
        "assignedDate": "2021-08-11"
      },
      {
        "id": "eq-emp-012-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-7054",
        "assignedDate": "2021-08-11"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-013",
    "matricule": "EMP-2023-013",
    "firstName": "Aminata",
    "lastName": "Barry",
    "name": "Aminata Barry",
    "email": "aminata.barry@sii-ci.com",
    "phone": "+225 01 93 77 11 95",
    "gender": "Féminin",
    "positionTitle": "Ingénieur QA Automatisation & Tests",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1996-02-05",
    "hireDate": "2025-09-10",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-30863865",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 26706188887 80",
    "childrenCount": 2,
    "annualLeaveBalance": 23,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-013-s1",
        "skillName": "Tests & QA (Cypress, Selenium, Jest)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-013-s2",
        "skillName": "Développement Front-End (React, Vue, Angular)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-013-s3",
        "skillName": "DevOps (Docker, Kubernetes, Jenkins, GitLab CI)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-013-s4",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-013-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-6617",
        "assignedDate": "2025-09-10"
      }
    ],
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-014",
    "matricule": "EMP-2023-014",
    "firstName": "Fodé",
    "lastName": "Koné",
    "name": "Fodé Koné",
    "email": "fode.kone@sii-ci.com",
    "phone": "+225 05 45 15 10 52",
    "gender": "Masculin",
    "positionTitle": "Testeur QA Fonctionnel & Recette Métier",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1983-03-24",
    "hireDate": "2025-03-21",
    "address": "Abidjan, Koumassi Remblais",
    "cnpsNumber": "CNPS-11297845",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 68865393468 81",
    "childrenCount": 0,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-014-s1",
        "skillName": "Tests & QA (Cypress, Selenium, Jest)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-014-s2",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-014-s3",
        "skillName": "Esprit Critique",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-014-s4",
        "skillName": "Écoute Active",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-014-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-1590",
        "assignedDate": "2025-03-21"
      },
      {
        "id": "eq-emp-014-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-8041",
        "assignedDate": "2025-03-21"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-015",
    "matricule": "EMP-2023-015",
    "firstName": "Chantal",
    "lastName": "Sylla",
    "name": "Chantal Sylla",
    "email": "chantal.sylla@sii-ci.com",
    "phone": "+225 07 97 41 95 23",
    "gender": "Féminin",
    "positionTitle": "UI/UX Designer Senior & Design System",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1988-10-24",
    "hireDate": "2021-09-28",
    "address": "Abidjan, Cocody Riviera Golf",
    "cnpsNumber": "CNPS-65337219",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 35188289684 32",
    "childrenCount": 0,
    "annualLeaveBalance": 19,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-015-s1",
        "skillName": "UI/UX Design",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-015-s2",
        "skillName": "Design Thinking",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-015-s3",
        "skillName": "Créativité / Innovation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-015-s4",
        "skillName": "Développement Front-End (React, Vue, Angular)",
        "proficiencyLevel": "Débutant",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-015-s5",
        "skillName": "Empathie",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-015-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-7745",
        "assignedDate": "2021-09-28"
      },
      {
        "id": "eq-emp-015-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-5371",
        "assignedDate": "2021-09-28"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-016",
    "matricule": "EMP-2023-016",
    "firstName": "Guillaume",
    "lastName": "Soro",
    "name": "Guillaume Soro",
    "email": "guillaume.soro@sii-ci.com",
    "phone": "+225 07 68 54 49 39",
    "gender": "Masculin",
    "positionTitle": "UI/UX Designer & Ergonome Mobile",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1981-07-11",
    "hireDate": "2020-01-22",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-96098221",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 47681150998 54",
    "childrenCount": 3,
    "annualLeaveBalance": 24,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-016-s1",
        "skillName": "UI/UX Design",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-016-s2",
        "skillName": "Design Thinking",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-016-s3",
        "skillName": "Créativité / Innovation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-016-s4",
        "skillName": "Développement Mobile (iOS, Android, React Native, Flutter)",
        "proficiencyLevel": "Débutant",
        "category": "Informatique & Tech (IT)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-016-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-5279",
        "assignedDate": "2020-01-22"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-017",
    "matricule": "EMP-2023-017",
    "firstName": "Dorothée",
    "lastName": "Sylla",
    "name": "Dorothée Sylla",
    "email": "dorothee.sylla@sii-ci.com",
    "phone": "+225 01 50 65 87 75",
    "gender": "Féminin",
    "positionTitle": "Technicien Support Informatique N2",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1981-05-02",
    "hireDate": "2019-07-19",
    "address": "Abidjan, Bingerville Fehi Kessé",
    "cnpsNumber": "CNPS-36445607",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 78726740707 78",
    "childrenCount": 2,
    "annualLeaveBalance": 27,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-017-s1",
        "skillName": "Support IT / Helpdesk",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-017-s2",
        "skillName": "Administration Système (Linux, Windows Server)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-017-s3",
        "skillName": "Écoute Active",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-017-s4",
        "skillName": "Résolution de Problèmes",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-017-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-6409",
        "assignedDate": "2019-07-19"
      },
      {
        "id": "eq-emp-017-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-5920",
        "assignedDate": "2019-07-19"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-018",
    "matricule": "EMP-2023-018",
    "firstName": "Yves",
    "lastName": "Camara",
    "name": "Yves Camara",
    "email": "yves.camara@sii-ci.com",
    "phone": "+225 01 26 34 63 95",
    "gender": "Masculin",
    "positionTitle": "Gestionnaire Helpdesk & Parc Informatique",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1980-10-19",
    "hireDate": "2022-11-24",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-38210242",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 48656449163 46",
    "childrenCount": 3,
    "annualLeaveBalance": 24,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Togolaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-018-s1",
        "skillName": "Support IT / Helpdesk",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-018-s2",
        "skillName": "Gestion des Stocks",
        "proficiencyLevel": "Intermédiaire",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-018-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-018-s4",
        "skillName": "Service Client / SAV",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-018-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-8244",
        "assignedDate": "2022-11-24"
      },
      {
        "id": "eq-emp-018-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-3780",
        "assignedDate": "2022-11-24"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-019",
    "matricule": "EMP-2023-019",
    "firstName": "Raïssa",
    "lastName": "Doumbia",
    "name": "Raïssa Doumbia",
    "email": "raissa.doumbia@sii-ci.com",
    "phone": "+225 05 21 40 96 49",
    "gender": "Féminin",
    "positionTitle": "Intégrateur Web & Accessibilité Numérique",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1975-01-08",
    "hireDate": "2020-04-05",
    "address": "Abidjan, Koumassi Remblais",
    "cnpsNumber": "CNPS-94525678",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 70442337008 63",
    "childrenCount": 1,
    "annualLeaveBalance": 26,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Togolaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-019-s1",
        "skillName": "Développement Front-End (React, Vue, Angular)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-019-s2",
        "skillName": "UI/UX Design",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-019-s3",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-019-s4",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-019-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-4997",
        "assignedDate": "2020-04-05"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-020",
    "matricule": "EMP-2023-020",
    "firstName": "Lassina",
    "lastName": "Bahi",
    "name": "Lassina Bahi",
    "email": "lassina.bahi@sii-ci.com",
    "phone": "+225 01 69 16 81 41",
    "gender": "Masculin",
    "positionTitle": "Développeur API & Intégrations Middleware",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1979-08-22",
    "hireDate": "2025-02-15",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-92228802",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 55507121189 66",
    "childrenCount": 3,
    "annualLeaveBalance": 28,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-020-s1",
        "skillName": "Développement Back-End (Node.js, Java, Python, C#)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-020-s2",
        "skillName": "Architecture Logicielle",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-020-s3",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-020-s4",
        "skillName": "Autonomie",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-020-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-8777",
        "assignedDate": "2025-02-15"
      },
      {
        "id": "eq-emp-020-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-5543",
        "assignedDate": "2025-02-15"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-021",
    "matricule": "EMP-2023-021",
    "firstName": "Esther",
    "lastName": "Dje",
    "name": "Esther Dje",
    "email": "esther.dje@sii-ci.com",
    "phone": "+225 05 40 44 52 50",
    "gender": "Féminin",
    "positionTitle": "Architecte Logiciel Senior",
    "role": "Manager",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1979-04-13",
    "hireDate": "2023-02-05",
    "address": "Abidjan, Bingerville Fehi Kessé",
    "cnpsNumber": "CNPS-65682626",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 38803850894 18",
    "childrenCount": 3,
    "annualLeaveBalance": 24,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Malienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-021-s1",
        "skillName": "Architecture Logicielle",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-021-s2",
        "skillName": "Développement Back-End (Node.js, Java, Python, C#)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-021-s3",
        "skillName": "Cloud Computing (AWS, Azure, Google Cloud)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-021-s4",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-021-s5",
        "skillName": "Prise de Décision",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-021-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-7812",
        "assignedDate": "2023-02-05"
      }
    ],
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-022",
    "matricule": "EMP-2023-022",
    "firstName": "Bakary",
    "lastName": "N'Zi",
    "name": "Bakary N'Zi",
    "email": "bakary.nzi@sii-ci.com",
    "phone": "+225 01 58 71 10 55",
    "gender": "Masculin",
    "positionTitle": "Ingénieur DBA (PostgreSQL & Oracle)",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1988-09-24",
    "hireDate": "2021-07-28",
    "address": "Abidjan, Bingerville Fehi Kessé",
    "cnpsNumber": "CNPS-75529051",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 95039786243 38",
    "childrenCount": 1,
    "annualLeaveBalance": 22,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Burkinabé",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-022-s1",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-022-s2",
        "skillName": "Administration Système (Linux, Windows Server)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-022-s3",
        "skillName": "Gestion des Risques",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-022-s4",
        "skillName": "Résolution de Problèmes",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-022-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-1475",
        "assignedDate": "2021-07-28"
      }
    ],
    "potential": "Low",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-023",
    "matricule": "EMP-2023-023",
    "firstName": "Prisca",
    "lastName": "Kra",
    "name": "Prisca Kra",
    "email": "prisca.kra@sii-ci.com",
    "phone": "+225 07 60 85 82 94",
    "gender": "Féminin",
    "positionTitle": "Scrum Master & Facilitateur Agile",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1988-03-28",
    "hireDate": "2019-02-21",
    "address": "Abidjan, Koumassi Remblais",
    "cnpsNumber": "CNPS-53936531",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 44575709227 58",
    "childrenCount": 1,
    "annualLeaveBalance": 28,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-023-s1",
        "skillName": "Méthodes Agiles (Scrum, Kanban)",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-023-s2",
        "skillName": "Conduite du Changement",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-023-s3",
        "skillName": "Intelligence Émotionnelle",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-023-s4",
        "skillName": "Gestion des Conflits",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-023-s5",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-023-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-7211",
        "assignedDate": "2019-02-21"
      }
    ],
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-024",
    "matricule": "EMP-2023-024",
    "firstName": "Bakary",
    "lastName": "Yapi",
    "name": "Bakary Yapi",
    "email": "bakary.yapi@sii-ci.com",
    "phone": "+225 01 16 54 38 93",
    "gender": "Masculin",
    "positionTitle": "Product Owner Plateforme Digitale",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1999-01-08",
    "hireDate": "2019-11-02",
    "address": "Abidjan, Cocody Angré 8e Tranche",
    "cnpsNumber": "CNPS-42016960",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 91691910134 29",
    "childrenCount": 1,
    "annualLeaveBalance": 29,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-024-s1",
        "skillName": "Méthodes Agiles (Scrum, Kanban)",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-024-s2",
        "skillName": "Gestion de Projet (Classique)",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-024-s3",
        "skillName": "Suivi des KPI / OKR",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-024-s4",
        "skillName": "Design Thinking",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-024-s5",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-024-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-4571",
        "assignedDate": "2019-11-02"
      },
      {
        "id": "eq-emp-024-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-7043",
        "assignedDate": "2019-11-02"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-025",
    "matricule": "EMP-2023-025",
    "firstName": "Grâce",
    "lastName": "Gnamien",
    "name": "Grâce Gnamien",
    "email": "grâce.gnamien@sii-ci.com",
    "phone": "+225 07 49 83 96 58",
    "gender": "Féminin",
    "positionTitle": "Chef de Projet SI & Transformation Digitale",
    "role": "Manager",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1977-10-23",
    "hireDate": "2022-12-07",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-50477742",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 23927932049 99",
    "childrenCount": 0,
    "annualLeaveBalance": 15,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-025-s1",
        "skillName": "Gestion de Projet (Classique)",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-025-s2",
        "skillName": "Planification Stratégique",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-025-s3",
        "skillName": "Gestion de Budget",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-025-s4",
        "skillName": "Leadership",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-025-s5",
        "skillName": "Suivi des KPI / OKR",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-025-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-8018",
        "assignedDate": "2022-12-07"
      },
      {
        "id": "eq-emp-025-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-9289",
        "assignedDate": "2022-12-07"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-026",
    "matricule": "EMP-2023-026",
    "firstName": "Gilles",
    "lastName": "Gbané",
    "name": "Gilles Gbané",
    "email": "gilles.gbane@sii-ci.com",
    "phone": "+225 05 91 68 29 65",
    "gender": "Masculin",
    "positionTitle": "Développeur C# / .NET Core",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1995-05-20",
    "hireDate": "2020-12-17",
    "address": "Abidjan, Cocody Danga",
    "cnpsNumber": "CNPS-68461818",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 77751569123 69",
    "childrenCount": 2,
    "annualLeaveBalance": 24,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-026-s1",
        "skillName": "Développement Back-End (Node.js, Java, Python, C#)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-026-s2",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-026-s3",
        "skillName": "Architecture Logicielle",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-026-s4",
        "skillName": "Autonomie",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-026-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-2419",
        "assignedDate": "2020-12-17"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-027",
    "matricule": "EMP-2023-027",
    "firstName": "Prisca",
    "lastName": "Doffou",
    "name": "Prisca Doffou",
    "email": "prisca.doffou@sii-ci.com",
    "phone": "+225 05 53 13 73 51",
    "gender": "Féminin",
    "positionTitle": "Développeur Go & Microservices Haute Performance",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1986-05-11",
    "hireDate": "2020-08-07",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-79340535",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 84201008529 11",
    "childrenCount": 1,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-027-s1",
        "skillName": "Développement Back-End (Node.js, Java, Python, C#)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-027-s2",
        "skillName": "DevOps (Docker, Kubernetes, Jenkins, GitLab CI)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-027-s3",
        "skillName": "Architecture Logicielle",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-027-s4",
        "skillName": "Résolution de Problèmes",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-027-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-7658",
        "assignedDate": "2020-08-07"
      },
      {
        "id": "eq-emp-027-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-8800",
        "assignedDate": "2020-08-07"
      }
    ],
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-028",
    "matricule": "EMP-2023-028",
    "firstName": "Tidiane",
    "lastName": "Soro",
    "name": "Tidiane Soro",
    "email": "tidiane.soro@sii-ci.com",
    "phone": "+225 05 98 41 49 94",
    "gender": "Masculin",
    "positionTitle": "Développeur Angular & Architecture SPA",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1992-09-12",
    "hireDate": "2023-06-16",
    "address": "Abidjan, Marcory Résidentiel",
    "cnpsNumber": "CNPS-70900658",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 55313573453 55",
    "childrenCount": 2,
    "annualLeaveBalance": 23,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Sénégalaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-028-s1",
        "skillName": "Développement Front-End (React, Vue, Angular)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-028-s2",
        "skillName": "Tests & QA (Cypress, Selenium, Jest)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-028-s3",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-028-s4",
        "skillName": "Esprit d'Équipe",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-028-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-2976",
        "assignedDate": "2023-06-16"
      },
      {
        "id": "eq-emp-028-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-2958",
        "assignedDate": "2023-06-16"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-029",
    "matricule": "EMP-2023-029",
    "firstName": "Gisèle",
    "lastName": "Keita",
    "name": "Gisèle Keita",
    "email": "gisele.keita@sii-ci.com",
    "phone": "+225 01 85 77 86 46",
    "gender": "Féminin",
    "positionTitle": "Ingénieur Performance & Optimisation Web",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1982-06-06",
    "hireDate": "2019-04-10",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-46817443",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 86055360270 26",
    "childrenCount": 0,
    "annualLeaveBalance": 15,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Malienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-029-s1",
        "skillName": "Développement Front-End (React, Vue, Angular)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-029-s2",
        "skillName": "Cloud Computing (AWS, Azure, Google Cloud)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-029-s3",
        "skillName": "Architecture Logicielle",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-029-s4",
        "skillName": "Esprit Critique",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-029-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-3068",
        "assignedDate": "2019-04-10"
      },
      {
        "id": "eq-emp-029-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-2680",
        "assignedDate": "2019-04-10"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-030",
    "matricule": "EMP-2023-030",
    "firstName": "Elhadj",
    "lastName": "Sow",
    "name": "Elhadj Sow",
    "email": "elhadj.sow@sii-ci.com",
    "phone": "+225 07 16 42 71 24",
    "gender": "Masculin",
    "positionTitle": "Spécialiste Intégration ERP & CRM",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1990-02-19",
    "hireDate": "2025-02-13",
    "address": "Abidjan, Yopougon Maroc",
    "cnpsNumber": "CNPS-85543051",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 27410118401 29",
    "childrenCount": 2,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-030-s1",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-030-s2",
        "skillName": "Gestion de la Relation Client (CRM)",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-030-s3",
        "skillName": "Gestion de Projet (Classique)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-030-s4",
        "skillName": "Écoute Active",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-030-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-7818",
        "assignedDate": "2025-02-13"
      },
      {
        "id": "eq-emp-030-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-9561",
        "assignedDate": "2025-02-13"
      }
    ],
    "potential": "Low",
    "performance": "Low",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-031",
    "matricule": "EMP-2023-031",
    "firstName": "Nafissatou",
    "lastName": "Gbané",
    "name": "Nafissatou Gbané",
    "email": "nafissatou.gbane@sii-ci.com",
    "phone": "+225 05 82 89 17 88",
    "gender": "Féminin",
    "positionTitle": "Responsable Infrastructure & Datacenter",
    "role": "Manager",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1981-11-07",
    "hireDate": "2024-02-25",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-33328859",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 31823534004 40",
    "childrenCount": 0,
    "annualLeaveBalance": 19,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-031-s1",
        "skillName": "Administration Système (Linux, Windows Server)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-031-s2",
        "skillName": "Réseaux et Télécoms",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-031-s3",
        "skillName": "Gestion des Risques",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-031-s4",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-031-s5",
        "skillName": "Gestion de Budget",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-031-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-8381",
        "assignedDate": "2024-02-25"
      },
      {
        "id": "eq-emp-031-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-5771",
        "assignedDate": "2024-02-25"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-032",
    "matricule": "EMP-2023-032",
    "firstName": "Tidiane",
    "lastName": "Bahi",
    "name": "Tidiane Bahi",
    "email": "tidiane.bahi@sii-ci.com",
    "phone": "+225 05 19 97 39 43",
    "gender": "Masculin",
    "positionTitle": "Ingénieur Virtualisation & Stockage",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1996-04-14",
    "hireDate": "2025-11-19",
    "address": "Abidjan, Cocody Riviera Palmeraie",
    "cnpsNumber": "CNPS-45652586",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 96864895142 29",
    "childrenCount": 1,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-032-s1",
        "skillName": "Cloud Computing (AWS, Azure, Google Cloud)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-032-s2",
        "skillName": "Administration Système (Linux, Windows Server)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-032-s3",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-032-s4",
        "skillName": "Autonomie",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-032-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-6039",
        "assignedDate": "2025-11-19"
      },
      {
        "id": "eq-emp-032-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-8195",
        "assignedDate": "2025-11-19"
      }
    ],
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "High",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-033",
    "matricule": "EMP-2023-033",
    "firstName": "Yaoua",
    "lastName": "Sanogo",
    "name": "Yaoua Sanogo",
    "email": "yaoua.sanogo@sii-ci.com",
    "phone": "+225 05 74 79 73 66",
    "gender": "Féminin",
    "positionTitle": "Administrateur Outils Collaboratifs & Office 365",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1988-12-11",
    "hireDate": "2019-10-02",
    "address": "Abidjan, Yopougon Niangon Sud",
    "cnpsNumber": "CNPS-87201917",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 18701023473 39",
    "childrenCount": 0,
    "annualLeaveBalance": 22,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-033-s1",
        "skillName": "Support IT / Helpdesk",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-033-s2",
        "skillName": "Administration Système (Linux, Windows Server)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-033-s3",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-033-s4",
        "skillName": "Service Client / SAV",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-033-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-3870",
        "assignedDate": "2019-10-02"
      },
      {
        "id": "eq-emp-033-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-5557",
        "assignedDate": "2019-10-02"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-034",
    "matricule": "EMP-2023-034",
    "firstName": "Fodé",
    "lastName": "Tanoh",
    "name": "Fodé Tanoh",
    "email": "fode.tanoh@sii-ci.com",
    "phone": "+225 05 62 52 51 95",
    "gender": "Masculin",
    "positionTitle": "Développeur Fullstack React / Python",
    "role": "Employee",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1988-12-16",
    "hireDate": "2019-03-11",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-14925405",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 65599182910 80",
    "childrenCount": 4,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-034-s1",
        "skillName": "Développement Front-End (React, Vue, Angular)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-034-s2",
        "skillName": "Développement Back-End (Node.js, Java, Python, C#)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-034-s3",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-034-s4",
        "skillName": "Esprit d'Équipe",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-034-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-6296",
        "assignedDate": "2019-03-11"
      }
    ],
    "potential": "Low",
    "performance": "High",
    "flightRisk": "High",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-035",
    "matricule": "EMP-2023-035",
    "firstName": "Florence",
    "lastName": "Dosso",
    "name": "Florence Dosso",
    "email": "florence.dosso@sii-ci.com",
    "phone": "+225 07 34 76 56 89",
    "gender": "Féminin",
    "positionTitle": "Directeur des Systèmes d'Information (DSI)",
    "role": "Administrator",
    "department": "Informatique & Systèmes d'Information",
    "status": "ACTIVE",
    "birthDate": "1989-01-07",
    "hireDate": "2025-08-21",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-75056916",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 71366617919 99",
    "childrenCount": 0,
    "annualLeaveBalance": 14,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Informatique",
      "positionTitle": "Directeur Informatique & Systèmes d'Information"
    },
    "skills": [
      {
        "id": "emp-035-s1",
        "skillName": "Planification Stratégique",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-035-s2",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-035-s3",
        "skillName": "Gestion de Budget",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-035-s4",
        "skillName": "Architecture Logicielle",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-035-s5",
        "skillName": "Cybersécurité",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-035-s6",
        "skillName": "Leadership",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-035-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-4920",
        "assignedDate": "2025-08-21"
      },
      {
        "id": "eq-emp-035-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-1224",
        "assignedDate": "2025-08-21"
      }
    ],
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-036",
    "matricule": "EMP-2023-036",
    "firstName": "Fabrice",
    "lastName": "Fofana",
    "name": "Fabrice Fofana",
    "email": "fabrice.fofana@sii-ci.com",
    "phone": "+225 01 29 73 47 75",
    "gender": "Masculin",
    "positionTitle": "Lead Data Scientist (Machine Learning)",
    "role": "Manager",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1990-08-08",
    "hireDate": "2024-05-14",
    "address": "Abidjan, Koumassi Remblais",
    "cnpsNumber": "CNPS-90447099",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 62160840065 34",
    "childrenCount": 1,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Sénégalaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-036-s1",
        "skillName": "Machine Learning / IA",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-036-s2",
        "skillName": "Analyse de Données (Data Science, Big Data)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-036-s3",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-036-s4",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-036-s5",
        "skillName": "Résolution de Problèmes",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-036-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-7798",
        "assignedDate": "2024-05-14"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-037",
    "matricule": "EMP-2023-037",
    "firstName": "Ursule",
    "lastName": "Gnamien",
    "name": "Ursule Gnamien",
    "email": "ursule.gnamien@sii-ci.com",
    "phone": "+225 01 94 72 29 67",
    "gender": "Féminin",
    "positionTitle": "Ingénieur IA Générative & LLM",
    "role": "Employee",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1985-09-25",
    "hireDate": "2023-08-12",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-61401477",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 43060504030 83",
    "childrenCount": 1,
    "annualLeaveBalance": 27,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-037-s1",
        "skillName": "Machine Learning / IA",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-037-s2",
        "skillName": "Développement Back-End (Node.js, Java, Python, C#)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-037-s3",
        "skillName": "Cloud Computing (AWS, Azure, Google Cloud)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-037-s4",
        "skillName": "Créativité / Innovation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-037-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-8749",
        "assignedDate": "2023-08-12"
      },
      {
        "id": "eq-emp-037-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-7325",
        "assignedDate": "2023-08-12"
      }
    ],
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-038",
    "matricule": "EMP-2023-038",
    "firstName": "Ismaël",
    "lastName": "Gnamien",
    "name": "Ismaël Gnamien",
    "email": "ismael.gnamien@sii-ci.com",
    "phone": "+225 05 22 66 22 77",
    "gender": "Masculin",
    "positionTitle": "Data Engineer Senior (Pipelines ETL & Spark)",
    "role": "Employee",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1979-07-28",
    "hireDate": "2022-01-24",
    "address": "Abidjan, Yopougon Maroc",
    "cnpsNumber": "CNPS-55440919",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 74745894332 43",
    "childrenCount": 3,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-038-s1",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-038-s2",
        "skillName": "Analyse de Données (Data Science, Big Data)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-038-s3",
        "skillName": "Cloud Computing (AWS, Azure, Google Cloud)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-038-s4",
        "skillName": "DevOps (Docker, Kubernetes, Jenkins, GitLab CI)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-038-s5",
        "skillName": "Autonomie",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-038-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-9742",
        "assignedDate": "2022-01-24"
      }
    ],
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-039",
    "matricule": "EMP-2023-039",
    "firstName": "Prisca",
    "lastName": "Diabaté",
    "name": "Prisca Diabaté",
    "email": "prisca.diabate@sii-ci.com",
    "phone": "+225 07 90 97 46 39",
    "gender": "Féminin",
    "positionTitle": "Data Analyst Senior (Power BI & Tableau)",
    "role": "Employee",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1978-11-23",
    "hireDate": "2024-02-14",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-50193656",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 33380421346 98",
    "childrenCount": 0,
    "annualLeaveBalance": 15,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-039-s1",
        "skillName": "Analyse de Données (Data Science, Big Data)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-039-s2",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-039-s3",
        "skillName": "Suivi des KPI / OKR",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-039-s4",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-039-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-1919",
        "assignedDate": "2024-02-14"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-040",
    "matricule": "EMP-2023-040",
    "firstName": "Junior",
    "lastName": "Dosso",
    "name": "Junior Dosso",
    "email": "junior.dosso@sii-ci.com",
    "phone": "+225 01 97 33 31 32",
    "gender": "Masculin",
    "positionTitle": "Business Intelligence Manager",
    "role": "Manager",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1987-10-22",
    "hireDate": "2019-10-28",
    "address": "Abidjan, Cocody Angré 8e Tranche",
    "cnpsNumber": "CNPS-41163805",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 91229982109 28",
    "childrenCount": 4,
    "annualLeaveBalance": 22,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Togolaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-040-s1",
        "skillName": "Analyse de Données (Data Science, Big Data)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-040-s2",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-040-s3",
        "skillName": "Suivi des KPI / OKR",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-040-s4",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-040-s5",
        "skillName": "Prise de Décision",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-040-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-1153",
        "assignedDate": "2019-10-28"
      },
      {
        "id": "eq-emp-040-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-5712",
        "assignedDate": "2019-10-28"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-041",
    "matricule": "EMP-2023-041",
    "firstName": "Nafissatou",
    "lastName": "Barry",
    "name": "Nafissatou Barry",
    "email": "nafissatou.barry@sii-ci.com",
    "phone": "+225 01 64 98 42 68",
    "gender": "Féminin",
    "positionTitle": "Ingénieur Computer Vision & Deep Learning",
    "role": "Employee",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1987-08-04",
    "hireDate": "2025-05-07",
    "address": "Abidjan, Cocody Angré 8e Tranche",
    "cnpsNumber": "CNPS-49711319",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 59701029528 83",
    "childrenCount": 2,
    "annualLeaveBalance": 14,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-041-s1",
        "skillName": "Machine Learning / IA",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-041-s2",
        "skillName": "Analyse de Données (Data Science, Big Data)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-041-s3",
        "skillName": "Développement Back-End (Node.js, Java, Python, C#)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-041-s4",
        "skillName": "Résolution de Problèmes",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-041-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-5497",
        "assignedDate": "2025-05-07"
      }
    ],
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-042",
    "matricule": "EMP-2023-042",
    "firstName": "Olivier",
    "lastName": "Sylla",
    "name": "Olivier Sylla",
    "email": "olivier.sylla@sii-ci.com",
    "phone": "+225 07 91 34 89 42",
    "gender": "Masculin",
    "positionTitle": "Statisticien Modélisateur Prédictif",
    "role": "Employee",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1996-11-27",
    "hireDate": "2024-12-25",
    "address": "Abidjan, Cocody Riviera Golf",
    "cnpsNumber": "CNPS-51464269",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 98594257977 15",
    "childrenCount": 4,
    "annualLeaveBalance": 15,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-042-s1",
        "skillName": "Analyse de Données (Data Science, Big Data)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-042-s2",
        "skillName": "Machine Learning / IA",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-042-s3",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-042-s4",
        "skillName": "Esprit Critique",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-042-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-3153",
        "assignedDate": "2024-12-25"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-043",
    "matricule": "EMP-2023-043",
    "firstName": "Laetitia",
    "lastName": "N'Dri",
    "name": "Laetitia N'Dri",
    "email": "laetitia.ndri@sii-ci.com",
    "phone": "+225 07 79 56 77 74",
    "gender": "Féminin",
    "positionTitle": "Data Governance & Qualité des Données",
    "role": "Employee",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1990-05-24",
    "hireDate": "2021-03-09",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-20106509",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 26339054364 69",
    "childrenCount": 1,
    "annualLeaveBalance": 21,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-043-s1",
        "skillName": "Conformité / Compliance (RGPD, etc.)",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-043-s2",
        "skillName": "Analyse de Données (Data Science, Big Data)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-043-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-043-s4",
        "skillName": "Gestion des Risques",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-043-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-7511",
        "assignedDate": "2021-03-09"
      },
      {
        "id": "eq-emp-043-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-2479",
        "assignedDate": "2021-03-09"
      }
    ],
    "potential": "Low",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-044",
    "matricule": "EMP-2023-044",
    "firstName": "Hamed",
    "lastName": "Assi",
    "name": "Hamed Assi",
    "email": "hamed.assi@sii-ci.com",
    "phone": "+225 05 96 96 43 84",
    "gender": "Masculin",
    "positionTitle": "Analyste Churn & Fidélisation Client",
    "role": "Employee",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1978-11-08",
    "hireDate": "2022-11-12",
    "address": "Abidjan, Koumassi Remblais",
    "cnpsNumber": "CNPS-91883846",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 87065324630 51",
    "childrenCount": 1,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-044-s1",
        "skillName": "Analyse de Données (Data Science, Big Data)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-044-s2",
        "skillName": "Gestion de la Relation Client (CRM)",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-044-s3",
        "skillName": "Machine Learning / IA",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-044-s4",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-044-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-8606",
        "assignedDate": "2022-11-12"
      },
      {
        "id": "eq-emp-044-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-7689",
        "assignedDate": "2022-11-12"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-045",
    "matricule": "EMP-2023-045",
    "firstName": "Ursule",
    "lastName": "Komenan",
    "name": "Ursule Komenan",
    "email": "ursule.komenan@sii-ci.com",
    "phone": "+225 07 22 40 78 27",
    "gender": "Féminin",
    "positionTitle": "Ingénieur MLOps (Déploiement Modèles IA)",
    "role": "Employee",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1996-12-23",
    "hireDate": "2022-08-12",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-97902129",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 30300588783 63",
    "childrenCount": 0,
    "annualLeaveBalance": 29,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-045-s1",
        "skillName": "Machine Learning / IA",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-045-s2",
        "skillName": "DevOps (Docker, Kubernetes, Jenkins, GitLab CI)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-045-s3",
        "skillName": "Cloud Computing (AWS, Azure, Google Cloud)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-045-s4",
        "skillName": "Autonomie",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-045-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-5583",
        "assignedDate": "2022-08-12"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-046",
    "matricule": "EMP-2023-046",
    "firstName": "Pascal",
    "lastName": "Kane",
    "name": "Pascal Kane",
    "email": "pascal.kane@sii-ci.com",
    "phone": "+225 07 97 57 79 92",
    "gender": "Masculin",
    "positionTitle": "Architecte Données d'Entreprise",
    "role": "Manager",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1983-04-04",
    "hireDate": "2021-01-13",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-38468360",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 20542930840 94",
    "childrenCount": 0,
    "annualLeaveBalance": 15,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-046-s1",
        "skillName": "Architecture Logicielle",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-046-s2",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-046-s3",
        "skillName": "Cloud Computing (AWS, Azure, Google Cloud)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-046-s4",
        "skillName": "Planification Stratégique",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-046-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-3063",
        "assignedDate": "2021-01-13"
      },
      {
        "id": "eq-emp-046-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-2124",
        "assignedDate": "2021-01-13"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-047",
    "matricule": "EMP-2023-047",
    "firstName": "Emmanuelle",
    "lastName": "Bakayoko",
    "name": "Emmanuelle Bakayoko",
    "email": "emmanuelle.bakayoko@sii-ci.com",
    "phone": "+225 01 10 45 28 26",
    "gender": "Féminin",
    "positionTitle": "Analyste Big Data & Streaming (Kafka)",
    "role": "Employee",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1980-02-22",
    "hireDate": "2023-05-26",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-41934639",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 10566090561 55",
    "childrenCount": 2,
    "annualLeaveBalance": 14,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-047-s1",
        "skillName": "Analyse de Données (Data Science, Big Data)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-047-s2",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-047-s3",
        "skillName": "Développement Back-End (Node.js, Java, Python, C#)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-047-s4",
        "skillName": "Résolution de Problèmes",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-047-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-1858",
        "assignedDate": "2023-05-26"
      }
    ],
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-048",
    "matricule": "EMP-2023-048",
    "firstName": "Guillaume",
    "lastName": "Kouamé",
    "name": "Guillaume Kouamé",
    "email": "guillaume.kouame@sii-ci.com",
    "phone": "+225 05 75 85 23 67",
    "gender": "Masculin",
    "positionTitle": "Data Analyst RH & People Analytics",
    "role": "Employee",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1976-12-26",
    "hireDate": "2023-04-20",
    "address": "Abidjan, Cocody Ambassades",
    "cnpsNumber": "CNPS-71477426",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 81549443894 48",
    "childrenCount": 0,
    "annualLeaveBalance": 15,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Togolaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-048-s1",
        "skillName": "Analyse de Données (Data Science, Big Data)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-048-s2",
        "skillName": "GPEC (Gestion Prévisionnelle des Emplois et Compétences)",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-048-s3",
        "skillName": "Qualité de Vie au Travail (QVT)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-048-s4",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-048-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-7580",
        "assignedDate": "2023-04-20"
      },
      {
        "id": "eq-emp-048-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-9032",
        "assignedDate": "2023-04-20"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-049",
    "matricule": "EMP-2023-049",
    "firstName": "Ornella",
    "lastName": "Bakayoko",
    "name": "Ornella Bakayoko",
    "email": "ornella.bakayoko@sii-ci.com",
    "phone": "+225 07 26 45 89 91",
    "gender": "Féminin",
    "positionTitle": "Data Analyst Marketing & Web Analytics",
    "role": "Employee",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1985-07-20",
    "hireDate": "2023-09-23",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-67740376",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 80668169619 87",
    "childrenCount": 0,
    "annualLeaveBalance": 17,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-049-s1",
        "skillName": "Analyse de Données Marketing (Google Analytics)",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-049-s2",
        "skillName": "Analyse de Données (Data Science, Big Data)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-049-s3",
        "skillName": "Marketing Digital",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-049-s4",
        "skillName": "SEO / SEA",
        "proficiencyLevel": "Intermédiaire",
        "category": "Vente, Marketing & Commerce"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-049-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-4522",
        "assignedDate": "2023-09-23"
      },
      {
        "id": "eq-emp-049-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-7779",
        "assignedDate": "2023-09-23"
      }
    ],
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-050",
    "matricule": "EMP-2023-050",
    "firstName": "Benoît",
    "lastName": "Traoré",
    "name": "Benoît Traoré",
    "email": "benoit.traore@sii-ci.com",
    "phone": "+225 05 64 50 95 42",
    "gender": "Masculin",
    "positionTitle": "Prompt Engineer & Formateur IA",
    "role": "Employee",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1990-02-03",
    "hireDate": "2021-03-22",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-60015814",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 66234995073 22",
    "childrenCount": 1,
    "annualLeaveBalance": 15,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-050-s1",
        "skillName": "Machine Learning / IA",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-050-s2",
        "skillName": "Créativité / Innovation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-050-s3",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-050-s4",
        "skillName": "Pédagogie / Écoute Active",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-050-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-6400",
        "assignedDate": "2021-03-22"
      },
      {
        "id": "eq-emp-050-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-6793",
        "assignedDate": "2021-03-22"
      }
    ],
    "potential": "Low",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-051",
    "matricule": "EMP-2023-051",
    "firstName": "Ursule",
    "lastName": "Sylla",
    "name": "Ursule Sylla",
    "email": "ursule.sylla@sii-ci.com",
    "phone": "+225 07 83 74 37 29",
    "gender": "Féminin",
    "positionTitle": "Analyste Risque Crédit & Modélisation",
    "role": "Employee",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1978-06-28",
    "hireDate": "2024-08-08",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-67594492",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 88505852701 38",
    "childrenCount": 0,
    "annualLeaveBalance": 22,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-051-s1",
        "skillName": "Analyse Financière",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-051-s2",
        "skillName": "Analyse de Données (Data Science, Big Data)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-051-s3",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-051-s4",
        "skillName": "Esprit Critique",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-051-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-5477",
        "assignedDate": "2024-08-08"
      },
      {
        "id": "eq-emp-051-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-6567",
        "assignedDate": "2024-08-08"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-052",
    "matricule": "EMP-2023-052",
    "firstName": "Moussa",
    "lastName": "Doffou",
    "name": "Moussa Doffou",
    "email": "moussa.doffou@sii-ci.com",
    "phone": "+225 05 18 28 91 13",
    "gender": "Masculin",
    "positionTitle": "Consultant Stratégie Data & IA",
    "role": "Employee",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1981-07-14",
    "hireDate": "2019-12-17",
    "address": "Abidjan, Koumassi Remblais",
    "cnpsNumber": "CNPS-53537934",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 57920707938 49",
    "childrenCount": 0,
    "annualLeaveBalance": 15,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-052-s1",
        "skillName": "Planification Stratégique",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-052-s2",
        "skillName": "Analyse de Données (Data Science, Big Data)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-052-s3",
        "skillName": "Conduite du Changement",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-052-s4",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-052-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-1815",
        "assignedDate": "2019-12-17"
      },
      {
        "id": "eq-emp-052-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-8259",
        "assignedDate": "2019-12-17"
      }
    ],
    "potential": "Low",
    "performance": "Low",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-053",
    "matricule": "EMP-2023-053",
    "firstName": "Christelle",
    "lastName": "Keita",
    "name": "Christelle Keita",
    "email": "christelle.keita@sii-ci.com",
    "phone": "+225 07 75 24 54 65",
    "gender": "Féminin",
    "positionTitle": "Administrateur Data Warehouse (Snowflake)",
    "role": "Employee",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1996-10-16",
    "hireDate": "2019-05-22",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-63051354",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 15619618497 38",
    "childrenCount": 0,
    "annualLeaveBalance": 14,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-053-s1",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-053-s2",
        "skillName": "Cloud Computing (AWS, Azure, Google Cloud)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-053-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-053-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-4460",
        "assignedDate": "2019-05-22"
      },
      {
        "id": "eq-emp-053-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-5742",
        "assignedDate": "2019-05-22"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-054",
    "matricule": "EMP-2023-054",
    "firstName": "Christian",
    "lastName": "Gbané",
    "name": "Christian Gbané",
    "email": "christian.gbane@sii-ci.com",
    "phone": "+225 07 26 58 78 39",
    "gender": "Masculin",
    "positionTitle": "Développeur Dashboard & Reporting Métier",
    "role": "Employee",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1996-06-03",
    "hireDate": "2023-09-27",
    "address": "Abidjan, Marcory Résidentiel",
    "cnpsNumber": "CNPS-12515446",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 17482010533 65",
    "childrenCount": 4,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-054-s1",
        "skillName": "Analyse de Données (Data Science, Big Data)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-054-s2",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-054-s3",
        "skillName": "UI/UX Design",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-054-s4",
        "skillName": "Esprit d'Équipe",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-054-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-8033",
        "assignedDate": "2023-09-27"
      },
      {
        "id": "eq-emp-054-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-5743",
        "assignedDate": "2023-09-27"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-055",
    "matricule": "EMP-2023-055",
    "firstName": "Kady",
    "lastName": "Doumbia",
    "name": "Kady Doumbia",
    "email": "kady.doumbia@sii-ci.com",
    "phone": "+225 05 98 56 21 65",
    "gender": "Féminin",
    "positionTitle": "Assistant Data Analyst Junior",
    "role": "Employee",
    "department": "Data & Intelligence Artificielle",
    "status": "ACTIVE",
    "birthDate": "1988-10-13",
    "hireDate": "2025-02-08",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-32566390",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 41522969523 52",
    "childrenCount": 0,
    "annualLeaveBalance": 30,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Data",
      "positionTitle": "Directeur Data & Intelligence Artificielle"
    },
    "skills": [
      {
        "id": "emp-055-s1",
        "skillName": "Analyse de Données (Data Science, Big Data)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-055-s2",
        "skillName": "Bases de Données (SQL, PostgreSQL, MongoDB, Oracle)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-055-s3",
        "skillName": "Adaptabilité / Flexibilité",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-055-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-9693",
        "assignedDate": "2025-02-08"
      },
      {
        "id": "eq-emp-055-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-6752",
        "assignedDate": "2025-02-08"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-056",
    "matricule": "EMP-2023-056",
    "firstName": "Romaric",
    "lastName": "N'Dri",
    "name": "Romaric N'Dri",
    "email": "romaric.ndri@sii-ci.com",
    "phone": "+225 07 87 29 93 19",
    "gender": "Masculin",
    "positionTitle": "Responsable Sécurité des SI (RSSI / CISO)",
    "role": "Manager",
    "department": "Cybersécurité & Risque",
    "status": "ACTIVE",
    "birthDate": "1989-10-25",
    "hireDate": "2020-11-16",
    "address": "Abidjan, Yopougon Niangon Sud",
    "cnpsNumber": "CNPS-95268296",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 91097779327 92",
    "childrenCount": 2,
    "annualLeaveBalance": 24,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Cybersécurité",
      "positionTitle": "Directeur Cybersécurité & Risque"
    },
    "skills": [
      {
        "id": "emp-056-s1",
        "skillName": "Cybersécurité",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-056-s2",
        "skillName": "Gestion des Risques",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-056-s3",
        "skillName": "Conformité / Compliance (RGPD, etc.)",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-056-s4",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-056-s5",
        "skillName": "Prise de Décision",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-056-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-2118",
        "assignedDate": "2020-11-16"
      },
      {
        "id": "eq-emp-056-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-5500",
        "assignedDate": "2020-11-16"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-057",
    "matricule": "EMP-2023-057",
    "firstName": "Ursule",
    "lastName": "Assi",
    "name": "Ursule Assi",
    "email": "ursule.assi@sii-ci.com",
    "phone": "+225 05 14 17 57 46",
    "gender": "Féminin",
    "positionTitle": "Ingénieur Pentesting & Sécurité Offensive",
    "role": "Employee",
    "department": "Cybersécurité & Risque",
    "status": "ACTIVE",
    "birthDate": "1977-10-20",
    "hireDate": "2019-11-28",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-15505975",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 89296742767 80",
    "childrenCount": 4,
    "annualLeaveBalance": 20,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Cybersécurité",
      "positionTitle": "Directeur Cybersécurité & Risque"
    },
    "skills": [
      {
        "id": "emp-057-s1",
        "skillName": "Cybersécurité",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-057-s2",
        "skillName": "Réseaux et Télécoms",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-057-s3",
        "skillName": "Administration Système (Linux, Windows Server)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-057-s4",
        "skillName": "Résolution de Problèmes",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-057-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-8792",
        "assignedDate": "2019-11-28"
      },
      {
        "id": "eq-emp-057-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-8381",
        "assignedDate": "2019-11-28"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-058",
    "matricule": "EMP-2023-058",
    "firstName": "Ismaël",
    "lastName": "Aka",
    "name": "Ismaël Aka",
    "email": "ismael.aka@sii-ci.com",
    "phone": "+225 07 15 41 66 66",
    "gender": "Masculin",
    "positionTitle": "Analyste SOC N2 (Monitoring Incidents)",
    "role": "Employee",
    "department": "Cybersécurité & Risque",
    "status": "ACTIVE",
    "birthDate": "1980-06-12",
    "hireDate": "2023-09-20",
    "address": "Abidjan, Cocody Ambassades",
    "cnpsNumber": "CNPS-90246882",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 67498516318 53",
    "childrenCount": 0,
    "annualLeaveBalance": 24,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Cybersécurité",
      "positionTitle": "Directeur Cybersécurité & Risque"
    },
    "skills": [
      {
        "id": "emp-058-s1",
        "skillName": "Cybersécurité",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-058-s2",
        "skillName": "Administration Système (Linux, Windows Server)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-058-s3",
        "skillName": "Gestion du Stress",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-058-s4",
        "skillName": "Esprit Critique",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-058-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-2548",
        "assignedDate": "2023-09-20"
      },
      {
        "id": "eq-emp-058-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-5655",
        "assignedDate": "2023-09-20"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-059",
    "matricule": "EMP-2023-059",
    "firstName": "Nafissatou",
    "lastName": "Doffou",
    "name": "Nafissatou Doffou",
    "email": "nafissatou.doffou@sii-ci.com",
    "phone": "+225 07 54 49 93 99",
    "gender": "Féminin",
    "positionTitle": "Ingénieur DevSecOps & Sécurité Applicative",
    "role": "Employee",
    "department": "Cybersécurité & Risque",
    "status": "ACTIVE",
    "birthDate": "1994-12-03",
    "hireDate": "2024-07-05",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-27152188",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 97517171228 52",
    "childrenCount": 0,
    "annualLeaveBalance": 27,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Malienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Cybersécurité",
      "positionTitle": "Directeur Cybersécurité & Risque"
    },
    "skills": [
      {
        "id": "emp-059-s1",
        "skillName": "Cybersécurité",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-059-s2",
        "skillName": "DevOps (Docker, Kubernetes, Jenkins, GitLab CI)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-059-s3",
        "skillName": "Cloud Computing (AWS, Azure, Google Cloud)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-059-s4",
        "skillName": "Développement Back-End (Node.js, Java, Python, C#)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-059-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-1298",
        "assignedDate": "2024-07-05"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-060",
    "matricule": "EMP-2023-060",
    "firstName": "Mamadou",
    "lastName": "Soro",
    "name": "Mamadou Soro",
    "email": "mamadou.soro@sii-ci.com",
    "phone": "+225 07 29 19 47 22",
    "gender": "Masculin",
    "positionTitle": "Consultant Gouvernance, Risque & Conformité (GRC)",
    "role": "Employee",
    "department": "Cybersécurité & Risque",
    "status": "ACTIVE",
    "birthDate": "1998-09-02",
    "hireDate": "2023-09-27",
    "address": "Abidjan, Yopougon Maroc",
    "cnpsNumber": "CNPS-60562485",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 29834294138 86",
    "childrenCount": 1,
    "annualLeaveBalance": 19,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Cybersécurité",
      "positionTitle": "Directeur Cybersécurité & Risque"
    },
    "skills": [
      {
        "id": "emp-060-s1",
        "skillName": "Gestion des Risques",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-060-s2",
        "skillName": "Conformité / Compliance (RGPD, etc.)",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-060-s3",
        "skillName": "Audit Financier",
        "proficiencyLevel": "Intermédiaire",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-060-s4",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-060-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-3712",
        "assignedDate": "2023-09-27"
      },
      {
        "id": "eq-emp-060-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-7731",
        "assignedDate": "2023-09-27"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-061",
    "matricule": "EMP-2023-061",
    "firstName": "Ténin",
    "lastName": "N'Zi",
    "name": "Ténin N'Zi",
    "email": "tenin.nzi@sii-ci.com",
    "phone": "+225 01 67 39 78 40",
    "gender": "Féminin",
    "positionTitle": "Délégué à la Protection des Données (DPO)",
    "role": "Employee",
    "department": "Cybersécurité & Risque",
    "status": "ACTIVE",
    "birthDate": "1981-06-22",
    "hireDate": "2021-08-27",
    "address": "Abidjan, Yopougon Niangon Sud",
    "cnpsNumber": "CNPS-66191704",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 80359606362 77",
    "childrenCount": 1,
    "annualLeaveBalance": 20,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Cybersécurité",
      "positionTitle": "Directeur Cybersécurité & Risque"
    },
    "skills": [
      {
        "id": "emp-061-s1",
        "skillName": "Conformité / Compliance (RGPD, etc.)",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-061-s2",
        "skillName": "Droit des Affaires",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-061-s3",
        "skillName": "Cybersécurité",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-061-s4",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-061-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-5096",
        "assignedDate": "2021-08-27"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-062",
    "matricule": "EMP-2023-062",
    "firstName": "Alassane",
    "lastName": "Brou",
    "name": "Alassane Brou",
    "email": "alassane.brou@sii-ci.com",
    "phone": "+225 07 46 20 30 44",
    "gender": "Masculin",
    "positionTitle": "Spécialiste Réponse à Incident & Forensics",
    "role": "Employee",
    "department": "Cybersécurité & Risque",
    "status": "ACTIVE",
    "birthDate": "1988-02-08",
    "hireDate": "2022-09-05",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-65686520",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 61044096197 13",
    "childrenCount": 0,
    "annualLeaveBalance": 26,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Malienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Cybersécurité",
      "positionTitle": "Directeur Cybersécurité & Risque"
    },
    "skills": [
      {
        "id": "emp-062-s1",
        "skillName": "Cybersécurité",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-062-s2",
        "skillName": "Administration Système (Linux, Windows Server)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-062-s3",
        "skillName": "Gestion du Stress",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-062-s4",
        "skillName": "Résolution de Problèmes",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-062-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-4862",
        "assignedDate": "2022-09-05"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-063",
    "matricule": "EMP-2023-063",
    "firstName": "Valérie",
    "lastName": "Traoré",
    "name": "Valérie Traoré",
    "email": "valerie.traore@sii-ci.com",
    "phone": "+225 01 93 52 28 27",
    "gender": "Féminin",
    "positionTitle": "Ingénieur IAM (Gestion Identités & Accès)",
    "role": "Employee",
    "department": "Cybersécurité & Risque",
    "status": "ACTIVE",
    "birthDate": "1990-12-27",
    "hireDate": "2019-05-27",
    "address": "Abidjan, Cocody Riviera Golf",
    "cnpsNumber": "CNPS-92590645",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 77454764236 67",
    "childrenCount": 0,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Cybersécurité",
      "positionTitle": "Directeur Cybersécurité & Risque"
    },
    "skills": [
      {
        "id": "emp-063-s1",
        "skillName": "Cybersécurité",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-063-s2",
        "skillName": "Administration Système (Linux, Windows Server)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-063-s3",
        "skillName": "Cloud Computing (AWS, Azure, Google Cloud)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-063-s4",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-063-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-4533",
        "assignedDate": "2019-05-27"
      },
      {
        "id": "eq-emp-063-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-2821",
        "assignedDate": "2019-05-27"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-064",
    "matricule": "EMP-2023-064",
    "firstName": "Drissa",
    "lastName": "Diop",
    "name": "Drissa Diop",
    "email": "drissa.diop@sii-ci.com",
    "phone": "+225 05 91 89 68 18",
    "gender": "Masculin",
    "positionTitle": "Auditeur Sécurité Informatique (ISO 27001)",
    "role": "Employee",
    "department": "Cybersécurité & Risque",
    "status": "ACTIVE",
    "birthDate": "1992-01-21",
    "hireDate": "2019-08-20",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-10209961",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 49271363513 64",
    "childrenCount": 2,
    "annualLeaveBalance": 21,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Cybersécurité",
      "positionTitle": "Directeur Cybersécurité & Risque"
    },
    "skills": [
      {
        "id": "emp-064-s1",
        "skillName": "Cybersécurité",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-064-s2",
        "skillName": "Audit Financier",
        "proficiencyLevel": "Intermédiaire",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-064-s3",
        "skillName": "Gestion des Risques",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-064-s4",
        "skillName": "Esprit Critique",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-064-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-4068",
        "assignedDate": "2019-08-20"
      },
      {
        "id": "eq-emp-064-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-9576",
        "assignedDate": "2019-08-20"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-065",
    "matricule": "EMP-2023-065",
    "firstName": "Irène",
    "lastName": "Meïté",
    "name": "Irène Meïté",
    "email": "irene.meite@sii-ci.com",
    "phone": "+225 01 12 59 70 15",
    "gender": "Féminin",
    "positionTitle": "Spécialiste Plan de Continuité d'Activité (PCA)",
    "role": "Employee",
    "department": "Cybersécurité & Risque",
    "status": "ACTIVE",
    "birthDate": "1983-12-01",
    "hireDate": "2024-07-12",
    "address": "Abidjan, Marcory Zone 4C",
    "cnpsNumber": "CNPS-98195059",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 57534806343 40",
    "childrenCount": 0,
    "annualLeaveBalance": 24,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Cybersécurité",
      "positionTitle": "Directeur Cybersécurité & Risque"
    },
    "skills": [
      {
        "id": "emp-065-s1",
        "skillName": "Gestion des Risques",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-065-s2",
        "skillName": "Planification Stratégique",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-065-s3",
        "skillName": "Administration Système (Linux, Windows Server)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-065-s4",
        "skillName": "Prise de Décision",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-065-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-6772",
        "assignedDate": "2024-07-12"
      },
      {
        "id": "eq-emp-065-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-8612",
        "assignedDate": "2024-07-12"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-066",
    "matricule": "EMP-2023-066",
    "firstName": "Alassane",
    "lastName": "Babo",
    "name": "Alassane Babo",
    "email": "alassane.babo@sii-ci.com",
    "phone": "+225 05 14 47 35 15",
    "gender": "Masculin",
    "positionTitle": "Consultant Sécurité Réseau & Pare-feu",
    "role": "Employee",
    "department": "Cybersécurité & Risque",
    "status": "ACTIVE",
    "birthDate": "1985-05-17",
    "hireDate": "2025-04-02",
    "address": "Abidjan, Marcory Résidentiel",
    "cnpsNumber": "CNPS-14915156",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 76756808521 42",
    "childrenCount": 1,
    "annualLeaveBalance": 23,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Cybersécurité",
      "positionTitle": "Directeur Cybersécurité & Risque"
    },
    "skills": [
      {
        "id": "emp-066-s1",
        "skillName": "Cybersécurité",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-066-s2",
        "skillName": "Réseaux et Télécoms",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-066-s3",
        "skillName": "Autonomie",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-066-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-1783",
        "assignedDate": "2025-04-02"
      },
      {
        "id": "eq-emp-066-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-5476",
        "assignedDate": "2025-04-02"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-067",
    "matricule": "EMP-2023-067",
    "firstName": "Carine",
    "lastName": "Kouamé",
    "name": "Carine Kouamé",
    "email": "carine.kouame@sii-ci.com",
    "phone": "+225 05 53 33 73 98",
    "gender": "Féminin",
    "positionTitle": "Analyste Gestion des Vulnérabilités",
    "role": "Employee",
    "department": "Cybersécurité & Risque",
    "status": "ACTIVE",
    "birthDate": "1991-05-26",
    "hireDate": "2022-06-26",
    "address": "Abidjan, Cocody Riviera Palmeraie",
    "cnpsNumber": "CNPS-90859912",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 20413146764 65",
    "childrenCount": 1,
    "annualLeaveBalance": 23,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Cybersécurité",
      "positionTitle": "Directeur Cybersécurité & Risque"
    },
    "skills": [
      {
        "id": "emp-067-s1",
        "skillName": "Cybersécurité",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-067-s2",
        "skillName": "Administration Système (Linux, Windows Server)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-067-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-067-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-2311",
        "assignedDate": "2022-06-26"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-068",
    "matricule": "EMP-2023-068",
    "firstName": "Alassane",
    "lastName": "Gbané",
    "name": "Alassane Gbané",
    "email": "alassane.gbane@sii-ci.com",
    "phone": "+225 07 98 66 54 67",
    "gender": "Masculin",
    "positionTitle": "Spécialiste Lutte Anti-Fraude Numérique",
    "role": "Employee",
    "department": "Cybersécurité & Risque",
    "status": "ACTIVE",
    "birthDate": "1986-10-14",
    "hireDate": "2019-12-28",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-95565484",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 18366185610 19",
    "childrenCount": 3,
    "annualLeaveBalance": 25,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Malienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Cybersécurité",
      "positionTitle": "Directeur Cybersécurité & Risque"
    },
    "skills": [
      {
        "id": "emp-068-s1",
        "skillName": "Cybersécurité",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-068-s2",
        "skillName": "Analyse de Données (Data Science, Big Data)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-068-s3",
        "skillName": "Conformité / Compliance (RGPD, etc.)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-068-s4",
        "skillName": "Résolution de Problèmes",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-068-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-3621",
        "assignedDate": "2019-12-28"
      },
      {
        "id": "eq-emp-068-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-8179",
        "assignedDate": "2019-12-28"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-069",
    "matricule": "EMP-2023-069",
    "firstName": "Emmanuelle",
    "lastName": "Aka",
    "name": "Emmanuelle Aka",
    "email": "emmanuelle.aka@sii-ci.com",
    "phone": "+225 05 56 59 82 14",
    "gender": "Féminin",
    "positionTitle": "Ingénieur Cryptographie & PKI",
    "role": "Employee",
    "department": "Cybersécurité & Risque",
    "status": "ACTIVE",
    "birthDate": "1989-06-12",
    "hireDate": "2023-03-22",
    "address": "Abidjan, Koumassi Remblais",
    "cnpsNumber": "CNPS-81062902",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 87639631734 27",
    "childrenCount": 2,
    "annualLeaveBalance": 26,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Cybersécurité",
      "positionTitle": "Directeur Cybersécurité & Risque"
    },
    "skills": [
      {
        "id": "emp-069-s1",
        "skillName": "Cybersécurité",
        "proficiencyLevel": "Expert",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-069-s2",
        "skillName": "Développement Back-End (Node.js, Java, Python, C#)",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-069-s3",
        "skillName": "Résolution de Problèmes",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-069-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-5566",
        "assignedDate": "2023-03-22"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-070",
    "matricule": "EMP-2023-070",
    "firstName": "Hassane",
    "lastName": "Brou",
    "name": "Hassane Brou",
    "email": "hassane.brou@sii-ci.com",
    "phone": "+225 05 81 25 43 43",
    "gender": "Masculin",
    "positionTitle": "Formateur & Sensibilisateur Sécurité IT",
    "role": "Employee",
    "department": "Cybersécurité & Risque",
    "status": "ACTIVE",
    "birthDate": "1994-05-23",
    "hireDate": "2024-08-07",
    "address": "Abidjan, Cocody Ambassades",
    "cnpsNumber": "CNPS-19939096",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 23744661316 27",
    "childrenCount": 4,
    "annualLeaveBalance": 19,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Togolaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Cybersécurité",
      "positionTitle": "Directeur Cybersécurité & Risque"
    },
    "skills": [
      {
        "id": "emp-070-s1",
        "skillName": "Cybersécurité",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-070-s2",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-070-s3",
        "skillName": "Pédagogie / Écoute Active",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-070-s4",
        "skillName": "Créativité / Innovation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-070-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-6236",
        "assignedDate": "2024-08-07"
      },
      {
        "id": "eq-emp-070-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-9882",
        "assignedDate": "2024-08-07"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-071",
    "matricule": "EMP-2023-071",
    "firstName": "Aminata",
    "lastName": "Bahi",
    "name": "Aminata Bahi",
    "email": "aminata.bahi@sii-ci.com",
    "phone": "+225 01 32 56 75 38",
    "gender": "Féminin",
    "positionTitle": "Directeur des Ressources Humaines (DRH)",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1979-04-26",
    "hireDate": "2019-04-26",
    "address": "Abidjan, Koumassi Remblais",
    "cnpsNumber": "CNPS-59514418",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 84564482803 83",
    "childrenCount": 4,
    "annualLeaveBalance": 18,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-071-s1",
        "skillName": "Planification Stratégique",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-071-s2",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-071-s3",
        "skillName": "Droit du Travail",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-071-s4",
        "skillName": "Politique de Rémunération",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-071-s5",
        "skillName": "GPEC (Gestion Prévisionnelle des Emplois et Compétences)",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-071-s6",
        "skillName": "Leadership",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-071-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-2077",
        "assignedDate": "2019-04-26"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-072",
    "matricule": "EMP-2023-072",
    "firstName": "Emmanuel",
    "lastName": "Coulibaly",
    "name": "Emmanuel Coulibaly",
    "email": "emmanuel.coulibaly@sii-ci.com",
    "phone": "+225 05 92 19 67 69",
    "gender": "Masculin",
    "positionTitle": "Responsable Développement des Compétences",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1979-09-21",
    "hireDate": "2024-09-12",
    "address": "Abidjan, Yopougon Niangon Sud",
    "cnpsNumber": "CNPS-17437386",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 66388767193 74",
    "childrenCount": 0,
    "annualLeaveBalance": 30,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-072-s1",
        "skillName": "Formation et Développement des Compétences",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-072-s2",
        "skillName": "GPEC (Gestion Prévisionnelle des Emplois et Compétences)",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-072-s3",
        "skillName": "Entretiens Annuels / Évaluation",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-072-s4",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-072-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-3697",
        "assignedDate": "2024-09-12"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-073",
    "matricule": "EMP-2023-073",
    "firstName": "Fatoumata",
    "lastName": "Cissé",
    "name": "Fatoumata Cissé",
    "email": "fatoumata.cisse@sii-ci.com",
    "phone": "+225 07 91 80 45 26",
    "gender": "Féminin",
    "positionTitle": "Responsable Recrutement & Marque Employeur",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1992-02-17",
    "hireDate": "2024-05-20",
    "address": "Abidjan, Yopougon Maroc",
    "cnpsNumber": "CNPS-98413629",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 29673726942 31",
    "childrenCount": 2,
    "annualLeaveBalance": 15,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-073-s1",
        "skillName": "Recrutement et Sourcing",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-073-s2",
        "skillName": "Marque Employeur",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-073-s3",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-073-s4",
        "skillName": "Négociation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-073-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-1744",
        "assignedDate": "2024-05-20"
      },
      {
        "id": "eq-emp-073-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-4453",
        "assignedDate": "2024-05-20"
      }
    ],
    "potential": "Low",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-074",
    "matricule": "EMP-2023-074",
    "firstName": "Kader",
    "lastName": "Camara",
    "name": "Kader Camara",
    "email": "kader.camara@sii-ci.com",
    "phone": "+225 01 48 71 41 97",
    "gender": "Masculin",
    "positionTitle": "Talent Acquisition Specialist (IT Sourcing)",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1977-12-02",
    "hireDate": "2022-05-15",
    "address": "Abidjan, Cocody Riviera Golf",
    "cnpsNumber": "CNPS-37383505",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 76209591246 69",
    "childrenCount": 2,
    "annualLeaveBalance": 18,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-074-s1",
        "skillName": "Recrutement et Sourcing",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-074-s2",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-074-s3",
        "skillName": "Écoute Active",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-074-s4",
        "skillName": "Anglais (Professionnel courant)",
        "proficiencyLevel": "Avancé",
        "category": "Langues"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-074-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-6231",
        "assignedDate": "2022-05-15"
      },
      {
        "id": "eq-emp-074-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-7532",
        "assignedDate": "2022-05-15"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-075",
    "matricule": "EMP-2023-075",
    "firstName": "Grâce",
    "lastName": "Mensah",
    "name": "Grâce Mensah",
    "email": "grâce.mensah@sii-ci.com",
    "phone": "+225 07 69 25 44 67",
    "gender": "Féminin",
    "positionTitle": "Chargée de Recrutement Métiers Tertiaires",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1976-05-13",
    "hireDate": "2020-03-04",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-53947691",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 41860646115 30",
    "childrenCount": 2,
    "annualLeaveBalance": 20,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-075-s1",
        "skillName": "Recrutement et Sourcing",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-075-s2",
        "skillName": "Entretiens Annuels / Évaluation",
        "proficiencyLevel": "Intermédiaire",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-075-s3",
        "skillName": "Intelligence Émotionnelle",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-075-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-9433",
        "assignedDate": "2020-03-04"
      },
      {
        "id": "eq-emp-075-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-9148",
        "assignedDate": "2020-03-04"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-076",
    "matricule": "EMP-2023-076",
    "firstName": "Fabrice",
    "lastName": "Diop",
    "name": "Fabrice Diop",
    "email": "fabrice.diop@sii-ci.com",
    "phone": "+225 07 84 55 16 16",
    "gender": "Masculin",
    "positionTitle": "Responsable Paie & Administration du Personnel",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1995-11-16",
    "hireDate": "2021-08-20",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-45496951",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 66296271299 27",
    "childrenCount": 2,
    "annualLeaveBalance": 26,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-076-s1",
        "skillName": "Gestion de la Paie",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-076-s2",
        "skillName": "Droit du Travail",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-076-s3",
        "skillName": "Gestion Administrative du Personnel",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-076-s4",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-076-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-7563",
        "assignedDate": "2021-08-20"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-077",
    "matricule": "EMP-2023-077",
    "firstName": "Esther",
    "lastName": "Diarra",
    "name": "Esther Diarra",
    "email": "esther.diarra@sii-ci.com",
    "phone": "+225 01 67 80 45 89",
    "gender": "Féminin",
    "positionTitle": "Gestionnaire de Paie & Charges Sociales",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1979-02-13",
    "hireDate": "2024-10-04",
    "address": "Abidjan, Marcory Zone 4C",
    "cnpsNumber": "CNPS-59070856",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 57187893707 81",
    "childrenCount": 1,
    "annualLeaveBalance": 20,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-077-s1",
        "skillName": "Gestion de la Paie",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-077-s2",
        "skillName": "Gestion Administrative du Personnel",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-077-s3",
        "skillName": "Comptabilité Générale",
        "proficiencyLevel": "Intermédiaire",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-077-s4",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-077-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-7576",
        "assignedDate": "2024-10-04"
      },
      {
        "id": "eq-emp-077-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-1637",
        "assignedDate": "2024-10-04"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-078",
    "matricule": "EMP-2023-078",
    "firstName": "Fabrice",
    "lastName": "Bakayoko",
    "name": "Fabrice Bakayoko",
    "email": "fabrice.bakayoko@sii-ci.com",
    "phone": "+225 01 75 27 51 88",
    "gender": "Masculin",
    "positionTitle": "Juriste Droit Social & Relations Syndicales",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1994-12-27",
    "hireDate": "2021-03-13",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-81449442",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 80164189712 75",
    "childrenCount": 4,
    "annualLeaveBalance": 23,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Togolaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-078-s1",
        "skillName": "Droit du Travail",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-078-s2",
        "skillName": "Gestion des Conflits",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-078-s3",
        "skillName": "Négociation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-078-s4",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-078-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-1272",
        "assignedDate": "2021-03-13"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-079",
    "matricule": "EMP-2023-079",
    "firstName": "Béatrice",
    "lastName": "Bahi",
    "name": "Béatrice Bahi",
    "email": "beatrice.bahi@sii-ci.com",
    "phone": "+225 01 13 86 70 43",
    "gender": "Féminin",
    "positionTitle": "Chargé des Relations Sociales & Délégués",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1982-12-02",
    "hireDate": "2024-10-19",
    "address": "Abidjan, Yopougon Niangon Sud",
    "cnpsNumber": "CNPS-93179531",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 79451820467 90",
    "childrenCount": 3,
    "annualLeaveBalance": 18,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-079-s1",
        "skillName": "Droit du Travail",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-079-s2",
        "skillName": "Gestion des Conflits",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-079-s3",
        "skillName": "Écoute Active",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-079-s4",
        "skillName": "Intelligence Émotionnelle",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-079-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-1517",
        "assignedDate": "2024-10-19"
      },
      {
        "id": "eq-emp-079-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-4125",
        "assignedDate": "2024-10-19"
      }
    ],
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-080",
    "matricule": "EMP-2023-080",
    "firstName": "Jean-Luc",
    "lastName": "Dosso",
    "name": "Jean-Luc Dosso",
    "email": "jean-luc.dosso@sii-ci.com",
    "phone": "+225 01 36 62 74 88",
    "gender": "Masculin",
    "positionTitle": "Responsable Formation Continue & FDFP",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1976-12-05",
    "hireDate": "2022-12-24",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-74205866",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 55358663301 94",
    "childrenCount": 3,
    "annualLeaveBalance": 24,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-080-s1",
        "skillName": "Formation et Développement des Compétences",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-080-s2",
        "skillName": "Gestion de Budget",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-080-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-080-s4",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-080-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-9734",
        "assignedDate": "2022-12-24"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-081",
    "matricule": "EMP-2023-081",
    "firstName": "Mariam",
    "lastName": "Diop",
    "name": "Mariam Diop",
    "email": "mariam.diop@sii-ci.com",
    "phone": "+225 05 81 48 38 48",
    "gender": "Féminin",
    "positionTitle": "Chargé de Conception E-Learning & LMS",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1981-12-23",
    "hireDate": "2025-05-23",
    "address": "Abidjan, Koumassi Remblais",
    "cnpsNumber": "CNPS-46702849",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 59305380257 81",
    "childrenCount": 2,
    "annualLeaveBalance": 17,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-081-s1",
        "skillName": "Formation et Développement des Compétences",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-081-s2",
        "skillName": "Créativité / Innovation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-081-s3",
        "skillName": "UI/UX Design",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-081-s4",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-081-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-9899",
        "assignedDate": "2025-05-23"
      }
    ],
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-082",
    "matricule": "EMP-2023-082",
    "firstName": "Cheick",
    "lastName": "Camara",
    "name": "Cheick Camara",
    "email": "cheick.camara@sii-ci.com",
    "phone": "+225 01 20 54 66 93",
    "gender": "Masculin",
    "positionTitle": "Conseiller Mobilité Interne & Carrières",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1981-04-27",
    "hireDate": "2021-12-16",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-46456416",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 87021751298 99",
    "childrenCount": 1,
    "annualLeaveBalance": 17,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-082-s1",
        "skillName": "GPEC (Gestion Prévisionnelle des Emplois et Compétences)",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-082-s2",
        "skillName": "Entretiens Annuels / Évaluation",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-082-s3",
        "skillName": "Écoute Active",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-082-s4",
        "skillName": "Empathie",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-082-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-4920",
        "assignedDate": "2021-12-16"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-083",
    "matricule": "EMP-2023-083",
    "firstName": "Christelle",
    "lastName": "Sow",
    "name": "Christelle Sow",
    "email": "christelle.sow@sii-ci.com",
    "phone": "+225 01 70 22 97 27",
    "gender": "Féminin",
    "positionTitle": "Responsable Rémunérations & Avantages (C&B)",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1988-11-16",
    "hireDate": "2019-09-06",
    "address": "Abidjan, Koumassi Remblais",
    "cnpsNumber": "CNPS-48307798",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 52794684952 51",
    "childrenCount": 0,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-083-s1",
        "skillName": "Politique de Rémunération",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-083-s2",
        "skillName": "Gestion de Budget",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-083-s3",
        "skillName": "Analyse Financière",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-083-s4",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-083-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-4804",
        "assignedDate": "2019-09-06"
      },
      {
        "id": "eq-emp-083-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-3868",
        "assignedDate": "2019-09-06"
      }
    ],
    "potential": "Low",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-084",
    "matricule": "EMP-2023-084",
    "firstName": "Hassane",
    "lastName": "Koffi",
    "name": "Hassane Koffi",
    "email": "hassane.koffi@sii-ci.com",
    "phone": "+225 01 47 14 11 48",
    "gender": "Masculin",
    "positionTitle": "People & Culture Lead",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1985-05-15",
    "hireDate": "2023-10-04",
    "address": "Abidjan, Yopougon Maroc",
    "cnpsNumber": "CNPS-77674279",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 76676440385 27",
    "childrenCount": 4,
    "annualLeaveBalance": 22,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-084-s1",
        "skillName": "Qualité de Vie au Travail (QVT)",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-084-s2",
        "skillName": "Marque Employeur",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-084-s3",
        "skillName": "Leadership",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-084-s4",
        "skillName": "Intelligence Émotionnelle",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-084-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-2845",
        "assignedDate": "2023-10-04"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-085",
    "matricule": "EMP-2023-085",
    "firstName": "Aïcha",
    "lastName": "Yapi",
    "name": "Aïcha Yapi",
    "email": "aicha.yapi@sii-ci.com",
    "phone": "+225 05 47 82 96 34",
    "gender": "Féminin",
    "positionTitle": "Chargée de Qualité de Vie au Travail (QVT)",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1995-07-27",
    "hireDate": "2020-10-28",
    "address": "Abidjan, Marcory Résidentiel",
    "cnpsNumber": "CNPS-99826000",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 19998368883 61",
    "childrenCount": 0,
    "annualLeaveBalance": 19,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-085-s1",
        "skillName": "Qualité de Vie au Travail (QVT)",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-085-s2",
        "skillName": "Gestion du Stress",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-085-s3",
        "skillName": "Écoute Active",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-085-s4",
        "skillName": "Empathie",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-085-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-6301",
        "assignedDate": "2020-10-28"
      },
      {
        "id": "eq-emp-085-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-5272",
        "assignedDate": "2020-10-28"
      }
    ],
    "potential": "Low",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-086",
    "matricule": "EMP-2023-086",
    "firstName": "Wilfried",
    "lastName": "Barry",
    "name": "Wilfried Barry",
    "email": "wilfried.barry@sii-ci.com",
    "phone": "+225 01 83 11 43 93",
    "gender": "Masculin",
    "positionTitle": "Assistant RH / Accueil & Onboarding",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1976-11-04",
    "hireDate": "2021-12-08",
    "address": "Abidjan, Koumassi Remblais",
    "cnpsNumber": "CNPS-77447155",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 62225586102 97",
    "childrenCount": 2,
    "annualLeaveBalance": 17,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-086-s1",
        "skillName": "Gestion Administrative du Personnel",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-086-s2",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-086-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-086-s4",
        "skillName": "Esprit d'Équipe",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-086-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-7021",
        "assignedDate": "2021-12-08"
      },
      {
        "id": "eq-emp-086-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-3188",
        "assignedDate": "2021-12-08"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-087",
    "matricule": "EMP-2023-087",
    "firstName": "Ornella",
    "lastName": "Kane",
    "name": "Ornella Kane",
    "email": "ornella.kane@sii-ci.com",
    "phone": "+225 05 99 80 70 78",
    "gender": "Féminin",
    "positionTitle": "Responsable Médecine du Travail & Santé",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1981-04-22",
    "hireDate": "2025-11-27",
    "address": "Abidjan, Cocody Danga",
    "cnpsNumber": "CNPS-80890196",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 79071107024 67",
    "childrenCount": 2,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-087-s1",
        "skillName": "Qualité de Vie au Travail (QVT)",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-087-s2",
        "skillName": "Droit du Travail",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-087-s3",
        "skillName": "Empathie",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-087-s4",
        "skillName": "Gestion du Stress",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-087-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-2011",
        "assignedDate": "2025-11-27"
      },
      {
        "id": "eq-emp-087-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-9792",
        "assignedDate": "2025-11-27"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-088",
    "matricule": "EMP-2023-088",
    "firstName": "Elhadj",
    "lastName": "Fofana",
    "name": "Elhadj Fofana",
    "email": "elhadj.fofana@sii-ci.com",
    "phone": "+225 01 36 84 72 21",
    "gender": "Masculin",
    "positionTitle": "Assistante Sociale d'Entreprise",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1976-08-05",
    "hireDate": "2023-08-26",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-85000490",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 89271345838 17",
    "childrenCount": 4,
    "annualLeaveBalance": 23,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-088-s1",
        "skillName": "Qualité de Vie au Travail (QVT)",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-088-s2",
        "skillName": "Empathie",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-088-s3",
        "skillName": "Écoute Active",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-088-s4",
        "skillName": "Gestion des Conflits",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-088-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-5169",
        "assignedDate": "2023-08-26"
      },
      {
        "id": "eq-emp-088-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-2196",
        "assignedDate": "2023-08-26"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-089",
    "matricule": "EMP-2023-089",
    "firstName": "Esther",
    "lastName": "Kra",
    "name": "Esther Kra",
    "email": "esther.kra@sii-ci.com",
    "phone": "+225 07 18 70 14 46",
    "gender": "Féminin",
    "positionTitle": "Coordonnateur Santé Sécurité Travail (CSST)",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1979-11-24",
    "hireDate": "2022-03-25",
    "address": "Abidjan, Yopougon Maroc",
    "cnpsNumber": "CNPS-60666702",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 65367856250 67",
    "childrenCount": 3,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-089-s1",
        "skillName": "Qualité de Vie au Travail (QVT)",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-089-s2",
        "skillName": "Gestion des Risques",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-089-s3",
        "skillName": "Droit du Travail",
        "proficiencyLevel": "Intermédiaire",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-089-s4",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-089-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-9835",
        "assignedDate": "2022-03-25"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-090",
    "matricule": "EMP-2023-090",
    "firstName": "Brahima",
    "lastName": "Brou",
    "name": "Brahima Brou",
    "email": "brahima.brou@sii-ci.com",
    "phone": "+225 07 38 10 12 48",
    "gender": "Masculin",
    "positionTitle": "Consultant SIRH & Digitalisation RH",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1992-07-18",
    "hireDate": "2022-11-24",
    "address": "Abidjan, Marcory Résidentiel",
    "cnpsNumber": "CNPS-56460773",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 41051170723 68",
    "childrenCount": 1,
    "annualLeaveBalance": 22,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-090-s1",
        "skillName": "Gestion Administrative du Personnel",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-090-s2",
        "skillName": "Gestion de Projet (Classique)",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-090-s3",
        "skillName": "Conduite du Changement",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-090-s4",
        "skillName": "Résolution de Problèmes",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-090-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-2848",
        "assignedDate": "2022-11-24"
      }
    ],
    "potential": "Low",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-091",
    "matricule": "EMP-2023-091",
    "firstName": "Esther",
    "lastName": "Traoré",
    "name": "Esther Traoré",
    "email": "esther.traore@sii-ci.com",
    "phone": "+225 01 14 67 86 96",
    "gender": "Féminin",
    "positionTitle": "Coach Interne & Facilitateur d'Équipe",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1998-01-13",
    "hireDate": "2024-01-08",
    "address": "Abidjan, Koumassi Remblais",
    "cnpsNumber": "CNPS-28808678",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 38088054502 17",
    "childrenCount": 2,
    "annualLeaveBalance": 21,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-091-s1",
        "skillName": "Intelligence Émotionnelle",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-091-s2",
        "skillName": "Gestion des Conflits",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-091-s3",
        "skillName": "Leadership",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-091-s4",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-091-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-6253",
        "assignedDate": "2024-01-08"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-092",
    "matricule": "EMP-2023-092",
    "firstName": "Souleymane",
    "lastName": "Ouattara",
    "name": "Souleymane Ouattara",
    "email": "souleymane.ouattara@sii-ci.com",
    "phone": "+225 01 85 32 90 96",
    "gender": "Masculin",
    "positionTitle": "Gestionnaire Contrats & Registre Personnel",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1976-06-21",
    "hireDate": "2022-09-16",
    "address": "Abidjan, Yopougon Maroc",
    "cnpsNumber": "CNPS-65878146",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 82094481788 50",
    "childrenCount": 3,
    "annualLeaveBalance": 18,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Sénégalaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-092-s1",
        "skillName": "Gestion Administrative du Personnel",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-092-s2",
        "skillName": "Droit du Travail",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-092-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-092-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-4012",
        "assignedDate": "2022-09-16"
      },
      {
        "id": "eq-emp-092-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-4948",
        "assignedDate": "2022-09-16"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-093",
    "matricule": "EMP-2023-093",
    "firstName": "Florence",
    "lastName": "Ouattara",
    "name": "Florence Ouattara",
    "email": "florence.ouattara@sii-ci.com",
    "phone": "+225 01 62 63 81 77",
    "gender": "Féminin",
    "positionTitle": "Responsable Diversité, Équité & Inclusion (DEI)",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1983-04-11",
    "hireDate": "2020-07-08",
    "address": "Abidjan, Yopougon Maroc",
    "cnpsNumber": "CNPS-22410307",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 74090473112 57",
    "childrenCount": 1,
    "annualLeaveBalance": 15,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Sénégalaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-093-s1",
        "skillName": "Qualité de Vie au Travail (QVT)",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-093-s2",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-093-s3",
        "skillName": "Conduite du Changement",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-093-s4",
        "skillName": "Empathie",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-093-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-1647",
        "assignedDate": "2020-07-08"
      },
      {
        "id": "eq-emp-093-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-4555",
        "assignedDate": "2020-07-08"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-094",
    "matricule": "EMP-2023-094",
    "firstName": "Amara",
    "lastName": "Diallo",
    "name": "Amara Diallo",
    "email": "amara.diallo@sii-ci.com",
    "phone": "+225 07 25 71 41 99",
    "gender": "Masculin",
    "positionTitle": "Chargé des Stages & Relations Campus",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1987-04-18",
    "hireDate": "2023-12-07",
    "address": "Abidjan, Marcory Zone 4C",
    "cnpsNumber": "CNPS-81625307",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 62755337555 69",
    "childrenCount": 2,
    "annualLeaveBalance": 23,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Sénégalaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-094-s1",
        "skillName": "Recrutement et Sourcing",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-094-s2",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-094-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-094-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-9401",
        "assignedDate": "2023-12-07"
      },
      {
        "id": "eq-emp-094-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-2615",
        "assignedDate": "2023-12-07"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-095",
    "matricule": "EMP-2023-095",
    "firstName": "Valérie",
    "lastName": "Dosso",
    "name": "Valérie Dosso",
    "email": "valerie.dosso@sii-ci.com",
    "phone": "+225 07 82 38 28 12",
    "gender": "Féminin",
    "positionTitle": "Auditeur Social & Climat d'Entreprise",
    "role": "HR",
    "department": "Ressources Humaines",
    "status": "ACTIVE",
    "birthDate": "1993-12-14",
    "hireDate": "2021-09-19",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-60981231",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 53792310267 39",
    "childrenCount": 1,
    "annualLeaveBalance": 29,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Malienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Ressources",
      "positionTitle": "Directeur Ressources Humaines"
    },
    "skills": [
      {
        "id": "emp-095-s1",
        "skillName": "Droit du Travail",
        "proficiencyLevel": "Expert",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-095-s2",
        "skillName": "Qualité de Vie au Travail (QVT)",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-095-s3",
        "skillName": "Esprit Critique",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-095-s4",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-095-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-6530",
        "assignedDate": "2021-09-19"
      }
    ],
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-096",
    "matricule": "EMP-2023-096",
    "firstName": "Benoît",
    "lastName": "Sylla",
    "name": "Benoît Sylla",
    "email": "benoit.sylla@sii-ci.com",
    "phone": "+225 07 27 79 72 33",
    "gender": "Masculin",
    "positionTitle": "Directeur Administratif et Financier (DAF)",
    "role": "Manager",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1991-01-27",
    "hireDate": "2023-11-02",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-65350347",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 17164931227 10",
    "childrenCount": 1,
    "annualLeaveBalance": 21,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-096-s1",
        "skillName": "Analyse Financière",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-096-s2",
        "skillName": "Contrôle de Gestion",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-096-s3",
        "skillName": "Planification Stratégique",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-096-s4",
        "skillName": "Gestion de Budget",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-096-s5",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-096-s6",
        "skillName": "Prise de Décision",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-096-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-3474",
        "assignedDate": "2023-11-02"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-097",
    "matricule": "EMP-2023-097",
    "firstName": "Raïssa",
    "lastName": "Doffou",
    "name": "Raïssa Doffou",
    "email": "raissa.doffou@sii-ci.com",
    "phone": "+225 01 71 94 72 12",
    "gender": "Féminin",
    "positionTitle": "Chef Comptable (Normes SYSCOHADA)",
    "role": "Manager",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1988-01-01",
    "hireDate": "2019-09-18",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-12300840",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 84194446519 46",
    "childrenCount": 3,
    "annualLeaveBalance": 19,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-097-s1",
        "skillName": "Comptabilité Générale",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-097-s2",
        "skillName": "Fiscalité",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-097-s3",
        "skillName": "Reporting Financier",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-097-s4",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-097-s5",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-097-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-9591",
        "assignedDate": "2019-09-18"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-098",
    "matricule": "EMP-2023-098",
    "firstName": "Brahima",
    "lastName": "Bamba",
    "name": "Brahima Bamba",
    "email": "brahima.bamba@sii-ci.com",
    "phone": "+225 05 61 68 82 41",
    "gender": "Masculin",
    "positionTitle": "Comptable Général Senior",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1996-02-21",
    "hireDate": "2024-04-10",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-64395532",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 17557363691 21",
    "childrenCount": 3,
    "annualLeaveBalance": 26,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Malienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-098-s1",
        "skillName": "Comptabilité Générale",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-098-s2",
        "skillName": "Fiscalité",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-098-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-098-s4",
        "skillName": "Autonomie",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-098-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-1919",
        "assignedDate": "2024-04-10"
      },
      {
        "id": "eq-emp-098-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-2354",
        "assignedDate": "2024-04-10"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-099",
    "matricule": "EMP-2023-099",
    "firstName": "Massandjé",
    "lastName": "Traoré",
    "name": "Massandjé Traoré",
    "email": "massandje.traore@sii-ci.com",
    "phone": "+225 01 15 39 37 98",
    "gender": "Féminin",
    "positionTitle": "Comptable Fournisseurs & Règlements",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1976-02-22",
    "hireDate": "2023-08-09",
    "address": "Abidjan, Cocody Ambassades",
    "cnpsNumber": "CNPS-98329927",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 86876958164 82",
    "childrenCount": 0,
    "annualLeaveBalance": 19,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-099-s1",
        "skillName": "Comptabilité Générale",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-099-s2",
        "skillName": "Négociation",
        "proficiencyLevel": "Intermédiaire",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-099-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-099-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-4394",
        "assignedDate": "2023-08-09"
      },
      {
        "id": "eq-emp-099-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-2260",
        "assignedDate": "2023-08-09"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-100",
    "matricule": "EMP-2023-100",
    "firstName": "Moussa",
    "lastName": "Diarra",
    "name": "Moussa Diarra",
    "email": "moussa.diarra@sii-ci.com",
    "phone": "+225 01 79 52 59 27",
    "gender": "Masculin",
    "positionTitle": "Comptable Clients & Recouvrement",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1977-09-24",
    "hireDate": "2025-12-24",
    "address": "Abidjan, Marcory Zone 4C",
    "cnpsNumber": "CNPS-20202996",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 66254132103 39",
    "childrenCount": 2,
    "annualLeaveBalance": 26,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-100-s1",
        "skillName": "Comptabilité Générale",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-100-s2",
        "skillName": "Négociation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-100-s3",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-100-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-5478",
        "assignedDate": "2025-12-24"
      },
      {
        "id": "eq-emp-100-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-9038",
        "assignedDate": "2025-12-24"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-101",
    "matricule": "EMP-2023-101",
    "firstName": "Dorothée",
    "lastName": "Koffi",
    "name": "Dorothée Koffi",
    "email": "dorothee.koffi@sii-ci.com",
    "phone": "+225 01 84 94 58 20",
    "gender": "Féminin",
    "positionTitle": "Contrôleur de Gestion Opérationnel",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "2000-04-23",
    "hireDate": "2025-10-10",
    "address": "Abidjan, Cocody Riviera Palmeraie",
    "cnpsNumber": "CNPS-95080736",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 28330800294 58",
    "childrenCount": 1,
    "annualLeaveBalance": 26,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-101-s1",
        "skillName": "Contrôle de Gestion",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-101-s2",
        "skillName": "Comptabilité Analytique",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-101-s3",
        "skillName": "Reporting Financier",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-101-s4",
        "skillName": "Suivi des KPI / OKR",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-101-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-2745",
        "assignedDate": "2025-10-10"
      }
    ],
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-102",
    "matricule": "EMP-2023-102",
    "firstName": "Gilles",
    "lastName": "Coulibaly",
    "name": "Gilles Coulibaly",
    "email": "gilles.coulibaly@sii-ci.com",
    "phone": "+225 07 33 65 67 81",
    "gender": "Masculin",
    "positionTitle": "Contrôleur Financier & Budget",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1978-01-03",
    "hireDate": "2023-09-14",
    "address": "Abidjan, Marcory Zone 4C",
    "cnpsNumber": "CNPS-53544301",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 92004086578 86",
    "childrenCount": 3,
    "annualLeaveBalance": 14,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Sénégalaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-102-s1",
        "skillName": "Contrôle de Gestion",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-102-s2",
        "skillName": "Gestion de Budget",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-102-s3",
        "skillName": "Analyse Financière",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-102-s4",
        "skillName": "Esprit Critique",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-102-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-7353",
        "assignedDate": "2023-09-14"
      },
      {
        "id": "eq-emp-102-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-9537",
        "assignedDate": "2023-09-14"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-103",
    "matricule": "EMP-2023-103",
    "firstName": "Salimata",
    "lastName": "Barry",
    "name": "Salimata Barry",
    "email": "salimata.barry@sii-ci.com",
    "phone": "+225 05 73 28 18 31",
    "gender": "Féminin",
    "positionTitle": "Auditeur Financier Interne",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1984-08-26",
    "hireDate": "2022-05-14",
    "address": "Abidjan, Cocody Riviera Palmeraie",
    "cnpsNumber": "CNPS-92767884",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 77109008682 86",
    "childrenCount": 1,
    "annualLeaveBalance": 28,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-103-s1",
        "skillName": "Audit Financier",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-103-s2",
        "skillName": "Comptabilité Générale",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-103-s3",
        "skillName": "Esprit Critique",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-103-s4",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-103-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-5991",
        "assignedDate": "2022-05-14"
      }
    ],
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-104",
    "matricule": "EMP-2023-104",
    "firstName": "Wilfried",
    "lastName": "Kouamé",
    "name": "Wilfried Kouamé",
    "email": "wilfried.kouame@sii-ci.com",
    "phone": "+225 05 65 93 86 27",
    "gender": "Masculin",
    "positionTitle": "Trésorier d'Entreprise & Cash Management",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1997-04-16",
    "hireDate": "2021-06-20",
    "address": "Abidjan, Marcory Zone 4C",
    "cnpsNumber": "CNPS-49117508",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 65682424027 50",
    "childrenCount": 4,
    "annualLeaveBalance": 21,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-104-s1",
        "skillName": "Trésorerie",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-104-s2",
        "skillName": "Analyse Financière",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-104-s3",
        "skillName": "Négociation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-104-s4",
        "skillName": "Gestion du Stress",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-104-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-5592",
        "assignedDate": "2021-06-20"
      },
      {
        "id": "eq-emp-104-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-6980",
        "assignedDate": "2021-06-20"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-105",
    "matricule": "EMP-2023-105",
    "firstName": "Laetitia",
    "lastName": "Gondo",
    "name": "Laetitia Gondo",
    "email": "laetitia.gondo@sii-ci.com",
    "phone": "+225 01 13 69 36 66",
    "gender": "Féminin",
    "positionTitle": "Fiscaliste d'Entreprise (Code Général des Impôts)",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1997-02-27",
    "hireDate": "2025-05-27",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-77015343",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 69249269810 96",
    "childrenCount": 1,
    "annualLeaveBalance": 23,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-105-s1",
        "skillName": "Fiscalité",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-105-s2",
        "skillName": "Droit des Affaires",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-105-s3",
        "skillName": "Conformité / Compliance (RGPD, etc.)",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-105-s4",
        "skillName": "Rigueur / Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-105-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-3525",
        "assignedDate": "2025-05-27"
      },
      {
        "id": "eq-emp-105-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-2211",
        "assignedDate": "2025-05-27"
      }
    ],
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-106",
    "matricule": "EMP-2023-106",
    "firstName": "Kader",
    "lastName": "Meïté",
    "name": "Kader Meïté",
    "email": "kader.meite@sii-ci.com",
    "phone": "+225 01 63 79 14 56",
    "gender": "Masculin",
    "positionTitle": "Analyste Financier & Investissements",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1995-02-04",
    "hireDate": "2024-09-20",
    "address": "Abidjan, Cocody Danga",
    "cnpsNumber": "CNPS-92232236",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 32999587757 92",
    "childrenCount": 0,
    "annualLeaveBalance": 26,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-106-s1",
        "skillName": "Analyse Financière",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-106-s2",
        "skillName": "Reporting Financier",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-106-s3",
        "skillName": "Anglais (Professionnel courant)",
        "proficiencyLevel": "Avancé",
        "category": "Langues"
      },
      {
        "id": "emp-106-s4",
        "skillName": "Prise de Décision",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-106-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-8052",
        "assignedDate": "2024-09-20"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-107",
    "matricule": "EMP-2023-107",
    "firstName": "Carine",
    "lastName": "Brou",
    "name": "Carine Brou",
    "email": "carine.brou@sii-ci.com",
    "phone": "+225 01 84 98 83 38",
    "gender": "Féminin",
    "positionTitle": "Gestionnaire Prêts & Crédits au Personnel",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1989-11-19",
    "hireDate": "2022-06-13",
    "address": "Abidjan, Bingerville Fehi Kessé",
    "cnpsNumber": "CNPS-74796438",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 57892084813 13",
    "childrenCount": 0,
    "annualLeaveBalance": 23,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Burkinabé",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-107-s1",
        "skillName": "Comptabilité Générale",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-107-s2",
        "skillName": "Gestion Administrative du Personnel",
        "proficiencyLevel": "Intermédiaire",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-107-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-107-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-2901",
        "assignedDate": "2022-06-13"
      },
      {
        "id": "eq-emp-107-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-6707",
        "assignedDate": "2022-06-13"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-108",
    "matricule": "EMP-2023-108",
    "firstName": "Junior",
    "lastName": "Tanoh",
    "name": "Junior Tanoh",
    "email": "junior.tanoh@sii-ci.com",
    "phone": "+225 05 70 22 66 99",
    "gender": "Masculin",
    "positionTitle": "Assistant Contrôle de Gestion",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1984-01-26",
    "hireDate": "2022-06-03",
    "address": "Abidjan, Bingerville Fehi Kessé",
    "cnpsNumber": "CNPS-32059232",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 97372854493 23",
    "childrenCount": 1,
    "annualLeaveBalance": 30,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-108-s1",
        "skillName": "Contrôle de Gestion",
        "proficiencyLevel": "Intermédiaire",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-108-s2",
        "skillName": "Comptabilité Analytique",
        "proficiencyLevel": "Intermédiaire",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-108-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-108-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-3623",
        "assignedDate": "2022-06-03"
      }
    ],
    "potential": "Low",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-109",
    "matricule": "EMP-2023-109",
    "firstName": "Raïssa",
    "lastName": "Koffi",
    "name": "Raïssa Koffi",
    "email": "raissa.koffi@sii-ci.com",
    "phone": "+225 07 91 94 65 60",
    "gender": "Féminin",
    "positionTitle": "Comptable Immobilisations & Inventaires",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1981-08-19",
    "hireDate": "2019-12-20",
    "address": "Abidjan, Marcory Résidentiel",
    "cnpsNumber": "CNPS-18397164",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 36692346028 45",
    "childrenCount": 0,
    "annualLeaveBalance": 19,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-109-s1",
        "skillName": "Comptabilité Générale",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-109-s2",
        "skillName": "Gestion des Stocks",
        "proficiencyLevel": "Intermédiaire",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-109-s3",
        "skillName": "Autonomie",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-109-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-4228",
        "assignedDate": "2019-12-20"
      },
      {
        "id": "eq-emp-109-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-9019",
        "assignedDate": "2019-12-20"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-110",
    "matricule": "EMP-2023-110",
    "firstName": "Nouhan",
    "lastName": "Fofana",
    "name": "Nouhan Fofana",
    "email": "nouhan.fofana@sii-ci.com",
    "phone": "+225 05 55 68 89 32",
    "gender": "Masculin",
    "positionTitle": "Responsable Trésorerie & Relations Bancaires",
    "role": "Manager",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "2000-05-20",
    "hireDate": "2025-11-23",
    "address": "Abidjan, Yopougon Niangon Sud",
    "cnpsNumber": "CNPS-25819123",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 30066560001 50",
    "childrenCount": 1,
    "annualLeaveBalance": 23,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-110-s1",
        "skillName": "Trésorerie",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-110-s2",
        "skillName": "Analyse Financière",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-110-s3",
        "skillName": "Négociation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-110-s4",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Intermédiaire",
        "category": "Management & Gestion de Projet"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-110-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-7116",
        "assignedDate": "2025-11-23"
      },
      {
        "id": "eq-emp-110-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-7852",
        "assignedDate": "2025-11-23"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-111",
    "matricule": "EMP-2023-111",
    "firstName": "Hortense",
    "lastName": "Koné",
    "name": "Hortense Koné",
    "email": "hortense.kone@sii-ci.com",
    "phone": "+225 01 98 92 32 81",
    "gender": "Féminin",
    "positionTitle": "Analyste Risque Financier & Marchés",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1979-03-11",
    "hireDate": "2020-08-10",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-11286267",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 16955312924 55",
    "childrenCount": 4,
    "annualLeaveBalance": 18,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-111-s1",
        "skillName": "Analyse Financière",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-111-s2",
        "skillName": "Gestion des Risques",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-111-s3",
        "skillName": "Esprit Critique",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-111-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-7290",
        "assignedDate": "2020-08-10"
      },
      {
        "id": "eq-emp-111-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-7703",
        "assignedDate": "2020-08-10"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-112",
    "matricule": "EMP-2023-112",
    "firstName": "Hassane",
    "lastName": "Yao",
    "name": "Hassane Yao",
    "email": "hassane.yao@sii-ci.com",
    "phone": "+225 07 82 13 38 47",
    "gender": "Masculin",
    "positionTitle": "Chargé de Consolidation Financière",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1992-05-06",
    "hireDate": "2019-05-08",
    "address": "Abidjan, Cocody Danga",
    "cnpsNumber": "CNPS-25194922",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 85141798644 75",
    "childrenCount": 0,
    "annualLeaveBalance": 22,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Malienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-112-s1",
        "skillName": "Reporting Financier",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-112-s2",
        "skillName": "Comptabilité Générale",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-112-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-112-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-7010",
        "assignedDate": "2019-05-08"
      },
      {
        "id": "eq-emp-112-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-8231",
        "assignedDate": "2019-05-08"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-113",
    "matricule": "EMP-2023-113",
    "firstName": "Saran",
    "lastName": "N'Zi",
    "name": "Saran N'Zi",
    "email": "saran.nzi@sii-ci.com",
    "phone": "+225 07 48 14 67 43",
    "gender": "Féminin",
    "positionTitle": "Opérateur Facturation & Rapprochement Bancaire",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1978-04-07",
    "hireDate": "2021-02-15",
    "address": "Abidjan, Cocody Danga",
    "cnpsNumber": "CNPS-67467610",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 94657043626 90",
    "childrenCount": 1,
    "annualLeaveBalance": 18,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-113-s1",
        "skillName": "Comptabilité Générale",
        "proficiencyLevel": "Intermédiaire",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-113-s2",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-113-s3",
        "skillName": "Autonomie",
        "proficiencyLevel": "Intermédiaire",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-113-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-4390",
        "assignedDate": "2021-02-15"
      },
      {
        "id": "eq-emp-113-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-9720",
        "assignedDate": "2021-02-15"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-114",
    "matricule": "EMP-2023-114",
    "firstName": "Tidiane",
    "lastName": "Camara",
    "name": "Tidiane Camara",
    "email": "tidiane.camara@sii-ci.com",
    "phone": "+225 01 44 75 96 22",
    "gender": "Masculin",
    "positionTitle": "Contrôleur Interne & Processus Financiers",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1983-11-05",
    "hireDate": "2020-07-02",
    "address": "Abidjan, Bingerville Fehi Kessé",
    "cnpsNumber": "CNPS-53231088",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 40634673965 28",
    "childrenCount": 1,
    "annualLeaveBalance": 26,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Togolaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-114-s1",
        "skillName": "Audit Financier",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-114-s2",
        "skillName": "Gestion des Risques",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-114-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-114-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-5402",
        "assignedDate": "2020-07-02"
      },
      {
        "id": "eq-emp-114-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-8405",
        "assignedDate": "2020-07-02"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-115",
    "matricule": "EMP-2023-115",
    "firstName": "Carine",
    "lastName": "Keita",
    "name": "Carine Keita",
    "email": "carine.keita@sii-ci.com",
    "phone": "+225 01 57 68 72 51",
    "gender": "Féminin",
    "positionTitle": "Économiste & Conjoncture Marché",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1999-12-03",
    "hireDate": "2023-01-28",
    "address": "Abidjan, Bingerville Fehi Kessé",
    "cnpsNumber": "CNPS-81729237",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 60239473604 18",
    "childrenCount": 3,
    "annualLeaveBalance": 20,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Burkinabé",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-115-s1",
        "skillName": "Analyse Financière",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-115-s2",
        "skillName": "Esprit Critique",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-115-s3",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-115-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-4470",
        "assignedDate": "2023-01-28"
      },
      {
        "id": "eq-emp-115-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-5646",
        "assignedDate": "2023-01-28"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-116",
    "matricule": "EMP-2023-116",
    "firstName": "Wilfried",
    "lastName": "Gondo",
    "name": "Wilfried Gondo",
    "email": "wilfried.gondo@sii-ci.com",
    "phone": "+225 07 15 22 90 68",
    "gender": "Masculin",
    "positionTitle": "Spécialiste Financements Bailleurs & Subventions",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1980-08-15",
    "hireDate": "2019-02-28",
    "address": "Abidjan, Cocody Deux-Plateaux Vallons",
    "cnpsNumber": "CNPS-46778269",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 51446422377 30",
    "childrenCount": 0,
    "annualLeaveBalance": 25,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Sénégalaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-116-s1",
        "skillName": "Analyse Financière",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-116-s2",
        "skillName": "Négociation de Contrats B2B/B2C",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-116-s3",
        "skillName": "Anglais (Professionnel courant)",
        "proficiencyLevel": "Avancé",
        "category": "Langues"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-116-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-7092",
        "assignedDate": "2019-02-28"
      },
      {
        "id": "eq-emp-116-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-1848",
        "assignedDate": "2019-02-28"
      }
    ],
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-117",
    "matricule": "EMP-2023-117",
    "firstName": "Danielle",
    "lastName": "Soro",
    "name": "Danielle Soro",
    "email": "danielle.soro@sii-ci.com",
    "phone": "+225 05 93 21 22 10",
    "gender": "Féminin",
    "positionTitle": "Responsable Recouvrement Contentieux",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1979-10-08",
    "hireDate": "2020-08-03",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-56113741",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 11911547690 11",
    "childrenCount": 0,
    "annualLeaveBalance": 27,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-117-s1",
        "skillName": "Droit des Affaires",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-117-s2",
        "skillName": "Négociation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-117-s3",
        "skillName": "Gestion du Stress",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-117-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-2160",
        "assignedDate": "2020-08-03"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-118",
    "matricule": "EMP-2023-118",
    "firstName": "Zoumana",
    "lastName": "Barry",
    "name": "Zoumana Barry",
    "email": "zoumana.barry@sii-ci.com",
    "phone": "+225 07 58 27 92 96",
    "gender": "Masculin",
    "positionTitle": "Comptable Auxiliaire",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1993-01-20",
    "hireDate": "2020-02-17",
    "address": "Abidjan, Yopougon Maroc",
    "cnpsNumber": "CNPS-94299475",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 59134852877 37",
    "childrenCount": 1,
    "annualLeaveBalance": 27,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-118-s1",
        "skillName": "Comptabilité Générale",
        "proficiencyLevel": "Intermédiaire",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-118-s2",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Intermédiaire",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-118-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-8248",
        "assignedDate": "2020-02-17"
      },
      {
        "id": "eq-emp-118-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-2646",
        "assignedDate": "2020-02-17"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-119",
    "matricule": "EMP-2023-119",
    "firstName": "Affoué",
    "lastName": "Sylla",
    "name": "Affoué Sylla",
    "email": "affoue.sylla@sii-ci.com",
    "phone": "+225 05 50 27 41 45",
    "gender": "Féminin",
    "positionTitle": "Gestionnaire de Caisse Centrale",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1992-10-20",
    "hireDate": "2024-02-08",
    "address": "Abidjan, Bingerville Fehi Kessé",
    "cnpsNumber": "CNPS-79491111",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 52416354812 36",
    "childrenCount": 1,
    "annualLeaveBalance": 26,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Sénégalaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-119-s1",
        "skillName": "Trésorerie",
        "proficiencyLevel": "Intermédiaire",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-119-s2",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-119-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-1894",
        "assignedDate": "2024-02-08"
      },
      {
        "id": "eq-emp-119-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-9108",
        "assignedDate": "2024-02-08"
      }
    ],
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-120",
    "matricule": "EMP-2023-120",
    "firstName": "Roland",
    "lastName": "Gohi",
    "name": "Roland Gohi",
    "email": "roland.gohi@sii-ci.com",
    "phone": "+225 07 77 11 56 50",
    "gender": "Masculin",
    "positionTitle": "Auditeur Conformité Fiscale & Douanière",
    "role": "Employee",
    "department": "Finance & Comptabilité",
    "status": "ACTIVE",
    "birthDate": "1993-07-12",
    "hireDate": "2020-07-28",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-19064068",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 10313497572 85",
    "childrenCount": 0,
    "annualLeaveBalance": 22,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Finance",
      "positionTitle": "Directeur Finance & Comptabilité"
    },
    "skills": [
      {
        "id": "emp-120-s1",
        "skillName": "Fiscalité",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-120-s2",
        "skillName": "Audit Financier",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-120-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-120-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-1990",
        "assignedDate": "2020-07-28"
      },
      {
        "id": "eq-emp-120-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-9300",
        "assignedDate": "2020-07-28"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-121",
    "matricule": "EMP-2023-121",
    "firstName": "Blandine",
    "lastName": "Bamba",
    "name": "Blandine Bamba",
    "email": "blandine.bamba@sii-ci.com",
    "phone": "+225 01 78 78 88 29",
    "gender": "Féminin",
    "positionTitle": "Directeur Commercial & Développement",
    "role": "Manager",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1977-09-07",
    "hireDate": "2021-02-10",
    "address": "Abidjan, Cocody Danga",
    "cnpsNumber": "CNPS-88710263",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 55253451222 60",
    "childrenCount": 0,
    "annualLeaveBalance": 23,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Burkinabé",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-121-s1",
        "skillName": "Négociation de Contrats B2B/B2C",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-121-s2",
        "skillName": "Stratégie Marketing",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-121-s3",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-121-s4",
        "skillName": "Leadership",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-121-s5",
        "skillName": "Prospection Commerciale",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-121-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-4909",
        "assignedDate": "2021-02-10"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-122",
    "matricule": "EMP-2023-122",
    "firstName": "Patrick",
    "lastName": "Gohi",
    "name": "Patrick Gohi",
    "email": "patrick.gohi@sii-ci.com",
    "phone": "+225 07 49 95 94 32",
    "gender": "Masculin",
    "positionTitle": "Responsable Grands Comptes (Key Account Manager)",
    "role": "Manager",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1979-12-01",
    "hireDate": "2019-01-23",
    "address": "Abidjan, Cocody Riviera Golf",
    "cnpsNumber": "CNPS-79420474",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 61337813668 76",
    "childrenCount": 2,
    "annualLeaveBalance": 19,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-122-s1",
        "skillName": "Négociation de Contrats B2B/B2C",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-122-s2",
        "skillName": "Gestion de la Relation Client (CRM)",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-122-s3",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-122-s4",
        "skillName": "Intelligence Émotionnelle",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-122-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-5403",
        "assignedDate": "2019-01-23"
      },
      {
        "id": "eq-emp-122-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-1480",
        "assignedDate": "2019-01-23"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-123",
    "matricule": "EMP-2023-123",
    "firstName": "Esther",
    "lastName": "Cissé",
    "name": "Esther Cissé",
    "email": "esther.cisse@sii-ci.com",
    "phone": "+225 01 83 90 19 73",
    "gender": "Féminin",
    "positionTitle": "Ingénieur Commercial B2B Solutions IT",
    "role": "Employee",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1976-08-28",
    "hireDate": "2022-09-12",
    "address": "Abidjan, Yopougon Niangon Sud",
    "cnpsNumber": "CNPS-23811663",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 33054043479 42",
    "childrenCount": 0,
    "annualLeaveBalance": 21,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Malienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-123-s1",
        "skillName": "Négociation de Contrats B2B/B2C",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-123-s2",
        "skillName": "Prospection Commerciale",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-123-s3",
        "skillName": "Cloud Computing (AWS, Azure, Google Cloud)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-123-s4",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-123-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-1721",
        "assignedDate": "2022-09-12"
      },
      {
        "id": "eq-emp-123-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-5006",
        "assignedDate": "2022-09-12"
      }
    ],
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-124",
    "matricule": "EMP-2023-124",
    "firstName": "Jean-Luc",
    "lastName": "Koffi",
    "name": "Jean-Luc Koffi",
    "email": "jean-luc.koffi@sii-ci.com",
    "phone": "+225 07 80 93 63 38",
    "gender": "Masculin",
    "positionTitle": "Business Developer Senior FinTech",
    "role": "Employee",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1998-06-09",
    "hireDate": "2021-04-14",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-77382794",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 59699368537 25",
    "childrenCount": 0,
    "annualLeaveBalance": 19,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-124-s1",
        "skillName": "Prospection Commerciale",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-124-s2",
        "skillName": "Négociation de Contrats B2B/B2C",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-124-s3",
        "skillName": "Autonomie",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-124-s4",
        "skillName": "Anglais (Professionnel courant)",
        "proficiencyLevel": "Avancé",
        "category": "Langues"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-124-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-9450",
        "assignedDate": "2021-04-14"
      },
      {
        "id": "eq-emp-124-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-2129",
        "assignedDate": "2021-04-14"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-125",
    "matricule": "EMP-2023-125",
    "firstName": "Fatoumata",
    "lastName": "Binate",
    "name": "Fatoumata Binate",
    "email": "fatoumata.binate@sii-ci.com",
    "phone": "+225 05 11 57 35 47",
    "gender": "Féminin",
    "positionTitle": "Chargée de Clientèle Entreprises (PME)",
    "role": "Employee",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1994-04-15",
    "hireDate": "2023-05-24",
    "address": "Abidjan, Marcory Zone 4C",
    "cnpsNumber": "CNPS-83357939",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 78598606668 35",
    "childrenCount": 1,
    "annualLeaveBalance": 18,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-125-s1",
        "skillName": "Gestion de la Relation Client (CRM)",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-125-s2",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-125-s3",
        "skillName": "Écoute Active",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-125-s4",
        "skillName": "Négociation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-125-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-1391",
        "assignedDate": "2023-05-24"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-126",
    "matricule": "EMP-2023-126",
    "firstName": "Désiré",
    "lastName": "Doffou",
    "name": "Désiré Doffou",
    "email": "desire.doffou@sii-ci.com",
    "phone": "+225 05 49 23 36 77",
    "gender": "Masculin",
    "positionTitle": "Chargé de Clientèle Particuliers & Professionnels",
    "role": "Employee",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1976-03-23",
    "hireDate": "2020-07-16",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-59995026",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 82350889774 62",
    "childrenCount": 4,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-126-s1",
        "skillName": "Service Client / SAV",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-126-s2",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-126-s3",
        "skillName": "Gestion de la Relation Client (CRM)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Vente, Marketing & Commerce"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-126-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-9280",
        "assignedDate": "2020-07-16"
      }
    ],
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-127",
    "matricule": "EMP-2023-127",
    "firstName": "Djeneba",
    "lastName": "Gbané",
    "name": "Djeneba Gbané",
    "email": "djeneba.gbane@sii-ci.com",
    "phone": "+225 01 26 40 47 43",
    "gender": "Féminin",
    "positionTitle": "Responsable Service Client & Expérience Client",
    "role": "Manager",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1987-12-27",
    "hireDate": "2025-06-26",
    "address": "Abidjan, Bingerville Fehi Kessé",
    "cnpsNumber": "CNPS-41354768",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 71495589642 44",
    "childrenCount": 0,
    "annualLeaveBalance": 20,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-127-s1",
        "skillName": "Service Client / SAV",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-127-s2",
        "skillName": "Gestion de la Relation Client (CRM)",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-127-s3",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-127-s4",
        "skillName": "Gestion du Stress",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-127-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-2785",
        "assignedDate": "2025-06-26"
      }
    ],
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-128",
    "matricule": "EMP-2023-128",
    "firstName": "Cédric",
    "lastName": "Fofana",
    "name": "Cédric Fofana",
    "email": "cedric.fofana@sii-ci.com",
    "phone": "+225 01 55 36 67 49",
    "gender": "Masculin",
    "positionTitle": "Téléconseiller Support Client N1",
    "role": "Employee",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1978-02-06",
    "hireDate": "2022-05-28",
    "address": "Abidjan, Cocody Danga",
    "cnpsNumber": "CNPS-53995720",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 16886131772 37",
    "childrenCount": 1,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-128-s1",
        "skillName": "Service Client / SAV",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-128-s2",
        "skillName": "Écoute Active",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-128-s3",
        "skillName": "Gestion du Stress",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-128-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-7492",
        "assignedDate": "2022-05-28"
      },
      {
        "id": "eq-emp-128-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-5262",
        "assignedDate": "2022-05-28"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-129",
    "matricule": "EMP-2023-129",
    "firstName": "Lou",
    "lastName": "Yapi",
    "name": "Lou Yapi",
    "email": "lou.yapi@sii-ci.com",
    "phone": "+225 01 41 22 69 23",
    "gender": "Féminin",
    "positionTitle": "Négociateur Contrats Commerciaux Internationaux",
    "role": "Employee",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1975-01-27",
    "hireDate": "2025-03-04",
    "address": "Abidjan, Cocody Danga",
    "cnpsNumber": "CNPS-59961172",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 36331221463 61",
    "childrenCount": 0,
    "annualLeaveBalance": 22,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-129-s1",
        "skillName": "Négociation de Contrats B2B/B2C",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-129-s2",
        "skillName": "Anglais (Professionnel courant)",
        "proficiencyLevel": "Expert",
        "category": "Langues"
      },
      {
        "id": "emp-129-s3",
        "skillName": "Droit des Affaires",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-129-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-2056",
        "assignedDate": "2025-03-04"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-130",
    "matricule": "EMP-2023-130",
    "firstName": "Hamed",
    "lastName": "Konan",
    "name": "Hamed Konan",
    "email": "hamed.konan@sii-ci.com",
    "phone": "+225 05 16 31 83 65",
    "gender": "Masculin",
    "positionTitle": "Responsable Partenariats & Alliances Stratégiques",
    "role": "Manager",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1990-01-13",
    "hireDate": "2025-12-13",
    "address": "Abidjan, Yopougon Maroc",
    "cnpsNumber": "CNPS-35118997",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 57986841570 37",
    "childrenCount": 2,
    "annualLeaveBalance": 22,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Togolaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-130-s1",
        "skillName": "Négociation de Contrats B2B/B2C",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-130-s2",
        "skillName": "Stratégie Marketing",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-130-s3",
        "skillName": "Leadership",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-130-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-1567",
        "assignedDate": "2025-12-13"
      },
      {
        "id": "eq-emp-130-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-5835",
        "assignedDate": "2025-12-13"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-131",
    "matricule": "EMP-2023-131",
    "firstName": "Djeneba",
    "lastName": "Bamba",
    "name": "Djeneba Bamba",
    "email": "djeneba.bamba@sii-ci.com",
    "phone": "+225 05 59 27 63 35",
    "gender": "Féminin",
    "positionTitle": "Responsable Agence Commerciale Plateau",
    "role": "Manager",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1995-09-26",
    "hireDate": "2024-09-08",
    "address": "Abidjan, Cocody Deux-Plateaux Vallons",
    "cnpsNumber": "CNPS-75052579",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 75966884208 79",
    "childrenCount": 2,
    "annualLeaveBalance": 30,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-131-s1",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-131-s2",
        "skillName": "Service Client / SAV",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-131-s3",
        "skillName": "Prospection Commerciale",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-131-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-5430",
        "assignedDate": "2024-09-08"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-132",
    "matricule": "EMP-2023-132",
    "firstName": "Drissa",
    "lastName": "Tanoh",
    "name": "Drissa Tanoh",
    "email": "drissa.tanoh@sii-ci.com",
    "phone": "+225 01 55 84 39 30",
    "gender": "Masculin",
    "positionTitle": "Chef des Ventes Réseau Régional",
    "role": "Manager",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1982-05-18",
    "hireDate": "2019-04-22",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-57621071",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 88251776902 59",
    "childrenCount": 1,
    "annualLeaveBalance": 19,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-132-s1",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-132-s2",
        "skillName": "Prospection Commerciale",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-132-s3",
        "skillName": "Suivi des KPI / OKR",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-132-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-6210",
        "assignedDate": "2019-04-22"
      },
      {
        "id": "eq-emp-132-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-1462",
        "assignedDate": "2019-04-22"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-133",
    "matricule": "EMP-2023-133",
    "firstName": "Hortense",
    "lastName": "Kra",
    "name": "Hortense Kra",
    "email": "hortense.kra@sii-ci.com",
    "phone": "+225 05 32 72 14 21",
    "gender": "Féminin",
    "positionTitle": "Customer Success Manager (SaaS B2B)",
    "role": "Employee",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1982-01-17",
    "hireDate": "2019-04-20",
    "address": "Abidjan, Koumassi Remblais",
    "cnpsNumber": "CNPS-55735904",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 38407492534 26",
    "childrenCount": 1,
    "annualLeaveBalance": 24,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-133-s1",
        "skillName": "Gestion de la Relation Client (CRM)",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-133-s2",
        "skillName": "Service Client / SAV",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-133-s3",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-133-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-3420",
        "assignedDate": "2019-04-20"
      },
      {
        "id": "eq-emp-133-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-2817",
        "assignedDate": "2019-04-20"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-134",
    "matricule": "EMP-2023-134",
    "firstName": "Thierry",
    "lastName": "Sanogo",
    "name": "Thierry Sanogo",
    "email": "thierry.sanogo@sii-ci.com",
    "phone": "+225 01 22 53 48 51",
    "gender": "Masculin",
    "positionTitle": "Gestionnaire de Comptes Clés Télécom",
    "role": "Employee",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1988-11-16",
    "hireDate": "2020-03-24",
    "address": "Abidjan, Yopougon Maroc",
    "cnpsNumber": "CNPS-92370625",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 87175163092 98",
    "childrenCount": 2,
    "annualLeaveBalance": 21,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-134-s1",
        "skillName": "Gestion de la Relation Client (CRM)",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-134-s2",
        "skillName": "Négociation de Contrats B2B/B2C",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-134-s3",
        "skillName": "Résolution de Problèmes",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-134-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-3872",
        "assignedDate": "2020-03-24"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-135",
    "matricule": "EMP-2023-135",
    "firstName": "Aïcha",
    "lastName": "Bahi",
    "name": "Aïcha Bahi",
    "email": "aicha.bahi@sii-ci.com",
    "phone": "+225 01 60 82 14 33",
    "gender": "Féminin",
    "positionTitle": "Chargé d'Appels d'Offres & Marchés Publics",
    "role": "Employee",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1994-04-21",
    "hireDate": "2023-06-26",
    "address": "Abidjan, Yopougon Niangon Sud",
    "cnpsNumber": "CNPS-54448673",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 78447552887 28",
    "childrenCount": 0,
    "annualLeaveBalance": 21,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-135-s1",
        "skillName": "Négociation de Contrats B2B/B2C",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-135-s2",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-135-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-135-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-3750",
        "assignedDate": "2023-06-26"
      },
      {
        "id": "eq-emp-135-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-6500",
        "assignedDate": "2023-06-26"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-136",
    "matricule": "EMP-2023-136",
    "firstName": "Pascal",
    "lastName": "Bahi",
    "name": "Pascal Bahi",
    "email": "pascal.bahi@sii-ci.com",
    "phone": "+225 07 54 42 23 10",
    "gender": "Masculin",
    "positionTitle": "Commercial Terrain Secteur Abidjan Sud",
    "role": "Employee",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1998-07-06",
    "hireDate": "2019-07-15",
    "address": "Abidjan, Cocody Ambassades",
    "cnpsNumber": "CNPS-60378298",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 58871198396 79",
    "childrenCount": 0,
    "annualLeaveBalance": 29,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-136-s1",
        "skillName": "Prospection Commerciale",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-136-s2",
        "skillName": "Négociation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-136-s3",
        "skillName": "Autonomie",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-136-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-4695",
        "assignedDate": "2019-07-15"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-137",
    "matricule": "EMP-2023-137",
    "firstName": "Valérie",
    "lastName": "Cissé",
    "name": "Valérie Cissé",
    "email": "valerie.cisse@sii-ci.com",
    "phone": "+225 07 19 53 31 58",
    "gender": "Féminin",
    "positionTitle": "Commercial Terrain Secteur Abidjan Nord",
    "role": "Employee",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1992-02-11",
    "hireDate": "2020-12-03",
    "address": "Abidjan, Yopougon Niangon Sud",
    "cnpsNumber": "CNPS-67891237",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 78260886637 13",
    "childrenCount": 1,
    "annualLeaveBalance": 27,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-137-s1",
        "skillName": "Prospection Commerciale",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-137-s2",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-137-s3",
        "skillName": "Adaptabilité / Flexibilité",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-137-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-2659",
        "assignedDate": "2020-12-03"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-138",
    "matricule": "EMP-2023-138",
    "firstName": "Benoît",
    "lastName": "Logbo",
    "name": "Benoît Logbo",
    "email": "benoit.logbo@sii-ci.com",
    "phone": "+225 01 43 94 46 48",
    "gender": "Masculin",
    "positionTitle": "Commercial Régional San Pedro (Port & Agro)",
    "role": "Employee",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1987-10-18",
    "hireDate": "2020-02-02",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-10512117",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 14954631046 56",
    "childrenCount": 3,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Sénégalaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-138-s1",
        "skillName": "Prospection Commerciale",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-138-s2",
        "skillName": "Négociation de Contrats B2B/B2C",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-138-s3",
        "skillName": "Autonomie",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-138-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-8869",
        "assignedDate": "2020-02-02"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-139",
    "matricule": "EMP-2023-139",
    "firstName": "Ténin",
    "lastName": "Bamba",
    "name": "Ténin Bamba",
    "email": "tenin.bamba@sii-ci.com",
    "phone": "+225 05 24 49 60 70",
    "gender": "Féminin",
    "positionTitle": "Commercial Régional Bouaké (Centre & Nord)",
    "role": "Employee",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1977-11-18",
    "hireDate": "2022-11-09",
    "address": "Abidjan, Marcory Résidentiel",
    "cnpsNumber": "CNPS-69830944",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 58882934852 33",
    "childrenCount": 0,
    "annualLeaveBalance": 22,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Togolaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-139-s1",
        "skillName": "Prospection Commerciale",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-139-s2",
        "skillName": "Écoute Active",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-139-s3",
        "skillName": "Autonomie",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-139-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-5315",
        "assignedDate": "2022-11-09"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-140",
    "matricule": "EMP-2023-140",
    "firstName": "Thierry",
    "lastName": "Traoré",
    "name": "Thierry Traoré",
    "email": "thierry.traore@sii-ci.com",
    "phone": "+225 07 95 54 79 62",
    "gender": "Masculin",
    "positionTitle": "Spécialiste Expérience Client (CX)",
    "role": "Employee",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1992-01-27",
    "hireDate": "2025-10-08",
    "address": "Abidjan, Marcory Résidentiel",
    "cnpsNumber": "CNPS-73729850",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 68079048638 78",
    "childrenCount": 1,
    "annualLeaveBalance": 29,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Sénégalaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-140-s1",
        "skillName": "Service Client / SAV",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-140-s2",
        "skillName": "Design Thinking",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-140-s3",
        "skillName": "Empathie",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-140-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-7468",
        "assignedDate": "2025-10-08"
      },
      {
        "id": "eq-emp-140-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-9226",
        "assignedDate": "2025-10-08"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-141",
    "matricule": "EMP-2023-141",
    "firstName": "Kady",
    "lastName": "Diallo",
    "name": "Kady Diallo",
    "email": "kady.diallo@sii-ci.com",
    "phone": "+225 07 26 15 64 20",
    "gender": "Féminin",
    "positionTitle": "Chargé de Prospection Téléphonique (Inside Sales)",
    "role": "Employee",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1995-03-27",
    "hireDate": "2024-07-07",
    "address": "Abidjan, Yopougon Niangon Sud",
    "cnpsNumber": "CNPS-62089786",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 22057449253 21",
    "childrenCount": 3,
    "annualLeaveBalance": 24,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Sénégalaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-141-s1",
        "skillName": "Prospection Commerciale",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-141-s2",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-141-s3",
        "skillName": "Gestion du Stress",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-141-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-8506",
        "assignedDate": "2024-07-07"
      },
      {
        "id": "eq-emp-141-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-9561",
        "assignedDate": "2024-07-07"
      }
    ],
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-142",
    "matricule": "EMP-2023-142",
    "firstName": "Jean-Luc",
    "lastName": "Sangharé",
    "name": "Jean-Luc Sangharé",
    "email": "jean-luc.sanghare@sii-ci.com",
    "phone": "+225 01 84 22 23 82",
    "gender": "Masculin",
    "positionTitle": "Conseiller Solutions Bancaires & FinTech",
    "role": "Employee",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1984-09-12",
    "hireDate": "2025-02-26",
    "address": "Abidjan, Cocody Ambassades",
    "cnpsNumber": "CNPS-75174087",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 62674065740 93",
    "childrenCount": 4,
    "annualLeaveBalance": 15,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-142-s1",
        "skillName": "Service Client / SAV",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-142-s2",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-142-s3",
        "skillName": "Analyse Financière",
        "proficiencyLevel": "Intermédiaire",
        "category": "Finance, Comptabilité & Légal"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-142-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-7602",
        "assignedDate": "2025-02-26"
      }
    ],
    "potential": "Low",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-143",
    "matricule": "EMP-2023-143",
    "firstName": "Yaoua",
    "lastName": "Diop",
    "name": "Yaoua Diop",
    "email": "yaoua.diop@sii-ci.com",
    "phone": "+225 07 70 44 57 12",
    "gender": "Féminin",
    "positionTitle": "Administrateur Ventes & Facturation Clients",
    "role": "Employee",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1983-08-28",
    "hireDate": "2021-05-10",
    "address": "Abidjan, Bingerville Fehi Kessé",
    "cnpsNumber": "CNPS-50329802",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 43796668274 27",
    "childrenCount": 4,
    "annualLeaveBalance": 24,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Sénégalaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-143-s1",
        "skillName": "Gestion de la Relation Client (CRM)",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-143-s2",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-143-s3",
        "skillName": "Comptabilité Générale",
        "proficiencyLevel": "Intermédiaire",
        "category": "Finance, Comptabilité & Légal"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-143-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-7828",
        "assignedDate": "2021-05-10"
      },
      {
        "id": "eq-emp-143-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-4079",
        "assignedDate": "2021-05-10"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-144",
    "matricule": "EMP-2023-144",
    "firstName": "Hassane",
    "lastName": "N'Zi",
    "name": "Hassane N'Zi",
    "email": "hassane.nzi@sii-ci.com",
    "phone": "+225 01 57 17 75 30",
    "gender": "Masculin",
    "positionTitle": "Coordinateur des Boutiques & Points de Vente",
    "role": "Manager",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1991-07-05",
    "hireDate": "2019-05-23",
    "address": "Abidjan, Cocody Danga",
    "cnpsNumber": "CNPS-35872271",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 12442428958 32",
    "childrenCount": 1,
    "annualLeaveBalance": 15,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-144-s1",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-144-s2",
        "skillName": "Service Client / SAV",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-144-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-144-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-8478",
        "assignedDate": "2019-05-23"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-145",
    "matricule": "EMP-2023-145",
    "firstName": "Florence",
    "lastName": "Meïté",
    "name": "Florence Meïté",
    "email": "florence.meite@sii-ci.com",
    "phone": "+225 05 91 25 97 13",
    "gender": "Féminin",
    "positionTitle": "Responsable Merchandising & Animation Commerciale",
    "role": "Employee",
    "department": "Commercial & Relation Client",
    "status": "ACTIVE",
    "birthDate": "1994-08-06",
    "hireDate": "2020-06-16",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-56204319",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 85535075519 54",
    "childrenCount": 1,
    "annualLeaveBalance": 22,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Commercial",
      "positionTitle": "Directeur Commercial & Relation Client"
    },
    "skills": [
      {
        "id": "emp-145-s1",
        "skillName": "Stratégie Marketing",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-145-s2",
        "skillName": "Créativité / Innovation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-145-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-145-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-1449",
        "assignedDate": "2020-06-16"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-146",
    "matricule": "EMP-2023-146",
    "firstName": "Oumar",
    "lastName": "Gondo",
    "name": "Oumar Gondo",
    "email": "oumar.gondo@sii-ci.com",
    "phone": "+225 07 44 93 62 75",
    "gender": "Masculin",
    "positionTitle": "Directeur Marketing & Communication",
    "role": "Manager",
    "department": "Marketing & Communication",
    "status": "ACTIVE",
    "birthDate": "1990-03-21",
    "hireDate": "2019-11-01",
    "address": "Abidjan, Cocody Riviera Golf",
    "cnpsNumber": "CNPS-43875271",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 13439688162 38",
    "childrenCount": 2,
    "annualLeaveBalance": 22,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Burkinabé",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Marketing",
      "positionTitle": "Directeur Marketing & Communication"
    },
    "skills": [
      {
        "id": "emp-146-s1",
        "skillName": "Stratégie Marketing",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-146-s2",
        "skillName": "Marketing Digital",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-146-s3",
        "skillName": "Planification Stratégique",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-146-s4",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-146-s5",
        "skillName": "Créativité / Innovation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-146-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-6713",
        "assignedDate": "2019-11-01"
      },
      {
        "id": "eq-emp-146-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-8646",
        "assignedDate": "2019-11-01"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-147",
    "matricule": "EMP-2023-147",
    "firstName": "Aïcha",
    "lastName": "Meïté",
    "name": "Aïcha Meïté",
    "email": "aicha.meite@sii-ci.com",
    "phone": "+225 01 57 81 92 86",
    "gender": "Féminin",
    "positionTitle": "Responsable Marketing Digital & Growth",
    "role": "Employee",
    "department": "Marketing & Communication",
    "status": "ACTIVE",
    "birthDate": "1996-02-16",
    "hireDate": "2023-05-10",
    "address": "Abidjan, Cocody Riviera Palmeraie",
    "cnpsNumber": "CNPS-53639158",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 48604716387 91",
    "childrenCount": 2,
    "annualLeaveBalance": 22,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Marketing",
      "positionTitle": "Directeur Marketing & Communication"
    },
    "skills": [
      {
        "id": "emp-147-s1",
        "skillName": "Marketing Digital",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-147-s2",
        "skillName": "SEO / SEA",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-147-s3",
        "skillName": "Inbound Marketing",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-147-s4",
        "skillName": "Analyse de Données Marketing (Google Analytics)",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-147-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-5895",
        "assignedDate": "2023-05-10"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-148",
    "matricule": "EMP-2023-148",
    "firstName": "Thierry",
    "lastName": "Mensah",
    "name": "Thierry Mensah",
    "email": "thierry.mensah@sii-ci.com",
    "phone": "+225 01 27 13 93 73",
    "gender": "Masculin",
    "positionTitle": "Community Manager & Social Media Lead",
    "role": "Employee",
    "department": "Marketing & Communication",
    "status": "ACTIVE",
    "birthDate": "1987-07-24",
    "hireDate": "2021-05-14",
    "address": "Abidjan, Cocody Deux-Plateaux Vallons",
    "cnpsNumber": "CNPS-81757508",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 53765352378 38",
    "childrenCount": 4,
    "annualLeaveBalance": 25,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Malienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Marketing",
      "positionTitle": "Directeur Marketing & Communication"
    },
    "skills": [
      {
        "id": "emp-148-s1",
        "skillName": "Gestion des Réseaux Sociaux (Community Management)",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-148-s2",
        "skillName": "Copywriting",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-148-s3",
        "skillName": "Créativité / Innovation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-148-s4",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-148-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-3785",
        "assignedDate": "2021-05-14"
      },
      {
        "id": "eq-emp-148-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-5813",
        "assignedDate": "2021-05-14"
      }
    ],
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-149",
    "matricule": "EMP-2023-149",
    "firstName": "Rama",
    "lastName": "Logbo",
    "name": "Rama Logbo",
    "email": "rama.logbo@sii-ci.com",
    "phone": "+225 01 33 97 52 93",
    "gender": "Féminin",
    "positionTitle": "Chargé de Communication Interne & Événements",
    "role": "Employee",
    "department": "Marketing & Communication",
    "status": "ACTIVE",
    "birthDate": "1982-12-28",
    "hireDate": "2019-04-12",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-88593968",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 58667636522 43",
    "childrenCount": 2,
    "annualLeaveBalance": 28,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Marketing",
      "positionTitle": "Directeur Marketing & Communication"
    },
    "skills": [
      {
        "id": "emp-149-s1",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-149-s2",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-149-s3",
        "skillName": "Créativité / Innovation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-149-s4",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-149-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-1879",
        "assignedDate": "2019-04-12"
      },
      {
        "id": "eq-emp-149-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-8736",
        "assignedDate": "2019-04-12"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-150",
    "matricule": "EMP-2023-150",
    "firstName": "Junior",
    "lastName": "Barry",
    "name": "Junior Barry",
    "email": "junior.barry@sii-ci.com",
    "phone": "+225 05 16 29 27 35",
    "gender": "Masculin",
    "positionTitle": "Rédacteur Web & Copywriter Senior",
    "role": "Employee",
    "department": "Marketing & Communication",
    "status": "ACTIVE",
    "birthDate": "1989-03-11",
    "hireDate": "2021-07-19",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-94695784",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 74771592034 52",
    "childrenCount": 1,
    "annualLeaveBalance": 24,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Marketing",
      "positionTitle": "Directeur Marketing & Communication"
    },
    "skills": [
      {
        "id": "emp-150-s1",
        "skillName": "Copywriting",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-150-s2",
        "skillName": "SEO / SEA",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-150-s3",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-150-s4",
        "skillName": "Créativité / Innovation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-150-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-1077",
        "assignedDate": "2021-07-19"
      },
      {
        "id": "eq-emp-150-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-3762",
        "assignedDate": "2021-07-19"
      }
    ],
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-151",
    "matricule": "EMP-2023-151",
    "firstName": "Prisca",
    "lastName": "Gbané",
    "name": "Prisca Gbané",
    "email": "prisca.gbane@sii-ci.com",
    "phone": "+225 01 64 61 64 71",
    "gender": "Féminin",
    "positionTitle": "Spécialiste Référencement (SEO / SEA)",
    "role": "Employee",
    "department": "Marketing & Communication",
    "status": "ACTIVE",
    "birthDate": "1992-04-24",
    "hireDate": "2022-01-02",
    "address": "Abidjan, Marcory Zone 4C",
    "cnpsNumber": "CNPS-35578773",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 56780811240 77",
    "childrenCount": 0,
    "annualLeaveBalance": 14,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Marketing",
      "positionTitle": "Directeur Marketing & Communication"
    },
    "skills": [
      {
        "id": "emp-151-s1",
        "skillName": "SEO / SEA",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-151-s2",
        "skillName": "Analyse de Données Marketing (Google Analytics)",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-151-s3",
        "skillName": "Marketing Digital",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-151-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-5076",
        "assignedDate": "2022-01-02"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-152",
    "matricule": "EMP-2023-152",
    "firstName": "Abdoulaye",
    "lastName": "Meïté",
    "name": "Abdoulaye Meïté",
    "email": "abdoulaye.meite@sii-ci.com",
    "phone": "+225 01 49 31 18 15",
    "gender": "Masculin",
    "positionTitle": "Média Buyer & Publicité Digitale (Ads)",
    "role": "Employee",
    "department": "Marketing & Communication",
    "status": "ACTIVE",
    "birthDate": "1998-09-20",
    "hireDate": "2021-05-15",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-58217837",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 53524294203 72",
    "childrenCount": 1,
    "annualLeaveBalance": 19,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Burkinabé",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Marketing",
      "positionTitle": "Directeur Marketing & Communication"
    },
    "skills": [
      {
        "id": "emp-152-s1",
        "skillName": "Marketing Digital",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-152-s2",
        "skillName": "SEO / SEA",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-152-s3",
        "skillName": "Gestion de Budget",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-152-s4",
        "skillName": "Analyse de Données Marketing (Google Analytics)",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-152-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-4742",
        "assignedDate": "2021-05-15"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-153",
    "matricule": "EMP-2023-153",
    "firstName": "Nafissatou",
    "lastName": "Meïté",
    "name": "Nafissatou Meïté",
    "email": "nafissatou.meite@sii-ci.com",
    "phone": "+225 07 25 56 93 14",
    "gender": "Féminin",
    "positionTitle": "Graphiste & Designer Visuel Senior",
    "role": "Employee",
    "department": "Marketing & Communication",
    "status": "ACTIVE",
    "birthDate": "1999-09-20",
    "hireDate": "2022-11-09",
    "address": "Abidjan, Cocody Deux-Plateaux Vallons",
    "cnpsNumber": "CNPS-24510741",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 18567086391 94",
    "childrenCount": 0,
    "annualLeaveBalance": 15,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Marketing",
      "positionTitle": "Directeur Marketing & Communication"
    },
    "skills": [
      {
        "id": "emp-153-s1",
        "skillName": "Créativité / Innovation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-153-s2",
        "skillName": "UI/UX Design",
        "proficiencyLevel": "Avancé",
        "category": "Informatique & Tech (IT)"
      },
      {
        "id": "emp-153-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-153-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-8279",
        "assignedDate": "2022-11-09"
      }
    ],
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-154",
    "matricule": "EMP-2023-154",
    "firstName": "N'Guessan",
    "lastName": "Bahi",
    "name": "N'Guessan Bahi",
    "email": "n'guessan.bahi@sii-ci.com",
    "phone": "+225 01 90 11 48 63",
    "gender": "Masculin",
    "positionTitle": "Vidéaste & Monteur Multimédia",
    "role": "Employee",
    "department": "Marketing & Communication",
    "status": "ACTIVE",
    "birthDate": "1991-05-20",
    "hireDate": "2024-02-22",
    "address": "Abidjan, Yopougon Niangon Sud",
    "cnpsNumber": "CNPS-78663747",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 66423687691 23",
    "childrenCount": 0,
    "annualLeaveBalance": 23,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Marketing",
      "positionTitle": "Directeur Marketing & Communication"
    },
    "skills": [
      {
        "id": "emp-154-s1",
        "skillName": "Créativité / Innovation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-154-s2",
        "skillName": "Gestion des Réseaux Sociaux (Community Management)",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-154-s3",
        "skillName": "Autonomie",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-154-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-2741",
        "assignedDate": "2024-02-22"
      },
      {
        "id": "eq-emp-154-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-5308",
        "assignedDate": "2024-02-22"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-155",
    "matricule": "EMP-2023-155",
    "firstName": "Ténin",
    "lastName": "Yao",
    "name": "Ténin Yao",
    "email": "tenin.yao@sii-ci.com",
    "phone": "+225 07 80 73 36 98",
    "gender": "Féminin",
    "positionTitle": "Chef de Produit (Product Marketing Manager)",
    "role": "Employee",
    "department": "Marketing & Communication",
    "status": "ACTIVE",
    "birthDate": "1975-01-22",
    "hireDate": "2022-06-08",
    "address": "Abidjan, Cocody Riviera Palmeraie",
    "cnpsNumber": "CNPS-76317520",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 90896706153 95",
    "childrenCount": 1,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Malienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Marketing",
      "positionTitle": "Directeur Marketing & Communication"
    },
    "skills": [
      {
        "id": "emp-155-s1",
        "skillName": "Stratégie Marketing",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-155-s2",
        "skillName": "Suivi des KPI / OKR",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-155-s3",
        "skillName": "Design Thinking",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-155-s4",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-155-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-2659",
        "assignedDate": "2022-06-08"
      },
      {
        "id": "eq-emp-155-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-8483",
        "assignedDate": "2022-06-08"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-156",
    "matricule": "EMP-2023-156",
    "firstName": "Gilles",
    "lastName": "Koffi",
    "name": "Gilles Koffi",
    "email": "gilles.koffi@sii-ci.com",
    "phone": "+225 07 47 56 96 50",
    "gender": "Masculin",
    "positionTitle": "Responsable Relations Publiques & Presse",
    "role": "Employee",
    "department": "Marketing & Communication",
    "status": "ACTIVE",
    "birthDate": "1978-01-01",
    "hireDate": "2022-12-04",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-54112109",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 98748434062 31",
    "childrenCount": 2,
    "annualLeaveBalance": 28,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Marketing",
      "positionTitle": "Directeur Marketing & Communication"
    },
    "skills": [
      {
        "id": "emp-156-s1",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-156-s2",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-156-s3",
        "skillName": "Négociation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-156-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-2522",
        "assignedDate": "2022-12-04"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-157",
    "matricule": "EMP-2023-157",
    "firstName": "Blandine",
    "lastName": "Assi",
    "name": "Blandine Assi",
    "email": "blandine.assi@sii-ci.com",
    "phone": "+225 05 59 98 71 63",
    "gender": "Féminin",
    "positionTitle": "Chargé de Marque & Identité Visuelle",
    "role": "Employee",
    "department": "Marketing & Communication",
    "status": "ACTIVE",
    "birthDate": "1979-12-24",
    "hireDate": "2024-03-04",
    "address": "Abidjan, Cocody Deux-Plateaux Vallons",
    "cnpsNumber": "CNPS-89289163",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 23569499934 63",
    "childrenCount": 4,
    "annualLeaveBalance": 28,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Marketing",
      "positionTitle": "Directeur Marketing & Communication"
    },
    "skills": [
      {
        "id": "emp-157-s1",
        "skillName": "Marque Employeur",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-157-s2",
        "skillName": "Stratégie Marketing",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-157-s3",
        "skillName": "Créativité / Innovation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-157-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-7221",
        "assignedDate": "2024-03-04"
      },
      {
        "id": "eq-emp-157-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-3140",
        "assignedDate": "2024-03-04"
      }
    ],
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-158",
    "matricule": "EMP-2023-158",
    "firstName": "Elhadj",
    "lastName": "Konan",
    "name": "Elhadj Konan",
    "email": "elhadj.konan@sii-ci.com",
    "phone": "+225 07 43 93 50 11",
    "gender": "Masculin",
    "positionTitle": "Spécialiste Inbound Marketing & Automation",
    "role": "Employee",
    "department": "Marketing & Communication",
    "status": "ACTIVE",
    "birthDate": "1999-12-19",
    "hireDate": "2024-11-17",
    "address": "Abidjan, Bingerville Fehi Kessé",
    "cnpsNumber": "CNPS-80209719",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 56699796019 76",
    "childrenCount": 0,
    "annualLeaveBalance": 27,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Marketing",
      "positionTitle": "Directeur Marketing & Communication"
    },
    "skills": [
      {
        "id": "emp-158-s1",
        "skillName": "Inbound Marketing",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-158-s2",
        "skillName": "Marketing Digital",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-158-s3",
        "skillName": "Gestion de la Relation Client (CRM)",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-158-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-5072",
        "assignedDate": "2024-11-17"
      },
      {
        "id": "eq-emp-158-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-3435",
        "assignedDate": "2024-11-17"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-159",
    "matricule": "EMP-2023-159",
    "firstName": "Irène",
    "lastName": "Tanoh",
    "name": "Irène Tanoh",
    "email": "irene.tanoh@sii-ci.com",
    "phone": "+225 05 31 19 72 51",
    "gender": "Féminin",
    "positionTitle": "Chargé d'Études de Marché & Concurrence",
    "role": "Employee",
    "department": "Marketing & Communication",
    "status": "ACTIVE",
    "birthDate": "1976-09-08",
    "hireDate": "2020-06-09",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-20580463",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 63165843642 40",
    "childrenCount": 4,
    "annualLeaveBalance": 28,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Marketing",
      "positionTitle": "Directeur Marketing & Communication"
    },
    "skills": [
      {
        "id": "emp-159-s1",
        "skillName": "Stratégie Marketing",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-159-s2",
        "skillName": "Esprit Critique",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-159-s3",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-159-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-2442",
        "assignedDate": "2020-06-09"
      },
      {
        "id": "eq-emp-159-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-6178",
        "assignedDate": "2020-06-09"
      }
    ],
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "High",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-160",
    "matricule": "EMP-2023-160",
    "firstName": "Bakary",
    "lastName": "Traoré",
    "name": "Bakary Traoré",
    "email": "bakary.traore@sii-ci.com",
    "phone": "+225 05 62 14 81 80",
    "gender": "Masculin",
    "positionTitle": "Chargé de Communication RSE & Impact",
    "role": "Employee",
    "department": "Marketing & Communication",
    "status": "ACTIVE",
    "birthDate": "1994-10-21",
    "hireDate": "2019-02-26",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-71231190",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 38185003777 93",
    "childrenCount": 2,
    "annualLeaveBalance": 25,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Marketing",
      "positionTitle": "Directeur Marketing & Communication"
    },
    "skills": [
      {
        "id": "emp-160-s1",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-160-s2",
        "skillName": "Qualité de Vie au Travail (QVT)",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-160-s3",
        "skillName": "Créativité / Innovation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-160-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-4652",
        "assignedDate": "2019-02-26"
      },
      {
        "id": "eq-emp-160-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-8751",
        "assignedDate": "2019-02-26"
      }
    ],
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-161",
    "matricule": "EMP-2023-161",
    "firstName": "Danielle",
    "lastName": "Doffou",
    "name": "Danielle Doffou",
    "email": "danielle.doffou@sii-ci.com",
    "phone": "+225 07 10 53 55 91",
    "gender": "Féminin",
    "positionTitle": "Directeur des Opérations & Supply Chain",
    "role": "Manager",
    "department": "Opérations & Logistique",
    "status": "ACTIVE",
    "birthDate": "1991-06-23",
    "hireDate": "2025-05-18",
    "address": "Abidjan, Cocody Riviera Palmeraie",
    "cnpsNumber": "CNPS-28850770",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 35326894396 73",
    "childrenCount": 3,
    "annualLeaveBalance": 17,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Sénégalaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Opérations",
      "positionTitle": "Directeur Opérations & Logistique"
    },
    "skills": [
      {
        "id": "emp-161-s1",
        "skillName": "Supply Chain Management",
        "proficiencyLevel": "Expert",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-161-s2",
        "skillName": "Planification Stratégique",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-161-s3",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-161-s4",
        "skillName": "Amélioration Continue",
        "proficiencyLevel": "Expert",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-161-s5",
        "skillName": "Gestion de Budget",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-161-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-4209",
        "assignedDate": "2025-05-18"
      }
    ],
    "potential": "Low",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-162",
    "matricule": "EMP-2023-162",
    "firstName": "Alassane",
    "lastName": "Sow",
    "name": "Alassane Sow",
    "email": "alassane.sow@sii-ci.com",
    "phone": "+225 07 63 15 91 96",
    "gender": "Masculin",
    "positionTitle": "Responsable Logistique & Transport",
    "role": "Manager",
    "department": "Opérations & Logistique",
    "status": "ACTIVE",
    "birthDate": "1989-08-22",
    "hireDate": "2023-02-25",
    "address": "Abidjan, Yopougon Niangon Sud",
    "cnpsNumber": "CNPS-16519170",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 12142452709 77",
    "childrenCount": 3,
    "annualLeaveBalance": 29,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Malienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Opérations",
      "positionTitle": "Directeur Opérations & Logistique"
    },
    "skills": [
      {
        "id": "emp-162-s1",
        "skillName": "Logistique de Transport",
        "proficiencyLevel": "Expert",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-162-s2",
        "skillName": "Supply Chain Management",
        "proficiencyLevel": "Avancé",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-162-s3",
        "skillName": "Gestion des Risques",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-162-s4",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-162-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-3903",
        "assignedDate": "2023-02-25"
      },
      {
        "id": "eq-emp-162-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-3103",
        "assignedDate": "2023-02-25"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-163",
    "matricule": "EMP-2023-163",
    "firstName": "Ornella",
    "lastName": "Mensah",
    "name": "Ornella Mensah",
    "email": "ornella.mensah@sii-ci.com",
    "phone": "+225 01 59 63 87 98",
    "gender": "Féminin",
    "positionTitle": "Acheteur Senior Équipements & Prestations",
    "role": "Employee",
    "department": "Opérations & Logistique",
    "status": "ACTIVE",
    "birthDate": "1987-06-10",
    "hireDate": "2025-04-09",
    "address": "Abidjan, Koumassi Remblais",
    "cnpsNumber": "CNPS-90869462",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 27752696838 62",
    "childrenCount": 2,
    "annualLeaveBalance": 24,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Malienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Opérations",
      "positionTitle": "Directeur Opérations & Logistique"
    },
    "skills": [
      {
        "id": "emp-163-s1",
        "skillName": "Achat / Procurement",
        "proficiencyLevel": "Expert",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-163-s2",
        "skillName": "Négociation de Contrats B2B/B2C",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-163-s3",
        "skillName": "Gestion de Budget",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-163-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-4560",
        "assignedDate": "2025-04-09"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-164",
    "matricule": "EMP-2023-164",
    "firstName": "Alassane",
    "lastName": "Aka",
    "name": "Alassane Aka",
    "email": "alassane.aka@sii-ci.com",
    "phone": "+225 07 74 79 98 91",
    "gender": "Masculin",
    "positionTitle": "Acheteur IT & Licences Logicielles",
    "role": "Employee",
    "department": "Opérations & Logistique",
    "status": "ACTIVE",
    "birthDate": "1999-06-18",
    "hireDate": "2021-12-04",
    "address": "Abidjan, Koumassi Remblais",
    "cnpsNumber": "CNPS-66691738",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 86628183576 46",
    "childrenCount": 0,
    "annualLeaveBalance": 30,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Opérations",
      "positionTitle": "Directeur Opérations & Logistique"
    },
    "skills": [
      {
        "id": "emp-164-s1",
        "skillName": "Achat / Procurement",
        "proficiencyLevel": "Avancé",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-164-s2",
        "skillName": "Négociation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-164-s3",
        "skillName": "Anglais (Professionnel courant)",
        "proficiencyLevel": "Avancé",
        "category": "Langues"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-164-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-7240",
        "assignedDate": "2021-12-04"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-165",
    "matricule": "EMP-2023-165",
    "firstName": "Ténin",
    "lastName": "Gondo",
    "name": "Ténin Gondo",
    "email": "tenin.gondo@sii-ci.com",
    "phone": "+225 05 28 17 98 47",
    "gender": "Féminin",
    "positionTitle": "Gestionnaire des Stocks & Inventaires",
    "role": "Employee",
    "department": "Opérations & Logistique",
    "status": "ACTIVE",
    "birthDate": "1986-08-04",
    "hireDate": "2020-09-02",
    "address": "Abidjan, Yopougon Niangon Sud",
    "cnpsNumber": "CNPS-41889524",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 85793800892 59",
    "childrenCount": 2,
    "annualLeaveBalance": 15,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Burkinabé",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Opérations",
      "positionTitle": "Directeur Opérations & Logistique"
    },
    "skills": [
      {
        "id": "emp-165-s1",
        "skillName": "Gestion des Stocks",
        "proficiencyLevel": "Expert",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-165-s2",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-165-s3",
        "skillName": "Autonomie",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-165-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-7825",
        "assignedDate": "2020-09-02"
      },
      {
        "id": "eq-emp-165-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-1881",
        "assignedDate": "2020-09-02"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-166",
    "matricule": "EMP-2023-166",
    "firstName": "Eric",
    "lastName": "Kouamé",
    "name": "Eric Kouamé",
    "email": "eric.kouame@sii-ci.com",
    "phone": "+225 07 91 92 57 85",
    "gender": "Masculin",
    "positionTitle": "Chef d'Entrepôt Central & Magasin",
    "role": "Manager",
    "department": "Opérations & Logistique",
    "status": "ACTIVE",
    "birthDate": "1981-12-07",
    "hireDate": "2023-12-20",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-33326387",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 21521932057 33",
    "childrenCount": 0,
    "annualLeaveBalance": 26,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Opérations",
      "positionTitle": "Directeur Opérations & Logistique"
    },
    "skills": [
      {
        "id": "emp-166-s1",
        "skillName": "Gestion des Stocks",
        "proficiencyLevel": "Expert",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-166-s2",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-166-s3",
        "skillName": "Contrôle Qualité",
        "proficiencyLevel": "Avancé",
        "category": "Opérations & Logistique"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-166-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-5572",
        "assignedDate": "2023-12-20"
      },
      {
        "id": "eq-emp-166-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-3636",
        "assignedDate": "2023-12-20"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-167",
    "matricule": "EMP-2023-167",
    "firstName": "Aminata",
    "lastName": "Bakayoko",
    "name": "Aminata Bakayoko",
    "email": "aminata.bakayoko@sii-ci.com",
    "phone": "+225 07 29 51 86 16",
    "gender": "Féminin",
    "positionTitle": "Coordinateur Flotte Automobile & Missions",
    "role": "Employee",
    "department": "Opérations & Logistique",
    "status": "ACTIVE",
    "birthDate": "1996-05-16",
    "hireDate": "2025-11-20",
    "address": "Abidjan, Cocody Danga",
    "cnpsNumber": "CNPS-52662313",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 59607560231 19",
    "childrenCount": 1,
    "annualLeaveBalance": 19,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Malienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Opérations",
      "positionTitle": "Directeur Opérations & Logistique"
    },
    "skills": [
      {
        "id": "emp-167-s1",
        "skillName": "Logistique de Transport",
        "proficiencyLevel": "Avancé",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-167-s2",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-167-s3",
        "skillName": "Gestion du Stress",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-167-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-9276",
        "assignedDate": "2025-11-20"
      }
    ],
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-168",
    "matricule": "EMP-2023-168",
    "firstName": "N'Guessan",
    "lastName": "Doffou",
    "name": "N'Guessan Doffou",
    "email": "n'guessan.doffou@sii-ci.com",
    "phone": "+225 05 52 56 47 37",
    "gender": "Masculin",
    "positionTitle": "Ingénieur Amélioration Continue (Lean / 5S)",
    "role": "Employee",
    "department": "Opérations & Logistique",
    "status": "ACTIVE",
    "birthDate": "1990-09-27",
    "hireDate": "2025-10-17",
    "address": "Abidjan, Cocody Danga",
    "cnpsNumber": "CNPS-56440312",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 22922713498 95",
    "childrenCount": 4,
    "annualLeaveBalance": 21,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Opérations",
      "positionTitle": "Directeur Opérations & Logistique"
    },
    "skills": [
      {
        "id": "emp-168-s1",
        "skillName": "Amélioration Continue",
        "proficiencyLevel": "Expert",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-168-s2",
        "skillName": "Lean Management",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-168-s3",
        "skillName": "Résolution de Problèmes",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-168-s4",
        "skillName": "Conduite du Changement",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-168-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-4994",
        "assignedDate": "2025-10-17"
      },
      {
        "id": "eq-emp-168-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-7248",
        "assignedDate": "2025-10-17"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-169",
    "matricule": "EMP-2023-169",
    "firstName": "Béatrice",
    "lastName": "Camara",
    "name": "Béatrice Camara",
    "email": "beatrice.camara@sii-ci.com",
    "phone": "+225 07 76 57 75 75",
    "gender": "Féminin",
    "positionTitle": "Responsable Qualité (ISO 9001)",
    "role": "Manager",
    "department": "Opérations & Logistique",
    "status": "ACTIVE",
    "birthDate": "1984-11-07",
    "hireDate": "2022-08-02",
    "address": "Abidjan, Marcory Zone 4C",
    "cnpsNumber": "CNPS-81565674",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 31886966217 78",
    "childrenCount": 0,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Opérations",
      "positionTitle": "Directeur Opérations & Logistique"
    },
    "skills": [
      {
        "id": "emp-169-s1",
        "skillName": "Contrôle Qualité",
        "proficiencyLevel": "Expert",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-169-s2",
        "skillName": "Amélioration Continue",
        "proficiencyLevel": "Avancé",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-169-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-169-s4",
        "skillName": "Audit Financier",
        "proficiencyLevel": "Intermédiaire",
        "category": "Finance, Comptabilité & Légal"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-169-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-4492",
        "assignedDate": "2022-08-02"
      },
      {
        "id": "eq-emp-169-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-2702",
        "assignedDate": "2022-08-02"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-170",
    "matricule": "EMP-2023-170",
    "firstName": "Christian",
    "lastName": "Gondo",
    "name": "Christian Gondo",
    "email": "christian.gondo@sii-ci.com",
    "phone": "+225 07 13 68 52 14",
    "gender": "Masculin",
    "positionTitle": "Contrôleur Qualité Opérationnel",
    "role": "Employee",
    "department": "Opérations & Logistique",
    "status": "ACTIVE",
    "birthDate": "1980-05-18",
    "hireDate": "2019-02-02",
    "address": "Abidjan, Cocody Riviera Palmeraie",
    "cnpsNumber": "CNPS-64711545",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 43593599198 43",
    "childrenCount": 3,
    "annualLeaveBalance": 28,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Opérations",
      "positionTitle": "Directeur Opérations & Logistique"
    },
    "skills": [
      {
        "id": "emp-170-s1",
        "skillName": "Contrôle Qualité",
        "proficiencyLevel": "Avancé",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-170-s2",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-170-s3",
        "skillName": "Esprit Critique",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-170-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-8094",
        "assignedDate": "2019-02-02"
      }
    ],
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-171",
    "matricule": "EMP-2023-171",
    "firstName": "Saran",
    "lastName": "Logbo",
    "name": "Saran Logbo",
    "email": "saran.logbo@sii-ci.com",
    "phone": "+225 01 18 84 15 99",
    "gender": "Féminin",
    "positionTitle": "Planificateur de Production & Flux",
    "role": "Employee",
    "department": "Opérations & Logistique",
    "status": "ACTIVE",
    "birthDate": "1991-02-10",
    "hireDate": "2025-02-12",
    "address": "Abidjan, Cocody Danga",
    "cnpsNumber": "CNPS-47784631",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 92898670059 21",
    "childrenCount": 4,
    "annualLeaveBalance": 26,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Burkinabé",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Opérations",
      "positionTitle": "Directeur Opérations & Logistique"
    },
    "skills": [
      {
        "id": "emp-171-s1",
        "skillName": "Planification de Production",
        "proficiencyLevel": "Expert",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-171-s2",
        "skillName": "Supply Chain Management",
        "proficiencyLevel": "Avancé",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-171-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-171-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-1504",
        "assignedDate": "2025-02-12"
      },
      {
        "id": "eq-emp-171-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-3234",
        "assignedDate": "2025-02-12"
      }
    ],
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-172",
    "matricule": "EMP-2023-172",
    "firstName": "Ulrich",
    "lastName": "Gondo",
    "name": "Ulrich Gondo",
    "email": "ulrich.gondo@sii-ci.com",
    "phone": "+225 01 92 57 11 80",
    "gender": "Masculin",
    "positionTitle": "Responsable Transit, Douanes & Import-Export",
    "role": "Employee",
    "department": "Opérations & Logistique",
    "status": "ACTIVE",
    "birthDate": "1978-01-01",
    "hireDate": "2025-09-05",
    "address": "Abidjan, Yopougon Niangon Sud",
    "cnpsNumber": "CNPS-21425533",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 84707012032 80",
    "childrenCount": 2,
    "annualLeaveBalance": 20,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Opérations",
      "positionTitle": "Directeur Opérations & Logistique"
    },
    "skills": [
      {
        "id": "emp-172-s1",
        "skillName": "Logistique de Transport",
        "proficiencyLevel": "Avancé",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-172-s2",
        "skillName": "Droit des Affaires",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-172-s3",
        "skillName": "Anglais (Professionnel courant)",
        "proficiencyLevel": "Avancé",
        "category": "Langues"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-172-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-7760",
        "assignedDate": "2025-09-05"
      },
      {
        "id": "eq-emp-172-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-3637",
        "assignedDate": "2025-09-05"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-173",
    "matricule": "EMP-2023-173",
    "firstName": "Mariam",
    "lastName": "Fofana",
    "name": "Mariam Fofana",
    "email": "mariam.fofana@sii-ci.com",
    "phone": "+225 07 95 82 16 80",
    "gender": "Féminin",
    "positionTitle": "Gestionnaire Expéditions Régionales",
    "role": "Employee",
    "department": "Opérations & Logistique",
    "status": "ACTIVE",
    "birthDate": "1977-05-22",
    "hireDate": "2022-11-18",
    "address": "Abidjan, Cocody Riviera Palmeraie",
    "cnpsNumber": "CNPS-75389589",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 36191579900 84",
    "childrenCount": 2,
    "annualLeaveBalance": 25,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Opérations",
      "positionTitle": "Directeur Opérations & Logistique"
    },
    "skills": [
      {
        "id": "emp-173-s1",
        "skillName": "Logistique de Transport",
        "proficiencyLevel": "Avancé",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-173-s2",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-173-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-4842",
        "assignedDate": "2022-11-18"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-174",
    "matricule": "EMP-2023-174",
    "firstName": "Patrick",
    "lastName": "Doffou",
    "name": "Patrick Doffou",
    "email": "patrick.doffou@sii-ci.com",
    "phone": "+225 05 98 84 29 82",
    "gender": "Masculin",
    "positionTitle": "Technicien Logistique & Réception Marchandises",
    "role": "Employee",
    "department": "Opérations & Logistique",
    "status": "ACTIVE",
    "birthDate": "1985-07-06",
    "hireDate": "2023-06-26",
    "address": "Abidjan, Cocody Deux-Plateaux Vallons",
    "cnpsNumber": "CNPS-47135338",
    "bankName": "Ecobank Côte d'Ivoire",
    "bankAccount": "CI058 01003 99076832382 65",
    "childrenCount": 2,
    "annualLeaveBalance": 18,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Opérations",
      "positionTitle": "Directeur Opérations & Logistique"
    },
    "skills": [
      {
        "id": "emp-174-s1",
        "skillName": "Gestion des Stocks",
        "proficiencyLevel": "Avancé",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-174-s2",
        "skillName": "Esprit d'Équipe",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-174-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-6432",
        "assignedDate": "2023-06-26"
      },
      {
        "id": "eq-emp-174-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-8296",
        "assignedDate": "2023-06-26"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-175",
    "matricule": "EMP-2023-175",
    "firstName": "Grâce",
    "lastName": "Koffi",
    "name": "Grâce Koffi",
    "email": "grâce.koffi@sii-ci.com",
    "phone": "+225 01 87 20 45 27",
    "gender": "Féminin",
    "positionTitle": "Spécialiste Éco-Logistique & Recyclage",
    "role": "Employee",
    "department": "Opérations & Logistique",
    "status": "ACTIVE",
    "birthDate": "1998-11-03",
    "hireDate": "2023-04-09",
    "address": "Abidjan, Bingerville Fehi Kessé",
    "cnpsNumber": "CNPS-94775473",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 13831562592 74",
    "childrenCount": 0,
    "annualLeaveBalance": 26,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Opérations",
      "positionTitle": "Directeur Opérations & Logistique"
    },
    "skills": [
      {
        "id": "emp-175-s1",
        "skillName": "Amélioration Continue",
        "proficiencyLevel": "Avancé",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-175-s2",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-175-s3",
        "skillName": "Créativité / Innovation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-175-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-1600",
        "assignedDate": "2023-04-09"
      },
      {
        "id": "eq-emp-175-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-3435",
        "assignedDate": "2023-04-09"
      }
    ],
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-176",
    "matricule": "EMP-2023-176",
    "firstName": "Benoît",
    "lastName": "Camara",
    "name": "Benoît Camara",
    "email": "benoit.camara@sii-ci.com",
    "phone": "+225 07 69 74 75 21",
    "gender": "Masculin",
    "positionTitle": "Directeur Général Adjoint (DGA)",
    "role": "Administrator",
    "department": "Direction Générale & Juridique",
    "status": "ACTIVE",
    "birthDate": "1975-11-08",
    "hireDate": "2022-06-17",
    "address": "Grand-Bassam, Quartier France",
    "cnpsNumber": "CNPS-32259144",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 95821406006 97",
    "childrenCount": 1,
    "annualLeaveBalance": 28,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Direction",
      "positionTitle": "Directeur Direction Générale & Juridique"
    },
    "skills": [
      {
        "id": "emp-176-s1",
        "skillName": "Planification Stratégique",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-176-s2",
        "skillName": "Leadership",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-176-s3",
        "skillName": "Prise de Décision",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-176-s4",
        "skillName": "Management d'Équipe",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-176-s5",
        "skillName": "Droit des Affaires",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-176-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-3395",
        "assignedDate": "2022-06-17"
      },
      {
        "id": "eq-emp-176-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-6878",
        "assignedDate": "2022-06-17"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-177",
    "matricule": "EMP-2023-177",
    "firstName": "Zalika",
    "lastName": "Soro",
    "name": "Zalika Soro",
    "email": "zalika.soro@sii-ci.com",
    "phone": "+225 07 95 36 76 56",
    "gender": "Féminin",
    "positionTitle": "Secrétaire Général & Gouvernance",
    "role": "Manager",
    "department": "Direction Générale & Juridique",
    "status": "ACTIVE",
    "birthDate": "1976-01-21",
    "hireDate": "2022-08-15",
    "address": "Abidjan, Marcory Zone 4C",
    "cnpsNumber": "CNPS-45341684",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 98138625478 45",
    "childrenCount": 1,
    "annualLeaveBalance": 26,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Direction",
      "positionTitle": "Directeur Direction Générale & Juridique"
    },
    "skills": [
      {
        "id": "emp-177-s1",
        "skillName": "Droit des Affaires",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-177-s2",
        "skillName": "Conformité / Compliance (RGPD, etc.)",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-177-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-177-s4",
        "skillName": "Leadership",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-177-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-6985",
        "assignedDate": "2022-08-15"
      },
      {
        "id": "eq-emp-177-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-9465",
        "assignedDate": "2022-08-15"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-178",
    "matricule": "EMP-2023-178",
    "firstName": "Brahima",
    "lastName": "Sylla",
    "name": "Brahima Sylla",
    "email": "brahima.sylla@sii-ci.com",
    "phone": "+225 05 72 71 87 10",
    "gender": "Masculin",
    "positionTitle": "Directeur Juridique & Contentieux",
    "role": "Manager",
    "department": "Direction Générale & Juridique",
    "status": "ACTIVE",
    "birthDate": "1980-04-03",
    "hireDate": "2023-03-15",
    "address": "Abidjan, Treichville Arras",
    "cnpsNumber": "CNPS-35086055",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 36975871426 29",
    "childrenCount": 1,
    "annualLeaveBalance": 25,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Française",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Direction",
      "positionTitle": "Directeur Direction Générale & Juridique"
    },
    "skills": [
      {
        "id": "emp-178-s1",
        "skillName": "Droit des Affaires",
        "proficiencyLevel": "Expert",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-178-s2",
        "skillName": "Négociation de Contrats B2B/B2C",
        "proficiencyLevel": "Expert",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-178-s3",
        "skillName": "Gestion des Risques",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-178-s4",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-178-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-2938",
        "assignedDate": "2023-03-15"
      },
      {
        "id": "eq-emp-178-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-6410",
        "assignedDate": "2023-03-15"
      }
    ],
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "High",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-179",
    "matricule": "EMP-2023-179",
    "firstName": "Gisèle",
    "lastName": "Diallo",
    "name": "Gisèle Diallo",
    "email": "gisele.diallo@sii-ci.com",
    "phone": "+225 01 30 92 62 12",
    "gender": "Féminin",
    "positionTitle": "Juriste Contrats & Propriété Intellectuelle",
    "role": "Employee",
    "department": "Direction Générale & Juridique",
    "status": "ACTIVE",
    "birthDate": "1993-10-06",
    "hireDate": "2020-01-05",
    "address": "Abidjan, Cocody Riviera Golf",
    "cnpsNumber": "CNPS-29711900",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 16496751445 83",
    "childrenCount": 0,
    "annualLeaveBalance": 19,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Sénégalaise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Direction",
      "positionTitle": "Directeur Direction Générale & Juridique"
    },
    "skills": [
      {
        "id": "emp-179-s1",
        "skillName": "Droit des Affaires",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-179-s2",
        "skillName": "Négociation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-179-s3",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-179-1",
        "name": "Dell Latitude 5430",
        "serialNumber": "LAT-2023-9464",
        "assignedDate": "2020-01-05"
      },
      {
        "id": "eq-emp-179-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-5644",
        "assignedDate": "2020-01-05"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-180",
    "matricule": "EMP-2023-180",
    "firstName": "Guillaume",
    "lastName": "Tanoh",
    "name": "Guillaume Tanoh",
    "email": "guillaume.tanoh@sii-ci.com",
    "phone": "+225 07 38 62 86 28",
    "gender": "Masculin",
    "positionTitle": "Responsable Moyens Généraux & Bâtiments",
    "role": "Manager",
    "department": "Direction Générale & Juridique",
    "status": "ACTIVE",
    "birthDate": "1999-03-20",
    "hireDate": "2025-10-27",
    "address": "Abidjan, Yopougon Maroc",
    "cnpsNumber": "CNPS-55992559",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 32610944239 97",
    "childrenCount": 4,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Direction",
      "positionTitle": "Directeur Direction Générale & Juridique"
    },
    "skills": [
      {
        "id": "emp-180-s1",
        "skillName": "Gestion des Risques",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-180-s2",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-180-s3",
        "skillName": "Achat / Procurement",
        "proficiencyLevel": "Avancé",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-180-s4",
        "skillName": "Gestion de Budget",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-180-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-7315",
        "assignedDate": "2025-10-27"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-181",
    "matricule": "EMP-2023-181",
    "firstName": "Victoire",
    "lastName": "Dosso",
    "name": "Victoire Dosso",
    "email": "victoire.dosso@sii-ci.com",
    "phone": "+225 07 87 22 32 70",
    "gender": "Féminin",
    "positionTitle": "Responsable HSE & Sécurité Incendie",
    "role": "Manager",
    "department": "Direction Générale & Juridique",
    "status": "ACTIVE",
    "birthDate": "2000-09-17",
    "hireDate": "2023-10-02",
    "address": "Abidjan, Cocody Danga",
    "cnpsNumber": "CNPS-27492440",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 74824757295 94",
    "childrenCount": 0,
    "annualLeaveBalance": 27,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Malienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Direction",
      "positionTitle": "Directeur Direction Générale & Juridique"
    },
    "skills": [
      {
        "id": "emp-181-s1",
        "skillName": "Gestion des Risques",
        "proficiencyLevel": "Expert",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-181-s2",
        "skillName": "Qualité de Vie au Travail (QVT)",
        "proficiencyLevel": "Avancé",
        "category": "Ressources Humaines (RH)"
      },
      {
        "id": "emp-181-s3",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-181-s4",
        "skillName": "Prise de Décision",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-181-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-7068",
        "assignedDate": "2023-10-02"
      },
      {
        "id": "eq-emp-181-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-4759",
        "assignedDate": "2023-10-02"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-182",
    "matricule": "EMP-2023-182",
    "firstName": "Christian",
    "lastName": "N'Zi",
    "name": "Christian N'Zi",
    "email": "christian.nzi@sii-ci.com",
    "phone": "+225 01 83 22 64 27",
    "gender": "Masculin",
    "positionTitle": "Coordinateur RSE & Impact Environnemental",
    "role": "Employee",
    "department": "Direction Générale & Juridique",
    "status": "ACTIVE",
    "birthDate": "1982-02-10",
    "hireDate": "2021-08-25",
    "address": "Abidjan, Yopougon Niangon Sud",
    "cnpsNumber": "CNPS-10734097",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 46114862597 34",
    "childrenCount": 0,
    "annualLeaveBalance": 30,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Direction",
      "positionTitle": "Directeur Direction Générale & Juridique"
    },
    "skills": [
      {
        "id": "emp-182-s1",
        "skillName": "Amélioration Continue",
        "proficiencyLevel": "Avancé",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-182-s2",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-182-s3",
        "skillName": "Créativité / Innovation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-182-s4",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-182-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-1117",
        "assignedDate": "2021-08-25"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-183",
    "matricule": "EMP-2023-183",
    "firstName": "Grâce",
    "lastName": "Bakayoko",
    "name": "Grâce Bakayoko",
    "email": "grâce.bakayoko@sii-ci.com",
    "phone": "+225 05 93 84 42 43",
    "gender": "Féminin",
    "positionTitle": "Assistante de Direction Bilingue",
    "role": "Employee",
    "department": "Direction Générale & Juridique",
    "status": "ACTIVE",
    "birthDate": "1993-06-20",
    "hireDate": "2025-09-14",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-84834795",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 66709432476 80",
    "childrenCount": 4,
    "annualLeaveBalance": 19,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Direction",
      "positionTitle": "Directeur Direction Générale & Juridique"
    },
    "skills": [
      {
        "id": "emp-183-s1",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-183-s2",
        "skillName": "Communication Écrite",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-183-s3",
        "skillName": "Anglais (Professionnel courant)",
        "proficiencyLevel": "Expert",
        "category": "Langues"
      },
      {
        "id": "emp-183-s4",
        "skillName": "Gestion du Temps",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-183-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-8925",
        "assignedDate": "2025-09-14"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-184",
    "matricule": "EMP-2023-184",
    "firstName": "Christian",
    "lastName": "Coulibaly",
    "name": "Christian Coulibaly",
    "email": "christian.coulibaly@sii-ci.com",
    "phone": "+225 01 25 39 67 99",
    "gender": "Masculin",
    "positionTitle": "Office Manager & Vie d'Entreprise",
    "role": "Employee",
    "department": "Direction Générale & Juridique",
    "status": "ACTIVE",
    "birthDate": "1991-07-26",
    "hireDate": "2020-02-07",
    "address": "Abidjan, Marcory Zone 4C",
    "cnpsNumber": "CNPS-16986408",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 93969085440 99",
    "childrenCount": 1,
    "annualLeaveBalance": 26,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Direction",
      "positionTitle": "Directeur Direction Générale & Juridique"
    },
    "skills": [
      {
        "id": "emp-184-s1",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-184-s2",
        "skillName": "Intelligence Émotionnelle",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-184-s3",
        "skillName": "Gestion de Budget",
        "proficiencyLevel": "Intermédiaire",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-184-s4",
        "skillName": "Esprit d'Équipe",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-184-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-2492",
        "assignedDate": "2020-02-07"
      },
      {
        "id": "eq-emp-184-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-8133",
        "assignedDate": "2020-02-07"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-185",
    "matricule": "EMP-2023-185",
    "firstName": "Zalika",
    "lastName": "Bamba",
    "name": "Zalika Bamba",
    "email": "zalika.bamba@sii-ci.com",
    "phone": "+225 01 14 59 61 88",
    "gender": "Féminin",
    "positionTitle": "Gestionnaire Immobilier & Baux Professionnels",
    "role": "Employee",
    "department": "Direction Générale & Juridique",
    "status": "ACTIVE",
    "birthDate": "1997-10-02",
    "hireDate": "2024-09-10",
    "address": "Abidjan, Cocody Danga",
    "cnpsNumber": "CNPS-68917831",
    "bankName": "Standard Chartered CI",
    "bankAccount": "CI034 01007 96652129671 73",
    "childrenCount": 0,
    "annualLeaveBalance": 20,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Direction",
      "positionTitle": "Directeur Direction Générale & Juridique"
    },
    "skills": [
      {
        "id": "emp-185-s1",
        "skillName": "Négociation de Contrats B2B/B2C",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-185-s2",
        "skillName": "Droit des Affaires",
        "proficiencyLevel": "Avancé",
        "category": "Finance, Comptabilité & Légal"
      },
      {
        "id": "emp-185-s3",
        "skillName": "Gestion de Budget",
        "proficiencyLevel": "Intermédiaire",
        "category": "Management & Gestion de Projet"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-185-1",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-9489",
        "assignedDate": "2024-09-10"
      }
    ],
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-186",
    "matricule": "EMP-2023-186",
    "firstName": "Vamara",
    "lastName": "Konan",
    "name": "Vamara Konan",
    "email": "vamara.konan@sii-ci.com",
    "phone": "+225 05 40 93 10 30",
    "gender": "Masculin",
    "positionTitle": "Superviseur Sécurité Physique & Badges",
    "role": "Employee",
    "department": "Direction Générale & Juridique",
    "status": "ACTIVE",
    "birthDate": "1987-06-22",
    "hireDate": "2019-05-25",
    "address": "Abidjan, Marcory Résidentiel",
    "cnpsNumber": "CNPS-12062459",
    "bankName": "Banque Atlantique CI",
    "bankAccount": "CI064 01004 38286998926 76",
    "childrenCount": 0,
    "annualLeaveBalance": 16,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Malienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Direction",
      "positionTitle": "Directeur Direction Générale & Juridique"
    },
    "skills": [
      {
        "id": "emp-186-s1",
        "skillName": "Gestion des Risques",
        "proficiencyLevel": "Avancé",
        "category": "Management & Gestion de Projet"
      },
      {
        "id": "emp-186-s2",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-186-s3",
        "skillName": "Gestion du Stress",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-186-1",
        "name": "Lenovo ThinkPad X1 Carbon",
        "serialNumber": "THK-2024-6703",
        "assignedDate": "2019-05-25"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-187",
    "matricule": "EMP-2023-187",
    "firstName": "Florence",
    "lastName": "Sanogo",
    "name": "Florence Sanogo",
    "email": "florence.sanogo@sii-ci.com",
    "phone": "+225 01 10 43 32 62",
    "gender": "Féminin",
    "positionTitle": "Chargé des Relations Institutionnelles",
    "role": "Employee",
    "department": "Direction Générale & Juridique",
    "status": "ACTIVE",
    "birthDate": "1977-09-10",
    "hireDate": "2023-02-18",
    "address": "Abidjan, Marcory Zone 4C",
    "cnpsNumber": "CNPS-82196170",
    "bankName": "Société Générale CI",
    "bankAccount": "CI059 01001 82168087413 42",
    "childrenCount": 2,
    "annualLeaveBalance": 28,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Burkinabé",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Direction",
      "positionTitle": "Directeur Direction Générale & Juridique"
    },
    "skills": [
      {
        "id": "emp-187-s1",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-187-s2",
        "skillName": "Négociation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-187-s3",
        "skillName": "Droit des Affaires",
        "proficiencyLevel": "Intermédiaire",
        "category": "Finance, Comptabilité & Légal"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-187-1",
        "name": "HP EliteBook 840 G9",
        "serialNumber": "ELT-2024-8923",
        "assignedDate": "2023-02-18"
      },
      {
        "id": "eq-emp-187-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-8517",
        "assignedDate": "2023-02-18"
      }
    ],
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-188",
    "matricule": "EMP-2023-188",
    "firstName": "Romaric",
    "lastName": "Diabaté",
    "name": "Romaric Diabaté",
    "email": "romaric.diabate@sii-ci.com",
    "phone": "+225 05 91 38 96 99",
    "gender": "Masculin",
    "positionTitle": "Archiviste & Gestionnaire Documentaire (GED)",
    "role": "Employee",
    "department": "Direction Générale & Juridique",
    "status": "ACTIVE",
    "birthDate": "1986-09-18",
    "hireDate": "2020-06-14",
    "address": "Abidjan, Cocody Deux-Plateaux Vallons",
    "cnpsNumber": "CNPS-48559355",
    "bankName": "Coris Bank International CI",
    "bankAccount": "CI098 01006 47933911559 41",
    "childrenCount": 0,
    "annualLeaveBalance": 26,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ghanéenne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Direction",
      "positionTitle": "Directeur Direction Générale & Juridique"
    },
    "skills": [
      {
        "id": "emp-188-s1",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-188-s2",
        "skillName": "Autonomie",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-188-s3",
        "skillName": "Support IT / Helpdesk",
        "proficiencyLevel": "Intermédiaire",
        "category": "Informatique & Tech (IT)"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-188-1",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-6603",
        "assignedDate": "2020-06-14"
      }
    ],
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-189",
    "matricule": "EMP-2023-189",
    "firstName": "Nadège",
    "lastName": "Sangharé",
    "name": "Nadège Sangharé",
    "email": "nadege.sanghare@sii-ci.com",
    "phone": "+225 05 33 97 34 73",
    "gender": "Féminin",
    "positionTitle": "Gestionnaire Flotte Téléphonie & Télécoms",
    "role": "Employee",
    "department": "Direction Générale & Juridique",
    "status": "ACTIVE",
    "birthDate": "1998-04-28",
    "hireDate": "2024-04-08",
    "address": "Abidjan, Plateau (Avenue Chardy)",
    "cnpsNumber": "CNPS-93026670",
    "bankName": "NSIA Banque CI",
    "bankAccount": "CI062 01002 36754242624 41",
    "childrenCount": 2,
    "annualLeaveBalance": 18,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Ivoirienne",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Direction",
      "positionTitle": "Directeur Direction Générale & Juridique"
    },
    "skills": [
      {
        "id": "emp-189-s1",
        "skillName": "Achat / Procurement",
        "proficiencyLevel": "Intermédiaire",
        "category": "Opérations & Logistique"
      },
      {
        "id": "emp-189-s2",
        "skillName": "Sens de l'Organisation",
        "proficiencyLevel": "Avancé",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-189-s3",
        "skillName": "Service Client / SAV",
        "proficiencyLevel": "Intermédiaire",
        "category": "Vente, Marketing & Commerce"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-189-1",
        "name": "MacBook Pro 14\" M2",
        "serialNumber": "MBP-2023-2285",
        "assignedDate": "2024-04-08"
      },
      {
        "id": "eq-emp-189-2",
        "name": "Samsung Galaxy S23 Enterprise",
        "serialNumber": "SGS-2024-1108",
        "assignedDate": "2024-04-08"
      }
    ],
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-190",
    "matricule": "EMP-2023-190",
    "firstName": "Vincent",
    "lastName": "Komenan",
    "name": "Vincent Komenan",
    "email": "vincent.komenan@sii-ci.com",
    "phone": "+225 01 45 72 33 75",
    "gender": "Masculin",
    "positionTitle": "Superviseure Accueil & Standard VIP",
    "role": "Employee",
    "department": "Direction Générale & Juridique",
    "status": "ACTIVE",
    "birthDate": "1999-10-05",
    "hireDate": "2021-07-08",
    "address": "Abidjan, Cocody Deux-Plateaux Vallons",
    "cnpsNumber": "CNPS-82580645",
    "bankName": "BICICI (BNP Paribas)",
    "bankAccount": "CI005 01005 69267413020 71",
    "childrenCount": 0,
    "annualLeaveBalance": 30,
    "leaveBalanceSource": "CALCUL",
    "nationality": "Béninoise",
    "onboardingProgress": 100,
    "manager": {
      "firstName": "Directeur",
      "lastName": "Direction",
      "positionTitle": "Directeur Direction Générale & Juridique"
    },
    "skills": [
      {
        "id": "emp-190-s1",
        "skillName": "Communication Orale",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-190-s2",
        "skillName": "Écoute Active",
        "proficiencyLevel": "Expert",
        "category": "Soft Skills (Savoir-être)"
      },
      {
        "id": "emp-190-s3",
        "skillName": "Service Client / SAV",
        "proficiencyLevel": "Avancé",
        "category": "Vente, Marketing & Commerce"
      },
      {
        "id": "emp-190-s4",
        "skillName": "Anglais (Professionnel courant)",
        "proficiencyLevel": "Intermédiaire",
        "category": "Langues"
      }
    ],
    "equipment": [
      {
        "id": "eq-emp-190-1",
        "name": "MacBook Air M2 13\"",
        "serialNumber": "MBA-2023-3863",
        "assignedDate": "2021-07-08"
      },
      {
        "id": "eq-emp-190-2",
        "name": "iPhone 14 Pro Entreprise",
        "serialNumber": "IPH-2023-9490",
        "assignedDate": "2021-07-08"
      }
    ],
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  }
];

export const MOCK_190_TALENTS = [
  {
    "id": "emp-001",
    "employeeId": "emp-001",
    "name": "Raïssa Fofana",
    "position": "Lead Développeur Fullstack (React / Node)",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-002",
    "employeeId": "emp-002",
    "name": "Yves Gbané",
    "position": "Ingénieur Front-End Senior (React / TypeScript)",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-003",
    "employeeId": "emp-003",
    "name": "Grâce Diarra",
    "position": "Ingénieur Back-End Senior (Java / Spring Boot)",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-004",
    "employeeId": "emp-004",
    "name": "Cheick Mensah",
    "position": "Développeur Python & Microservices",
    "department": "Informatique & Systèmes d'Information",
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-005",
    "employeeId": "emp-005",
    "name": "Habiba Bakayoko",
    "position": "Développeur Mobile iOS (Swift)",
    "department": "Informatique & Systèmes d'Information",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-006",
    "employeeId": "emp-006",
    "name": "Ismaël Traoré",
    "position": "Développeur Mobile Android (Kotlin / Flutter)",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-007",
    "employeeId": "emp-007",
    "name": "Hortense Diabaté",
    "position": "Architecte Cloud & Infrastructure (AWS / Azure)",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-008",
    "employeeId": "emp-008",
    "name": "Losseni Soro",
    "position": "Ingénieur DevOps & CI/CD (Kubernetes)",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-009",
    "employeeId": "emp-009",
    "name": "Christelle Assi",
    "position": "Ingénieur SRE (Site Reliability Engineer)",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "High",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-010",
    "employeeId": "emp-010",
    "name": "Amara Bamba",
    "position": "Administrateur Systèmes & Réseaux (Linux)",
    "department": "Informatique & Systèmes d'Information",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-011",
    "employeeId": "emp-011",
    "name": "Irène Brou",
    "position": "Ingénieur Télécoms & Réseaux d'Entreprise",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "High",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-012",
    "employeeId": "emp-012",
    "name": "Vincent Diop",
    "position": "Développeur Fullstack Junior (Vue.js / PHP)",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-013",
    "employeeId": "emp-013",
    "name": "Aminata Barry",
    "position": "Ingénieur QA Automatisation & Tests",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-014",
    "employeeId": "emp-014",
    "name": "Fodé Koné",
    "position": "Testeur QA Fonctionnel & Recette Métier",
    "department": "Informatique & Systèmes d'Information",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-015",
    "employeeId": "emp-015",
    "name": "Chantal Sylla",
    "position": "UI/UX Designer Senior & Design System",
    "department": "Informatique & Systèmes d'Information",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-016",
    "employeeId": "emp-016",
    "name": "Guillaume Soro",
    "position": "UI/UX Designer & Ergonome Mobile",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-017",
    "employeeId": "emp-017",
    "name": "Dorothée Sylla",
    "position": "Technicien Support Informatique N2",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-018",
    "employeeId": "emp-018",
    "name": "Yves Camara",
    "position": "Gestionnaire Helpdesk & Parc Informatique",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-019",
    "employeeId": "emp-019",
    "name": "Raïssa Doumbia",
    "position": "Intégrateur Web & Accessibilité Numérique",
    "department": "Informatique & Systèmes d'Information",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-020",
    "employeeId": "emp-020",
    "name": "Lassina Bahi",
    "position": "Développeur API & Intégrations Middleware",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-021",
    "employeeId": "emp-021",
    "name": "Esther Dje",
    "position": "Architecte Logiciel Senior",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-022",
    "employeeId": "emp-022",
    "name": "Bakary N'Zi",
    "position": "Ingénieur DBA (PostgreSQL & Oracle)",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Low",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-023",
    "employeeId": "emp-023",
    "name": "Prisca Kra",
    "position": "Scrum Master & Facilitateur Agile",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-024",
    "employeeId": "emp-024",
    "name": "Bakary Yapi",
    "position": "Product Owner Plateforme Digitale",
    "department": "Informatique & Systèmes d'Information",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-025",
    "employeeId": "emp-025",
    "name": "Grâce Gnamien",
    "position": "Chef de Projet SI & Transformation Digitale",
    "department": "Informatique & Systèmes d'Information",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-026",
    "employeeId": "emp-026",
    "name": "Gilles Gbané",
    "position": "Développeur C# / .NET Core",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-027",
    "employeeId": "emp-027",
    "name": "Prisca Doffou",
    "position": "Développeur Go & Microservices Haute Performance",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-028",
    "employeeId": "emp-028",
    "name": "Tidiane Soro",
    "position": "Développeur Angular & Architecture SPA",
    "department": "Informatique & Systèmes d'Information",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-029",
    "employeeId": "emp-029",
    "name": "Gisèle Keita",
    "position": "Ingénieur Performance & Optimisation Web",
    "department": "Informatique & Systèmes d'Information",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-030",
    "employeeId": "emp-030",
    "name": "Elhadj Sow",
    "position": "Spécialiste Intégration ERP & CRM",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Low",
    "performance": "Low",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-031",
    "employeeId": "emp-031",
    "name": "Nafissatou Gbané",
    "position": "Responsable Infrastructure & Datacenter",
    "department": "Informatique & Systèmes d'Information",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-032",
    "employeeId": "emp-032",
    "name": "Tidiane Bahi",
    "position": "Ingénieur Virtualisation & Stockage",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "High",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-033",
    "employeeId": "emp-033",
    "name": "Yaoua Sanogo",
    "position": "Administrateur Outils Collaboratifs & Office 365",
    "department": "Informatique & Systèmes d'Information",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-034",
    "employeeId": "emp-034",
    "name": "Fodé Tanoh",
    "position": "Développeur Fullstack React / Python",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Low",
    "performance": "High",
    "flightRisk": "High",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-035",
    "employeeId": "emp-035",
    "name": "Florence Dosso",
    "position": "Directeur des Systèmes d'Information (DSI)",
    "department": "Informatique & Systèmes d'Information",
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-036",
    "employeeId": "emp-036",
    "name": "Fabrice Fofana",
    "position": "Lead Data Scientist (Machine Learning)",
    "department": "Data & Intelligence Artificielle",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-037",
    "employeeId": "emp-037",
    "name": "Ursule Gnamien",
    "position": "Ingénieur IA Générative & LLM",
    "department": "Data & Intelligence Artificielle",
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-038",
    "employeeId": "emp-038",
    "name": "Ismaël Gnamien",
    "position": "Data Engineer Senior (Pipelines ETL & Spark)",
    "department": "Data & Intelligence Artificielle",
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-039",
    "employeeId": "emp-039",
    "name": "Prisca Diabaté",
    "position": "Data Analyst Senior (Power BI & Tableau)",
    "department": "Data & Intelligence Artificielle",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-040",
    "employeeId": "emp-040",
    "name": "Junior Dosso",
    "position": "Business Intelligence Manager",
    "department": "Data & Intelligence Artificielle",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-041",
    "employeeId": "emp-041",
    "name": "Nafissatou Barry",
    "position": "Ingénieur Computer Vision & Deep Learning",
    "department": "Data & Intelligence Artificielle",
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-042",
    "employeeId": "emp-042",
    "name": "Olivier Sylla",
    "position": "Statisticien Modélisateur Prédictif",
    "department": "Data & Intelligence Artificielle",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-043",
    "employeeId": "emp-043",
    "name": "Laetitia N'Dri",
    "position": "Data Governance & Qualité des Données",
    "department": "Data & Intelligence Artificielle",
    "potential": "Low",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-044",
    "employeeId": "emp-044",
    "name": "Hamed Assi",
    "position": "Analyste Churn & Fidélisation Client",
    "department": "Data & Intelligence Artificielle",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-045",
    "employeeId": "emp-045",
    "name": "Ursule Komenan",
    "position": "Ingénieur MLOps (Déploiement Modèles IA)",
    "department": "Data & Intelligence Artificielle",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-046",
    "employeeId": "emp-046",
    "name": "Pascal Kane",
    "position": "Architecte Données d'Entreprise",
    "department": "Data & Intelligence Artificielle",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-047",
    "employeeId": "emp-047",
    "name": "Emmanuelle Bakayoko",
    "position": "Analyste Big Data & Streaming (Kafka)",
    "department": "Data & Intelligence Artificielle",
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-048",
    "employeeId": "emp-048",
    "name": "Guillaume Kouamé",
    "position": "Data Analyst RH & People Analytics",
    "department": "Data & Intelligence Artificielle",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-049",
    "employeeId": "emp-049",
    "name": "Ornella Bakayoko",
    "position": "Data Analyst Marketing & Web Analytics",
    "department": "Data & Intelligence Artificielle",
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-050",
    "employeeId": "emp-050",
    "name": "Benoît Traoré",
    "position": "Prompt Engineer & Formateur IA",
    "department": "Data & Intelligence Artificielle",
    "potential": "Low",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-051",
    "employeeId": "emp-051",
    "name": "Ursule Sylla",
    "position": "Analyste Risque Crédit & Modélisation",
    "department": "Data & Intelligence Artificielle",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-052",
    "employeeId": "emp-052",
    "name": "Moussa Doffou",
    "position": "Consultant Stratégie Data & IA",
    "department": "Data & Intelligence Artificielle",
    "potential": "Low",
    "performance": "Low",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-053",
    "employeeId": "emp-053",
    "name": "Christelle Keita",
    "position": "Administrateur Data Warehouse (Snowflake)",
    "department": "Data & Intelligence Artificielle",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-054",
    "employeeId": "emp-054",
    "name": "Christian Gbané",
    "position": "Développeur Dashboard & Reporting Métier",
    "department": "Data & Intelligence Artificielle",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-055",
    "employeeId": "emp-055",
    "name": "Kady Doumbia",
    "position": "Assistant Data Analyst Junior",
    "department": "Data & Intelligence Artificielle",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-056",
    "employeeId": "emp-056",
    "name": "Romaric N'Dri",
    "position": "Responsable Sécurité des SI (RSSI / CISO)",
    "department": "Cybersécurité & Risque",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-057",
    "employeeId": "emp-057",
    "name": "Ursule Assi",
    "position": "Ingénieur Pentesting & Sécurité Offensive",
    "department": "Cybersécurité & Risque",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-058",
    "employeeId": "emp-058",
    "name": "Ismaël Aka",
    "position": "Analyste SOC N2 (Monitoring Incidents)",
    "department": "Cybersécurité & Risque",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-059",
    "employeeId": "emp-059",
    "name": "Nafissatou Doffou",
    "position": "Ingénieur DevSecOps & Sécurité Applicative",
    "department": "Cybersécurité & Risque",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-060",
    "employeeId": "emp-060",
    "name": "Mamadou Soro",
    "position": "Consultant Gouvernance, Risque & Conformité (GRC)",
    "department": "Cybersécurité & Risque",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-061",
    "employeeId": "emp-061",
    "name": "Ténin N'Zi",
    "position": "Délégué à la Protection des Données (DPO)",
    "department": "Cybersécurité & Risque",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-062",
    "employeeId": "emp-062",
    "name": "Alassane Brou",
    "position": "Spécialiste Réponse à Incident & Forensics",
    "department": "Cybersécurité & Risque",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-063",
    "employeeId": "emp-063",
    "name": "Valérie Traoré",
    "position": "Ingénieur IAM (Gestion Identités & Accès)",
    "department": "Cybersécurité & Risque",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-064",
    "employeeId": "emp-064",
    "name": "Drissa Diop",
    "position": "Auditeur Sécurité Informatique (ISO 27001)",
    "department": "Cybersécurité & Risque",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-065",
    "employeeId": "emp-065",
    "name": "Irène Meïté",
    "position": "Spécialiste Plan de Continuité d'Activité (PCA)",
    "department": "Cybersécurité & Risque",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-066",
    "employeeId": "emp-066",
    "name": "Alassane Babo",
    "position": "Consultant Sécurité Réseau & Pare-feu",
    "department": "Cybersécurité & Risque",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-067",
    "employeeId": "emp-067",
    "name": "Carine Kouamé",
    "position": "Analyste Gestion des Vulnérabilités",
    "department": "Cybersécurité & Risque",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-068",
    "employeeId": "emp-068",
    "name": "Alassane Gbané",
    "position": "Spécialiste Lutte Anti-Fraude Numérique",
    "department": "Cybersécurité & Risque",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-069",
    "employeeId": "emp-069",
    "name": "Emmanuelle Aka",
    "position": "Ingénieur Cryptographie & PKI",
    "department": "Cybersécurité & Risque",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-070",
    "employeeId": "emp-070",
    "name": "Hassane Brou",
    "position": "Formateur & Sensibilisateur Sécurité IT",
    "department": "Cybersécurité & Risque",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-071",
    "employeeId": "emp-071",
    "name": "Aminata Bahi",
    "position": "Directeur des Ressources Humaines (DRH)",
    "department": "Ressources Humaines",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-072",
    "employeeId": "emp-072",
    "name": "Emmanuel Coulibaly",
    "position": "Responsable Développement des Compétences",
    "department": "Ressources Humaines",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-073",
    "employeeId": "emp-073",
    "name": "Fatoumata Cissé",
    "position": "Responsable Recrutement & Marque Employeur",
    "department": "Ressources Humaines",
    "potential": "Low",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-074",
    "employeeId": "emp-074",
    "name": "Kader Camara",
    "position": "Talent Acquisition Specialist (IT Sourcing)",
    "department": "Ressources Humaines",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-075",
    "employeeId": "emp-075",
    "name": "Grâce Mensah",
    "position": "Chargée de Recrutement Métiers Tertiaires",
    "department": "Ressources Humaines",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-076",
    "employeeId": "emp-076",
    "name": "Fabrice Diop",
    "position": "Responsable Paie & Administration du Personnel",
    "department": "Ressources Humaines",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-077",
    "employeeId": "emp-077",
    "name": "Esther Diarra",
    "position": "Gestionnaire de Paie & Charges Sociales",
    "department": "Ressources Humaines",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-078",
    "employeeId": "emp-078",
    "name": "Fabrice Bakayoko",
    "position": "Juriste Droit Social & Relations Syndicales",
    "department": "Ressources Humaines",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-079",
    "employeeId": "emp-079",
    "name": "Béatrice Bahi",
    "position": "Chargé des Relations Sociales & Délégués",
    "department": "Ressources Humaines",
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-080",
    "employeeId": "emp-080",
    "name": "Jean-Luc Dosso",
    "position": "Responsable Formation Continue & FDFP",
    "department": "Ressources Humaines",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-081",
    "employeeId": "emp-081",
    "name": "Mariam Diop",
    "position": "Chargé de Conception E-Learning & LMS",
    "department": "Ressources Humaines",
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-082",
    "employeeId": "emp-082",
    "name": "Cheick Camara",
    "position": "Conseiller Mobilité Interne & Carrières",
    "department": "Ressources Humaines",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-083",
    "employeeId": "emp-083",
    "name": "Christelle Sow",
    "position": "Responsable Rémunérations & Avantages (C&B)",
    "department": "Ressources Humaines",
    "potential": "Low",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-084",
    "employeeId": "emp-084",
    "name": "Hassane Koffi",
    "position": "People & Culture Lead",
    "department": "Ressources Humaines",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-085",
    "employeeId": "emp-085",
    "name": "Aïcha Yapi",
    "position": "Chargée de Qualité de Vie au Travail (QVT)",
    "department": "Ressources Humaines",
    "potential": "Low",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-086",
    "employeeId": "emp-086",
    "name": "Wilfried Barry",
    "position": "Assistant RH / Accueil & Onboarding",
    "department": "Ressources Humaines",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-087",
    "employeeId": "emp-087",
    "name": "Ornella Kane",
    "position": "Responsable Médecine du Travail & Santé",
    "department": "Ressources Humaines",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-088",
    "employeeId": "emp-088",
    "name": "Elhadj Fofana",
    "position": "Assistante Sociale d'Entreprise",
    "department": "Ressources Humaines",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-089",
    "employeeId": "emp-089",
    "name": "Esther Kra",
    "position": "Coordonnateur Santé Sécurité Travail (CSST)",
    "department": "Ressources Humaines",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-090",
    "employeeId": "emp-090",
    "name": "Brahima Brou",
    "position": "Consultant SIRH & Digitalisation RH",
    "department": "Ressources Humaines",
    "potential": "Low",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-091",
    "employeeId": "emp-091",
    "name": "Esther Traoré",
    "position": "Coach Interne & Facilitateur d'Équipe",
    "department": "Ressources Humaines",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-092",
    "employeeId": "emp-092",
    "name": "Souleymane Ouattara",
    "position": "Gestionnaire Contrats & Registre Personnel",
    "department": "Ressources Humaines",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-093",
    "employeeId": "emp-093",
    "name": "Florence Ouattara",
    "position": "Responsable Diversité, Équité & Inclusion (DEI)",
    "department": "Ressources Humaines",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-094",
    "employeeId": "emp-094",
    "name": "Amara Diallo",
    "position": "Chargé des Stages & Relations Campus",
    "department": "Ressources Humaines",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-095",
    "employeeId": "emp-095",
    "name": "Valérie Dosso",
    "position": "Auditeur Social & Climat d'Entreprise",
    "department": "Ressources Humaines",
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-096",
    "employeeId": "emp-096",
    "name": "Benoît Sylla",
    "position": "Directeur Administratif et Financier (DAF)",
    "department": "Finance & Comptabilité",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-097",
    "employeeId": "emp-097",
    "name": "Raïssa Doffou",
    "position": "Chef Comptable (Normes SYSCOHADA)",
    "department": "Finance & Comptabilité",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-098",
    "employeeId": "emp-098",
    "name": "Brahima Bamba",
    "position": "Comptable Général Senior",
    "department": "Finance & Comptabilité",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-099",
    "employeeId": "emp-099",
    "name": "Massandjé Traoré",
    "position": "Comptable Fournisseurs & Règlements",
    "department": "Finance & Comptabilité",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-100",
    "employeeId": "emp-100",
    "name": "Moussa Diarra",
    "position": "Comptable Clients & Recouvrement",
    "department": "Finance & Comptabilité",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-101",
    "employeeId": "emp-101",
    "name": "Dorothée Koffi",
    "position": "Contrôleur de Gestion Opérationnel",
    "department": "Finance & Comptabilité",
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-102",
    "employeeId": "emp-102",
    "name": "Gilles Coulibaly",
    "position": "Contrôleur Financier & Budget",
    "department": "Finance & Comptabilité",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-103",
    "employeeId": "emp-103",
    "name": "Salimata Barry",
    "position": "Auditeur Financier Interne",
    "department": "Finance & Comptabilité",
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-104",
    "employeeId": "emp-104",
    "name": "Wilfried Kouamé",
    "position": "Trésorier d'Entreprise & Cash Management",
    "department": "Finance & Comptabilité",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-105",
    "employeeId": "emp-105",
    "name": "Laetitia Gondo",
    "position": "Fiscaliste d'Entreprise (Code Général des Impôts)",
    "department": "Finance & Comptabilité",
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-106",
    "employeeId": "emp-106",
    "name": "Kader Meïté",
    "position": "Analyste Financier & Investissements",
    "department": "Finance & Comptabilité",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-107",
    "employeeId": "emp-107",
    "name": "Carine Brou",
    "position": "Gestionnaire Prêts & Crédits au Personnel",
    "department": "Finance & Comptabilité",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-108",
    "employeeId": "emp-108",
    "name": "Junior Tanoh",
    "position": "Assistant Contrôle de Gestion",
    "department": "Finance & Comptabilité",
    "potential": "Low",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-109",
    "employeeId": "emp-109",
    "name": "Raïssa Koffi",
    "position": "Comptable Immobilisations & Inventaires",
    "department": "Finance & Comptabilité",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-110",
    "employeeId": "emp-110",
    "name": "Nouhan Fofana",
    "position": "Responsable Trésorerie & Relations Bancaires",
    "department": "Finance & Comptabilité",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-111",
    "employeeId": "emp-111",
    "name": "Hortense Koné",
    "position": "Analyste Risque Financier & Marchés",
    "department": "Finance & Comptabilité",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-112",
    "employeeId": "emp-112",
    "name": "Hassane Yao",
    "position": "Chargé de Consolidation Financière",
    "department": "Finance & Comptabilité",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-113",
    "employeeId": "emp-113",
    "name": "Saran N'Zi",
    "position": "Opérateur Facturation & Rapprochement Bancaire",
    "department": "Finance & Comptabilité",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-114",
    "employeeId": "emp-114",
    "name": "Tidiane Camara",
    "position": "Contrôleur Interne & Processus Financiers",
    "department": "Finance & Comptabilité",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-115",
    "employeeId": "emp-115",
    "name": "Carine Keita",
    "position": "Économiste & Conjoncture Marché",
    "department": "Finance & Comptabilité",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-116",
    "employeeId": "emp-116",
    "name": "Wilfried Gondo",
    "position": "Spécialiste Financements Bailleurs & Subventions",
    "department": "Finance & Comptabilité",
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-117",
    "employeeId": "emp-117",
    "name": "Danielle Soro",
    "position": "Responsable Recouvrement Contentieux",
    "department": "Finance & Comptabilité",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-118",
    "employeeId": "emp-118",
    "name": "Zoumana Barry",
    "position": "Comptable Auxiliaire",
    "department": "Finance & Comptabilité",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-119",
    "employeeId": "emp-119",
    "name": "Affoué Sylla",
    "position": "Gestionnaire de Caisse Centrale",
    "department": "Finance & Comptabilité",
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-120",
    "employeeId": "emp-120",
    "name": "Roland Gohi",
    "position": "Auditeur Conformité Fiscale & Douanière",
    "department": "Finance & Comptabilité",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-121",
    "employeeId": "emp-121",
    "name": "Blandine Bamba",
    "position": "Directeur Commercial & Développement",
    "department": "Commercial & Relation Client",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-122",
    "employeeId": "emp-122",
    "name": "Patrick Gohi",
    "position": "Responsable Grands Comptes (Key Account Manager)",
    "department": "Commercial & Relation Client",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-123",
    "employeeId": "emp-123",
    "name": "Esther Cissé",
    "position": "Ingénieur Commercial B2B Solutions IT",
    "department": "Commercial & Relation Client",
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-124",
    "employeeId": "emp-124",
    "name": "Jean-Luc Koffi",
    "position": "Business Developer Senior FinTech",
    "department": "Commercial & Relation Client",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-125",
    "employeeId": "emp-125",
    "name": "Fatoumata Binate",
    "position": "Chargée de Clientèle Entreprises (PME)",
    "department": "Commercial & Relation Client",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-126",
    "employeeId": "emp-126",
    "name": "Désiré Doffou",
    "position": "Chargé de Clientèle Particuliers & Professionnels",
    "department": "Commercial & Relation Client",
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-127",
    "employeeId": "emp-127",
    "name": "Djeneba Gbané",
    "position": "Responsable Service Client & Expérience Client",
    "department": "Commercial & Relation Client",
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-128",
    "employeeId": "emp-128",
    "name": "Cédric Fofana",
    "position": "Téléconseiller Support Client N1",
    "department": "Commercial & Relation Client",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-129",
    "employeeId": "emp-129",
    "name": "Lou Yapi",
    "position": "Négociateur Contrats Commerciaux Internationaux",
    "department": "Commercial & Relation Client",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-130",
    "employeeId": "emp-130",
    "name": "Hamed Konan",
    "position": "Responsable Partenariats & Alliances Stratégiques",
    "department": "Commercial & Relation Client",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-131",
    "employeeId": "emp-131",
    "name": "Djeneba Bamba",
    "position": "Responsable Agence Commerciale Plateau",
    "department": "Commercial & Relation Client",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-132",
    "employeeId": "emp-132",
    "name": "Drissa Tanoh",
    "position": "Chef des Ventes Réseau Régional",
    "department": "Commercial & Relation Client",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-133",
    "employeeId": "emp-133",
    "name": "Hortense Kra",
    "position": "Customer Success Manager (SaaS B2B)",
    "department": "Commercial & Relation Client",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-134",
    "employeeId": "emp-134",
    "name": "Thierry Sanogo",
    "position": "Gestionnaire de Comptes Clés Télécom",
    "department": "Commercial & Relation Client",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-135",
    "employeeId": "emp-135",
    "name": "Aïcha Bahi",
    "position": "Chargé d'Appels d'Offres & Marchés Publics",
    "department": "Commercial & Relation Client",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-136",
    "employeeId": "emp-136",
    "name": "Pascal Bahi",
    "position": "Commercial Terrain Secteur Abidjan Sud",
    "department": "Commercial & Relation Client",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-137",
    "employeeId": "emp-137",
    "name": "Valérie Cissé",
    "position": "Commercial Terrain Secteur Abidjan Nord",
    "department": "Commercial & Relation Client",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-138",
    "employeeId": "emp-138",
    "name": "Benoît Logbo",
    "position": "Commercial Régional San Pedro (Port & Agro)",
    "department": "Commercial & Relation Client",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-139",
    "employeeId": "emp-139",
    "name": "Ténin Bamba",
    "position": "Commercial Régional Bouaké (Centre & Nord)",
    "department": "Commercial & Relation Client",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-140",
    "employeeId": "emp-140",
    "name": "Thierry Traoré",
    "position": "Spécialiste Expérience Client (CX)",
    "department": "Commercial & Relation Client",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-141",
    "employeeId": "emp-141",
    "name": "Kady Diallo",
    "position": "Chargé de Prospection Téléphonique (Inside Sales)",
    "department": "Commercial & Relation Client",
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-142",
    "employeeId": "emp-142",
    "name": "Jean-Luc Sangharé",
    "position": "Conseiller Solutions Bancaires & FinTech",
    "department": "Commercial & Relation Client",
    "potential": "Low",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-143",
    "employeeId": "emp-143",
    "name": "Yaoua Diop",
    "position": "Administrateur Ventes & Facturation Clients",
    "department": "Commercial & Relation Client",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-144",
    "employeeId": "emp-144",
    "name": "Hassane N'Zi",
    "position": "Coordinateur des Boutiques & Points de Vente",
    "department": "Commercial & Relation Client",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-145",
    "employeeId": "emp-145",
    "name": "Florence Meïté",
    "position": "Responsable Merchandising & Animation Commerciale",
    "department": "Commercial & Relation Client",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-146",
    "employeeId": "emp-146",
    "name": "Oumar Gondo",
    "position": "Directeur Marketing & Communication",
    "department": "Marketing & Communication",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-147",
    "employeeId": "emp-147",
    "name": "Aïcha Meïté",
    "position": "Responsable Marketing Digital & Growth",
    "department": "Marketing & Communication",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-148",
    "employeeId": "emp-148",
    "name": "Thierry Mensah",
    "position": "Community Manager & Social Media Lead",
    "department": "Marketing & Communication",
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-149",
    "employeeId": "emp-149",
    "name": "Rama Logbo",
    "position": "Chargé de Communication Interne & Événements",
    "department": "Marketing & Communication",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-150",
    "employeeId": "emp-150",
    "name": "Junior Barry",
    "position": "Rédacteur Web & Copywriter Senior",
    "department": "Marketing & Communication",
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-151",
    "employeeId": "emp-151",
    "name": "Prisca Gbané",
    "position": "Spécialiste Référencement (SEO / SEA)",
    "department": "Marketing & Communication",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-152",
    "employeeId": "emp-152",
    "name": "Abdoulaye Meïté",
    "position": "Média Buyer & Publicité Digitale (Ads)",
    "department": "Marketing & Communication",
    "potential": "High",
    "performance": "High",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-153",
    "employeeId": "emp-153",
    "name": "Nafissatou Meïté",
    "position": "Graphiste & Designer Visuel Senior",
    "department": "Marketing & Communication",
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-154",
    "employeeId": "emp-154",
    "name": "N'Guessan Bahi",
    "position": "Vidéaste & Monteur Multimédia",
    "department": "Marketing & Communication",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-155",
    "employeeId": "emp-155",
    "name": "Ténin Yao",
    "position": "Chef de Produit (Product Marketing Manager)",
    "department": "Marketing & Communication",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-156",
    "employeeId": "emp-156",
    "name": "Gilles Koffi",
    "position": "Responsable Relations Publiques & Presse",
    "department": "Marketing & Communication",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-157",
    "employeeId": "emp-157",
    "name": "Blandine Assi",
    "position": "Chargé de Marque & Identité Visuelle",
    "department": "Marketing & Communication",
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-158",
    "employeeId": "emp-158",
    "name": "Elhadj Konan",
    "position": "Spécialiste Inbound Marketing & Automation",
    "department": "Marketing & Communication",
    "potential": "High",
    "performance": "High",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-159",
    "employeeId": "emp-159",
    "name": "Irène Tanoh",
    "position": "Chargé d'Études de Marché & Concurrence",
    "department": "Marketing & Communication",
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "High",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-160",
    "employeeId": "emp-160",
    "name": "Bakary Traoré",
    "position": "Chargé de Communication RSE & Impact",
    "department": "Marketing & Communication",
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-161",
    "employeeId": "emp-161",
    "name": "Danielle Doffou",
    "position": "Directeur des Opérations & Supply Chain",
    "department": "Opérations & Logistique",
    "potential": "Low",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-162",
    "employeeId": "emp-162",
    "name": "Alassane Sow",
    "position": "Responsable Logistique & Transport",
    "department": "Opérations & Logistique",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-163",
    "employeeId": "emp-163",
    "name": "Ornella Mensah",
    "position": "Acheteur Senior Équipements & Prestations",
    "department": "Opérations & Logistique",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-164",
    "employeeId": "emp-164",
    "name": "Alassane Aka",
    "position": "Acheteur IT & Licences Logicielles",
    "department": "Opérations & Logistique",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-165",
    "employeeId": "emp-165",
    "name": "Ténin Gondo",
    "position": "Gestionnaire des Stocks & Inventaires",
    "department": "Opérations & Logistique",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-166",
    "employeeId": "emp-166",
    "name": "Eric Kouamé",
    "position": "Chef d'Entrepôt Central & Magasin",
    "department": "Opérations & Logistique",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-167",
    "employeeId": "emp-167",
    "name": "Aminata Bakayoko",
    "position": "Coordinateur Flotte Automobile & Missions",
    "department": "Opérations & Logistique",
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-168",
    "employeeId": "emp-168",
    "name": "N'Guessan Doffou",
    "position": "Ingénieur Amélioration Continue (Lean / 5S)",
    "department": "Opérations & Logistique",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-169",
    "employeeId": "emp-169",
    "name": "Béatrice Camara",
    "position": "Responsable Qualité (ISO 9001)",
    "department": "Opérations & Logistique",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-170",
    "employeeId": "emp-170",
    "name": "Christian Gondo",
    "position": "Contrôleur Qualité Opérationnel",
    "department": "Opérations & Logistique",
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-171",
    "employeeId": "emp-171",
    "name": "Saran Logbo",
    "position": "Planificateur de Production & Flux",
    "department": "Opérations & Logistique",
    "potential": "Low",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-172",
    "employeeId": "emp-172",
    "name": "Ulrich Gondo",
    "position": "Responsable Transit, Douanes & Import-Export",
    "department": "Opérations & Logistique",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-173",
    "employeeId": "emp-173",
    "name": "Mariam Fofana",
    "position": "Gestionnaire Expéditions Régionales",
    "department": "Opérations & Logistique",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-174",
    "employeeId": "emp-174",
    "name": "Patrick Doffou",
    "position": "Technicien Logistique & Réception Marchandises",
    "department": "Opérations & Logistique",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-175",
    "employeeId": "emp-175",
    "name": "Grâce Koffi",
    "position": "Spécialiste Éco-Logistique & Recyclage",
    "department": "Opérations & Logistique",
    "potential": "High",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-176",
    "employeeId": "emp-176",
    "name": "Benoît Camara",
    "position": "Directeur Général Adjoint (DGA)",
    "department": "Direction Générale & Juridique",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-177",
    "employeeId": "emp-177",
    "name": "Zalika Soro",
    "position": "Secrétaire Général & Gouvernance",
    "department": "Direction Générale & Juridique",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-178",
    "employeeId": "emp-178",
    "name": "Brahima Sylla",
    "position": "Directeur Juridique & Contentieux",
    "department": "Direction Générale & Juridique",
    "potential": "Medium",
    "performance": "Low",
    "flightRisk": "High",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-179",
    "employeeId": "emp-179",
    "name": "Gisèle Diallo",
    "position": "Juriste Contrats & Propriété Intellectuelle",
    "department": "Direction Générale & Juridique",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-180",
    "employeeId": "emp-180",
    "name": "Guillaume Tanoh",
    "position": "Responsable Moyens Généraux & Bâtiments",
    "department": "Direction Générale & Juridique",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-181",
    "employeeId": "emp-181",
    "name": "Victoire Dosso",
    "position": "Responsable HSE & Sécurité Incendie",
    "department": "Direction Générale & Juridique",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-182",
    "employeeId": "emp-182",
    "name": "Christian N'Zi",
    "position": "Coordinateur RSE & Impact Environnemental",
    "department": "Direction Générale & Juridique",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Medium",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-183",
    "employeeId": "emp-183",
    "name": "Grâce Bakayoko",
    "position": "Assistante de Direction Bilingue",
    "department": "Direction Générale & Juridique",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-184",
    "employeeId": "emp-184",
    "name": "Christian Coulibaly",
    "position": "Office Manager & Vie d'Entreprise",
    "department": "Direction Générale & Juridique",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "Low",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-185",
    "employeeId": "emp-185",
    "name": "Zalika Bamba",
    "position": "Gestionnaire Immobilier & Baux Professionnels",
    "department": "Direction Générale & Juridique",
    "potential": "High",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-186",
    "employeeId": "emp-186",
    "name": "Vamara Konan",
    "position": "Superviseur Sécurité Physique & Badges",
    "department": "Direction Générale & Juridique",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-187",
    "employeeId": "emp-187",
    "name": "Florence Sanogo",
    "position": "Chargé des Relations Institutionnelles",
    "department": "Direction Générale & Juridique",
    "potential": "Medium",
    "performance": "High",
    "flightRisk": "Medium",
    "readiness": "Prêt maintenant"
  },
  {
    "id": "emp-188",
    "employeeId": "emp-188",
    "name": "Romaric Diabaté",
    "position": "Archiviste & Gestionnaire Documentaire (GED)",
    "department": "Direction Générale & Juridique",
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "1-2 ans"
  },
  {
    "id": "emp-189",
    "employeeId": "emp-189",
    "name": "Nadège Sangharé",
    "position": "Gestionnaire Flotte Téléphonie & Télécoms",
    "department": "Direction Générale & Juridique",
    "potential": "High",
    "performance": "Low",
    "flightRisk": "Low",
    "readiness": "3-5 ans"
  },
  {
    "id": "emp-190",
    "employeeId": "emp-190",
    "name": "Vincent Komenan",
    "position": "Superviseure Accueil & Standard VIP",
    "department": "Direction Générale & Juridique",
    "potential": "Medium",
    "performance": "Medium",
    "flightRisk": "High",
    "readiness": "Prêt maintenant"
  }
];

export default MOCK_190_EMPLOYEES;
