//0 - empty, 1 - ship, 2 - hit, 3 - miss, 4 - next to the ship.

/**
 * Ships in the game.
 */
let shipSizes = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]

/**
 * Returns a sum of the two given numbers.
 * @param {*} sum Sum of previous numbers.
 * @param {*} current Current number.
 * @returns Sum of numbers.
 */
let reducer = (sum, current) => sum + current

/**
 * Possible statuses of a sector.
 */
let statuses = ["empty", "ship", "hit", "miss", "next"]

/**
 * Node of the enemy's field.
 * Node of your field.
 */
let node_fields = {
    enemy: document.getElementById('fieldEnemy'),
    me: document.getElementById('fieldMe')
}

/**
 * Node of field blocker.
 */
let node_fieldBlocker = document.getElementById('fieldBlocker')

/**
 * Node of "New Game" button.
 */
let node_newGame = document.getElementById('newGame')

/**
 * Node of end-game popup.
 */
let node_endGame = document.getElementById('endGame')

/**
 * Node of end-game message title.
 */
let node_endGameTitle = document.getElementById('endGameTitle')


/**
 * Game mode. 0 - easy, 1 - hard.
 */
let mode = localStorage.getItem('mode') ? localStorage.getItem('mode') : 0

/**
 * Text names of the modes.
 */
let modes = ['easy', 'hard']

/**
 * Node of game-mode select.
 */
let node_mode = document.getElementById('mode')
node_mode.value = mode
node_mode.addEventListener('change', (event) => {
    mode = event.target.value
    localStorage.setItem('mode', mode)
    newGame()
})

/**
 * Enemy's sectors.
 * Your sectors.
 */
let fields = {
    enemy: {shipSectors: shipSizes.reduce(reducer)},
    me: {shipSectors: shipSizes.reduce(reducer)}
}

/**
 * Enemy's ships lost in current game.
 * Your ships lost in current game.
 */
let shipsLost = {
    enemy: {4:1, 3:2, 2:3, 1:4},
    me: {4:1, 3:2, 2:3, 1:4}
}

/**
 * My-move flag.
 */
let myMove

/**
 * Number of hits that enemy skips. Don't hit the ship if != 0.
 */
let skipHit

let getRandom = () => Math.floor(Math.random() * Math.floor(9))

/**
 * Last hit at the enemy.
 * Last hit at me.
 */
let lastHits = {
    enemy: null,
    me: null
}

/**
 * Timeout for end-game animation.
 */
let animation

/**
 * Starts a new game and redraws the fields.
 */
function newGame() {
    run0to100(refreshSector, 'me')
    run0to100(refreshSector, 'enemy')
    shipSizes.forEach(ship => {
        createShip(ship, 'me')
        createShip(ship, 'enemy')
    })
    fields.enemy.shipSectors = shipSizes.reduce(reducer)
    fields.me.shipSectors = shipSizes.reduce(reducer)
    shipsLost.enemy = {4:1, 3:2, 2:3, 1:4}
    shipsLost.me = {4:1, 3:2, 2:3, 1:4}
    lastHits.ememy = null
    lastHits.me = null

    myMove = true
    skipHit = mode == "1" ? 0 : 3
    clearTimeout(animation)

    /**
     * Enemy's sectors for event listeners.
     */
    let node_enemy_sectors = document.getElementsByClassName('field__sector-enemy')
    for (let i = 0; i < 100; i++) {
        node_enemy_sectors[i].addEventListener('click', event => shoot(event, 'enemy'))
    }

    node_endGame.classList.add('hidden')
    node_endGame.classList.remove('endGame-animation')

    
    console.log(`%cNew game is started. \nGame mode: ${modes[mode]}. \n${skipHit} enemy's hits will be skipped. \n`, `color: green;`)
}

/**
 * Runs the 10x10 matrix and calls a callback function for each sector.
 * 
 * @param {function} callback Callback for each sector.
 * @param {*} owner Field owner (me/enemy).
 */
function run0to100 (callback, owner) {
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) callback(j, i, owner)
}


