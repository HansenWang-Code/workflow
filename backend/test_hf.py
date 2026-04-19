import os

print("STEP 1: script started", flush=True)

token = os.environ.get("HF_TOKEN")
print("STEP 2: HF_TOKEN present =", bool(token), flush=True)

if not token:
    raise RuntimeError("HF_TOKEN is missing in this terminal session")

from huggingface_hub import HfFileSystem

print("STEP 3: imported HfFileSystem", flush=True)

fs = HfFileSystem(token=token)
print("STEP 4: filesystem object created", flush=True)

paths = fs.glob("datasets/foursquare/fsq-os-places@~parquet/**/*.parquet")
print("STEP 5: glob finished", flush=True)
print("PARQUET FILE COUNT =", len(paths), flush=True)

print("FIRST 5 PATHS:", flush=True)
for p in paths[:5]:
    print(p, flush=True)