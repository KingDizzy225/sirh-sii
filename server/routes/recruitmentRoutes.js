const express = require('express');
const router = express.Router();

// Mock endpoints pour l'API Recrutement (Maintien de compatibilité avec le Frontend)
const mockJobs = [
    { id: 1, title: 'Senior Frontend Engineer', department: 'Engineering', location: 'À distance', status: 'Actif', postedAt: 'il y a 5 jours', type: 'CDI', experience: 'Senior', description: 'Nous recherchons un Développeur Frontend Senior expérimenté...', requirements: 'React, TypeScript, 5+ années d\'expérience' },
    { id: 2, title: 'Product Marketing Manager', department: 'Marketing', location: 'Abidjan, CI', status: 'Actif', postedAt: 'il y a 12 jours', type: 'CDI', experience: 'Intermédiaire', description: 'Pilotez notre stratégie marketing produit...', requirements: '3+ années d\'expérience en marketing B2B' }
];

const mockApplicants = [
    { id: 101, jobId: 1, firstName: 'Alex', lastName: 'Martin', email: 'alex@example.com', stage: 'SCREENING', score: null },
    { id: 102, jobId: 1, firstName: 'Sarah', lastName: 'Jenkins', email: 'sarah@example.com', stage: 'INTERVIEW', score: null }
];

router.get('/jobs', (req, res) => {
    res.json(mockJobs);
});

router.post('/jobs', (req, res) => {
    const newJob = { id: Date.now(), ...req.body, status: 'Actif', postedAt: 'À l\'instant' };
    mockJobs.push(newJob);
    res.status(201).json(newJob);
});

router.get('/applicants', (req, res) => {
    res.json(mockApplicants);
});

router.post('/applicants', (req, res) => {
    const newApplicant = { id: Date.now(), ...req.body, stage: 'SCREENING', score: null };
    mockApplicants.push(newApplicant);
    res.status(201).json(newApplicant);
});

router.put('/applicants/:candidateId/status', (req, res) => {
    const { candidateId } = req.params;
    const { status } = req.body;

    const candidate = mockApplicants.find(c => c.id === parseInt(candidateId));
    if (candidate) {
        candidate.stage = status;
        res.json(candidate);
    } else {
        res.status(404).json({ error: 'Candidat non trouvé' });
    }
});

module.exports = router;