/**
 * Clears the given sector.
 * 
 * @param {number} i Coordinate X.
 * @param {number} j Coordinate Y.
 * @param {string} owner Field owner (me/enemy).
 */
function refreshSector(i, j, owner) {
    if (document.getElementById(`${owner}-${i}-${j}`)) document.getElementById(`${owner}-${i}-${j}`).parentNode.removeChild(document.getElementById(`${owner}-${i}-${j}`))

    let field = fields[owner]
    let node = node_fields[owner]
    let newSector = document.createElement('div')
    newSector.classList.add('field__sector')
    newSector.classList.add(`field__sector-${owner}`)
    newSector.id = `${owner}-${i}-${j}`
    node.appendChild(newSector)
    field[i] = field[i] ? field[i] : {}
    field[i][j] = {}
    field[i][j].status = 0
    field[i][j].opened = 0
}

/**
 * Creates a ship of the given size on the given field.
 * 
 * @param {nubmer} size Ship's size.
 * @param {*} owner Field owner (me/enemy).
 */
function createShip(size, owner) {
    let field = fields[owner]
    let noClass = owner == 'enemy'
    
    let horizontal = Math.round(Math.random())
    let x = getRandom()
    let y = getRandom()

    // The first run through the possible ship. Recalls the function if the ship doesn't fit.
    for (let i = 0; i < size; i++) {
        let xi = horizontal ? x + i : x
        let yi = !horizontal ? y + i : y
        if (xi > 9 || yi > 9 || field[xi][yi].status) return createShip(size, owner)
    }
    
    // The second run through the possible ship. Marks all sectors.
    for (let i = 0; i < size; i++) {
        let xi = horizontal ? x + i : x
        let yi = !horizontal ? y + i : y
        markSector(xi, yi, owner, 1, false, noClass)
    }
    
    // Runs around the ship and marks sectors as 'next to the ship'.
    for (let i = -1; i <= size; i++) for (let j = -1; j <= 1; j++) {
        let xi = horizontal ? x + i : x + j
        let yi = horizontal ? y + j : y + i
        if (xi > 9 || yi > 9 || xi < 0 || yi < 0 || field[xi][yi].status) continue; 
        markSector(xi, yi, owner, 4, false, true)
    }
}

/**
 * Marks the given sector as the given type.
 * 
 * @param {number} x Coordinate X.
 * @param {number} y Coordinate Y.
 * @param {string} owner Field owner (me/enemy).
 * @param {number} status The given status.
 * @param {boolean} opened Mark as opened if true.
 * @param {boolean} noClass Do not add class if true.
 */
function markSector (x, y, owner, status, open, noClass) {
    let field = fields[owner]
    let sector = document.getElementById(`${owner}-${x}-${y}`)

    field[x][y].status = status
    field[x][y].opened = open

    if (open) sector.classList.remove('field__sector-enemy')

    sector.classList.remove('field__sector-miss')
    sector.classList.remove('field__sector-next')
    sector.classList.remove(`field__sector-ship-me`)
    sector.classList.remove(`field__sector-ship-enemy`)
    sector.classList.remove('field__sector-hit-me')
    sector.classList.remove('field__sector-hit-enemy')

    if (noClass) return

    let postfix = status == 1 || status == 2 ? `-${owner}` : ''

    sector.classList.add(`field__sector-${statuses[status]}${postfix}`)
}

/**
 * Hits the given sector.
 * @param {event} event Event of the click.
 * @param {string} owner Field owner (me/enemy).
 */
