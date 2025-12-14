# @file main.py
# @brief Backend pro hru Wordle Unlimited
# @author Jiří Hronský xhronsj00
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import random
import nltk 
from nltk.corpus import words 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# Ujistíme se, že máme stažený korpus slov
try:
    nltk.data.find('corpora/words')
except LookupError:
    nltk.download('words')

# Načteme slovník anglických slov
VALID_GUESSES = set(
    word.lower() for word in words.words() 
    if len(word) == 5 and word.isalpha()
)

# Zjednodušený slovník pro výběr tajného slova
SECRET_CANDIDATES = list(set(
    word.lower() for word in words.words('en-basic') 
    if len(word) == 5 and word.isalpha()
))

# Definice kategorií (Tabulka Category)
CATEGORIES_DB = [
    {"id": "cat_food", "name": "Food"},
    {"id": "cat_animals", "name": "Animals"},
    {"id": "cat_all", "name": "Dictionary"}
]

# Rozšířený seznam pro Food a Animals
TAGGED_WORDS = [
    # JÍDLO
    {"word": "apple", "categories": ["cat_food"]},
    {"word": "bread", "categories": ["cat_food"]},
    {"word": "cream", "categories": ["cat_food"]},
    {"word": "grape", "categories": ["cat_food"]},
    {"word": "honey", "categories": ["cat_food"]},
    {"word": "lemon", "categories": ["cat_food"]},
    {"word": "melon", "categories": ["cat_food"]},
    {"word": "onion", "categories": ["cat_food"]},
    {"word": "peach", "categories": ["cat_food"]},
    {"word": "pizza", "categories": ["cat_food"]},
    {"word": "sugar", "categories": ["cat_food"]},
    {"word": "water", "categories": ["cat_food"]},
    {"word": "bacon", "categories": ["cat_food"]},
    {"word": "steak", "categories": ["cat_food"]},
    {"word": "fruit", "categories": ["cat_food"]},
    {"word": "juice", "categories": ["cat_food"]},
    {"word": "salad", "categories": ["cat_food"]},
    {"word": "sauce", "categories": ["cat_food"]},
    {"word": "snack", "categories": ["cat_food"]},
    {"word": "spice", "categories": ["cat_food"]},
    {"word": "sushi", "categories": ["cat_food"]},
    {"word": "toast", "categories": ["cat_food"]},
    
    # OBĚ
    {"word": "goose", "categories": ["cat_food", "cat_animals"]},
    {"word": "trout", "categories": ["cat_food", "cat_animals"]},
    
    # ZVÍŘATA
    {"word": "tiger", "categories": ["cat_animals"]},
    {"word": "horse", "categories": ["cat_animals"]},
    {"word": "panda", "categories": ["cat_animals"]},
    {"word": "eagle", "categories": ["cat_animals"]},
    {"word": "shark", "categories": ["cat_animals"]},
    {"word": "zebra", "categories": ["cat_animals"]},
    {"word": "snake", "categories": ["cat_animals"]},
    {"word": "koala", "categories": ["cat_animals"]},
    {"word": "mouse", "categories": ["cat_animals"]},
    {"word": "sheep", "categories": ["cat_animals"]},
    {"word": "whale", "categories": ["cat_animals"]},
    {"word": "bunny", "categories": ["cat_animals"]},
    {"word": "camel", "categories": ["cat_animals"]},
    {"word": "puppy", "categories": ["cat_animals"]},
    {"word": "kitty", "categories": ["cat_animals"]},
    {"word": "otter", "categories": ["cat_animals"]},
    {"word": "skunk", "categories": ["cat_animals"]},
    {"word": "sloth", "categories": ["cat_animals"]},
]

# Debug výpisy
print(f"{len(VALID_GUESSES)} five-letter words loaded in secret dictionary, of which {len(SECRET_CANDIDATES)} are in the simplified.")

class GameConfig(BaseModel):
    category_ids: List[str] = [] # Seznam vybraných kategorií
    
# Ukládáme hry do paměti pomocí slovníku
GAMES = {} 

# Model pro příchozí hádání slova
class Guess(BaseModel):
    word: str
    game_id: str

# Funkce pro výpočet zpětné vazby
def compute_feedback(secret: str, guess: str) -> list[str]:
    feedback = ["B"] * len(secret)
    secret_count = {}
    for c in secret:
        secret_count[c] = secret_count.get(c, 0) + 1
    for i in range(len(secret)):
        if guess[i] == secret[i]:
            feedback[i] = "G"
            secret_count[guess[i]] -= 1
    for i in range(len(secret)):
        if feedback[i] == "B" and guess[i] in secret_count and secret_count[guess[i]] > 0:
            feedback[i] = "Y"
            secret_count[guess[i]] -= 1
    return feedback

# Endpoint pro získání kategorií
@app.get("/api/categories")
def get_categories():
    return CATEGORIES_DB

# Running Endpoint
@app.get("/")
def root():
    return {"message": "Wordle backend running!"}

# Endpoint pro vytvoření nové hry
@app.post("/api/new_game")
def new_game(config: GameConfig):
    game_id = str(uuid.uuid4())
    candidate_words = set()
    
    selected_cats = set(config.category_ids)

    # Pokud je vybráno "cat_all", NEBO není vybráno nic -> Bereme celý slovník
    if "cat_all" in selected_cats or not selected_cats:
        candidate_words = set(SECRET_CANDIDATES)
        print(f"Game {game_id}: Mode ALL (Dictionary)")
    
    # Jinak filtrujeme z TAGGED_WORDS podle Food/Animals
    else:
        for item in TAGGED_WORDS:
            # Pokud má slovo alespoň jednu kategorii shodnou s výběrem uživatele
            if not selected_cats.isdisjoint(set(item["categories"])):
                candidate_words.add(item["word"])
        print(f"Game {game_id}: Mode Categories {selected_cats}")

    # Fallback pojistka, kdyby byl průnik prázdný
    if not candidate_words:
        candidate_words = {"apple", "start"}

    secret_word = random.choice(list(candidate_words))
    GAMES[game_id] = secret_word
    
    print(f"-> Secret word: {secret_word}")
    
    return {"game_id": game_id}

# Endpoint pro kontrolu hádaného slova
@app.post("/api/check_word")
def check_word(guess: Guess):
    # Najdeme tajné slovo pro tuto konkrétní hru
    secret_word = GAMES.get(guess.game_id)

    if not secret_word:
        raise HTTPException(status_code=404, detail="Game not found (probably expired or does not exist)")

    word = guess.word.lower()
    # Validace vstupu
    if len(word) != 5:
        raise HTTPException(status_code=400, detail="The word must have 5 letters.")
    if not word.isalpha():
        raise HTTPException(status_code=400, detail="The word must contain only letters")
    if word not in VALID_GUESSES:
        raise HTTPException(status_code=400, detail="Invalid English word")
    
    result = compute_feedback(secret_word, word)
    is_correct = word == secret_word

    # Debug výpis
    return {
        "word": word,
        "result": result,
        "is_correct": is_correct
    }

# Endpoint pro získání stavu serveru
@app.get("/api/status")
async def status():
    return {"status": "ok", "active_games": len(GAMES)}