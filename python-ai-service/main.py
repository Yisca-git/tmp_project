from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

load_dotenv()
os.environ["HUGGING_FACE_HUB_TOKEN"] = os.getenv("HF_TOKEN", "")

app = FastAPI()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://localhost:44362", "http://localhost:4200"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    dresses: list = []

def find_relevant(query: str, dresses: list, top_k: int = 5) -> list:
    if not dresses:
        return []
    texts = [f"{d.get('Name','')} {d.get('Description','')} {d.get('Color','')} {' '.join(d.get('Categories', []))}" for d in dresses]
    vectorizer = TfidfVectorizer()
    matrix = vectorizer.fit_transform(texts + [query])
    scores = cosine_similarity(matrix[-1], matrix[:-1])[0]
    top_indices = scores.argsort()[::-1][:top_k]
    return [dresses[i] for i in top_indices]

@app.post("/chat")
def chat(req: ChatRequest):
    relevant = find_relevant(req.message, req.dresses) if req.dresses else []
    context = f"המוצרים הרלוונטיים:\n{relevant}" if relevant else ""
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": f"אתה עוזר לחנות השכרת שמלות לאירועים. ענה בעברית בצורה ידידותית וקצרה. {context}"},
            {"role": "user", "content": req.message}
        ]
    )
    return {"reply": response.choices[0].message.content}
