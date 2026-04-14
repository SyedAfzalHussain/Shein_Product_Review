from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import pandas as pd
import numpy as np
import os
import random
from typing import Optional

app = FastAPI(title="SheinReview API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

analyzer = SentimentIntensityAnalyzer()

# ─────────────────────────────────────────────
#  DATASET LOADING
#  Download from Kaggle:
#  https://www.kaggle.com/datasets/nicapotato/womens-ecommerce-clothing-reviews
#  Place CSV in this folder as: reviews.csv
# ─────────────────────────────────────────────

CATEGORY_MAP = {
    "Tops": ["Crop Top", "Graphic Tee", "Oversized Hoodie", "Ribbed Tank"],
    "Dresses": ["Floral Midi Dress", "Mini Wrap Dress", "Slip Dress", "Bodycon Dress"],
    "Bottoms": ["Wide-Leg Jeans", "Pleated Skirt", "Cargo Pants", "Denim Shorts"],
    "Outerwear": ["Puffer Jacket", "Trench Coat", "Blazer Set", "Fleece Hoodie"],
    "Intimate": ["Lace Bra Set", "Seamless Underwear", "Sleep Shorts", "Lounge Set"],
    "Trend": ["Y2K Coord Set", "Coquette Blouse", "Dark Academia Vest", "Preppy Sweater"],
}

SHEIN_PRODUCT_IMAGES = [
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&q=80",
    "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80",
    "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80",
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80",
    "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80",
]


def get_sentiment_label(score: float) -> str:
    if score >= 0.05:
        return "Positive"
    elif score <= -0.05:
        return "Negative"
    return "Neutral"


def analyze_text(text: str) -> dict:
    scores = analyzer.polarity_scores(str(text))
    label = get_sentiment_label(scores["compound"])
    return {
        "compound": round(scores["compound"], 3),
        "positive": round(scores["pos"], 3),
        "negative": round(scores["neg"], 3),
        "neutral": round(scores["neu"], 3),
        "label": label,
    }


def load_dataset() -> pd.DataFrame:
    csv_path = "reviews.csv"
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        # Standardize columns from Kaggle Women's Clothing dataset
        col_map = {
            "Clothing ID": "product_id",
            "Age": "age",
            "Title": "title",
            "Review Text": "review_text",
            "Rating": "rating",
            "Recommended IND": "recommended",
            "Positive Feedback Count": "helpful_count",
            "Division Name": "division",
            "Department Name": "department",
            "Class Name": "category",
        }
        df = df.rename(columns={k: v for k, v in col_map.items() if k in df.columns})
        df = df.dropna(subset=["review_text"])
        df["review_text"] = df["review_text"].astype(str)
        print(f"✅ Loaded {len(df)} reviews from CSV")
        return df
    else:
        print("⚠️  reviews.csv not found — generating sample data")
        return generate_sample_data()


def generate_sample_data() -> pd.DataFrame:
    """Generates realistic sample data if CSV isn't available."""
    random.seed(42)
    sample_reviews = [
        ("Amazing quality for the price! Fits perfectly and the material is soft.", 5),
        ("Color is slightly different from the picture but overall happy with it.", 4),
        ("Runs small, order a size up. Fabric feels cheap but looks great in photos.", 3),
        ("Absolutely love this piece! Got so many compliments wearing it out.", 5),
        ("Stitching came apart after the first wash. Very disappointed.", 1),
        ("Cute design, decent quality. Shipping took 3 weeks though.", 3),
        ("Perfect for summer! Light fabric and the fit is flattering.", 5),
        ("Not as described. The length is much shorter than shown in pictures.", 2),
        ("Great value for money. Would definitely buy again!", 4),
        ("Material is thinner than expected but still looks nice on.", 3),
        ("Exactly what I was looking for. Super fast delivery too!", 5),
        ("The zipper broke after a week. Quality control issue.", 1),
        ("Obsessed with this! The style is very trendy and modern.", 5),
        ("Decent purchase overall. Sizing chart was accurate.", 4),
        ("Fabric pills after one wash. Not worth the price.", 2),
    ]

    rows = []
    pid = 1
    for cat, names in CATEGORY_MAP.items():
        for name in names:
            price = round(random.uniform(8.99, 49.99), 2)
            img = random.choice(SHEIN_PRODUCT_IMAGES)
            for i in range(random.randint(8, 20)):
                review, base_rating = random.choice(sample_reviews)
                noise = random.randint(-1, 1)
                rating = max(1, min(5, base_rating + noise))
                rows.append({
                    "product_id": pid,
                    "product_name": name,
                    "category": cat,
                    "price": price,
                    "image_url": img,
                    "review_text": review,
                    "rating": rating,
                    "age": random.randint(18, 45),
                    "helpful_count": random.randint(0, 50),
                    "recommended": 1 if rating >= 4 else 0,
                })
            pid += 1

    return pd.DataFrame(rows)


# ─────────────────────────────────────────────
#  STARTUP: load data & compute sentiments
# ─────────────────────────────────────────────
df = load_dataset()

# Compute sentiment for every review
sentiments = df["review_text"].apply(analyze_text)
df["sentiment_label"] = sentiments.apply(lambda x: x["label"])
df["sentiment_score"] = sentiments.apply(lambda x: x["compound"])

# Build product catalog
if "product_name" not in df.columns:
    # Kaggle CSV — synthesize product names from category
    df["product_name"] = df.get("category", "Item").fillna("Item") + " #" + df["product_id"].astype(str)

if "price" not in df.columns:
    random.seed(0)
    unique_ids = df["product_id"].unique()
    price_map = {pid: round(random.uniform(8.99, 49.99), 2) for pid in unique_ids}
    df["price"] = df["product_id"].map(price_map)

if "image_url" not in df.columns:
    unique_ids = df["product_id"].unique()
    img_map = {pid: SHEIN_PRODUCT_IMAGES[i % len(SHEIN_PRODUCT_IMAGES)] for i, pid in enumerate(unique_ids)}
    df["image_url"] = df["product_id"].map(img_map)

# Product-level aggregation
product_df = (
    df.groupby("product_id")
    .agg(
        product_name=("product_name", "first"),
        category=("category", "first"),
        price=("price", "first"),
        image_url=("image_url", "first"),
        avg_rating=("rating", "mean"),
        review_count=("review_text", "count"),
        avg_sentiment=("sentiment_score", "mean"),
        positive_pct=("sentiment_label", lambda x: round((x == "Positive").mean() * 100, 1)),
        negative_pct=("sentiment_label", lambda x: round((x == "Negative").mean() * 100, 1)),
        neutral_pct=("sentiment_label", lambda x: round((x == "Neutral").mean() * 100, 1)),
    )
    .reset_index()
)
product_df["avg_rating"] = product_df["avg_rating"].round(1)
product_df["avg_sentiment"] = product_df["avg_sentiment"].round(3)

print(f"✅ Indexed {len(product_df)} products")


# ─────────────────────────────────────────────
#  ROUTES
# ─────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "SheinReview API is running"}


@app.get("/products")
def get_products(
    page: int = 1,
    limit: int = 12,
    category: Optional[str] = None,
    sort: Optional[str] = "popular",  # popular | rating | sentiment | price_asc | price_desc
    search: Optional[str] = None,
):
    data = product_df.copy()

    if category and category != "All":
        data = data[data["category"].str.lower() == category.lower()]

    if search:
        data = data[data["product_name"].str.lower().str.contains(search.lower(), na=False)]

    sort_map = {
        "popular": ("review_count", False),
        "rating": ("avg_rating", False),
        "sentiment": ("avg_sentiment", False),
        "price_asc": ("price", True),
        "price_desc": ("price", False),
    }
    col, asc = sort_map.get(sort, ("review_count", False))
    data = data.sort_values(col, ascending=asc)

    total = len(data)
    start = (page - 1) * limit
    paginated = data.iloc[start : start + limit]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit,
        "products": paginated.to_dict(orient="records"),
    }


