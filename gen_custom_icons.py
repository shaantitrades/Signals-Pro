"""Génère toutes les icônes Android nécessaires pour TWA/PWA à partir d'un fichier PNG personnalisé.
Usage: python gen_custom_icons.py
Placez votre icon.png dans le dossier Downloads ou modifiez le chemin ci-dessous."""

from PIL import Image, ImageDraw
import os
import sys

# ======== CONFIGURATION ========
# Chemin de votre icône source (modifiez si nécessaire)
SOURCE_ICON = r"C:\Users\Compte Utilisateur\Downloads\icon.png"

# Dossier de sortie (dossier twa/icons du projet)
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'twa', 'icons')

# Couleur de fond pour les icônes (gris foncé = #0d1117)
BG_COLOR = (13, 17, 23, 255)

# ======== FONCTIONS ========
def load_source_icon():
    """Charge l'icône source et la convertit en RGBA."""
    if not os.path.exists(SOURCE_ICON):
        print(f"ERREUR: Fichier introuvable: {SOURCE_ICON}")
        sys.exit(1)
    img = Image.open(SOURCE_ICON)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    return img


def create_launcher_icon(source_img, size, padding_ratio=0.08):
    """
    Crée une icône de lancement (legacy) à la taille donnée.
    Redimensionne l'icône source pour qu'elle tienne dans la zone avec padding,
    puis la centre sur un fond arrondi.
    """
    drawable_size = int(size * (1 - 2 * padding_ratio))
    
    # Redimensionner l'icône source
    icon_resized = source_img.resize((drawable_size, drawable_size), Image.LANCZOS)
    
    # Créer l'image de fond avec coins arrondis
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    r = size // 5
    draw.rounded_rectangle([0, 0, size-1, size-1], radius=r, fill=BG_COLOR)
    
    # Coller l'icône au centre
    pad = (size - drawable_size) // 2
    img.paste(icon_resized, (pad, pad), icon_resized)
    
    return img


def create_adaptive_foreground(source_img, size):
    """
    Crée l'avant-plan pour les icônes adaptatives Android.
    L'icône est placée dans la zone de sécurité (66.67% du centre).
    """
    safe_margin = int(size * 0.1667)
    drawable_size = size - 2 * safe_margin
    
    icon_resized = source_img.resize((drawable_size, drawable_size), Image.LANCZOS)
    
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    pad = safe_margin
    img.paste(icon_resized, (pad, pad), icon_resized)
    
    return img


def create_adaptive_background(size):
    """Crée le fond pour les icônes adaptatives Android."""
    return Image.new('RGBA', (size, size), BG_COLOR)


def create_maskable_icon(source_img, size, padding_ratio=0.1667):
    """
    Crée une icône maskable avec une zone de sécurité.
    16.67% de padding = zone de sécurité Android adaptive icon.
    """
    drawable_size = int(size * (1 - 2 * padding_ratio))
    
    icon_resized = source_img.resize((drawable_size, drawable_size), Image.LANCZOS)
    
    # Fond avec coins arrondis
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    r = size // 5
    draw.rounded_rectangle([0, 0, size-1, size-1], radius=r, fill=BG_COLOR)
    
    pad = (size - drawable_size) // 2
    img.paste(icon_resized, (pad, pad), icon_resized)
    
    return img


def create_playstore_icon(source_img, size=512):
    """Crée l'icône pour la fiche Play Store (512x512, fond arrondi, pas de padding)."""
    icon_resized = source_img.resize((size, size), Image.LANCZOS)
    
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    r = size // 5
    draw.rounded_rectangle([0, 0, size-1, size-1], radius=r, fill=BG_COLOR)
    
    img.paste(icon_resized, (0, 0), icon_resized)
    
    return img


def create_notification_icon(source_img, size=96):
    """Crée une petite icône de notification (96x96, transparent)."""
    icon_resized = source_img.resize((size, size), Image.LANCZOS)
    return icon_resized


# ======== GÉNÉRATION ========
print("Chargement de l'icône source...")
source = load_source_icon()
print(f"  Icône chargée: {source.size[0]}x{source.size[1]} pixels")

# Créer le dossier de sortie
os.makedirs(OUT_DIR, exist_ok=True)

# ---- Icônes de lancement (mipmap) ----
MIPMAP_SIZES = {
    'mdpi': 48,
    'hdpi': 72,
    'xhdpi': 96,
    'xxhdpi': 144,
    'xxxhdpi': 192,
}

print("\nGénération des icônes de lancement (mipmap)...")
for density, size in MIPMAP_SIZES.items():
    folder = f'mipmap-{density}'
    os.makedirs(os.path.join(OUT_DIR, folder), exist_ok=True)
    img = create_launcher_icon(source, size)
    path = os.path.join(OUT_DIR, folder, 'ic_launcher.png')
    img.save(path)
    print(f"  [OK] {folder}/ic_launcher.png ({size}x{size})")

# ---- Icônes adaptatives (foreground + background) ----
print("\nGénération des icônes adaptatives...")
ADAPTIVE_SIZE = 432  # 108dp * 4

# Foreground
fg = create_adaptive_foreground(source, ADAPTIVE_SIZE)
path = os.path.join(OUT_DIR, 'ic_foreground.png')
fg.save(path)
print(f"  [OK] ic_foreground.png ({ADAPTIVE_SIZE}x{ADAPTIVE_SIZE})")

# Background
bg = create_adaptive_background(ADAPTIVE_SIZE)
path = os.path.join(OUT_DIR, 'ic_background.png')
bg.save(path)
print(f"  [OK] ic_background.png ({ADAPTIVE_SIZE}x{ADAPTIVE_SIZE})")

# ---- Icônes maskable ----
print("\nGénération des icônes maskable...")
for size in [192, 512]:
    img = create_maskable_icon(source, size)
    path = os.path.join(OUT_DIR, f'maskable_{size}.png')
    img.save(path)
    print(f"  [OK] maskable_{size}.png ({size}x{size})")

# ---- Icône Play Store ----
print("\nGénération de l'icône Play Store...")
img = create_playstore_icon(source, 512)
path = os.path.join(OUT_DIR, 'playstore_icon.png')
img.save(path)
print(f"  [OK] playstore_icon.png (512x512)")

# ---- Icône de notification ----
print("\nGénération de l'icône de notification...")
img = create_notification_icon(source, 96)
path = os.path.join(OUT_DIR, 'ic_notification.png')
img.save(path)
print(f"  [OK] ic_notification.png (96x96)")

print(f"\n[SUCCESS] Toutes les icones ont ete generees dans: {OUT_DIR}")
print(f"   Vous pouvez maintenant rebuilder l'AAB avec: twa\\build-aab.bat")