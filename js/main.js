//0 - empty, 1 - ship, 2 - hit, 3 - miss, 4 - next to the ship.


// *****===== START OF NODES =====*****
/** All needed nodes. */
let nodes = {
    /**
     * Nodes of the fields.
     * @property {Element} field.enemy The enemy's field.
     * @property {Element} field.me My field.
     */
    fields: {
        /** The enemy's field. */
        enemy: document.getElementById('fieldEnemy'),
        /** My field. */
        me: document.getElementById('fieldMe')
    },

    /**
     * Nodes of the ships containers.
     * @property {Element} shipsLists.enemy The enemy's ships container.
     * @property {Element} shipsLists.me My ships container.
     */
    shipsLists: {
        /** The enemy's ships container. */
        enemy: document.getElementById('shipsEnemy'),
        /** My ships container. */
        me: document.getElementById('shipsMe')
    },

    /**
     * Collection of listed ships.
     */
    listedShips: {
        /** The enemy's listed ships. */
        enemy: document.getElementsByClassName('ship-enemy'),
        /** My listed ships */
        me: document.getElementsByClassName('ship-me')
    },

    /** Node of the listed ships block. Blocked when game started. */
    listedShipsBlock: document.getElementById('shipsBlock'),

    /** Node of the enemy's field blocker. Blocked while your ships not placed yet. */
    fieldBlocker: document.getElementById('fieldBlocker'),
    
    /** Node of the enemy's field blocker with animation. Blocked while enemy making a move. */
    animation: document.getElementById('animation'),

    /** Node of the "New Game" button. */
    newGame: document.getElementById('newGame'),

    /** Node of the end-game blocker. */
    endGame: document.getElementById('endGame'),

    /** Node of the end-game message title. */
    endGameTitle: document.getElementById('endGameTitle'), 
    
    /** Node of the rotation tip. */
    tip: document.getElementById('tip'),

    /** Node of the 'finish placing' button. */
    finish: document.getElementById('finish'),
    
    /** Node of the game-mode select. */
    mode: document.getElementById('mode'),
   
    /** Node of layout select. */
    layout: document.getElementById('layout')
}

// *****===== END OF NODES =====*****

// *****=====*****

// *****===== START OF VARIABLES =====*****

/**
 * Fields in the game with all sectors info.
 * @property {number} enemy Number of the enemy's sectors
 */
 let fields = {
    enemy: {shipSectors: 20},
    me: {shipSectors: 20}
}

/**
 * Ships lost during the game.
 * @property {object} enemy The enemy's ships lost during the game.
 * @property {object} me My ships lost during the game.
 */
let shipsLost = {
    /** The enemy's ships lost during the game. */
    enemy: {4:1, 3:2, 2:3, 1:4},
    /** My ships lost during the game. */
    me: {4:1, 3:2, 2:3, 1:4}
}

/** Ships in the game.  */
let shipSizes = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]

/** Possible statuses of a sector. */
let statuses = ["empty", "ship", "hit", "miss", "next"]

/** Game mode. 0 - easy, 1 - hard. */
let mode = localStorage.getItem('mode') ? localStorage.getItem('mode') : 0

/** Text names of the modes. */
let modes = ['easy', 'hard']

/** Layout mode. 0 - manual, 1 - auto. */
let layout = localStorage.getItem('layout') ? localStorage.getItem('layout') : 0

/** Text names of the modes. */
let layouts = ['manual', 'auto']


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
 * Are all ships placed on the field.
 */
let isAllShips

/**
 * Is the drag'n'drop ship vertical.
 */
let isVertical

/**
 * Was the drag'n'drop ship vertical.
 */
let wasVertical

/**
 * The size of the gragged ship.
 */
let shipSize

/**
 * True if it's a good place for the ship.
 */
let isDragOk

/**
 * The sector where the manually placed ship starts.
 */
let shipStart

// *****===== END OF VARIABLES =====*****

// *****=====*****

// *****===== START OF EVENT LISTENERS =====*****

nodes.newGame.addEventListener('click', () => newGame())

nodes.fieldBlocker.addEventListener('click', () => {
    let node = document.getElementsByClassName('field-container')[1]
    node.classList.add('field_animated')
    nodes.shipsLists.me.classList.add('field_animated')
    setTimeout(() => {
        node.classList.remove('field_animated')
        nodes.shipsLists.me.classList.remove('field_animated')
    }, 500)
})

nodes.finish.addEventListener('click', event => finishPlacing(event))

nodes.mode.addEventListener('change', event => {
    mode = event.target.value
    localStorage.setItem('mode', mode)
    newGame()
})

nodes.layout.addEventListener('change', (event) => {
    layout = event.target.value
    localStorage.setItem('layout', layout)
    newGame()
})

