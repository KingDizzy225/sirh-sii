const prisma = require('../prismaClient');

// =============== JOB OFFERS ===============

exports.getAllJobOffers = async (req, res) => {
    try {
        const offers = await prisma.jobOffer.findMany({
            include: { applicants: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(offers);
    } catch (error) {
        console.error('Error fetching job offers:', error);
        res.status(500).json({ error: 'Failed to fetch job offers' });
    }
};

exports.createJobOffer = async (req, res) => {
    try {
        const { title, department, location, type, experience, description, requirements } = req.body;

        const newOffer = await prisma.jobOffer.create({
            data: {
                title,
                department,
                location,
                type,
                experience,
                description,
                requirements,
                status: 'PUBLISHED'
            }
        });

        res.status(201).json(newOffer);
    } catch (error) {
        console.error('Error creating job offer:', error);
        res.status(500).json({ error: 'Failed to create job offer' });
    }
};

exports.updateJobOfferStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'PUBLISHED', 'CLOSED', 'DRAFT'

        const updatedOffer = await prisma.jobOffer.update({
            where: { id },
            data: { status }
        });

        res.status(200).json(updatedOffer);
    } catch (error) {
        console.error('Error updating job offer status:', error);
        res.status(500).json({ error: 'Failed to update job offer status' });
    }
};

// =============== APPLICANTS ===============

exports.getAllApplicants = async (req, res) => {
    try {
        const applicants = await prisma.applicant.findMany({
            include: { jobOffer: true },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(applicants);
    } catch (error) {
        console.error('Error fetching applicants:', error);
        res.status(500).json({ error: 'Failed to fetch applicants' });
    }
};

exports.createApplicant = async (req, res) => {
    try {
        const { jobOfferId, firstName, lastName, email, phone, resumeUrl, experience } = req.body;

        const newApplicant = await prisma.applicant.create({
            data: {
                jobOfferId,
                firstName,
                lastName,
                email,
                phone,
                resumeUrl,
                experience,
                status: 'NEW'
            }
        });

        res.status(201).json(newApplicant);
    } catch (error) {
        console.error('Error creating applicant:', error);
        res.status(500).json({ error: 'Failed to create applicant' });
    }
};

exports.updateApplicantStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'NEW', 'REVIEWING', 'INTERVIEW', 'OFFER', 'REJECTED'

        const updatedApplicant = await prisma.applicant.update({
            where: { id },
            data: { status }
        });

        res.status(200).json(updatedApplicant);
    } catch (error) {
        console.error('Error updating applicant status:', error);
        res.status(500).json({ error: 'Failed to update applicant status' });
    }
};
