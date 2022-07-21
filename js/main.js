var gBoard
var gLevel = { // level settings
    SIZE: 4,
    MINES: 2
}
var gGame // game settings



// ELEMENTS
const MINE = '<img src="img/mine.png" />'
const HEART1 = document.querySelector(`.health1`)
const HEART2 = document.querySelector(`.health2`)
const HEART3 = document.querySelector(`.health3`)
const SMILEY = document.querySelector('.smiling-face')
const LOST_SMILEY = document.querySelector('.lost-smiley')
const WIN_SMILEY = document.querySelector('.win-smiley')
const HINT1 = document.querySelector(`.hint1`)
const HINT2 = document.querySelector(`.hint2`)
const HINT3 = document.querySelector(`.hint3`)
const losingTitle = document.querySelector('.losing-title')
const winningTitle = document.querySelector('.winning-title')
const elContainer = document.querySelector('.game-container')
const safeButton = document.querySelector('.safe-button')


var gFlags // array of flags objects
var gMines = [] // array of mines objects
var gClicks // how many clicks the user did (not including the mines)
var gStartTime // the time before the timer started
var gTimePassed // the interval id
var gTimeText = document.querySelector('.timer') // element of timer
var gFirstClick // object with location for the first click
var gLives // the count of lives of the player
var gMinesPressed // how many mines were pressed
var gIsClick = true // true if the player can click on cell
var gSafeButtonClicks // how many times the safe button clicked left
var gSafeCells // array of safe cells
var gIsCreative // true if creative mode activated
var gCreativeClicks // how many clicks the user did on creative mode
var gUndoList // array of the moves of the player
var isSeven // true if the seven boom mode activated
var gExpansionUndo
var gIsFirstClick



function init() {
    gExpansionUndo = []
    isSeven = false
    gUndoList = []
    gCreativeClicks = 0
    gIsCreative = false
    gSafeCells = []
    gSafeButtonClicks = 3
    document.querySelector('.clicks-left').innerText = `${gSafeButtonClicks} clicks available`
    gMinesPressed = 0
    gLives = 3
    clearInterval(gTimePassed)
    gTimeText.innerText = 0
    gFirstClick = {}
    gClicks = 0
    gFlags = []
    gMines = []

    losingTitle.style.display = 'none'
    winningTitle.style.display = 'none'
    elContainer.style.backgroundColor = 'black'
    gGame = {
        isOn: false,
        markedCount: 0,
        isHint: false,
        hints: 3


    }
    restoreHp()
    restoreSmiley()
    restoreHints()

    gBoard = buildBoard()
    renderBoard(gBoard)




}

// build the mat on modal
function buildBoard() {
    var board = createMat(gLevel.SIZE, gLevel.SIZE)
    return board

}
//rendering the board 
function renderBoard(board) {
    var elBoard = document.querySelector('.board')

    printMat(board, elBoard)
}




// sets the timer before starting it
function setTimer() {
    gStartTime = Date.now()
    gTimePassed = setInterval(startTimer, 1)
}
// starts the timer
function startTimer() {
    var currTime = Date.now() - gStartTime
    var milSec = currTime % 1000
    var sec = parseInt(currTime / 1000)
    gTimeText.innerText = `${sec}:${milSec}`



}


// render the right heart count on init
function restoreHp(isUndo = false) {
    if (isUndo) {
        if (HEART2.style.display === 'none') {
            HEART2.style.display = 'inline'
        }
        else if (HEART3.style.display === 'none' && gLevel.SIZE !== 4) {
            HEART3.style.display = 'inline'

        }
    }
    else {
        if (gLevel.MINES === 2) {

            HEART2.style.display = 'inline'
            HEART1.style.display = 'inline'
            HEART3.style.display = 'none'
            gLives = 2
        }
        else {
            HEART3.style.display = 'inline'
            HEART2.style.display = 'inline'
            HEART1.style.display = 'inline'
        }
    }
}


//render the smiley on init
function restoreSmiley() {
    SMILEY.style.display = 'inline'
    LOST_SMILEY.style.display = 'none'
    WIN_SMILEY.style.display = 'none'
}


