"""Configuration chargée depuis les variables d'environnement (fichier .env)."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


@dataclass
class Settings:
    claude_model: str = field(default_factory=lambda: os.getenv("CLAUDE_MODEL", "claude-opus-5"))

    imap_host: str = field(default_factory=lambda: os.getenv("IMAP_HOST", ""))
    imap_port: int = field(default_factory=lambda: int(os.getenv("IMAP_PORT", "993")))
    imap_user: str = field(default_factory=lambda: os.getenv("IMAP_USER", ""))
    imap_password: str = field(default_factory=lambda: os.getenv("IMAP_PASSWORD", ""))
    imap_folder: str = field(default_factory=lambda: os.getenv("IMAP_FOLDER", "INBOX"))

    db_path: Path = field(default_factory=lambda: Path(os.getenv("DB_PATH", "data/comptabilite.db")))
    pieces_dir: Path = field(default_factory=lambda: Path(os.getenv("PIECES_DIR", "data/pieces")))

    devise: str = field(default_factory=lambda: os.getenv("DEVISE", "XOF"))
    taux_tva: float = field(default_factory=lambda: float(os.getenv("TAUX_TVA", "0.18")))

    def preparer_dossiers(self) -> None:
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.pieces_dir.mkdir(parents=True, exist_ok=True)


settings = Settings()
