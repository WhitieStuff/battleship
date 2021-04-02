//0 - пусто, 1 - корабль, 2 - ранен, 3 - мимо, 4 - соседняя.

/**
 * Корабли, участвующие в игре.
 */
let shipSizes = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]

/**
 * Возвращает сумму для суммирования членов массива.
 * @param {*} sum Сумма предыдущих членов.
 * @param {*} current Текущий член.
 * @returns Сумма значений.
 */
let reducer = (sum, current) => sum + current

/**
 * Статусы сектора.
 */
let statuses = ["empty", "ship", "hit", "miss", "next"]

/**
 * Элемент поля противника.
 * Элемент своего поля.
 */
let node_fields = {
    enemy: document.getElementById('fieldEnemy'),
    me: document.getElementById('fieldMe')
}

/**
 * Элемент блока поля противника.
 */
let node_fieldBlocker = document.getElementById('fieldBlocker')

/**
 * Элемент кнопки "Новая игра".
 */
let node_newGame = document.getElementById('newGame')


/**
 * Объект с секторами поля противника.
 * Объект с секторами своего поля.
 */
let fields = {
    enemy: {shipSectors: shipSizes.reduce(reducer)},
    me: {shipSectors: shipSizes.reduce(reducer)}
}

/**
 * Корабли противника, оставшиеся в текущей игре.
 * Свои корабли, оставшиеся в текущей игре.
 */
let shipsLost = {
    enemy: {4:1, 3:2, 2:3, 1:4},
    me: {4:1, 3:2, 2:3, 1:4}
}

/**
 * Флаг своего хода.
 */
let myMove

let getRandom = () => Math.floor(Math.random() * Math.floor(9))

/**
 * Последнее попадание по полю противника.
 * Последнее попадание по моему полю.
 */
 let lastHits = {
    enemy: null,
    me: null
 }








/**
 * Начинает новую игру и перерисовывает поля.
 */
function newGame() {
    run0to100(refreshSector, 'me')
    run0to100(refreshSector, 'enemy')
    shipSizes.forEach(ship => {
        createShip(ship, 'me')
        createShip(ship, 'enemy')
    })
    fields.enemy.shipSectors = fields.me.shipSectors = shipSizes.reduce(reducer)
    shipsLost.enemy = shipsLost.me = {4:1, 3:2, 2:3, 1:4}
    lastHits.ememy = lastHits.me = null

    myMove = true

    /**
     * Секторы противника для листенера кликов.
     */
    let node_enemy_sectors = document.getElementsByClassName('field__sector-enemy')
    /**
     * Свои секторы для листенера ходов противника.
     */
    let node_me_sectors = document.getElementsByClassName('field__sector-me')
    for (let i = 0; i < 100; i++) {
        node_enemy_sectors[i].addEventListener('click', event => shoot(event, 'enemy'))
    }

    console.log('%cНачата новая игра.', "color: green;")
}

/**
 * Проходит по матрице 10х10 и вызывает коллбэк для каждого сектора.
 * 
 * @param {function} callback Коллбэк, который будет вызван для каждого сектора поля.
 * @param {*} extraParameter Дополнительные параметры для вызова коллбэка.
 */
function run0to100 (callback, extraParameter) {
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) callback(j, i, extraParameter)
}


/**
 * Очищает сектор и создает новый.
 * 
 * @param {number} i Координата X.
 * @param {number} j Координата Y.
 * @param {string} owner Владелец поля (me/enemy).
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
 * Создает корабль заданного размера на указанном поле.
 * 
 * @param {nubmer} size Размер корабля.
 * @param {*} owner Владелец поля (me/enemy).
 */
function createShip(size, owner) {
    let field = fields[owner]
    
    let horizontal = Math.round(Math.random())
    let x = getRandom()
    let y = getRandom()

    // Первая проходка по гипотетическому кораблю. Если не умещается, начинаем по новой.
    for (let i = 0; i < size; i++) {
        let xi = horizontal ? x + i : x
        let yi = !horizontal ? y + i : y
        if (xi > 9 || yi > 9 || field[xi][yi].status) return createShip(size, owner)
    }
    
    // Вторая проходка по гипотетическому кораблю, помечаем секторы.
    for (let i = 0; i < size; i++) {
        let xi = horizontal ? x + i : x
        let yi = !horizontal ? y + i : y
        markSector(xi, yi, owner, 1)
    }
    
    // Проходка вокруг корабля, помечаем пустые секторы "соседними".
    for (let i = -1; i <= size; i++) for (let j = -1; j <= 1; j++) {
        let xi = horizontal ? x + i : x + j
        let yi = horizontal ? y + j : y + i
        if (xi > 9 || yi > 9 || xi < 0 || yi < 0 || field[xi][yi].status) continue; 
        markSector(xi, yi, owner, 4)
    }
}

/**
 * Помечает указанный сектор на указанном поле указанным статусом.
 * 
 * @param {number} x Координата X.
 * @param {number} y Координата Y.
 * @param {string} owner Владелец поля (me/enemy).
 * @param {number} status Статус сектора.
 */