// render the hints on init
function restoreHints() {
    if (gLevel.MINES === 2) {
        HINT1.style.display = 'inline'
        HINT2.style.display = 'inline'
        HINT3.style.display = 'none'
        gGame.hints = 2
    }
    else {
        HINT1.style.display = 'inline'
        HINT2.style.display = 'inline'
        HINT3.style.display = 'inline'
        gGame.hints = 3
    }
}




// update the modal with the cells with mines
function placeMines() {
    var sevenBoomCounter = 0
    var emptyCells = getEmptyCell(gBoard)
    if (isSeven) {


        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard[0].length; j++) {
                if (sevenBoomCounter % 7 === 0 && sevenBoomCounter !== 0) {
                    gBoard[i][j].element = MINE
                    sevenBoomCounter++
                    gMines.push({ i, j })


                }
                else {
                    sevenBoomCounter++
                }

            }

        }

    }
    else {

        for (var i = 0; i < gLevel.MINES; i++) {

            var randIdx = getRandomInt(0, emptyCells.length)
            var cell = emptyCells[randIdx]

            // prevent mine on the first click
            if (cell.i === gFirstClick.i && cell.j === gFirstClick.j) {
                emptyCells.splice(randIdx, 1)
                randIdx = getRandomInt(0, emptyCells.length)
                cell = emptyCells[randIdx]


            }
            gBoard[cell.i][cell.j].element = MINE
            emptyCells.splice(randIdx, 1)
            gMines.push(cell)



        }
    }



}


// update the modal with the cells with neighbors
function placeNeighbors() {
    var emptyCells = getEmptyCell(gBoard)

    for (var i = 0; i < emptyCells.length; i++) {
        var cell = emptyCells[i]
        var neighbours = countNeighbors(cell, gBoard)
        var mineCount = 0
        for (var j = 0; j < neighbours.length; j++) {
            if (neighbours[j].element === MINE) {
                mineCount++
            }
            cell.mineNeighborsCount = mineCount
            if (mineCount > 0)
                gBoard[cell.i][cell.j].element = `<img  src="img/${mineCount}.png"/>`
            else
                gBoard[cell.i][cell.j].element = ''

        }

    }



}



// cell clicked function
function cellClicked(elCell, i, j, ev) {
    if (!gIsClick) return
    if (gBoard[i][j].cellPressed) return

    // creative mode mines planting
    if (gIsCreative) {
        if (gCreativeClicks < gLevel.MINES) {
            if (gBoard[i][j].element === MINE) {

                return
            }
            gCreativeClicks++
            gBoard[i][j].element = MINE
            gMines.push({ i, j })
            elCell.classList.add('plant')
            setTimeout(() => {
                elCell.classList.remove('plant')
            }, 1500);

            return
        }
        else {

            gIsCreative = false
            gGame.isOn = true
            gFirstClick = { i, j }
            placeNeighbors()
            setTimer()
            gClicks++
        }
    }
    else {
        gClicks++
        if (gClicks === 1) {
            gFirstClick = { i, j }
            if (gCreativeClicks === 0 && !isSeven) { placeMines() }
            placeNeighbors()
            gGame.isOn = true
            setTimer()

        }

    }





    if (!gGame.isOn) return
    if (gGame.isHint) {
        document.querySelector(`.hint${gGame.hints}`).style.display = 'none'
        gGame.hints--

        hintCheck(i, j)
        elContainer.style.backgroundColor = 'black'

        return
    }
    //right click

    if (ev.which === 3) {
        // prevent adding flag on a pressed cell
        if (gBoard[i][j].cellPressed) return
        // toggle the flag off
        if (gBoard[i][j].isFlag) {
            renderCell(i, j, '<img hidden src="img/flag.png" />')
            gBoard[i][j].isFlag = false
            removeFlag(i, j)

        }

        // toggle the flag on
        else {
            renderCell(i, j, '<img  src="img/flag.png" />')
            gBoard[i][j].isFlag = true
            gFlags.push({ i, j })
            checkGameOver()

        }

    }

    else if (ev.which === 1 && !gBoard[i][j].isFlag) {
        // check if its a safe cell with neighbors
        if (gBoard[i][j].mineNeighborsCount > 0) {

            renderCell(i, j, `<img  src="img/${gBoard[i][j].mineNeighborsCount}.png"/>`)
            gBoard[i][j].cellPressed = true
            gGame.markedCount++
            checkGameOver()
            gBoard[i][j].cellPressed = true

            gUndoList.push({ i, j })


        }
        // check if the cell is a mine
        else if (gBoard[i][j].element === MINE) {


            renderCell(i, j, MINE)
            gBoard[i][j].cellPressed = true
            lostGame()
            gBoard[i][j].cellPressed = true
            checkGameOver()
            gUndoList.push({ i, j })
        }
        // check if the cell is empty and safe
        else {

            elCell.classList.add('pressed')
            gBoard[i][j].cellPressed = true
            
            gGame.markedCount++
            expandShown(i, j)
            var k = i
            var n = j
            gExpansionUndo.push({k,n})
            console.log(gExpansionUndo);
            gUndoList.push(gExpansionUndo)
            console.log(gUndoList);
            checkGameOver()

        }
    }
}

