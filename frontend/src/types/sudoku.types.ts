/**
 * @file sudoku.types.ts
 * @brief TypeScript definície typov pre Sudoku aplikáciu
 * @author Natalia Holbikova (xholbin00)
 * @date 2025
 * 
 * Tento súbor obsahuje všetky TypeScript typy a rozhrania
 * použité v Sudoku aplikácii vrátane herných stavov, buniek,
 * režimov a dátových štruktúr pre špeciálne herné režimy.
 */

/**
 * Úrovne obtiažnosti hry
 * - easy: Ľahká (viac vyplnených buniek, 5 undo)
 * - medium: Stredná (menej vyplnených buniek, 3 undo)
 * - hard: Ťažká (minimum vyplnených buniek, 0 undo, max 3 chyby)
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * Herné režimy Sudoku
 * - classic: Klasické Sudoku pravidlá
 * - comparison: Symboly ukazujú vzťah medzi susednými bunkami
 * - odd-even: Bunky sú obmedzené na párne/nepárne čísla
 * - diagonal: Diagonály musia obsahovať čísla 1-9 bez opakovania
 */
export type GameMode = 'classic' | 'comparison' | 'odd-even' | 'diagonal';

/**
 * Hodnota bunky (0 = prázdna, 1-9 = číslo)
 */
export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

/**
 * Symbol porovnania pre Comparison režim
 * - '<': Ľavá/horná bunka je menšia ako pravá/dolná
 * - '>': Ľavá/horná bunka je väčšia ako pravá/dolná
 * - '^': Horná bunka je menšia ako dolná (vertikálne)
 * - 'v': Horná bunka je väčšia ako dolná (vertikálne)
 * - null: Žiadne porovnanie
 */
export type ComparisonSymbol = '<' | '>' | '^' | 'v' | null;

/**
 * Obmedzenie párne/nepárne pre Odd-Even režim
 * - 'odd': Bunka musí obsahovať nepárne číslo (1,3,5,7,9)
 * - 'even': Bunka musí obsahovať párne číslo (2,4,6,8)
 * - null: Žiadne obmedzenie
 */
export type OddEvenConstraint = 'odd' | 'even' | null;

/**
 * Reprezentácia jednej bunky v Sudoku mriežke
 */
export interface Cell {
  value: CellValue;      // Aktuálna hodnota bunky
  isInitial: boolean;    // Či je to počiatočná (nemeniteľná) bunka
  isError: boolean;      // Či obsahuje nesprávnu hodnotu
  notes: Set<number>;    // Poznámky (možné hodnoty 1-9)
}

/**
 * Pozícia bunky v mriežke
 */
export interface Position {
  row: number;  // Riadok (0-8)
  col: number;  // Stĺpec (0-8)
}

/**
 * Dáta pre Comparison režim
 * Obsahuje symboly porovnania medzi susednými bunkami
 */
export interface ComparisonData {
  horizontal: ComparisonSymbol[][];  // 9x8 - symboly medzi stĺpcami
  vertical: ComparisonSymbol[][];    // 8x9 - symboly medzi riadkami
}

/**
 * Kompletný herný stav Sudoku
 * Obsahuje všetky informácie potrebné pre chod hry
 */
export interface GameState {
  board: Cell[][];                          // Herná doska 9x9
  solution: number[][];                     // Správne riešenie
  initialBoard: number[][];                 // Počiatočný stav (pre reset)
  difficulty: Difficulty;                   // Úroveň obtiažnosti
  mode: GameMode;                           // Herný režim
  filledCells: number;                      // Počet vyplnených buniek
  mistakes: number;                         // Počet chýb
  hintsUsed: number;                        // Počet použitých nápovied
  timeElapsed: number;                      // Uplynulý čas v sekundách
  isNotesMode: boolean;                     // Režim poznámok zapnutý/vypnutý
  selectedCell: Position | null;            // Aktuálne vybraná bunka
  isComplete: boolean;                      // Či je hra úspešne dokončená
  undosRemaining: number;                   // Zostávajúce undo akcie
  maxMistakes: number;                      // Maximum povolených chýb (0 = neobmedzené)
  isGameOver: boolean;                      // Či hra skončila kvôli príliš veľa chybám
  comparisonData?: ComparisonData;          // Dáta pre Comparison režim
  oddEvenPattern?: OddEvenConstraint[][];   // Pattern pre Odd-Even režim (9x9)
}