function shoot(event, owner) {
    let id = event.target.id
    let x = id.split('-')[1]
    let y = id.split('-')[2]
    let field = fields[owner]
    let sector = field[x][y]
    let color = owner == 'me' ? 'color: red;' : 'color: green;'

    console.log(`%cShot at ${owner}: ${x} ${y}`, color)


    if (sector.opened) return
    sector.opened = 1
    
    if (sector.status == 0 || sector.status == 4) {
        markSector(x, y, owner, 3, true, false)
        myMove = !myMove
        console.log(`%cMissed.\n`, color)

        if (myMove && lastHits['me']) checkDone(lastHits['me'].x, lastHits['me'].y, 'me', false)
        if (!myMove && lastHits['enemy']) checkDone(lastHits['enemy'].x, lastHits['enemy'].y, 'enemy', false)
        if (!myMove && lastHits['me']) return checkDone(lastHits['me'].x, lastHits['me'].y, 'me', true)
        if (!myMove) return shootRandom()
    }

    if (sector.status == 1) {
        if (!myMove && skipHit) {
            sector.opened = 0
            skipHit--
            console.log(`%cEnemy hits a ship but skips the move because it's the easy mode.\n`, color)
            return shootRandom()
        }
        markSector(x, y, owner, 2, true, false)
        lastHits[owner] = {x, y}
        console.log(`%cHit.\n`, color)


        if (--field.shipSectors == 0) return endGame(owner)
        if (myMove) return checkDone(x, y, owner, false)
        if (!myMove) return checkDone(x, y, owner, true)
    }
}

/**
 * Enemy hits at the given coordinated.
 * 
 * @param {number} x Coordinate X.
 * @param {number} y Coordinate Y.
 */
function enemyMove(x, y) {
    node_fieldBlocker.classList.remove('hidden')
    setTimeout(() => {
        node_fieldBlocker.classList.add('hidden')
        let event = {}
        event.target = document.getElementById(`me-${x}-${y}`)
        shoot(event, 'me')
    }, 500)
    
    
}

/**
 * Generates random coordinates for the next enemy hit.
 */
function shootRandom() {
    let field = fields.me
    let x = getRandom()
    let y = getRandom()
    if (field[x][y].opened) return shootRandom()
    enemyMove(x, y)
}

/**
 * Checks if the whole ship killed with the last hit.
 * 
 * @param {number} x Coordinate X.
 * @param {number} y Coordinate Y.
 * @param {string} owner Field owner (me/enemy).
 * @param {boolean} makeHit Makes next hit if true.
 * @returns {boolean} Is the whole ship killed.
 */
function checkDone(oldX, oldY, owner, makeHit) {
    let field = fields[owner]

    /**
     * Is the given sector unknown.
     */
    let isUnknown = (x, y) => field[x] && field[x][y] && !field[x][y].opened
    /**
     * Is the given sector a hit ship.
     */
    let isHit = (x, y) => field[x] && field[x][y] && field[x][y].status == 2
    /**
     * Is the given ship the biggest one lost.
     */
    let isBiggest = (size) => {
        if (size == 4) return true
        for (let i = size + 1; i <= 4; i++) {
            if (shipsLost[owner][i] > 0) return false
        }
        return true
    }

    /** 
     * Lenght of the hit part by now. 
     */
    let length = 1

    let horizontal = false
    let doneRight = false
    let doneLeft = false
    let vertical = false
    let doneUp = false
    let doneDown = false
    let isDone = false

    oldX = parseInt(oldX)
    oldY = parseInt(oldY)
    let newX = 11
    let newY = 11

    let makeDone = () => {
        isDone = true
        lastHits[owner] = null
        shipsLost[owner][length] = shipsLost[owner][length] - 1
        newX = 11
        newY = 11
        markDone(oldX, oldY, owner)
    }


    let goRight = (x, y) => {
        x++
        if (isHit(x, y)) {
            length++
            horizontal = true
            return goRight(x, y)
        } else {
            if (isUnknown(x, y)) {
                newX = x
                newY = y
            } else {
                doneRight = true
            }
            return goLeft(oldX, oldY)
        }
    }

    let goLeft = (x, y) => {
        x--
        if (isHit(x, y)) {
            length++
            horizontal = true
            return goLeft(x, y)
        } else {
            if (isUnknown(x, y)) {
                newX = x
                newY = y
            } else {
                doneLeft = true
            }
            if (!horizontal) return goUp(oldX, oldY)
        }
    }

    let goUp = (x, y) => {
        y--
        if (isHit(x, y)) {
            length++
            vertical = true
            return goUp(x, y)
        } else {
            if (isUnknown(x, y)) {
                newX = x
                newY = y
            } else {
                doneUp = true
            }
            return goDown(oldX, oldY)
        }
    }

    let goDown = (x, y) => {
        y++
        if (isHit(x, y)) {
            length++
            vertical = true
            return goDown(x, y)
        } else {
            if (isUnknown(x, y)) {
                newX = x
                newY = y
            } else {
                if (!isHit(x, y)) doneDown = true
            }
        }
    }

    goRight(oldX, oldY)

    if (isBiggest(length) || horizontal && doneRight && doneLeft || vertical && doneUp && doneDown || doneRight && doneLeft && doneUp && doneDown) {
        makeDone()
    }

    if (makeHit) {
        console.log('\nEnemy shoots')
        if (newX == 11) return shootRandom()
        enemyMove(newX, newY)
    }
    
}