function expandShown(i, j) {

    if (gBoard[i][j].element !== '') return
    for (var k = i - 1; k <= i + 1; k++) {
        if (k < 0 || k >= gBoard.length) continue
        for (var n = j - 1; n <= j + 1; n++) {
            if (n < 0 || n >= gBoard[0].length) continue
            if (k === i && n === j) continue
            if (gBoard[k][n].element !== MINE && !gBoard[k][n].cellPressed && !gBoard[k][n].isFlag) {
                renderCell(k, n, gBoard[k][n].element)
                gBoard[k][n].cellPressed = true
                gGame.markedCount++

                // console.log(k,n);
                if (!gBoard[k][n].element) {
                    var elCell = document.querySelector(`.cell-${k}-${n}`)
                    elCell.classList.add('pressed')
                }
                gExpansionUndo.push({ k, n })
                expandShown(k, n)



            }

        }

    }


}




// confirm the player won
function checkGameOver() {


    var flagCount = 0
    for (var i = 0; i < gMines.length; i++) {
        for (var k = 0; k < gFlags.length; k++) {
            if (gMines[i].i === gFlags[k].i && gMines[i].j === gFlags[k].j)
                flagCount++




        }
    }
    if (flagCount === gLevel.MINES - gMinesPressed && gGame.markedCount === (gLevel.SIZE ** 2) - gLevel.MINES) winGame()
}

// function thats called when the player lost

function lostGame() {
    if (gLives !== 1) {
        gMinesPressed++

        var health = document.querySelector(`.health${gLives}`)
        health.style.display = 'none'
        gLives--
    }
    else {
        var health = document.querySelector(`.health${gLives}`)
        health.style.display = 'none'
        clearInterval(gTimePassed)
        gGame.isOn = false
        losingTitle.style.display = 'block'

        document.querySelector('.lost-smiley').style.display = 'inline'
        document.querySelector('.smiling-face').style.display = 'none'
        for (var i = 0; i < gMines.length; i++) {
            renderCell(gMines[i].i, gMines[i].j, MINE)

        }
    }
}
// function thats called when the player win
function winGame() {
    clearInterval(gTimePassed)
    gGame.isOn = false
    winningTitle.style.display = 'block'
    document.querySelector('.win-smiley').style.display = 'inline'
    document.querySelector('.smiling-face').style.display = 'none'
    localStorage.setItem('Score', gTimeText.innerText)

    document.querySelector('.score-board').innerHTML += `<tr><td>${localStorage.getItem('Score')}</td></tr>`
}


// take the flags that toggled off out of the array gFlags
function removeFlag(i, j) {
    for (var k = 0; k < gFlags.length; k++) {
        if (gFlags[k].i === i && gFlags[k].j === j)
            gFlags.splice(k, 1)


    }
}



// handle the click on the image of the hint
function hintClick() {
    if (gGame.isHint) {
        elContainer.style.backgroundColor = 'black'
        gGame.isHint = false
        return
    }
    gGame.isHint = true
    elContainer.style.backgroundColor = 'yellow'



}



// let the user choose the cell of the hint
function hintCheck(i, j) {
    gIsClick = false
    var neighbors = []
    for (var k = i - 1; k <= i + 1; k++) {
        if (k < 0 || k >= gBoard.length) continue
        for (var n = j - 1; n <= j + 1; n++) {
            if (n < 0 || n >= gBoard[0].length) continue
            if (i === k && j === n) {
                continue
            }
            neighbors.push(gBoard[k][n])

        }
    }
    for (var i = 0; i < neighbors.length; i++) {


        renderCell(neighbors[i].i, neighbors[i].j, neighbors[i].element)

    }
    setTimeout(() => {
        for (var i = 0; i < neighbors.length; i++) {
            if (!neighbors[i].cellPressed) {
                renderCell(neighbors[i].i, neighbors[i].j, '')
            }
            gGame.isHint = false
            gIsClick = true

        }

    }, 1000)



}


