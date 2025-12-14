/**
 * @file Wordle.tsx
 * @brief Hlavní komponenta hry Wordle Unlimited
 * @author Jiří Hronský xhronsj00
 */
import React, { useState, useEffect, useRef } from "react";
import "./Wordle.css";

// Definice typu pro zpětnou vazbu barev
type Feedback = "G" | "Y" | "B";

const ROWS = 6;
const COLS = 5;
const GAME_DURATION = 120; // 2 minuty

const ROW1 = ["Q","W","E","R","T","Y","U","I","O","P"];
const ROW2 = ["A","S","D","F","G","H","J","K","L"];
const ROW3 = ["Z","X","C","V","B","N","M"];

// Definice typu pro kategorie slov
type Category = {
  id: string;
  name: string;
};

// Ikony kategorií
const CategoryIcons: Record<string, React.ReactNode> = {
  // Ikona pro FOOD (Jablko/Burger)
  cat_food: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"></path>
      <path d="M10 2c1 .5 2 2 2 5"></path>
    </svg>
  ),
  // Ikona pro ANIMALS (Tlapka)
  cat_animals: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 14c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"></path>
      <path d="M12 16c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"></path>
      <path d="M6 10C4.34 10 3 8.66 3 7s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"></path>
      <path d="M18 10c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"></path>
    </svg>
  ),
  // Ikona pro ALL / Ostatní (Kniha)
  cat_all: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  ),
  // Fallback ikona (kdyby přibyla kategorie bez ikony)
  default: (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
       <circle cx="12" cy="12" r="10"></circle>
       <line x1="12" y1="8" x2="12" y2="16"></line>
       <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
  )
};