@app.get("/products/{product_id}")
def get_product(product_id: int):
    product = product_df[product_df["product_id"] == product_id]
    if product.empty:
        raise HTTPException(status_code=404, detail="Product not found")

    reviews = df[df["product_id"] == product_id][
        ["review_text", "rating", "sentiment_label", "sentiment_score", "age", "helpful_count"]
    ].to_dict(orient="records")

    return {
        **product.iloc[0].to_dict(),
        "reviews": reviews,
    }


@app.get("/categories")
def get_categories():
    cats = ["All"] + sorted(df["category"].dropna().unique().tolist())
    return {"categories": cats}


@app.get("/dashboard/stats")
def get_dashboard_stats():
    total_reviews = len(df)
    total_products = len(product_df)
    avg_rating = round(df["rating"].mean(), 2)
    sentiment_dist = df["sentiment_label"].value_counts().to_dict()

    top_products = (
        product_df.nlargest(5, "avg_sentiment")[
            ["product_id", "product_name", "avg_sentiment", "avg_rating", "review_count", "category"]
        ].to_dict(orient="records")
    )

    bottom_products = (
        product_df.nsmallest(5, "avg_sentiment")[
            ["product_id", "product_name", "avg_sentiment", "avg_rating", "review_count", "category"]
        ].to_dict(orient="records")
    )

    rating_dist = df["rating"].value_counts().sort_index().to_dict()
    category_sentiment = (
        df.groupby("category")["sentiment_score"]
        .mean()
        .round(3)
        .sort_values(ascending=False)
        .to_dict()
    )

    return {
        "total_reviews": total_reviews,
        "total_products": total_products,
        "avg_rating": avg_rating,
        "sentiment_distribution": sentiment_dist,
        "top_products": top_products,
        "bottom_products": bottom_products,
        "rating_distribution": rating_dist,
        "category_sentiment": category_sentiment,
    }


@app.post("/analyze")
def analyze_review(payload: dict):
    text = payload.get("text", "")
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text is required")
    return analyze_text(text)