from fastapi import FastAPI, UploadFile, File, HTTPException
import io, socket, tempfile                                # ✨ CHANGED
from PIL import Image, ImageOps                           # ✨ CHANGED
from ultralytics import YOLO

# ==== KONFIG FIX (tanpa .env) ====
WEIGHTS_PATH = "models/bestardhika.pt"
CONF_THRESH  = 0.25     # boleh coba 0.20 kalau box lemah hilang
IOU_THRESH   = 0.70
IMG_SIZE     = 640
MAX_DET      = 300
DEVICE       = "cpu"
MODEL_VERSION = "1.0"

model = YOLO(WEIGHTS_PATH).to(DEVICE)
app = FastAPI(title="Inference Service", version=MODEL_VERSION)

@app.get("/healthz")
def healthz():
    return {"status": "ok", "model_version": MODEL_VERSION}

@app.get("/labels")
def labels():
    return {"names": model.model.names}

@app.post("/infer")
async def infer(file: UploadFile = File(...)):
    if file.content_type not in ("image/jpeg", "image/png"):
        raise HTTPException(status_code=415, detail="only jpg/png")

    content = await file.read()
    try:
        # perbaiki orientasi EXIF dan pastikan RGB
        pil = Image.open(io.BytesIO(content))
        pil = ImageOps.exif_transpose(pil).convert("RGB")   # ✨ CHANGED
    except Exception:
        raise HTTPException(status_code=400, detail="invalid image")

    # ✅ simpan ke file sementara → predict pakai PATH (persis Colab)
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=True) as tmp:   # ✨ CHANGED
        pil.save(tmp.name, "JPEG", quality=95)                              # ✨ CHANGED
        try:
            res = model.predict(
                source=tmp.name,          # ✨ CHANGED (path, bukan numpy)
                conf=CONF_THRESH,
                iou=IOU_THRESH,
                imgsz=IMG_SIZE,
                max_det=MAX_DET,
                device=DEVICE,
                agnostic_nms=False,       # ✨ CHANGED
                verbose=False,
            )[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"infer error: {e}")

    # parse ke xywh (pixel)
    items = []
    if res.boxes is not None:
        W, H = pil.size
        xyxy = res.boxes.xyxy.cpu().numpy()
        cls  = res.boxes.cls.cpu().numpy()
        conf = res.boxes.conf.cpu().numpy()
        names = res.names
        for (x1,y1,x2,y2), c, p in zip(xyxy, cls, conf):
            x1, y1 = int(max(0, x1)), int(max(0, y1))
            x2, y2 = int(min(W-1, x2)), int(min(H-1, y2))
            items.append({
                "klass": names.get(int(c), str(int(c))),
                "confidence": float(round(float(p), 4)),
                "x": x1, "y": y1, "w": max(0, x2-x1), "h": max(0, y2-y1),
            })

    return {"model_version": MODEL_VERSION, "pod_id": socket.gethostname(), "items": items}