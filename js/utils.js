function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}



function createMat(ROWS, COLS) {
    var board = []
    for (var i = 0; i < ROWS; i++) {
        board[i] = []
        for (var j = 0; j < COLS; j++) {
            board[i][j] = createCell(i, j)

        }

    }
    return board

}


function printMat(board, elBoard) {
    strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[0].length; j++) {
            strHTML += `<td oncontextmenu="cellClicked(this,${i},${j},event)" data-i="${i}" data-j="${j}"  class=${getClassName({ i, j })} onclick="cellClicked(this,${i},${j},event)"></td>`



        }
        strHTML += '</tr>'

    }
    elBoard.innerHTML = strHTML

}
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}




function createCell(rowIdx, colIdx, inCell = '') {
    return {
        i: rowIdx,
        j: colIdx,
        element: inCell,
        mineNeighborsCount: 0,
        isFlag: false,
        cellPressed: false

    }


}



function renderCell(i, j, value = '') {



    var elCell = document.querySelector(`.cell-${i}-${j}`)

    elCell.innerHTML = value


}



function countNeighbors(cell, board) {
    var neighbours = []
    var rowIdx = cell.i
    var colIdx = cell.j
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (rowIdx === i && colIdx === j) {

                continue
            }
            if (board[i][j]) {
                neighbours.push(board[i][j])

            }

        }

    }
    return neighbours
}



function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}






function getEmptyCell(board) {
    var emptyCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].element || board[i][j].mineNeighborsCount > 0) {
                emptyCells.push(board[i][j])

            }

        }

    }
    return emptyCells



}



function getTime() {
    return new Date().toString().split(' ')[4];
}


function copyMat(mat) {
    var newMat = [];
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = mat[i][j];
        }
    }
    return newMat;
}

