"""Build the approved 2026-09 collection artwork map without touching products."""
from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / ".source" / "URBAN RIDER TOKYO"
if not SOURCE.exists():
    SOURCE = ROOT.parent / ".source" / "URBAN RIDER TOKYO"
OUT = ROOT / "public" / "images"
OUT.mkdir(parents=True, exist_ok=True)

FOLDER = {
    "bike": ("bike_collection", "bike_collection_{n}.png"),
    "gakusei": ("GAKUSEI COLLECTION", "gakusei_collection_{n}.png"),
    "animal": ("ANIMAL DESIGN COLLECTION", "ANIMAL_collection_{n}.png"),
    "army": ("army_collection", "army_collection_{n}.png"),
    "dokuro": ("dokuro_collection", "dokuro_collection_{n}.png"),
}
PICKS = {
    "bike": {"top": [46, 54, 69, 43], "hero": [1, 7, 9, 4], "gallery": [13, 42, 58, 67, 68, 40, 35, 34, 5]},
    "gakusei": {"top": [8, 23, 20, 5], "hero": [4, 14, 19], "gallery": [1, 6, 28, 24, 11, 17, 16, 20, 22, 5]},
    "animal": {"top": [2, 16, 11, 8], "hero": [6, 14, 19], "gallery": [1, 4, 5, 7, 13, 20, 18, 17, 15]},
    "army": {"top": [3, 2, 6], "hero": [4, 8], "gallery": [8, 4, 5, 3, 7]},
    "dokuro": {"top": [4, 7, 10], "hero": [2, 8, 3], "gallery": [11, 12, 3, 4, 13, 9, 5]},
}
manifest = {}

def convert(relative_source, key, width=1400):
    source = SOURCE / relative_source
    if not source.exists():
        raise FileNotFoundError(source)
    image = Image.open(source).convert("RGBA")
    background = Image.new("RGBA", image.size, (255, 255, 255, 255))
    background.alpha_composite(image)
    image = background.convert("RGB")
    image.thumbnail((width, width), Image.Resampling.LANCZOS)
    image.save(OUT / f"{key}.webp", "WEBP", quality=86, method=6)
    small = image.copy()
    small.thumbnail((640, 640), Image.Resampling.LANCZOS)
    small.save(OUT / f"{key}-640.webp", "WEBP", quality=82, method=6)
    manifest[key] = {"source": relative_source, "width": image.width, "height": image.height}
    return f"images/{key}.webp"

assets = {}
for slug, picks in PICKS.items():
    folder, pattern = FOLDER[slug]
    converted = {}
    def ref(number):
        if number not in converted:
            converted[number] = convert(f"{folder}/{pattern.format(n=number)}", f"{slug}-{number}")
        return converted[number]
    assets[slug] = {slot: [ref(number) for number in picks[slot]] for slot in ("top", "hero", "gallery")}

brand_folder = "URBAN RIDER TOKYO BRAND COLLECTION"
brand_top = f"{brand_folder}/URBAN RIDER TOKYO BRAND COLLECTION.png"
if not (SOURCE / brand_top).exists():
    brand_top = "TOP/ブランドオブジェクト/URBAN RIDER TOKYO BRAND COLLECTION.png"
assets["brand"] = {
    "top": [convert(brand_top, "top-brand-0")],
    "hero": [convert(f"{brand_folder}/URBAN RIDER TOKYO ロゴ 黒.png", "brand-black"), convert(f"{brand_folder}/URBAN RIDER TOKYO ロゴ 白 .png", "brand-white")],
    "gallery": [],
}

manifest_path = ROOT / "src" / "asset-manifest.json"
existing = json.loads(manifest_path.read_text(encoding="utf-8")) if manifest_path.exists() else {}
merged = {key: value for key, value in existing.items() if key.startswith("product-")}
merged.update(manifest)
(ROOT / "src" / "assets.json").write_text(json.dumps(assets, ensure_ascii=False, indent=2), encoding="utf-8")
manifest_path.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding="utf-8")

products = json.loads((ROOT / "src" / "products.json").read_text(encoding="utf-8"))
referenced = {Path(path).stem for group in assets.values() for paths in group.values() for path in paths}
referenced.update(Path(product["image"]).stem for product in products)
removed = []
for file in OUT.glob("*.webp"):
    base = file.stem[:-4] if file.stem.endswith("-640") else file.stem
    if base not in referenced:
        file.unlink()
        removed.append(file.name)
print(json.dumps({"collections": {slug: {slot: len(paths) for slot, paths in group.items()} for slug, group in assets.items()}, "converted": len(manifest), "orphans_removed": len(removed)}, ensure_ascii=False, indent=2))
