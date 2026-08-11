"""Modèles SQLAlchemy et accès à la base SQLite."""

from __future__ import annotations

import datetime as dt
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String, Text, create_engine
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    Session,
    mapped_column,
    relationship,
    sessionmaker,
)

from .config import settings


class Base(DeclarativeBase):
    pass


class Tiers(Base):
    """Fournisseur, club affilié, sponsor…"""

    __tablename__ = "tiers"

    id: Mapped[int] = mapped_column(primary_key=True)
    nom: Mapped[str] = mapped_column(String(200), unique=True)
    type: Mapped[str] = mapped_column(String(30), default="fournisseur")  # fournisseur | club | sponsor | autre
    compte: Mapped[str] = mapped_column(String(10), default="401")


class PieceComptable(Base):
    """Une pièce justificative (facture, reçu…) reçue par e-mail ou déposée à la main."""

    __tablename__ = "pieces"

    id: Mapped[int] = mapped_column(primary_key=True)
    source: Mapped[str] = mapped_column(String(20), default="email")  # email | manuel
    email_expediteur: Mapped[str | None] = mapped_column(String(320))
    email_sujet: Mapped[str | None] = mapped_column(String(500))
    recu_le: Mapped[dt.datetime] = mapped_column(default=dt.datetime.utcnow)
    fichier: Mapped[str] = mapped_column(String(500))
    type_fichier: Mapped[str] = mapped_column(String(20), default="pdf")  # pdf | image
    statut: Mapped[str] = mapped_column(String(20), default="a_traiter")
    # a_traiter -> extraite -> comptabilisee | rejetee
    donnees_extraites: Mapped[str | None] = mapped_column(Text)  # JSON produit par Claude

    ecritures: Mapped[list["EcritureComptable"]] = relationship(back_populates="piece")


class EcritureComptable(Base):
    __tablename__ = "ecritures"

    id: Mapped[int] = mapped_column(primary_key=True)
    piece_id: Mapped[int | None] = mapped_column(ForeignKey("pieces.id"))
    journal: Mapped[str] = mapped_column(String(5), default="OD")
    date_ecriture: Mapped[dt.date] = mapped_column(default=dt.date.today)
    libelle: Mapped[str] = mapped_column(String(300))

    piece: Mapped[PieceComptable | None] = relationship(back_populates="ecritures")
    lignes: Mapped[list["LigneEcriture"]] = relationship(
        back_populates="ecriture", cascade="all, delete-orphan"
    )


class LigneEcriture(Base):
    __tablename__ = "lignes_ecriture"

    id: Mapped[int] = mapped_column(primary_key=True)
    ecriture_id: Mapped[int] = mapped_column(ForeignKey("ecritures.id"))
    compte: Mapped[str] = mapped_column(String(10))
    libelle: Mapped[str] = mapped_column(String(300))
    debit: Mapped[Decimal] = mapped_column(Numeric(16, 2), default=Decimal("0"))
    credit: Mapped[Decimal] = mapped_column(Numeric(16, 2), default=Decimal("0"))

    ecriture: Mapped[EcritureComptable] = relationship(back_populates="lignes")


class Echeancier(Base):
    __tablename__ = "echeanciers"

    id: Mapped[int] = mapped_column(primary_key=True)
    piece_id: Mapped[int | None] = mapped_column(ForeignKey("pieces.id"))
    beneficiaire: Mapped[str] = mapped_column(String(200))
    montant_total: Mapped[Decimal] = mapped_column(Numeric(16, 2))
    nb_echeances: Mapped[int] = mapped_column(default=1)
    cree_le: Mapped[dt.datetime] = mapped_column(default=dt.datetime.utcnow)

    echeances: Mapped[list["Echeance"]] = relationship(
        back_populates="echeancier", cascade="all, delete-orphan"
    )


class Echeance(Base):
    __tablename__ = "echeances"

    id: Mapped[int] = mapped_column(primary_key=True)
    echeancier_id: Mapped[int] = mapped_column(ForeignKey("echeanciers.id"))
    numero: Mapped[int] = mapped_column()
    date_echeance: Mapped[dt.date] = mapped_column()
    montant: Mapped[Decimal] = mapped_column(Numeric(16, 2))
    statut: Mapped[str] = mapped_column(String(20), default="a_payer")  # a_payer | payee
    payee_le: Mapped[dt.date | None] = mapped_column()

    echeancier: Mapped[Echeancier] = relationship(back_populates="echeances")


_engine = None
_SessionLocal: sessionmaker[Session] | None = None


def get_engine():
    global _engine
    if _engine is None:
        settings.preparer_dossiers()
        _engine = create_engine(f"sqlite:///{settings.db_path}")
    return _engine


def init_db() -> None:
    Base.metadata.create_all(get_engine())


def get_session() -> Session:
    global _SessionLocal
    if _SessionLocal is None:
        _SessionLocal = sessionmaker(bind=get_engine())
    return _SessionLocal()
