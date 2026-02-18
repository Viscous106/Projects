let cells = document.querySelectorAll('.cell');
let newGameBtn = document.querySelectorAll('#primary');
let currentPlayer = 'X';

cells.forEach((cell) => {
    cell.addEventListener('click', () => {
        if(currentPlayer === 'X') {
            cell.textContent = 'X';
            currentPlayer = 'O';
        } else {
            cell.textContent = 'O';
            currentPlayer = 'X';
        }
    });
});
newGameBtn.addEventListener('click', () => {
    cells.forEach((cell) => {
        cell.textContent = '' ;
        currentPlayer = 'X';
    });
});