function markSector (x, y, owner, status) {
    let field = fields[owner]
    let sector = document.getElementById(`${owner}-${x}-${y}`)

    field[x][y].status = status

    sector.classList.remove('field__sector-miss')
    sector.classList.remove('field__sector-ship')
    sector.classList.remove('field__sector-hit')

    //TODO: Убрать пометку c классами на поле противника. 
    // if (owner == 'enemy') return
    sector.classList.add(`field__sector-${statuses[status]}`)

    
}

/**
 * Выстрел по заданному сектору.
 * @param {event} event Ивент нажатия на сектор.
 * @param {string} owner Владелец поля (me/enemy).
 */
function shoot(event, owner) {
    let id = event.target.id
    let x = id.split('-')[1]
    let y = id.split('-')[2]
    let field = fields[owner]

    console.log('')
    console.log('Shoot at', owner, lastHits[owner])


    if (field[x][y].opened) return
    field[x][y].opened = 1
    
    if (field[x][y].status == 0 || field[x][y].status == 4) {
        markSector(x, y, owner, 3)
        if (myMove && lastHits['enemy']) checkDone(lastHits['enemy'].x, lastHits['enemy'].y, 'enemy', false)
        myMove = !myMove
        console.log('Miss at', owner, lastHits[owner])
        if (!myMove && lastHits['me']) return checkDone(lastHits['me'].x, lastHits['me'].y, 'me', true)
        if (!myMove) return shootRandom()
    }

    if (field[x][y].status == 1) {
        markSector(x, y, owner, 2)
        lastHits[owner] = {x, y}
        console.log('Hit at', owner, lastHits[owner])
        if (--field.shipSectors == 0) return endGame(owner)
        return checkDone(x, y, owner, true)
    }
}

/**
 * Противник делает ход по заданным координатам.
 * 
 * @param {number} x Координата X.
 * @param {number} y Координата Y.
 */
function enemyMove(x, y) {
    node_fieldBlocker.classList.remove('hidden')
    setTimeout(() => {
        node_fieldBlocker.classList.add('hidden')
        let event = {}
        event.target = document.getElementById(`me-${x}-${y}`)
        shoot(event, 'me')
    }, 800)
    
    
}

/**
 * Вычисляет следующий ход противника.
 */
function shootRandom() {
    console.log('Shoot random')
    let field = fields.me
    let x = getRandom()
    let y = getRandom()
    if (field[x][y].opened) return shootRandom()
    enemyMove(x, y)
}

/**
 * Проверяет, добит ли корабль последним попаданием.
 * 
 * @param {number} x Координата X.
 * @param {number} y Координата Y.
 * @param {string} owner Владелец поля (me/enemy).
 * @param {boolean} makeHit Делать ли выстрел после проверки.
 * @returns {boolean} Добит ли корабль.
 */
function checkDone(oldX, oldY, owner, makeHit) {
    let field = fields[owner]

    /**
     * Неизвестен ли сектор с заданными координатами.
     */
    let isUnknown = (x, y) => field[x] && field[x][y] && !field[x][y].opened
    /**
     * Является ли заданный сектор подбитым кораблем.
     */
    let isHit = (x, y) => field[x] && field[x][y] && field[x][y].status == 2
    /**
     * Является ли заданный корабль самым большим из оставшихся.
     */
    let isBiggest = (size) => {
        if (size == 4) return true
        for (let i = size + 1; i <= 4; i++) {
            // if (shipsLost[owner][i] > 0) console.log('Не самый большой корабль')
            if (shipsLost[owner][i] > 0) return false
        }
        return true
    }

    let makeDone = () => {
        //TODO: Добавить проверку по уже отстреленным кораблям. Убил четверку - тройки обводятся.
        isDone = true
        lastHits[owner] = null
        shipsLost[owner][length] = shipsLost[owner][length] - 1
        markDone(oldX, oldY, owner)
    }

    /** Длина уже подбитой части */
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
                doneDown = true
            }
        }
    }

    goRight(oldX, oldY)

    if (isBiggest(length) || horizontal && doneRight && doneLeft || vertical && doneUp && doneDown || doneRight && doneLeft && doneUp && doneDown) {
        makeDone()
    }

    console.log("Корабль убит?", isDone)

    if (makeHit) {
        if (newX == 11) return shootRandom()
        enemyMove(newX, newY)
    }
    
}

/**
 * Помечает данный корабль убитым. Обводит его.
 * 
 * @param {number} oldX Координата X.
 * @param {number} oldY Координа Y.
 * @param {boolean} owner Владелец поля (me/enemy).
 */
function markDone(oldX, oldY, owner) {
    let field = fields[owner]
    oldX = parseInt(oldX)
    oldY = parseInt(oldY)
    let isHit = (x, y) => field[x] && field[x][y] && field[x][y].status == 2
    let isUnknown = (x, y) => field[x] && field[x][y] && !field[x][y].opened

    let getAround = (x, y) => {
        for (let i = x - 1; i <= x + 1; i++) for (let j = y - 1; j <= y + 1; j++) if (isUnknown(i, j)) markSector(i, j, owner, 3)
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
 * Заканчиваем игру, победитель - не владелец поля.
 * @param {string} owner Владелец поля (me/enemy) последнего убитого корабля.
 */
function endGame(owner) {
    if (owner == 'me') return console.log('Проигрыш')
    console.log('Выигрыш')
}

node_newGame.addEventListener('click', () => {
    newGame()
})

newGame()