// *****===== END OF EVENT LISTENERS =====*****

// *****=====*****




/**
 * Starts a new game and redraws the fields.
 */
function newGame() {
    run0to100(refreshSector, 'me')
    run0to100(refreshSector, 'enemy')

    
    if (layout == '0') {
        show(nodes.fieldBlocker)
        show(nodes.finish)
        hide(nodes.listedShipsBlock)
        nodes.finish.classList.add('greyed-out')
    } else {
        hide(nodes.fieldBlocker)
        hide(nodes.finish)
        show(nodes.listedShipsBlock)
    }
    

    nodes.shipsLists.me.innerHTML = ""
    nodes.shipsLists.enemy.innerHTML = ""
    nodes.layout.value = layout
    nodes.mode.value = mode


    shipSizes.forEach(ship => {
        if (layout == '1') createShip(ship, 'me')
        drawShip(ship, 'me')
        createShip(ship, 'enemy')
        drawShip(ship, 'enemy')
    })
    fields.enemy.shipSectors = 20
    fields.me.shipSectors = 20
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
        node_enemy_sectors[i].addEventListener('click', event => shoot(event.target, 'enemy'))
    }

    hide(nodes.endGameTitle)
    hide(nodes.endGame)
    nodes.endGame.classList.remove('endGame-animation')

    
    console.log(`%cNew game is started.\nGame mode: ${modes[mode]}.\n${skipHit} enemy's hits will be skipped.\nChosen layout: ${layouts[layout]}\n`, `color: green;`)
}


/**
 * Clears the given sector.
 * 
 * @param {number} i Coordinate X.
 * @param {number} j Coordinate Y.
 * @param {string} owner Field owner (me/enemy).
 */
function refreshSector(i, j, owner) {
    if (fields[owner][i] && fields[owner][i][j]) nodes.fields[owner].removeChild(fields[owner][i][j])

    let field = fields[owner]
    let node = nodes.fields[owner]
    let newSector = document.createElement('div')
    newSector.classList.add('field__sector')
    newSector.classList.add(`field__sector-${owner}`)
    newSector.id = `${owner}-${i}-${j}`
    node.appendChild(newSector)

    newSector.x = i
    newSector.y = j
    newSector.status = 0
    newSector.opened = 0
    field[i] = field[i] ? field[i] : {}
    field[i][j] = newSector
    //TODO: An object with CSS classes.

    if (owner == 'me') newSector.addEventListener('dragenter', event => handleDragEnter(event))
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
    let sector = field[x][y]

    sector.status = status
    sector.opened = open

    if (open) sector.classList.remove('field__sector-enemy')

    sector.classList.remove('field__sector-miss')
    sector.classList.remove('field__sector-next')
    sector.classList.remove(`field__sector-ship-me`)
    sector.classList.remove(`field__sector-ship-enemy`)
    sector.classList.remove('field__sector-hit-me')
    sector.classList.remove('field__sector-hit-enemy')

    if (layout == '0' && owner == 'me' && status == 1) {
        sector.draggable = true
        sector.addEventListener('dragstart', event => handleDragStart(event, false))
        sector.addEventListener('dragend', event => handleDragEnd(event, false))
    }

    if (noClass) return

    let postfix = status == 1 || status == 2 ? `-${owner}` : ''

    sector.classList.add(`field__sector-${statuses[status]}${postfix}`)
}

/**
 * Hits the given sector.
 * @param {Element} sector Sector of the click.
 * @param {string} owner Field owner (me/enemy).
 */