// changes the difficulty 
function changeDifficulty(elButton) {
    switch (elButton.innerText) {
        case 'Easy':
            gLevel.SIZE = 4
            gLevel.MINES = 2
            init()

            break
        case 'Medium':
            gLevel.SIZE = 8
            gLevel.MINES = 12
            init()

            break
        case 'Hard':
            gLevel.SIZE = 12
            gLevel.MINES = 30
            init()

            break

    }

}


//safe button click handle
function safeButtonClick(button) {
    debugger
    if (!gGame.isOn) return
    if (gSafeButtonClicks === 0) return
    if (gMinesPressed === 1 || gMinesPressed === 0) {
        if (gLevel.SIZE ** 2 - gGame.markedCount - gMinesPressed === 1 || gLevel.SIZE ** 2 - gGame.markedCount - gMinesPressed === 2)
        {    var warning = document.querySelector('.warning-safe-clicks')
        warning.style.display = 'block'
        return}
    }
    var emptyCells = getEmptyCell(gBoard)
    var randIdx = getRandomInt(0, emptyCells.length)
    while (emptyCells[randIdx].element === MINE || emptyCells[randIdx].cellPressed) {

        var emptyCells = getEmptyCell(gBoard)
        var randIdx = getRandomInt(0, emptyCells.length)
    }
    gSafeCells.push(emptyCells[randIdx])
    var elCell = document.querySelector(`.cell-${emptyCells[randIdx].i}-${emptyCells[randIdx].j}`)

    elCell.classList.add('safe')
    setTimeout(() => elCell.classList.remove('safe'), 1500)

    gSafeButtonClicks--
    document.querySelector('.clicks-left').innerText = `${gSafeButtonClicks} clicks available`
    if (gSafeButtonClicks === 0) {
        document.querySelector('.safe-button').style.backgroundColor = 'grey'
    }

}

// activating creative mode
function creativeMode() {
    if (gGame.isOn) return
    gIsCreative = true


}


// prevent context menu to pop up
document, addEventListener('contextmenu', (event) => {
    event.preventDefault()


})

// undo
function undoAction() {
    if(gUndoList.length === 0 ) return
    if (Array.isArray(gUndoList[gUndoList.length - 1])) {
        console.log('object');
        
        var undoItems = gUndoList[gUndoList.length - 1]
       
        for (var i = 0; i < undoItems.length; i++) {
            if (gBoard[undoItems[i].k][undoItems[i].n].element === '') {
                var elCell = document.querySelector(`.cell-${undoItems[i].k}-${undoItems[i].n}`)

                elCell.classList.remove('pressed')
                gBoard[undoItems[i].k][undoItems[i].n].cellPressed = false
            }

            renderCell(undoItems[i].k, undoItems[i].n, '')

            gBoard[undoItems[i].k][undoItems[i].n].cellPressed = false
            gExpansionUndo = []



        }
    gUndoList.splice(gUndoList.length - 1 , 1)
    
}
    else {
        console.log('cell');
        var cell = gUndoList.pop()
       

        if (gBoard[cell.i][cell.j].element === '') {
            var elCell = document.querySelector(`.cell-${cell.i}-${cell.j}`)

            elCell.classList.remove('pressed')
            gBoard[cell.i][cell.j].cellPressed = false
            gGame.markedCount--


        }
        else {
            if(gBoard[cell.i][cell.j].element === MINE){
                gMinesPressed--
                gLives++
                restoreHp()
            }
            gBoard[cell.i][cell.j].cellPressed = false

            renderCell(cell.i, cell.j, '')
            gGame.markedCount--
            

        }
    }

    console.log(gUndoList);




}

// activates the seven boom mode
function sevenBoom() {
    if (gGame.isOn) return
    isSeven = true
    placeMines()
    placeNeighbors()
    gGame.isOn = true
    setTimer()

}





