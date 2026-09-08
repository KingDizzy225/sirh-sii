<#
.SYNOPSIS
    Sauvegarde de la base et des fichiers du SIRH.

.DESCRIPTION
    Sur un hébergement en nuage, les sauvegardes étaient faites par
    l'hébergeur. Sur un serveur installé dans l'entreprise, personne ne les
    fait — sauf si on les met en place. Ce script produit une copie complète et
    ne garde que les plus récentes.

    Deux choses sont sauvegardées, et il en faut deux : la base, qui contient
    les dossiers, et le dossier des fichiers, qui contient les pièces jointes,
    les attestations et les certificats de signature. Une base sans ses fichiers
    laisserait des dossiers dont les pièces auraient disparu.

    Une sauvegarde jamais restaurée n'est pas une sauvegarde. Éprouvez-la une
    fois, sur une base jetable, avant d'en avoir besoin.

.EXAMPLE
    .\sauvegarde.ps1 -Destination D:\Sauvegardes\SIRH
#>

param(
    [Parameter(Mandatory = $true)][string]$Destination,
    [string]$Base = $env:PGDATABASE,
    [string]$Utilisateur = $env:PGUSER,
    [string]$Serveur = "localhost",
    [int]$Port = 5432,
    [string]$DossierFichiers = "$PSScriptRoot\..\uploads",
    [int]$JoursConserves = 30
)

$ErrorActionPreference = "Stop"

if (-not $Base) { throw "Base non precisee : utiliser -Base ou definir PGDATABASE." }
if (-not $Utilisateur) { throw "Utilisateur non precise : utiliser -Utilisateur ou definir PGUSER." }

$horodatage = Get-Date -Format "yyyy-MM-dd_HHmm"
$dossierDuJour = Join-Path $Destination $horodatage
New-Item -ItemType Directory -Path $dossierDuJour -Force | Out-Null

Write-Host "Sauvegarde de la base $Base..."
$fichierBase = Join-Path $dossierDuJour "base.dump"

# Format personnalise : compresse, et restaurable table par table si besoin.
& pg_dump --host=$Serveur --port=$Port --username=$Utilisateur --format=custom --file=$fichierBase $Base
if ($LASTEXITCODE -ne 0) { throw "pg_dump a echoue (code $LASTEXITCODE). Sauvegarde incomplete." }

$tailleBase = (Get-Item $fichierBase).Length
if ($tailleBase -lt 1024) {
    # Un dump de quelques octets est un dump vide : mieux vaut echouer bruyamment
    # que conserver une sauvegarde qui ne restaurera rien.
    throw "Le fichier de base ne fait que $tailleBase octets : sauvegarde suspecte."
}
Write-Host "  base : $([math]::Round($tailleBase / 1MB, 2)) Mo"

if (Test-Path $DossierFichiers) {
    Write-Host "Sauvegarde des fichiers..."
    $archive = Join-Path $dossierDuJour "fichiers.zip"
    Compress-Archive -Path (Join-Path $DossierFichiers "*") -DestinationPath $archive -Force
    Write-Host "  fichiers : $([math]::Round((Get-Item $archive).Length / 1MB, 2)) Mo"
} else {
    Write-Warning "Dossier des fichiers introuvable ($DossierFichiers) : seule la base est sauvegardee."
}

# Rotation : les sauvegardes anciennes sont retirees, jamais celle du jour.
$limite = (Get-Date).AddDays(-$JoursConserves)
Get-ChildItem -Path $Destination -Directory |
    Where-Object { $_.CreationTime -lt $limite -and $_.FullName -ne $dossierDuJour } |
    ForEach-Object {
        Write-Host "Retrait de la sauvegarde du $($_.Name)"
        Remove-Item -Recurse -Force $_.FullName
    }

Write-Host "Sauvegarde terminee : $dossierDuJour"
