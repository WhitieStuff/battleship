//0 - пусто, 1 - корабль, 2 - ранен, 3 - мимо, 4 - соседняя.

/**
 * Корабли, участвующие в игре.
 */
var ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]

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
var statuses = ["empty", "ship", "hit", "miss", "next"]

/**
 * Элемент поля противника.
 */
var node_field_enemy = document.getElementById('fieldEnemy')
/**
 * Элемент своего поля.
 */
var node_field_me = document.getElementById('fieldMe')

/**
 * Элемент блока поля противника.
 */
var node_fieldBlocker = document.getElementById('fieldBlocker')

/**
 * Элемент кнопки "Новая игра".
 */
var node_newGame = document.getElementById('newGame')

/**
 * Объект с секторами поля противника.
 */
var field_enemy = {ships: ships.reduce(reducer)}
/**
 * Объект с секторами своего поля.
 */
var field_me = {ships: ships.reduce(reducer)}

/**
 * Флаг своего хода.
 */
var myMove

/**
 * Последнее попадание соперника.
 */
var lastHits = []

/**
 * Свои корабли, оставшиеся в текущей игре.
 */
 var myShips = {4:1, 3:2, 2:3, 1:4}








/**
 * Начинает новую игру и перерисовывает поля.
 */
function newGame() {
    run0to100(refreshSector, 'me')
    run0to100(refreshSector, 'enemy')
    ships.forEach(ship => {
        createShip(ship, 'me')
        createShip(ship, 'enemy')
    })
    field_enemy.shipSectors = ships.reduce(reducer)
    field_me.shipSectors = ships.reduce(reducer)
    myShips = {4:1, 3:2, 2:3, 1:4}

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

    let field = window[`field_${owner}`]
    let node = window[`node_field_${owner}`]
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
    let field = window[`field_${owner}`]
    
    let horizontal = Math.round(Math.random())
    let x = Math.floor(Math.random() * Math.floor(9))
    let y = Math.floor(Math.random() * Math.floor(9))

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
    let field = window[`field_${owner}`]
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
    let field = window[`field_${owner}`]

    if (!myMove && field[x][y].opened) return enemyMove()
    if (field[x][y].opened) return
    field[x][y].opened = 1
    
    if (field[x][y].status == 0 || field[x][y].status == 4) {
        markSector(x, y, owner, 3)
        myMove = !myMove
        if (!myMove) enemyMove()
    }

    if (field[x][y].status == 1) {
        markSector(x, y, owner, 2)
        if (--field.shipSectors == 0) endGame(owner)
        if (!myMove) {
            lastHits.push({x, y})
            return enemyMove()
        }
    }
}

/**
 * Противник делает ход.
 */
function enemyMove() {
    node_fieldBlocker.classList.remove('hidden')
    setTimeout(() => {
        node_fieldBlocker.classList.add('hidden')
        let event = {}
        let coordinates = getCoordinates()
        event.target = document.getElementById(`me-${coordinates.x}-${coordinates.y}`)
        shoot(event, 'me')
    }, 800)
    
    
}

/**
 * Вычисляет следующий ход противника.
 */
function getCoordinates() {
    let x = Math.floor(Math.random() * Math.floor(9))
    let y = Math.floor(Math.random() * Math.floor(9))
    if (!lastHits.length) return {x, y}

    let lastHit = lastHits[lastHits.length-1]
    let lastX = parseInt(lastHit.x)
    let lastY = parseInt(lastHit.y)

    if (!myShips[lastHits.length + 1] && !myShips[lastHits.length + 2] && !myShips[lastHits.length + 3]) {
        // Если не осталось кораблей длинней уже подбитого, то идем дальше.
        myShips[lastHits.length]--
        //TODO: Окружить корабль пустыми секторами.
        lastHits = []
        return {x, y}
    }
    //Если остался корабль длинней, вычисляем следующий ход.
    if (lastHits.length == 1) {
        if (field_me[lastX + 1][lastY] && !field_me[lastX + 1][lastY].opened) return {x: lastX + 1, y: lastY}
    }

    

    return {x, y}
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