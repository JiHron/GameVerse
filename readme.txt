ADRESÁŘOVÁ STRUKTURA A AUTORSTVÍ:
Natália Holbíková <xholbin00> - sudoku.utils.ts, sudoku.types.ts, Sudoku.css, sudokuApi.ts, useSudoku.ts, Sudoku.tsx, SudokuBoard.tsx, SudokuCell.tsx
Jiří Hronský <xhronsj00> - App.css, App.tsx, Wordle.tsx, Wordle.css, main.py
Ivan Savin <xsavini00> - Chess.css, Chess.tsx, ChessGame.tsx, ChessSidebar.css, ChessSidebar.tsx

/root
| - readme.txt
| - package-lock.json
| - start.sh				<-- Start script
|
| /backend				<-- Serverová část
|	|- main.py
|	|-- package-lock.json
|
|
| -- /frontend				<-- Klientská část
	| - package.json
	| - vite.config.ts
	| - tsconfig.node.json
	| - tsconfig.json
	| - tsconfig.app.json
	| - README.md
	| - package-lock.json
	| - index.html
	| - eslint.config.js
	|
	| /public
	|	|-- vite.svg
	|
	|-- /src			<-- Hlavní zdrojové kódy Frontendu
		| - App.css
		| - App.tsx
		| - Chess.css
		| - Chess.tsx
		| - index.css
		| - main.tsx
		| - Wordle.css
		| - Wordle.tsx
		|
		| /utils
		|	|-- sudoku.utils.ts
		|
		| /types
		|	|-- sudoku.types.ts
		|
		| /styles
		|	|-- Sudoku.css
		|
		| /services
		|	|-- sudokuApi.ts
		|
		| /hooks
		|	|-- useSudoku.ts
		|
		| /assets
		|	|- chess.png
		|	|- react.svg
		|	|- sudoku.png
		|	|-- wordle.png
		|
		|-- /components
			|
			| /chess
			|	| - ChessGame.tsx
			|	| - ChessSidebar.css
			|	| -- ChessSidebar.tsx
			|
			|-- /Sudoku
				| - Sudoku.tsx
				| - SudokuBoard.tsx
				| -- SudokuCell.tsx	