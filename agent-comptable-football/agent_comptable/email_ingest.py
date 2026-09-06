"""Relevé de la boîte e-mail comptable (IMAP) et enregistrement des pièces jointes."""

from __future__ import annotations

import email
import email.header
import imaplib
import re
import time
from pathlib import Path

from .config import settings
from .db import PieceComptable, get_session

EXTENSIONS_PDF = {".pdf"}
EXTENSIONS_IMAGE = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
EXTENSIONS_ACCEPTEES = EXTENSIONS_PDF | EXTENSIONS_IMAGE


def _decoder_entete(valeur: str | None) -> str:
    if not valeur:
        return ""
    morceaux = email.header.decode_header(valeur)
    resultat = []
    for texte, charset in morceaux:
        if isinstance(texte, bytes):
            resultat.append(texte.decode(charset or "utf-8", errors="replace"))
        else:
            resultat.append(texte)
    return "".join(resultat)


def _nom_fichier_sur(nom: str) -> str:
    nom = Path(nom).name  # neutralise toute traversée de chemin
    return re.sub(r"[^A-Za-z0-9._-]", "_", nom) or "piece"


def relever_boite() -> list[int]:
    """Relève les e-mails non lus, sauvegarde les pièces jointes acceptées.

    Retourne la liste des identifiants de pièces créées.
    """
    if not settings.imap_host or not settings.imap_user:
        raise RuntimeError("IMAP_HOST / IMAP_USER non configurés (voir .env)")

    settings.preparer_dossiers()
    pieces_creees: list[int] = []

    boite = imaplib.IMAP4_SSL(settings.imap_host, settings.imap_port)
    try:
        boite.login(settings.imap_user, settings.imap_password)
        boite.select(settings.imap_folder)

        statut, donnees = boite.search(None, "UNSEEN")
        if statut != "OK":
            return []

        for num in donnees[0].split():
            statut, contenu = boite.fetch(num, "(RFC822)")
            if statut != "OK" or not contenu or contenu[0] is None:
                continue
            message = email.message_from_bytes(contenu[0][1])
            expediteur = _decoder_entete(message.get("From"))
            sujet = _decoder_entete(message.get("Subject"))

            for partie in message.walk():
                if partie.get_content_maintype() == "multipart":
                    continue
                nom = partie.get_filename()
                if not nom:
                    continue
                nom = _nom_fichier_sur(_decoder_entete(nom))
                extension = Path(nom).suffix.lower()
                if extension not in EXTENSIONS_ACCEPTEES:
                    continue
                contenu_pj = partie.get_payload(decode=True)
                if not contenu_pj:
                    continue

                chemin = settings.pieces_dir / f"{int(time.time())}_{num.decode()}_{nom}"
                chemin.write_bytes(contenu_pj)

                with get_session() as session:
                    piece = PieceComptable(
                        source="email",
                        email_expediteur=expediteur[:320],
                        email_sujet=sujet[:500],
                        fichier=str(chemin),
                        type_fichier="pdf" if extension in EXTENSIONS_PDF else "image",
                        statut="a_traiter",
                    )
                    session.add(piece)
                    session.commit()
                    pieces_creees.append(piece.id)

            # Marque l'e-mail comme lu une fois ses pièces sauvegardées
            boite.store(num, "+FLAGS", "\\Seen")
    finally:
        try:
            boite.logout()
        except Exception:
            pass

    return pieces_creees


def ajouter_piece_manuelle(chemin_fichier: str) -> int:
    """Enregistre une pièce déposée manuellement (hors e-mail)."""
    chemin = Path(chemin_fichier)
    if not chemin.exists():
        raise FileNotFoundError(chemin_fichier)
    extension = chemin.suffix.lower()
    if extension not in EXTENSIONS_ACCEPTEES:
        raise ValueError(f"Format non pris en charge : {extension}")

    with get_session() as session:
        piece = PieceComptable(
            source="manuel",
            fichier=str(chemin),
            type_fichier="pdf" if extension in EXTENSIONS_PDF else "image",
            statut="a_traiter",
        )
        session.add(piece)
        session.commit()
        return piece.id
