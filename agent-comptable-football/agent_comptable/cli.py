"""Interface en ligne de commande de l'agent comptable."""

from __future__ import annotations

import datetime as dt
import json

import typer

app = typer.Typer(help="Agent comptable IA — fédération de football américain de Côte d'Ivoire")
echeancier_app = typer.Typer(help="Gestion des échéanciers de paiement")
app.add_typer(echeancier_app, name="echeancier")


@app.command()
def init() -> None:
    """Initialise la base de données et les dossiers de travail."""
    from .db import init_db

    init_db()
    typer.echo("Base de données initialisée.")


@app.command("ingerer-emails")
def ingerer_emails() -> None:
    """Relève la boîte e-mail et enregistre les pièces jointes non lues."""
    from .db import init_db
    from .email_ingest import relever_boite

    init_db()
    pieces = relever_boite()
    typer.echo(f"{len(pieces)} pièce(s) récupérée(s) : {pieces or '—'}")


@app.command("ajouter-piece")
def ajouter_piece(fichier: str) -> None:
    """Enregistre une pièce déposée manuellement (PDF ou image)."""
    from .db import init_db
    from .email_ingest import ajouter_piece_manuelle

    init_db()
    piece_id = ajouter_piece_manuelle(fichier)
    typer.echo(f"Pièce {piece_id} enregistrée.")


@app.command()
def extraire() -> None:
    """Extrait avec Claude les données des pièces au statut « a_traiter »."""
    from .extraction import extraire_pieces_en_attente

    traitees = extraire_pieces_en_attente()
    typer.echo(f"{len(traitees)} pièce(s) extraite(s) : {traitees or '—'}")


@app.command()
def comptabiliser() -> None:
    """Génère les écritures des pièces extraites."""
    from .comptabilisation import comptabiliser_pieces_extraites

    ecritures = comptabiliser_pieces_extraites()
    typer.echo(f"{len(ecritures)} écriture(s) enregistrée(s) : {ecritures or '—'}")


@app.command()
def pieces(statut: str = typer.Option(None, help="a_traiter | extraite | comptabilisee | rejetee")) -> None:
    """Liste les pièces comptables."""
    from .agent import _outil_lister_pieces

    for piece in _outil_lister_pieces({"statut": statut}):
        typer.echo(
            f"[{piece['id']:>4}] {piece['statut']:<14} {piece['expediteur'] or piece['source']:<40} "
            f"{piece['sujet'] or ''}"
        )


@app.command()
def journal(limite: int = 20) -> None:
    """Affiche les dernières écritures du journal."""
    from .rapports import journal as journal_rapport

    for ecriture in journal_rapport(limite):
        typer.echo(f"\n#{ecriture['id']} {ecriture['date']} [{ecriture['journal']}] {ecriture['libelle']}")
        for ligne in ecriture["lignes"]:
            typer.echo(
                f"    {ligne['compte']:<6} {ligne['intitule'][:38]:<40} "
                f"D {ligne['debit']:>14}  C {ligne['credit']:>14}"
            )


@app.command()
def balance() -> None:
    """Affiche la balance des comptes."""
    from .rapports import balance as balance_rapport

    typer.echo(f"{'Compte':<8}{'Intitulé':<46}{'Débit':>16}{'Crédit':>16}{'Solde':>16}")
    for ligne in balance_rapport():
        typer.echo(
            f"{ligne['compte']:<8}{ligne['intitule'][:44]:<46}"
            f"{ligne['total_debit']:>16}{ligne['total_credit']:>16}{ligne['solde']:>16}"
        )


@app.command("export-csv")
def export_csv(dossier: str = "rapports") -> None:
    """Exporte journal et balance en CSV."""
    from .rapports import exporter_csv

    for fichier in exporter_csv(dossier):
        typer.echo(f"Écrit : {fichier}")


@echeancier_app.command("creer")
def echeancier_creer(
    beneficiaire: str = typer.Option(..., help="Nom du bénéficiaire"),
    montant: float = typer.Option(..., help="Montant total (FCFA)"),
    nb: int = typer.Option(..., help="Nombre d'échéances"),
    debut: str = typer.Option(..., help="Date de la première échéance (AAAA-MM-JJ)"),
    intervalle: int = typer.Option(30, help="Intervalle en jours entre échéances"),
    piece: int = typer.Option(None, help="Id de la pièce liée"),
) -> None:
    """Crée un échéancier de paiement."""
    from .db import init_db
    from .echeancier import creer_echeancier

    init_db()
    echeancier_id = creer_echeancier(
        beneficiaire=beneficiaire,
        montant_total=montant,
        nb_echeances=nb,
        date_debut=dt.date.fromisoformat(debut),
        intervalle_jours=intervalle,
        piece_id=piece,
    )
    typer.echo(f"Échéancier {echeancier_id} créé ({nb} échéance(s) pour {beneficiaire}).")


@echeancier_app.command("lister")
def echeancier_lister(
    statut: str = typer.Option(None, help="a_payer | payee"),
    retard: bool = typer.Option(False, "--retard", help="Uniquement les échéances en retard"),
) -> None:
    """Liste les échéances."""
    from .echeancier import lister_echeances

    lignes = lister_echeances(statut=statut, en_retard_seulement=retard)
    if not lignes:
        typer.echo("Aucune échéance.")
        return
    for ligne in lignes:
        typer.echo(
            f"[{ligne['id']:>4}] {ligne['date']}  {ligne['montant']:>14} FCFA  "
            f"{ligne['numero']:<6} {ligne['beneficiaire']:<30} {ligne['statut']}"
        )


@echeancier_app.command("payer")
def echeancier_payer(
    echeance_id: int,
    date: str = typer.Option(None, help="Date de paiement (AAAA-MM-JJ), défaut aujourd'hui"),
) -> None:
    """Marque une échéance comme payée."""
    from .echeancier import marquer_payee

    marquer_payee(echeance_id, dt.date.fromisoformat(date) if date else None)
    typer.echo(f"Échéance {echeance_id} marquée payée.")


@app.command()
def piece(piece_id: int) -> None:
    """Affiche le détail d'une pièce (dont les données extraites)."""
    from .agent import _outil_consulter_piece

    typer.echo(json.dumps(_outil_consulter_piece({"piece_id": piece_id}), ensure_ascii=False, indent=2))


@app.command()
def chat() -> None:
    """Lance le comptable IA en mode conversationnel."""
    from .agent import boucle_chat

    boucle_chat()


if __name__ == "__main__":
    app()
