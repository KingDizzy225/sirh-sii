import { useState, useEffect } from 'react';
import { api } from './api.js';

/**
 * Effectif de l'entreprise, lu une fois par écran.
 *
 * Neuf écrans embarquaient leur propre copie d'un effectif de démonstration
 * et la fusionnaient avec ce que renvoyait le serveur. Deux conséquences : les
 * chiffres affichés ne venaient pas tous de la même source, et une panne de
 * chargement passait inaperçue — l'écran se remplissait quand même.
 *
 * Ce crochet ne fournit que ce que le serveur donne. Une erreur reste une
 * erreur, et une liste vide reste vide : l'écran doit le dire plutôt que de
 * le combler.
 */
export function useEffectif({ actifsSeulement = false } = {}) {
    const [salaries, setSalaries] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);

    useEffect(() => {
        let vivant = true;
        (async () => {
            try {
                const res = await api.get('/employees');
                const liste = Array.isArray(res?.data) ? res.data : [];
                if (vivant) {
                    setSalaries(actifsSeulement ? liste.filter((s) => s.status !== 'TERMINATED') : liste);
                    setErreur(null);
                }
            } catch (err) {
                if (vivant) {
                    setSalaries([]);
                    setErreur(err?.message || "L'effectif n'a pas pu être chargé.");
                }
            } finally {
                if (vivant) setChargement(false);
            }
        })();
        return () => { vivant = false; };
    }, [actifsSeulement]);

    return { salaries, chargement, erreur };
}

/** Nom lisible d'un salarié, quelle que soit la forme du champ. */
export const nomDe = (s) =>
    s?.name || `${s?.firstName || ''} ${s?.lastName || ''}`.trim() || 'Sans nom';
