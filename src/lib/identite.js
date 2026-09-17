import { useEffect, useState } from 'react';

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = RAW_API_URL.replace(/\/api\/?$/, '');

/**
 * Identité de l'entreprise, lue une fois par page et partagée.
 *
 * Les pages publiques (écran d'agence, badge, pré-accueil, bilan annuel)
 * affichaient toutes le même dégradé orange générique. Elles lisent désormais
 * le nom, le logo et les couleurs saisis par la RH. En cas d'échec, les valeurs
 * par défaut s'appliquent : une page d'accueil sans couleurs vaut mieux qu'une
 * page qui ne s'affiche pas.
 */

export const IDENTITE_PAR_DEFAUT = {
    nom: 'SIRH-SII',
    slogan: null,
    couleurPrincipale: '#f97316',
    couleurSecondaire: '#7e22ce',
    logo: false,
    version: 0
};

let promesse = null;

function charger(forcer = false) {
    if (!promesse || forcer) {
        promesse = fetch(`${API_URL}/api/public/identite`)
            .then(async (res) => {
                const corps = await res.json().catch(() => null);
                return res.ok && corps && corps.couleurPrincipale ? { ...IDENTITE_PAR_DEFAUT, ...corps } : IDENTITE_PAR_DEFAUT;
            })
            .catch(() => IDENTITE_PAR_DEFAUT);
    }
    return promesse;
}

/** Oublie la copie en mémoire, après une modification. */
export const rechargerIdentite = () => charger(true);

export const logoUrl = (identite) => (identite?.logo ? `${API_URL}/api/public/identite/logo?v=${identite.version}` : null);

/** Dégradé de marque, pour un `style`. */
export const degradeMarque = (identite, angle = 135) =>
    `linear-gradient(${angle}deg, ${identite.couleurPrincipale}, ${identite.couleurSecondaire})`;

export function useIdentite() {
    const [identite, setIdentite] = useState(IDENTITE_PAR_DEFAUT);
    useEffect(() => {
        let actif = true;
        charger().then((valeur) => { if (actif) setIdentite(valeur); });
        return () => { actif = false; };
    }, []);
    return identite;
}
