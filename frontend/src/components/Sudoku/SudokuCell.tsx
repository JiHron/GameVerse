/**
 * @file SudokuCell.tsx
 * @brief Komponent pre jednotlivú bunku Sudoku
 * @author Natalia Holbikova (xholbin00)
 * @date 2025
 * 
 * Tento komponent zobrazuje jednu bunku v Sudoku mriežke.
 * Podporuje zobrazenie hodnoty, poznámok, označenie vybranej bunky,
 * chybových stavov a špeciálnych indikátorov pre rôzne herné režimy.
 */

import React from 'react';
import { Cell, GameMode, ComparisonSymbol, OddEvenConstraint } from '../../types/sudoku.types';

interface Props {
  cell: Cell;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
  row: number;
  col: number;
  mode: GameMode;
  horizontalComparison?: ComparisonSymbol;
  verticalComparison?: ComparisonSymbol;
  oddEvenConstraint?: OddEvenConstraint;
  isDiagonalCell?: boolean;
}

/**
 * Komponent jednotlivej bunky Sudoku
 * Renderuje obsah bunky a aplikuje príslušné CSS triedy podľa stavu
 */
const SudokuCell: React.FC<Props> = ({ 
  cell, 
  isSelected, 
  isHighlighted, 
  onClick, 
  row, 
  col, 
  mode,
  horizontalComparison,
  verticalComparison,
  oddEvenConstraint,
  isDiagonalCell
}) => {
  /**
   * Generuje CSS triedy pre bunku na základe jej stavu
   * @returns String s CSS triedami oddelenými medzerou
   */
  const getClassName = () => {
    let className = 'sudoku-cell';
    
    // Základné stavy bunky
    if (isSelected) className += ' selected';
    if (isHighlighted) className += ' highlighted';
    if (cell.isInitial) className += ' initial';
    if (cell.isError) className += ' error';
    if (isDiagonalCell) className += ' diagonal-cell';
    
    // Špeciálne štýly pre Odd/Even režim
    if (mode === 'odd-even' && oddEvenConstraint) {
      className += oddEvenConstraint === 'even' ? ' even-cell' : ' odd-cell';
    }

    // Hrubšie okraje pre oddelenie 3x3 boxov
    if (col === 2 || col === 5) className += ' border-right';
    if (row === 2 || row === 5) className += ' border-bottom';

    return className;
  };

  return (
    <div className={getClassName()} onClick={onClick}>
      {/* Indikátor pre Odd/Even režim v prázdnych bunkách */}
      {mode === 'odd-even' && oddEvenConstraint && cell.value === 0 && (
        <span className="constraint-indicator">
          {oddEvenConstraint === 'odd' ? 'O' : 'E'}
        </span>
      )}
      
      {/* Zobrazenie hodnoty alebo poznámok */}
      {cell.value !== 0 ? (
        <span className="cell-value">{cell.value}</span>
      ) : (
        <div className="notes">
          {/* Mriežka 3x3 pre poznámky čísiel 1-9 */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(note => (
            <span 
              key={note} 
              className={`note ${cell.notes.has(note) ? 'visible' : ''}`}
            >
              {cell.notes.has(note) ? note : ''}
            </span>
          ))}
        </div>
      )}
      
      {/* Symboly porovnania pre Comparison režim */}
      {mode === 'comparison' && horizontalComparison && (
        <span className="comparison-symbol right">{horizontalComparison}</span>
      )}
      {mode === 'comparison' && verticalComparison && (
        <span className="comparison-symbol bottom">{verticalComparison}</span>
      )}
    </div>
  );
};

export default SudokuCell;
