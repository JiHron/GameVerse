/**
 * @file sudokuApi.ts
 * @brief API služba pre komunikáciu s backend serverom
 * @author Natalia Holbikova (xholbin00)
 * @date 2025
 * 
 * Tento modul poskytuje funkcie pre komunikáciu s backend API.
 * Obsahuje volania pre:
 * - Vytvorenie novej hry
 * - Vykonanie ťahu
 * - Získanie nápovedy
 * - Správu poznámok
 * - Reset hry
 */

import { Difficulty, GameMode } from '../types/sudoku.types';

// URL backendu - nastaviteľné cez environment premennú
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Odpoveď API pri vytvorení novej hry
 */
export interface NewGameResponse {
  board: number[][];           // Herná doska s niektorými vyplnenými bunkami
  initial_board: number[][];   // Počiatočný stav dosky
  solution?: number[][];       // Riešenie (nepovinné)
}

/**
 * Odpoveď API pri vykonaní ťahu
 */
export interface MakeMoveResponse {
  is_correct: boolean;    // Či je ťah správny
  mistakes: number;       // Počet chýb
  filled_cells: number;   // Počet vyplnených buniek
  is_complete: boolean;   // Či je hra dokončená
  all_correct: boolean;   // Či sú všetky bunky správne
}

/**
 * Odpoveď API pri požiadaní nápovedy
 */
export interface HintResponse {
  row: number;    // Riadok nápovedy
  col: number;    // Stĺpec nápovedy
  value: number;  // Správna hodnota
}

/**
 * Odpoveď API pri získaní herného stavu
 */
export interface GameStateResponse {
  board: number[][];
  filled_cells: number;
  mistakes: number;
  hints_used: number;
  time: number;
  is_complete: boolean;
}

/**
 * Odpoveď API pri dokončení hry
 */
export interface CompletionResponse {
  time: number;
  mistakes: number;
  difficulty: string;
}

/**
 * Objekt s API funkciami pre Sudoku
 */
export const sudokuApi = {
  /**
   * Vytvorí novú Sudoku hru
   * @param difficulty - Úroveň obtiažnosti (easy, medium, hard)
   * @param mode - Herný režim (classic, comparison, odd-even, diagonal)
   * @returns Promise s dátami novej hry
   * @throws Error ak požiadavka zlyhá
   */
  async newGame(difficulty: Difficulty, mode: GameMode): Promise<NewGameResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/sudoku/new-game`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ difficulty, mode }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating new game:', error);
      throw error;
    }
  },

  /**
   * Vykoná ťah v hre
   * @param row - Riadok bunky (0-8)
   * @param col - Stĺpec bunky (0-8)
   * @param value - Hodnota na vloženie (1-9)
   * @returns Promise s výsledkom ťahu
   * @throws Error ak požiadavka zlyhá
   */
  async makeMove(row: number, col: number, value: number): Promise<MakeMoveResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/sudoku/make-move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ row, col, value }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error making move:', error);
      throw error;
    }
  },

  /**
   * Vymaže obsah bunky
   * @param row - Riadok bunky
   * @param col - Stĺpec bunky
   * @throws Error ak požiadavka zlyhá
   */
  async erase(row: number, col: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/sudoku/erase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ row, col }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error erasing cell:', error);
      throw error;
    }
  },

  /**
   * Získa nápovedu pre ďalší ťah
   * @returns Promise s pozíciou a hodnotou nápovedy
   * @throws Error ak požiadavka zlyhá
   */
  async getHint(): Promise<HintResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/sudoku/hint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting hint:', error);
      throw error;
    }
  },

  /**
   * Aktualizuje poznámky v bunke
   * @param mode - Režim: 'toggle' pre prepnutie, 'add' pre pridanie
   * @param row - Riadok bunky
   * @param col - Stĺpec bunky
   * @param value - Hodnota poznámky (1-9)
   * @throws Error ak požiadavka zlyhá
   */
  async updateNotes(mode: 'toggle' | 'add', row: number, col: number, value: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/sudoku/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode, row, col, value }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      throw error;
    }
  },

  /**
   * Resetuje aktuálnu hru
   * @throws Error ak požiadavka zlyhá
   */
  async reset(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/sudoku/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error resetting game:', error);
      throw error;
    }
  },

  /**
   * Získa aktuálny stav hry
   * @returns Promise s aktuálnym stavom hry
   * @throws Error ak požiadavka zlyhá
   */
  async getState(): Promise<GameStateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/sudoku/state`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting state:', error);
      throw error;
    }
  },

  /**
   * Získa informácie o dokončení hry
   * @returns Promise s informáciami o dokončení
   * @throws Error ak požiadavka zlyhá
   */
  async getCompletion(): Promise<CompletionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/sudoku/completion`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting completion:', error);
      throw error;
    }
  },
};

export default sudokuApi;
