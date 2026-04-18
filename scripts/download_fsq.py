import os
from datasets import load_dataset

token = os.environ["HF_TOKEN"]

ds = load_dataset(
    "foursquare/fsq-os-places",
    "places",
    split="train",
    token=token,
)

print(ds)
ds.to_parquet("fsq_places_train.parquet")
print("Saved to fsq_places_train.parquet")
