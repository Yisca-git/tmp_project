# Event Dress Rental 👗

A full-stack web application for renting event dresses, featuring an AI-powered chatbot that answers customer questions in natural language.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 21 |
| Backend | .NET 9 Web API |
| AI Service | Python 3.13 + FastAPI |
| AI Model | Groq (LLaMA 3.3 70B) |
| Database | SQL Server |

## Project Structure

```
├── angular-event-dress/     # Angular frontend
├── git_webApi/              # .NET backend
└── python-ai-service/       # Python AI service
```

## Features

- Browse and filter dresses by color, size, price, and category
- User authentication with JWT
- Shopping cart and order management
- Admin dashboard for managing dresses and orders
- **AI Chatbot** — answers customer questions based on real product data from the DB

## AI Chatbot

The chatbot uses **Groq's LLaMA 3.3 70B** model with real-time product injection (RAG).

- Knows all dresses, sizes, prices, and categories from the database
- Answers in Hebrew
- Semantic search using TF-IDF to find the most relevant products per query

## Getting Started

### Prerequisites

- Node.js 18+
- .NET 9 SDK
- Python 3.10+
- SQL Server

### 1. Frontend (Angular)

```bash
cd angular-event-dress
npm install
ng serve
```

Runs on `http://localhost:4200`

### 2. Backend (.NET)

```bash
cd git_webApi
```

Open `EventDressRental.sln` in Visual Studio and press **F5**.

Runs on `https://localhost:44362`

### 3. AI Service (Python)

```bash
cd python-ai-service
pip install -r requirements.txt
```

Create a `.env` file:

```
GROQ_API_KEY=your_groq_api_key_here
```

Get your free API key at [console.groq.com](https://console.groq.com)

```bash
py -m uvicorn main:app --reload --port 8000
```

Runs on `http://localhost:8000`
