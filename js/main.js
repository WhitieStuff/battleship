//0 - пусто, 1 - корабль, 2 - ранен, 3 - мимо, 4 - соседняя.

/**
 * Элемент поля противника.
 */
var node_field_enemy = document.getElementById('fieldEnemy')
/**
 * Элемент своего поля.
 */
var node_field_me = document.getElementById('fieldMe')
/**
 * Элемент кнопки "Новая игра".
 */
var newGameNode = document.getElementById('newGame')

/**
 * Объект с секторами поля противника.
 */
var field_enemy = {}
/**
 * Объект с секторами своего поля.
 */
var field_me = {}

/**
 * Корабли, участвующие в игре.
 */
var ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]

/**
 * Статусы сектора.
 */
var statuses = ["empty", "ship", "hit", "miss", "next"]








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

    console.log('%cНачата новая игра.', "color: green;")
}

/**
 * Проходит по матрице 10х10 и вызывает коллбэк для каждого сектора.
 * 
 * @param {function} callback Коллбэк, который будет вызван для каждого сектора поля.
 * @param {*} extraParameter Дополнительные параметры для вызова коллбэка.
 */
function run0to100 (callback, extraParameter) {
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) callback(i, j, extraParameter)
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

    sector.classList.add(`field__sector-${statuses[status]}`)

    //TODO: Убрать пометку c классами на поле противника. 
}





newGameNode.addEventListener('click', () => {
    newGame()
})

newGame()