function shoot(sector, owner) {
    let x = sector.x
    let y = sector.y
    let field = fields[owner]
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


        if (--field.shipSectors == 0) endGame(owner)
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
    show(nodes.animation)
    setTimeout(() => {
        hide(nodes.animation)
        let sector = fields.me[x][y]
        shoot(sector, 'me')
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
        let shipNodes = document.getElementsByClassName(`ship-${owner}-${length}`)
        let marked = false
        for (let i = 0; i <= 3; i++) {
            if (marked || shipNodes[i].classList.contains(`ship-stroke`)) continue
            shipNodes[i].classList.add(`ship-stroke`)
            marked = true
        }
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
        nodes.endGameTitle.innerText = 'You lost..'
    } else {
        console.log('%c\nYou won!\n', color)
        nodes.endGameTitle.innerText = 'You won!'
    }
    openField(0, 0)
    show(nodes.endGameTitle)
    show(nodes.endGame)
    nodes.endGame.classList.add('endGame-animation')
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

    animation = setTimeout(() => {
        if (sector.status == 1) sector.classList.add('field__sector-ship-enemy')
        sector.classList.remove('field__sector-enemy')

        y++
        openField(x, y)
    }, 10)

}

/**
 * Draws a hypothetical ship under the field.
 * @param {number} size The size of the ship.
 * @param {string} owner Owner (me/enemy) of the ships.
 */
function drawShip(size, owner) {
    let container = nodes.shipsLists[owner]
    let newShip = document.createElement('div')
    newShip.classList.add('ship')
    newShip.classList.add(`ship-${owner}`)
    newShip.classList.add(`ship-${owner}-${size}`)

    container.appendChild(newShip)
    newShip.size = size

    for (let i = 0; i < size; i++) {
        let newSector = document.createElement('div')
        newSector.classList.add('ship__sector')
        newSector.classList.add(`ship__sector-${owner}`)

        newShip.appendChild(newSector)
    }

    if (owner == 'me') {
        newShip.draggable = true
        newShip.classList.add(`ship-draggable`)
        newShip.imageHorizontal = new Image()
        newShip.imageHorizontal.src = (`./images/ship-horizontal-${size}.png`)
        newShip.imageVertical = new Image()
        newShip.imageVertical.src = (`./images/ship-vertical-${size}.png`)
        newShip.addEventListener('dragstart', event => handleDragStart(event, true))
        newShip.addEventListener('dragend', event => handleDragEnd(event, true))
    }
}

/**
 * Handles the drag start of the ship.
 * @param {Event} event The event of drag start.
 * @param {boolean} isNew True if the ship is new. False if it's from the field.
 */
function handleDragStart(event, isNew) {
    isDragOk = false
    show(nodes.tip)
    let image
    if (isNew) {
        image = event.ctrlKey || event.altKey ? event.target.imageVertical : event.target.imageHorizontal
        isVertical = event.ctrlKey || event.altKey ? true : false
        event.target.classList.add('ship-moved')
        shipSize = event.target.size
    } else {
        getShip(event.target)
        isVertical = event.ctrlKey || event.altKey ? !wasVertical : wasVertical
        image = new Image()
        image.src = isVertical ? `./images/ship-vertical-${shipSize}.png` : `./images/ship-horizontal-${shipSize}.png` 
    }
    event.dataTransfer.setDragImage(image, 0, 0)
}

/**
 * Handles the drag end of the ship.
 * @param {Event} event The event of the drag end.
 * @param {boolean} isNew True if the ship is new. False if it's from the field.
 */
function handleDragEnd(event, isNew) {
    if (isDragOk) {
        if (isNew) {
            event.target.draggable = false
            event.target.classList.remove('ship-draggable')
        }
        placeShip(shipStart)
    } else {
        if (isNew) {
            event.target.classList.remove('ship-moved')
        } else {
            isVertical = wasVertical
            placeShip(shipStart)
        }
    }
    hide(nodes.tip)
    checkAllShips()
    
    run0to100(clearDragOverStyle)
}

/**
 * Handles the drag over a field sectopr.
 * @param {Event} event The event of the drag over.
 */
function handleDragEnter(event) {
    event.preventDefault()
    run0to100(clearDragOverStyle)
    isDragOk = checkDragOk(event.target)
    showGhostShip(event.target)
}

/**
 * 
 * @param {Element} sector 
 */
function clearDragOverStyle(x, y) {
    let sector = fields.me[x][y]
    sector.classList.remove('field__sector-dragover-ok')
    sector.classList.remove('field__sector-dragover-bad')
}

/**
 * Cheks if the current place is ok for the ship.
 * @param {Element} sector Node of the current drag-over sector.
 */
function checkDragOk(sector) {
    let x = sector.x
    let y = sector.y
    let field = fields.me
    for (let i = 0; i < shipSize; i++) {
        let nextX = isVertical ? x : x + i
        let nextY = isVertical ? y + i : y
        if (!field[nextX]) return false
        // Runs around the ship and marks sectors as 'next to the ship'.
        for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
            if (field[nextX + i] && field[nextX + i][nextY + j]) {
                let sector = field[nextX + i][nextY + j]
                if (!(sector.status == '0' || sector.status == '4')) return false
            }
        }
        
    }

    shipStart = sector
    return true
}

/**
 * Shows the hypothetical ship on the field.
 * @param {Element} sector Node of the current drag-over sector.
 */
function showGhostShip(sector) {
    let x = sector.x
    let y = sector.y
    let type = isDragOk ? 'ok' : 'bad'
    for (let i = 0; i < shipSize; i++) {
        let nextX = isVertical ? x : x + i
        let nextY = isVertical ? y + i : y
        let nextSector = fields.me[nextX][nextY]
        if (fields.me[nextX] && nextSector && nextSector.status != '1') nextSector.classList.add(`field__sector-dragover-${type}`)
    }
}