// Hlavní komponenta aplikace
function App() {
  const [grid, setGrid] = useState<string[][]>( // Herní mřížka
    Array.from({ length: ROWS }, () => Array(COLS).fill(""))
  );
  const [feedbackGrid, setFeedbackGrid] = useState<Feedback[][]>( // Mřížka zpětné vazby
    Array.from({ length: ROWS }, () => Array(COLS).fill("B"))
  );
  
  // Stav klávesnice
  const [keyboardStatus, setKeyboardStatus] = useState<Record<string, Feedback>>({});
  // Aktuální stav hry
  const [currentRow, setCurrentRow] = useState(0);
  // Aktuálně zadávané slovo
  const [currentWord, setCurrentWord] = useState("");
  // Toast zprávy
  const [toast, setToast] = useState<string | null>(null);
  // Časovač pro toast zprávy
  const toastTimeout = useRef<number | null>(null);
  // Stav odesílání slova
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Stav výhry
  const [hasWon, setHasWon] = useState(false);
  // ID hry
  const [gameId, setGameId] = useState<string>("");
  // Zbývající čas
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  // Stav zastavení hry
  const [isGameStopped, setIsGameStopped] = useState(false);
  // Zobrazení modálního okna s výsledky
  const [showResultModal, setShowResultModal] = useState(false);
  // Kategorie slov
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isGameActive, setIsGameActive] = useState(false);

  // Načtení kategorií ze serveru při načtení komponenty
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Failed to fetch categories", err));
  }, []);

  // Funkce pro zahájení nové hry
  const startNewGame = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/new_game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category_ids: selectedCategories })
      });
      const data = await res.json();
      setGameId(data.game_id);
      
      // Reset stavu hry
      setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill("")));
      setFeedbackGrid(Array.from({ length: ROWS }, () => Array(COLS).fill("B")));
      setKeyboardStatus({}); // Reset klávesnice
      setCurrentRow(0); // Reset aktuálního řádku
      setCurrentWord("");
      setHasWon(false);
      setIsGameStopped(false);
      setShowResultModal(false);
      setTimeLeft(GAME_DURATION);
      setIsGameActive(true); // Zapneme herní obrazovku
    } catch (err) {
      console.error("Failed to start the game:", err);
    }
  };

  // Formátování času ve formátu MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Zobrazení toast zprávy
  const showToast = (message: string) => {
    setToast(message);
    if (toastTimeout.current) {
      clearTimeout(toastTimeout.current);
    }
    toastTimeout.current = window.setTimeout(() => {
      setToast(null);
      toastTimeout.current = null;
    }, 3000);
  };

  // Časovač hry
  useEffect(() => {
    if (isGameStopped || !isGameActive) return; 

    if (timeLeft <= 0) {
      setIsGameStopped(true);
      showToast("Times Up!");
      setTimeout(() => {
        setShowResultModal(true);
      }, 3000);
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isGameStopped, isGameActive]);

  // Zpracování klávesových vstupů
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGameStopped || !isGameActive) return;

      if (e.key === "Enter") {
        handleSubmit();
      } else if (e.key === "Backspace") {
        setCurrentWord((prev) => prev.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        setCurrentWord((prev) =>
          prev.length < COLS ? prev + e.key.toUpperCase() : prev
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentWord, currentRow, isGameStopped, isGameActive]);

  // Odeslání aktuálního slova na server a zpracování odpovědi
  const handleSubmit = async () => {
    if (isGameStopped) return;
    
    if (currentWord.length !== COLS) {
      showToast("Not enough letters! Enter 5 letters.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/check_word", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            word: currentWord, 
            game_id: gameId 
        }),
      });

      if (!res.ok) { // 400 Bad Request pro neplatná slova
        const error = await res.json();
        showToast(error.detail || "Invalid English word!");
        return;
      }

      const data = await res.json();
      if (data.error) { // Ošetření jiných chyb
        alert(data.error);
        return;
      }

      // Aktualizace herní mřížky a zpětné vazby
      const newGrid = grid.map((row, r) =>
        r === currentRow ? currentWord.split("") : row
      );
      setGrid(newGrid);

      const newFeedbackGrid = feedbackGrid.map((row, r) =>
        r === currentRow ? data.result : row
      );
      setFeedbackGrid(newFeedbackGrid);

      // Aktualizace stavu klávesnice s animací
      const resultColors: Feedback[] = data.result;
      const letters = currentWord.split("");

      letters.forEach((letter, index) => {
        const color = resultColors[index];
        const delay = (index * 300) + 300; // Zpoždění pro animaci

        setTimeout(() => {
          setKeyboardStatus((prev) => {
            const currentStatus = prev[letter];
            
            // Logika priorit: Green > Yellow > Black
            if (color === "G") return { ...prev, [letter]: "G" };
            
            // Pokud je nová barva žlutá a současná není zelená, přepsat
            if (color === "Y" && currentStatus !== "G") return { ...prev, [letter]: "Y" };
            
            // Pokud je nová barva černá a klávesa ještě nemá barvu, nastavit černou
            if (color === "B" && !currentStatus) return { ...prev, [letter]: "B" };
            
            return prev;
          });
        }, delay);
      });

      // Přesun na další řádek
      const nextRow = currentRow + 1;
      setCurrentRow(nextRow);
      setCurrentWord("");

      // Kontrola výhry nebo prohry
      if (data.is_correct) {
        setIsGameStopped(true);
        showToast("Congratulations! You guessed the word!");
        setTimeout(() => {
          setHasWon(true);
          setShowResultModal(true); 
        }, 3000); // Čeká se déle než trvají všechny animace
      } 
      else if (nextRow >= ROWS) {
        setIsGameStopped(true);
        showToast("Game over! You've run out of attempts.");
        setTimeout(() => {
            setShowResultModal(true); 
        }, 3000);
      }

    } catch (err) { // Síťové chyby
      console.error("Chyba:", err);
      showToast("Connection error with the server!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Získání třídy pro klávesu na základě jejího stavu
  const getKeyClassName = (key: string) => {
    const status = keyboardStatus[key];
    if (status === "G") return " green";
    if (status === "Y") return " yellow";
    if (status === "B") return " black";
    return "";
  };

  // Zpracování kliknutí na klávesu
  const handleKeyClick = (key: string) => {
     if (isSubmitting || isGameStopped) return;
     if (currentWord.length < COLS) {
       setCurrentWord((prev) => prev + key);
     }
  };

  // Zpracování stisku backspace
  const handleBackspace = () => {
    if (isGameStopped) return;
    setCurrentWord((prev) => prev.slice(0, -1));
  };
 
  // Zpracování stisku enter
  const handleEnter = () => {
    if (isSubmitting || isGameStopped) return;
    handleSubmit();
  };
  
  // Zpracování změny výběru kategorie
  const handleCategoryChange = (catId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(catId)) return prev.filter(id => id !== catId);
      return [...prev, catId];
    });
  };

  // Funkce pro návrat do menu
  const goBackToMenu = () => {
    setShowResultModal(false);
    setIsGameActive(false);
  };

  // Zobrazení okna s výsledky po skončení hry
  if (showResultModal) {
    const isTimeOut = timeLeft <= 0 && !hasWon;
   
    return (
      <div className="win-screen">
         <h1>WORDLE UNLIMITED</h1>
         
         <div className="mini-grid-icon">
            <div className="mini-row">
              <div className="mini-cell-static yellow"></div>
              <div className="mini-cell-static green"></div>
              <div className="mini-cell-static black"></div>
            </div>
            <div className="mini-row">
              <div className="mini-cell-static black"></div>
              <div className="mini-cell-static black"></div>
              <div className="mini-cell-static yellow"></div>
            </div>
            <div className="mini-row">
              <div className="mini-cell-static black"></div>
              <div className="mini-cell-static yellow"></div>
              <div className="mini-cell-static green"></div>
            </div>
         </div>

         {hasWon ? (
            <>
              <h2 className="result-title green">CONGRATULATIONS!</h2>
              <p className="win-subtitle">You used {currentRow} of {ROWS} guesses</p>
              <p className="win-subtitle">Time remaining: {formatTime(timeLeft)}</p>
            </>
         ) : (
            <>
              <h2 className="result-title red">
                {isTimeOut ? "TIME'S UP!" : "GAME OVER"}
              </h2>
              <p className="win-subtitle">
                {isTimeOut ? "You ran out of time." : "You ran out of guesses."}
              </p>
              <p className="win-subtitle">Don't worry, try again!</p>
            </>
         )}

         <div className="win-buttons">
            <button className="btn-grey" onClick={() => window.location.href = "/"}>Main Menu</button>
            <button className="btn-grey" onClick={goBackToMenu}>Play Again 
              <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor" 
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginLeft: "5px" }}
            >
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg></button>
         </div>
      </div>
    );
  }

  return ( // Hlavní rozhraní hry
    <div className="wordle-app-container" tabIndex={-1}>
      {toast && <div className="toast">{toast}</div>}

      <h1>WORDLE UNLIMITED</h1>
      
      {/* Kategorie*/}
            {!isGameActive ? (
              <div className="menu-container">
                  <h2>Select Categories</h2>
                  <p className="menu-description">Choose your categories.</p>
                  
                  <div className="categories-grid">
                      {categories.map(cat => {
                          // Zjistíme, jestli je kategorie vybraná
                          const isSelected = selectedCategories.includes(cat.id);
                          // Najdeme správnou ikonku, nebo použijeme default
                          const Icon = CategoryIcons[cat.id] || CategoryIcons.default;

                          return (
                              <div 
                                  key={cat.id} 
                                  // Pokud je vybraná, přidáme třídu 'selected'
                                  className={`category-card ${isSelected ? "selected" : ""}`}
                                  onClick={() => handleCategoryChange(cat.id)}
                              >
                                  <div className="card-icon">
                                      {Icon}
                                  </div>
                                  <span className="card-name">{cat.name}</span>
                                  <input 
                                      type="checkbox" 
                                      style={{display: 'none'}}
                                      checked={isSelected}
                                      readOnly
                                  />
                              </div>
                          );
                      })}
                  </div>

                  <button 
                      onClick={startNewGame} 
                      className="start-btn"
                  >
                      START GAME
                  </button>
                  <button 
                      onClick={() => window.location.href = "/"} // ZDE DOPLŇ SVOU FUNKCI
                      className="leave-btn"
                  >
                      LEAVE
                  </button>
              </div>
            ) : (
          <>
            {/* HRA*/}
            <div className="game-content">
                <div className="grid-container">
                {grid.map((row, r) => {
                    const isCurrent = r === currentRow;
                    const currentLetters = isCurrent
                    ? [...currentWord.split(""), ...Array(COLS - currentWord.length).fill("")]
                    : row;

                    return ( // Jednotlivé řádky herní mřížky
                    <div key={r} className="grid-row">
                        {currentLetters.map((cell, c) => {
                        const feedback = feedbackGrid[r][c];
                        const entered = cell !== "";
                        let className = "grid-cell";

                        if (entered) {
                            if (currentRow === r) {
                            className += " filled";
                            } else if (currentRow > r || feedback !== "B") {
                            if (feedback === "G") className += " green";
                            else if (feedback === "Y") className += " yellow";
                            else className += " black";
                            }
                        }
                        return <span key={c} className={className}>{cell.toUpperCase()}</span>;
                        })}
                    </div>
                    );
                })}
                </div>

                <div className="side-panel"> {/* Boční panel s informacemi */}
                <div className="info-container">
                    <div className="info-label">REMAINING TIME</div>
                    <div className="info-box">
                    {formatTime(timeLeft)}
                    </div>
                </div>

                <div className="info-container"> {/* Aktuální počet tahů */}
                    <div className="info-label">CURRENT MOVES</div>
                    <div className="info-box">
                    {Math.min(ROWS, currentRow)}/{ROWS}
                    </div>
                </div>

                <div className="info-container"> {/* Tlačítko pro opuštění hry */}
                    <div className="info-label" style={{ visibility: "hidden" }}>PLACEHOLDER</div>
                    <button 
                    className="leave-btn" 
                    onClick={() => { setIsGameActive(false); setIsGameStopped(true); }} 
                    >
                    Menu ←
                    </button>
                </div>
                </div>
            </div>

            <div className="keyboard"> {/* Klávesnice */}
                <div className="keyboard-row">
                {ROW1.map((key) => (
                    <button
                    key={key}
                    onClick={(e) => { handleKeyClick(key); (e.currentTarget as HTMLButtonElement).blur(); }}
                    className={(key.length === 1 ? "key key-big" : "key") + getKeyClassName(key)}
                    >
                    {key}
                    </button>
                ))}
                </div>

                <div className="keyboard-row">
                {ROW2.map((key) => (
                    <button
                    key={key}
                    onClick={(e) => { handleKeyClick(key); (e.currentTarget as HTMLButtonElement).blur(); }}
                    className={(key.length === 1 ? "key key-big" : "key") + getKeyClassName(key)}
                    >
                    {key}
                    </button>
                ))}
                </div>

                <div className="keyboard-row keyboard-row-last"> 
                <button 
                    onClick={(e) => { handleEnter(); (e.currentTarget as HTMLButtonElement).blur(); }} className="key key-wide">
                    {/* Tlačítko Enter */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>
                </button>
                {ROW3.map((key) => ( 
                    <button
                    key={key}
                    onClick={(e) => { handleKeyClick(key); (e.currentTarget as HTMLButtonElement).blur(); }}
                    className={(key.length === 1 ? "key key-big" : "key") + getKeyClassName(key)}
                    >
                    {key}
                    </button>
                ))}
                <button onClick={(e) => { handleBackspace(); (e.currentTarget as HTMLButtonElement).blur(); }} className="key key-wide">
                    {/* Tlačítko Backspace */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12H4"/><path d="M10 18l-6-6 6-6"/></svg>
                </button>
                </div>
            </div>
        </>
      )}
    </div>
  );
}

export default App;