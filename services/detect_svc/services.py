import os
import uuid
import requests
from django.conf import settings
from PIL import Image, ImageDraw, ImageFont

# Baca URL inference dari env (mendukung dua nama var)
INFERENCE_URL = (
    os.getenv("INFERENCE_URL")
    or os.getenv("INFERENCE_BASE_URL")
    or "http://127.0.0.1:8001"
).rstrip("/")

# ---------- HTTP call ke service inference ----------
def call_inference(file_path: str) -> dict:
    """
    Kirim file ke backend inference (FastAPI) di /infer.
    Melempar requests.HTTPError bila status bukan 200.
    """
    url = f"{INFERENCE_URL}/infer"
    with open(file_path, "rb") as f:
        r = requests.post(
            url,
            files={"file": ("image.jpg", f, "image/jpeg")},
            timeout=30,
        )
    r.raise_for_status()
    return r.json()

# ---------- Utilities gambar ----------
# Warna per kelas (opsional). Jika kelas tak terdaftar, pakai warna default.
CLASS_COLORS = {
    "Safety helmet": (0, 255, 255),   # cyan
    "Wearpack":      (0, 255, 255),
    "No wearpack":   (0, 255, 255),
    "Dust mask":     (0, 255, 255),
    "No dust mask":  (0, 255, 255),
    "Ear protection":(0, 255, 255),
    "No ear protection": (0,255,255),
    "Hand gloves":   (0, 255, 255),
    "No hand gloves":(0, 255, 255),
    "Safety glasses":(0, 255, 255),
    "No safety glasses": (0,255,255),
    "Safety shoes":  (0, 255, 255),
    "No safety shoes": (0,255,255),
}
DEFAULT_COLOR = (255, 0, 0)  # merah jika tidak match di atas

def _get_color(klass: str):
    return CLASS_COLORS.get(klass, DEFAULT_COLOR)

def draw_boxes_and_save(src_path: str, items):
    """
    Gambar bbox + label (seperti YOLO) dan simpan ke MEDIA_ROOT/annotated.
    items: list of {klass, confidence, x, y, w, h}
    Return: MEDIA_URL path dari file hasil.
    """
    img = Image.open(src_path).convert("RGB")
    W, H = img.size

    # overlay RGBA untuk label semi-transparan
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # font: coba DejaVuSans, fallback default
    try:
        font = ImageFont.truetype("DejaVuSans.ttf", size=max(14, int(W * 0.018)))
    except Exception:
        font = ImageFont.load_default()

    for it in items or []:
        x, y, w, h = int(it["x"]), int(it["y"]), int(it["w"]), int(it["h"])
        x2, y2 = x + w, y + h
        label = f'{it["klass"]} {float(it["confidence"]):.2f}'
        color = _get_color(it["klass"])

        # kotak bbox
        draw.rectangle([x, y, x2, y2], outline=color + (255,), width=3)

        # label background
        pad = 4
        tb = draw.textbbox((0, 0), label, font=font)  # (l, t, r, b)
        tw, th = tb[2] - tb[0], tb[3] - tb[1]

        label_y = y - (th + pad * 2)
        if label_y < 0:
            label_y = y

        draw.rectangle(
            [x, label_y, x + tw + pad * 2, label_y + th + pad * 2],
            fill=(0, 255, 255, 220),  # cyan semi-transparan
            outline=color + (255,),
            width=1,
        )
        draw.text((x + pad, label_y + pad), label, fill=(0, 43, 43, 255), font=font)

    out = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")

    out_dir = os.path.join(settings.MEDIA_ROOT, "annotated")
    os.makedirs(out_dir, exist_ok=True)
    out_name = f"annotated_{uuid.uuid4().hex}.jpg"
    out_path = os.path.join(out_dir, out_name)
    out.save(out_path, "JPEG", quality=90)

    return settings.MEDIA_URL + "annotated/" + out_name