/**
 * Marks the given ship as killed and outlines it.
 * 
 * @param {number} oldX Coordinate X.
 * @param {number} oldY Coordinate Y.
 * @param {boolean} owner Field owner (me/enemy).
 */
function markDone(oldX, oldY, owner) {
    let noClass = owner == 'me'
    console.log('The whole ship is done.\n')
    let field = fields[owner]
    oldX = parseInt(oldX)
    oldY = parseInt(oldY)
    let isHit = (x, y) => field[x] && field[x][y] && field[x][y].status == 2
    let isUnknown = (x, y) => field[x] && field[x][y] && !field[x][y].opened

    let getAround = (x, y) => {
        for (let i = x - 1; i <= x + 1; i++) for (let j = y - 1; j <= y + 1; j++) if (isUnknown(i, j)) markSector(i, j, owner, 4, true, noClass)
    }

    let goRight = (x, y) => {
        x++
        if (isHit(x, y)) {
            getAround(x, y)
            goRight(x, y)
        } else {
            goLeft(oldX, oldY)
        }
    }

    let goLeft = (x, y) => {
        x--
        if (isHit(x, y)) {
            getAround(x, y)
            goLeft(x, y)
        } else {
            goUp(oldX, oldY)
        }
    }

    let goUp = (x, y) => {
        y--
        if (isHit(x, y)) {
            getAround(x, y)
            goUp(x, y)
        } else {
            goDown(oldX, oldY)
        }
    }

    let goDown = (x, y) => {
        y++
        if (isHit(x, y)) {
            getAround(x, y)
            goDown(x, y)
        }
    }

    getAround(oldX, oldY)
    goRight(oldX, oldY)
}

/**
 * Ends game, the winner is NOT the Field owner.
 * @param {string} owner Field owner (me/enemy) of the last killed ship.
 */
function endGame(owner) {
    let color = owner == 'me' ? 'color: red;' : 'color: green;'

    if (owner == 'me') {
        console.log('%c\nYou lost..\n', color)
        node_endGameTitle.innerText = 'You lost..'
    } else {
        console.log('%c\nYou won!\n', color)
        node_endGameTitle.innerText = 'You won!'
    }
    openField(0, 0)
    node_endGame.classList.remove('hidden')
    node_endGame.classList.add('endGame-animation')
}



/**
 * Opens the enemy's field.

 * @param {number} oldX Coordinate X.
 * @param {number} oldY Coordinate Y.
 */
function openField(x, y) {
    if (y > 9) {
        x++
        y = 0
    }
    if (x > 9) return
    let field = fields['enemy']
    let sector = field[y][x]
    let node_sector = document.getElementById(`enemy-${y}-${x}`)

    animation = setTimeout(() => {
        if (sector.status == 1) node_sector.classList.add('field__sector-ship-enemy')
        node_sector.classList.remove('field__sector-enemy')

        y++
        openField(x, y)
    }, 10)

}

node_newGame.addEventListener('click', () => {
    newGame()
})

window.oncontextmenu = () => {
    return false
}

newGame()
