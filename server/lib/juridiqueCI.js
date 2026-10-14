/**
 * Référentiel et Moteur d'Analyse Juridique — Droit du Travail de Côte d'Ivoire.
 *
 * Sources de référence :
 *  - Loi n° 2015-532 du 20 juillet 2015 portant Code du travail en Côte d'Ivoire.
 *  - Décret n° 96-203 du 7 mars 1996 (durée du travail, travail de nuit, heures supplémentaires).
 *  - Convention Collective Interprofessionnelle (CCNI) de la République de Côte d'Ivoire.
 */

const SYSTEM_PROMPT_JURIDIQUE = `Tu es l'Expert Juridique RH de SIRH-SII, spécialisé en droit social et droit du travail en République de Côte d'Ivoire.
Tu conseilles la Direction des Ressources Humaines de SII, partenaire de distribution Orange Côte d'Ivoire.

Tes compétences reposent sur :
1. La Loi n° 2015-532 du 20 juillet 2015 portant Code du travail de Côte d'Ivoire.
2. Les Décrets d'application (notamment Décret 96-203 sur les heures supplémentaires et le travail de nuit).
3. La Convention Collective Interprofessionnelle (CCNI) de Côte d'Ivoire.
4. Les barèmes sociaux de la CNPS (Caisse Nationale de Prévoyance Sociale) et de la CMU (Caisse Nationale d'Assurance Maladie).

Règles de déontologie et de précision :
- Cite TOUJOURS précisément les articles de lois ou de la convention collective applicables (ex: "Selon l'article 16.11 du Code du travail..." ou "Conformément à l'article 34 de la CCNI...").
- Rappelle toujours les formalités obligatoires (demande d'explications écrites préalable avec délai de réponse de 48h à 72h, notification écrite avec accusé de réception, notification à l'Inspection du Travail le cas échéant).
- Sois pragmatique, structuré et bienveillant, orienté vers la sécurisation du risque employeur et le respect scrupuleux des droits des salariés.
- Rédige tes réponses en français soigné et professionnel.`;

/**
 * Calculateur exact de l'indemnité légale de licenciement selon l'article 34 de la CCNI.
 * @param {number} salaireMoyenMensuel - Salaire global moyen mensuel des 12 derniers mois
 * @param {number} ancienneteAnnees - Nombre d'années de service (révolues + prorata)
 */
function calculerIndemniteLicenciement(salaireMoyenMensuel, ancienneteAnnees) {
    if (!salaireMoyenMensuel || salaireMoyenMensuel <= 0 || !ancienneteAnnees || ancienneteAnnees < 1) {
        return { total: 0, details: [] };
    }

    const salaire = Number(salaireMoyenMensuel);
    const anciennete = Number(ancienneteAnnees);
    const tranches = [];
    let montantTotal = 0;

    // Tranche 1 : De la 1ère à la 5ème année (30% du salaire mensuel moyen par année)
    const anneesTranche1 = Math.min(anciennete, 5);
    if (anneesTranche1 > 0) {
        const montantT1 = anneesTranche1 * (salaire * 0.30);
        montantTotal += montantT1;
        tranches.push({
            tranche: '1 à 5 ans (30%)',
            annees: Math.round(anneesTranche1 * 100) / 100,
            taux: '30%',
            montant: Math.round(montantT1)
        });
    }

    // Tranche 2 : De la 6ème à la 10ème année (35% du salaire mensuel moyen par année)
    if (anciennete > 5) {
        const anneesTranche2 = Math.min(anciennete - 5, 5);
        const montantT2 = anneesTranche2 * (salaire * 0.35);
        montantTotal += montantT2;
        tranches.push({
            tranche: '6 à 10 ans (35%)',
            annees: Math.round(anneesTranche2 * 100) / 100,
            taux: '35%',
            montant: Math.round(montantT2)
        });
    }

    // Tranche 3 : Au-delà de la 10ème année (40% du salaire mensuel moyen par année)
    if (anciennete > 10) {
        const anneesTranche3 = anciennete - 10;
        const montantT3 = anneesTranche3 * (salaire * 0.40);
        montantTotal += montantT3;
        tranches.push({
            tranche: 'Plus de 10 ans (40%)',
            annees: Math.round(anneesTranche3 * 100) / 100,
            taux: '40%',
            montant: Math.round(montantT3)
        });
    }

    return {
        salaireMoyen: Math.round(salaire),
        anciennete: Math.round(anciennete * 100) / 100,
        total: Math.round(montantTotal),
        tranches
    };
}

/**
 * Calculateur de la durée légale de préavis selon la catégorie professionnelle et l'ancienneté.
 */
function calculerPreavis(categorie = 'EMPLOYES', ancienneteAnnees = 1) {
    const a = Number(ancienneteAnnees) || 0;
    const cat = String(categorie).toUpperCase();

    if (cat.includes('CADRE') || cat.includes('INGENIEUR')) {
        return a <= 6 ? { mois: 3, baseLegale: 'CCNI art. 31 (Cadres ≤ 6 ans)' } : { mois: 4, baseLegale: 'CCNI art. 31 (Cadres > 6 ans)' };
    }
    if (cat.includes('MAITRISE') || cat.includes('TECHNICIEN') || cat.includes('AGENT')) {
        return a <= 6 ? { mois: 2, baseLegale: 'CCNI art. 31 (Maîtrise ≤ 6 ans)' } : { mois: 3, baseLegale: 'CCNI art. 31 (Maîtrise > 6 ans)' };
    }
    // Employés et ouvriers (catégories 1 à 5)
    return a <= 6 ? { mois: 1, baseLegale: 'CCNI art. 31 (Employés ≤ 6 ans)' } : { mois: 2, baseLegale: 'CCNI art. 31 (Employés > 6 ans)' };
}

module.exports = {
    SYSTEM_PROMPT_JURIDIQUE,
    calculerIndemniteLicenciement,
    calculerPreavis
};
