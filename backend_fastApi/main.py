"""
FastAPI backend for SheinReview
Dataset: Fashion Product Images (Small)
Download from: https://www.kaggle.com/datasets/paramaggarwal/fashion-product-images-small
Place the CSV at:       backend/styles.csv
Place images folder at: backend/images/
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pandas as pd
import os, random

from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import torch.nn.functional as F

MODEL_PATH = "sentiment_model_v1"

def predict_sentiment_ml(text: str):
    inputs = hf_tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=128
    )

    with torch.no_grad():
        outputs = hf_model(**inputs)
        probs = F.softmax(outputs.logits, dim=1)
        pred_class = torch.argmax(probs, dim=1).item()

    return {
        "label": label_map[pred_class],
        "confidence": round(probs[0][pred_class].item(), 3),
        "all_scores": probs[0].tolist()
    }

app = FastAPI(title="SheinReview API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

IMAGES_DIR = "images"
if os.path.exists(IMAGES_DIR):
    app.mount("/images", StaticFiles(directory=IMAGES_DIR), name="images")
    print("Serving real product images from /images/")
else:
    print("images/ folder not found, using fallback URLs")

analyzer = SentimentIntensityAnalyzer()

print("Loading ML sentiment model...")
hf_tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
hf_model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)

hf_model.eval()  # set to evaluation mode

# Optional: label mapping (adjust if needed)
label_map = {
    0: "Very Negative",
    1: "Negative",
    2: "Neutral",
    3: "Positive"
}

FALLBACK_IMAGES = {
    "Topwear":    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80",
    "Bottomwear": "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80",
    "Shoes":      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    "Bags":       "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",
    "Watches":    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    "Jewellery":  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80",
    "Eyewear":    "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&q=80",
    "Dress":      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
    "default":    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80",
}

SAMPLE_REVIEWS = [
    ("Absolutely love this! Great quality and fits perfectly.", 5),
    ("Amazing product, exactly as described. Will buy again!", 5),
    ("Very trendy and comfortable. Got so many compliments!", 5),
    ("Perfect fit, fast shipping, highly recommend.", 5),
    ("Good quality for the price. Happy with my purchase.", 4),
    ("Looks great in person, color is accurate to the photos.", 4),
    ("Decent quality. Sizing runs a little small, order up.", 4),
    ("Nice product overall. Delivery took longer than expected.", 3),
    ("It's okay. Not as soft as I expected but looks good.", 3),
    ("Average quality. Color is slightly different from pictures.", 3),
    ("Stitching came apart after two washes. Disappointing.", 2),
    ("Material feels cheap. Not worth the price at all.", 2),
    ("Sizing is way off and returns are a hassle.", 1),
    ("Very poor quality. Fell apart after first use.", 1),
]


def get_sentiment_label(score):
    if score >= 0.05:  return "Positive"
    if score <= -0.05: return "Negative"
    return "Neutral"


def analyze_text(text):
    s = analyzer.polarity_scores(str(text))
    return {
        "compound": round(s["compound"], 3),
        "positive": round(s["pos"], 3),
        "negative": round(s["neg"], 3),
        "neutral":  round(s["neu"], 3),
        "label":    get_sentiment_label(s["compound"]),
    }


def image_url_for(product_id, category):
    local = f"images/{product_id}.jpg"
    if os.path.exists(local):
        return f"http://localhost:4000/images/{product_id}.jpg"
    return FALLBACK_IMAGES.get(category, FALLBACK_IMAGES["default"])


def load_dataset():
    csv_path = "styles.csv"
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path, on_bad_lines="skip")
        print(f"Loaded {len(df)} rows from styles.csv")
        keep = ["id","productDisplayName","masterCategory","subCategory","articleType","baseColour","season","usage","gender"]
        df = df[[c for c in keep if c in df.columns]].copy()
        df = df.dropna(subset=["productDisplayName"])
        df = df.rename(columns={
            "id": "product_id",
            "productDisplayName": "product_name",
            "masterCategory": "master_category",
            "subCategory": "category",
            "articleType": "article_type",
            "baseColour": "colour",
        })
        fashion_cats = ["Topwear","Bottomwear","Dress","Innerwear","Shoes","Bags","Watches","Jewellery","Eyewear","Socks","Belts","Scarves"]
        df = df[df["category"].isin(fashion_cats)].copy()

        price_ranges = {
            "Topwear":(8.99,29.99),"Bottomwear":(12.99,39.99),"Dress":(14.99,49.99),
            "Shoes":(19.99,59.99),"Bags":(14.99,44.99),"Watches":(9.99,34.99),
            "Jewellery":(4.99,19.99),"Eyewear":(9.99,24.99),
        }
        random.seed(42)
        df["price"] = df["category"].apply(lambda c: round(random.uniform(*price_ranges.get(c,(9.99,39.99))), 2))
        df["image_url"] = df.apply(lambda r: image_url_for(int(r["product_id"]), r["category"]), axis=1)
        return df.head(2000)
    else:
        print("styles.csv not found, generating sample data")
        return _sample()


def _sample():
    cats = {"Topwear":["Graphic Tee","Crop Top","Polo Shirt"],"Bottomwear":["Wide-Leg Jeans","Cargo Pants"],"Dress":["Midi Dress","Mini Dress"],"Shoes":["Sneakers","Boots"],"Bags":["Tote","Crossbody"],"Watches":["Sport Watch","Classic"],"Jewellery":["Hoops","Necklace"],"Eyewear":["Sunglasses","Aviators"]}
    rows, pid = [], 1
    random.seed(42)
    for cat, names in cats.items():
        for name in names:
            rows.append({"product_id":pid,"product_name":name,"category":cat,"master_category":"Fashion","article_type":name,"colour":random.choice(["Black","White","Blue","Red"]),"price":round(random.uniform(9.99,49.99),2),"image_url":FALLBACK_IMAGES.get(cat,FALLBACK_IMAGES["default"]),"season":"Summer","gender":"Unisex"})
            pid += 1
    return pd.DataFrame(rows)


def generate_reviews(product_id, n=None):
    rng = random.Random(product_id)
    n = n or rng.randint(6, 22)
    reviews = []
    for _ in range(n):
        text, base = rng.choice(SAMPLE_REVIEWS)
        rating = max(1, min(5, base + rng.randint(-1, 1)))
        s = analyze_text(text)
        reviews.append({"review_text":text,"rating":rating,"sentiment_label":s["label"],"sentiment_score":s["compound"],"age":rng.randint(18,45),"helpful_count":rng.randint(0,60)})
    return reviews


# Build catalog with aggregated sentiment
product_df = load_dataset()

def _agg(pid, name):
    revs = generate_reviews(pid)
    ratings = [r["rating"] for r in revs]
    scores  = [r["sentiment_score"] for r in revs]
    labels  = [r["sentiment_label"] for r in revs]
    n = len(revs)
    return {"review_count":n,"avg_rating":round(sum(ratings)/n,1),"avg_sentiment":round(sum(scores)/n,3),"positive_pct":round(labels.count("Positive")/n*100,1),"neutral_pct":round(labels.count("Neutral")/n*100,1),"negative_pct":round(labels.count("Negative")/n*100,1)}

print("Computing sentiment aggregates...")
rows = []
for _, r in product_df.iterrows():
    rows.append({**r.to_dict(), **_agg(int(r["product_id"]), r["product_name"])})
catalog_df = pd.DataFrame(rows)
print(f"Catalog ready: {len(catalog_df)} products")


@app.get("/")
def root():
    return {"status": "SheinReview FastAPI v2", "products": len(catalog_df)}


@app.get("/products")
def get_products(page:int=1, limit:int=12, category:str=None, sort:str="popular", search:str=None, colour:str=None, gender:str=None):
    data = catalog_df.copy()
    if category and category != "All":
        data = data[data["category"].str.lower() == category.lower()]
    if search:
        data = data[data["product_name"].str.lower().str.contains(search.lower(), na=False)]
    if colour and "colour" in data.columns:
        data = data[data["colour"].str.lower() == colour.lower()]
    if gender and "gender" in data.columns:
        data = data[data["gender"].str.lower() == gender.lower()]
    col,asc = {"popular":("review_count",False),"rating":("avg_rating",False),"sentiment":("avg_sentiment",False),"price_asc":("price",True),"price_desc":("price",False)}.get(sort,("review_count",False))
    if col in data.columns:
        data = data.sort_values(col, ascending=asc)
    total = len(data)
    chunk = data.iloc[(page-1)*limit : page*limit]
    return {"total":total,"page":page,"limit":limit,"pages":(total+limit-1)//limit,"products":chunk.to_dict(orient="records")}


@app.get("/products/{product_id}")
def get_product(product_id: int):
    row = catalog_df[catalog_df["product_id"] == product_id]
    if row.empty:
        raise HTTPException(status_code=404, detail="Product not found")
    p = row.iloc[0].to_dict()
    p["reviews"] = generate_reviews(product_id)
    return p


@app.get("/categories")
def get_categories():
    return {"categories": ["All"] + sorted(catalog_df["category"].dropna().unique().tolist())}


@app.get("/filters")
def get_filters():
    colours = sorted(catalog_df["colour"].dropna().unique().tolist()) if "colour" in catalog_df else []
    genders  = sorted(catalog_df["gender"].dropna().unique().tolist()) if "gender" in catalog_df else []
    return {"colours": colours, "genders": genders}


@app.get("/dashboard/stats")
def dashboard_stats():
    total_reviews  = int(catalog_df["review_count"].sum())
    total_products = len(catalog_df)
    avg_rating     = round(float(catalog_df["avg_rating"].mean()), 2)
    positive = int((catalog_df["positive_pct"] * catalog_df["review_count"]).sum() / 100)
    negative = int((catalog_df["negative_pct"] * catalog_df["review_count"]).sum() / 100)
    neutral  = total_reviews - positive - negative
    top5 = catalog_df.nlargest(5,"avg_sentiment")[["product_id","product_name","avg_sentiment","avg_rating","review_count","category"]].to_dict(orient="records")
    bot5 = catalog_df.nsmallest(5,"avg_sentiment")[["product_id","product_name","avg_sentiment","avg_rating","review_count","category"]].to_dict(orient="records")
    cat_sentiment = catalog_df.groupby("category")["avg_sentiment"].mean().round(3).sort_values(ascending=False).to_dict()
    rating_dist = {str(s): int(catalog_df[catalog_df["avg_rating"].between(s-0.5,s+0.49)]["review_count"].sum()) for s in [1,2,3,4,5]}
    return {"total_reviews":total_reviews,"total_products":total_products,"avg_rating":avg_rating,"sentiment_distribution":{"Positive":positive,"Neutral":neutral,"Negative":negative},"top_products":top5,"bottom_products":bot5,"rating_distribution":rating_dist,"category_sentiment":cat_sentiment}


# @app.post("/analyze")
# def analyze(payload: dict):
#     text = payload.get("text","")
#     if not text.strip():
#         raise HTTPException(status_code=400, detail="text is required")
#     return analyze_text(text)

@app.post("/analyze-ml")
def analyze_ml(payload: dict):
    # POST /analyze-ml
    # {
    # "text": "This dress is amazing and fits perfectly!"
    # }
    text = payload.get("text", "")
    
    if not text.strip():
        raise HTTPException(status_code=400, detail="text is required")

    result = predict_sentiment_ml(text)

    return {
        "text": text,
        "prediction": result
    }