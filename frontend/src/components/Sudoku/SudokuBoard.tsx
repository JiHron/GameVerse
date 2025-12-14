/**
 * @file SudokuBoard.tsx
 * @brief Komponent pre zobrazenie hernej dosky Sudoku
 * @author Natalia Holbikova (xholbin00)
 * @date 2025
 * 
 * Tento komponent renderuje 9x9 hernú dosku a spravuje
 * zobrazenie buniek, označenie aktívnych oblastí a špeciálnych
 * prvkov pre rôzne herné režimy (diagonály, porovnania, odd/even)
 */

import React from 'react';
import SudokuCell from './SudokuCell';
import { GameState, ComparisonSymbol, OddEvenConstraint } from '../../types/sudoku.types';
import { isOnDiagonal } from '../../utils/sudoku.utils';

interface SudokuBoardProps {
  gameState: GameState;
  onCellClick: (row: number, col: number) => void;
}

/**
 * Komponent hernej dosky Sudoku
 * Renderuje 9x9 mriežku buniek s podporou pre rôzne herné režimy
 */
const SudokuBoard: React.FC<SudokuBoardProps> = ({ gameState, onCellClick }) => {
  const { board, selectedCell, mode, comparisonData, oddEvenPattern } = gameState;

  /**
   * Zisťuje, či má byť bunka zvýraznená na základe vybranej bunky
   * Zvýrazňujú sa: rovnaký riadok, stĺpec alebo 3x3 box
   * @param row - Riadok bunky
   * @param col - Stĺpec bunky
   * @returns True ak má byť bunka zvýraznená
   */
  const isHighlighted = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    
    const sameRow = row === selectedCell.row;
    const sameCol = col === selectedCell.col;
    const sameBox = 
      Math.floor(row / 3) === Math.floor(selectedCell.row / 3) &&
      Math.floor(col / 3) === Math.floor(selectedCell.col / 3);
    
    return sameRow || sameCol || sameBox;
  };

  /**
   * Získa horizontálny porovnávací symbol pre Comparison režim
   * @param row - Riadok bunky
   * @param col - Stĺpec bunky
   * @returns Symbol '<' alebo '>' alebo null
   */
  const getHorizontalComparison = (row: number, col: number): ComparisonSymbol => {
    if (mode !== 'comparison' || !comparisonData || col >= 8) return null;
    return comparisonData.horizontal[row][col];
  };

  /**
   * Získa vertikálny porovnávací symbol pre Comparison režim
   * @param row - Riadok bunky
   * @param col - Stĺpec bunky
   * @returns Symbol '^' alebo 'v' alebo null
   */
  const getVerticalComparison = (row: number, col: number): ComparisonSymbol => {
    if (mode !== 'comparison' || !comparisonData || row >= 8) return null;
    return comparisonData.vertical[row][col];
  };

  /**
   * Získa obmedzenie párne/nepárne pre Odd/Even režim
   * @param row - Riadok bunky
   * @param col - Stĺpec bunky
   * @returns 'odd', 'even' alebo null
   */
  const getOddEvenConstraint = (row: number, col: number): OddEvenConstraint => {
    if (mode !== 'odd-even' || !oddEvenPattern) return null;
    return oddEvenPattern[row][col];
  };

  /**
   * Kontroluje, či je bunka na diagonále pre Diagonal režim
   * @param row - Riadok bunky
   * @param col - Stĺpec bunky
   * @returns True ak je bunka na hlavnej alebo vedľajšej diagonále
   */
  const isDiagonalCell = (row: number, col: number): boolean => {
    if (mode !== 'diagonal') return false;
    return isOnDiagonal(row, col);
  };

  return (
    <div className={`sudoku-board ${mode === 'diagonal' ? 'diagonal-mode' : ''}`}>
      {/* SVG vrstva pre zobrazenie diagonálnych čiar v Diagonal režime */}
      {mode === 'diagonal' && (
        <svg className="diagonal-overlay" viewBox="0 0 459 459" preserveAspectRatio="none">
          {/* Hlavná diagonála (ľavý horný roh → pravý dolný roh) */}
          <line x1="2" y1="2" x2="457" y2="457" stroke="#2196f3" strokeWidth="3" strokeLinecap="round" />
          {/* Vedľajšia diagonála (pravý horný roh → ľavý dolný roh) */}
          <line x1="457" y1="2" x2="2" y2="457" stroke="#2196f3" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      
      {/* Renderovanie riadkov a buniek */}
      {board.map((row, rowIdx) => (
        <div key={rowIdx} className="sudoku-row">
          {row.map((cell, colIdx) => (
            <SudokuCell
              key={`${rowIdx}-${colIdx}`}
              cell={cell}
              row={rowIdx}
              col={colIdx}
              isSelected={
                selectedCell?.row === rowIdx && 
                selectedCell?.col === colIdx
              }
              isHighlighted={isHighlighted(rowIdx, colIdx)}
              onClick={() => onCellClick(rowIdx, colIdx)}
              mode={mode}
              horizontalComparison={getHorizontalComparison(rowIdx, colIdx)}
              verticalComparison={getVerticalComparison(rowIdx, colIdx)}
              oddEvenConstraint={getOddEvenConstraint(rowIdx, colIdx)}
              isDiagonalCell={isDiagonalCell(rowIdx, colIdx)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SudokuBoard;