/**
 * Places the ship on the field.
 * @param {Element} sector Node of the current drag-over sector.
 */
function placeShip(sector) {
    let x = sector.x
    let y = sector.y
    let field = fields.me
    for (let i = 0; i < shipSize; i++) {
        let nextX = isVertical ? x : x + i
        let nextY = isVertical ? y + i : y
        markSector(nextX, nextY, 'me', 1, false, false)
    }

    // Runs around the ship and marks sectors as 'next to the ship'.
    for (let i = -1; i <= shipSize; i++) for (let j = -1; j <= 1; j++) {
        let xi = !isVertical ? x + i : x + j
        let yi = !isVertical ? y + j : y + i
        if (xi > 9 || yi > 9 || xi < 0 || yi < 0 || field[xi][yi].status) continue; 
        markSector(xi, yi, 'me', 4, false, true)
    }
}

/**
 * Gets the ship from the field.
 * @param {Element} sector Node of the current drag-start sector.
 */
function getShip(sector) {
    let oldX = sector.x
    let oldY = sector.y
    let field = fields.me
    shipSize = 1
    wasVertical = false
    shipStart = sector

    let clear = (x, y) => {
        // Runs around the ship and marks sectors as 'next to the ship'.
        for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) {
            if (field[x + i] && field[x + i][y + j]) setTimeout(() => {
                markSector(x + i, y + j, 'me', 0, false, false)
            }, 5)
        }
    }

    
    let goDown = (x, y) => {
        newY = y + 1
        if (field[x][newY] && field[x][newY].status == '1') {
            shipSize++
            wasVertical = true
            clear(x, newY)
            return goDown(x, newY)
        } 
        goUp(oldX, oldY)
    }
    let goUp = (x, y) => {
        newY = y - 1
        if (field[x][newY] && field[x][newY].status == '1') {
            shipSize++
            wasVertical = true
            shipStart = fields.me[x][newY]
            clear(x, newY)
            return goUp(x, newY)
        } 
        goRight(oldX, oldY)
    }
    let goRight = (x, y) => {
        if (wasVertical) return
        newX = x + 1
        if (field[newX] && field[newX][y] && field[newX][y].status == '1') {
            shipSize++
            clear(newX, y)
            return goRight(newX, y)
        } 
        goLeft(oldX, y)
    }
    let goLeft = (x, y) => {
        newX = x - 1
        if (field[newX] && field[newX][y] && field[newX][y].status == '1') {
            shipSize++
            shipStart = fields.me[newX][y]
            clear(newX, y)
            return goLeft(newX, oldY)
        }
    }

    clear(oldX, oldY)
    goDown(oldX, oldY)
}

/**
 * Checks if all the ships are placed on the field.
 */
function checkAllShips() {
    for (let i = 0; i < nodes.listedShips.me.length; i++) {
        if (!nodes.listedShips.me[i].classList.contains('ship-moved')) return isAllShips = false
    }
    isAllShips = true
    nodes.finish.classList.remove('greyed-out')
}

/**
 * Finishes placing and starts the game.
 * 
 */
function finishPlacing() {
    if (isAllShips) {
        for (let i = 1; i < 10; i++) for (let j = 1; j < 10; j++) {
            fields.me[i][j].draggable = false
        }
        hide(nodes.finish)
        hide(nodes.fieldBlocker)
        show(nodes.endGame)
        nodes.endGame.classList.add('endGame-animation')
        isAllShips = false
        for (let i = 0; i < nodes.listedShips.me.length; i++) {
            nodes.listedShips.me[i].classList.remove('ship-draggable')
            nodes.listedShips.me[i].classList.remove('ship-moved')
        }
        return setTimeout(() => {
            hide(nodes.endGame)
            nodes.endGame.classList.remove('endGame-animation')
        }, 1000)
    } else {
        let node = document.getElementsByClassName('field-container')[1]
        node.classList.add('field_animated')
        nodes.shipsLists.me.classList.add('field_animated')
        return setTimeout(() => {
            node.classList.remove('field_animated')
            nodes.shipsLists.me.classList.remove('field_animated')
        }, 500)
    }
}

// *****=====*****

// *****===== START OF SERVICE =====*****

/** 
 * Shows the given element by removing the 'hidden' class.
 * @param {Element} node The element to show. 
 */
 function show(node) {
    node.classList.remove('hidden')
}

/** 
 * Hides the given element by adding the 'hidden' class.
 * @param {Element} node The element to hide. 
 */
function hide(node) {
    node.classList.add('hidden')
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

// *****===== END OF SERVICE =====*****



window.oncontextmenu = () => {
    return false
}

newGame()
