$(function() {

/*
 * Öâåòà :
 * Ôîí - #ffeda9
 *  - #eccc9a
 * - #6b4d1c
 */

/* global cellHtml */

Array.prototype.shuffle = function () {
    for (var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x)
        ;
};

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
                ? args[number]
                : match
                ;
    });
};

var GUID = new function () {

    function s(cnt) {
        var segm = '';
        while (cnt-- > 0) { segm += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); }
        return segm.toUpperCase();
    }

    this.getNew = function () { return [s(2), s(1), s(1), s(1), s(3)].join('-'); };
    this.getSix = function() { return s(2).substr(0,6); };
};

var Score = 0;
var Inventory = new function () {
    var _items = new Array();
    var _activeIndex = 0;

    this.getItems = function () {
        return _items;
    };

    this.getActiveItem = function () {
        return _items[_activeIndex] || null;
    }

    this.add = function (item) {
        if (!(item instanceof Item)) {
            Error.init('7D1902C804C5');
            return;
        }
        _items.push(item);
        _activeIndex = _items.length - 1;
    }

    this.slideRight = function () {
        if (_activeIndex < _items.length - 1) {
            _activeIndex++;
        }
    };

    this.slideLeft = function () {
        if (_activeIndex > 0) {
            _activeIndex--;
        }
    };

    this.activateItem = function () {
        var item = _items[_activeIndex];
        _items.splice(_activeIndex, 1);
        item.activate();
        View.activateItem();
    };
};

var GameMode = {
    CLASSIC: 0,
    ENDLESS: 1,
    EXTREME: 2
};
var ElementType = {
    PLANT: 10, 
    SEED: 11,
    FLOWER: 12,
    FRUIT: 13,
    WEED: 20,
    WEED_SMALL: 21,
    WEED_MEDIUM: 22,
    WEED_LARGE: 23
};

// --------------------------------------------------------------------------------------------------------

var Field = new function () {
    
    var m_this = this;
    
    var FIELD_WIDTH = 7;
    var FIELD_HEIGHT = 9;

    this.getSize = function () {
        return [FIELD_WIDTH, FIELD_HEIGHT];
    };

    var _cells = new Object();
    var _cellsXY = new Array();
    var _selectedCell = null;

    function _init() {
        for (var x = 0; x < FIELD_WIDTH; x++) {
            _cellsXY[x] = new Array();
            for (var y = 0; y < FIELD_HEIGHT; y++) {
                var elem = null;
                if(x == 1 && y == FIELD_HEIGHT - 2) { elem = Fruit(); }
                if(x == FIELD_WIDTH - 2 && y == 1) { elem = Weed_medium(); }
                var cell = new Cell(x, y, elem);
                _cells[cell.id()] = cell;
                _cellsXY[x][y] = cell;
            }
        }
    }

    this.refreshCells = function() {
        for(var k in _cells) {
            if(_cells.hasOwnProperty(k)) { _cells[k].refresh(); }
        }
    };

    this.getCell = function(id) {
        return _cells[id];
    };

    this.getIds = function() {
        var sortArr = new Array();
        for (var k in _cells) {
            if(_cells.hasOwnProperty(k)) { 
                sortArr.push({
                    id:_cells[k].id(), 
                    x:_cells[k].x(), 
                    y:_cells[k].y()
                });
            }
        }
        sortArr.sort(function(a, b) {
            if(a.y < b.y) { return -1; }
            if(a.y > b.y) { return 1; }
            if(a.y == b.y) {
                if(a.x < b.x) { return -1; }
                if(a.x > b.x) { return 1; }
                return 0;
            }
        });
        
        var result = new Array();
        
        for(var i = 0; i < sortArr.length; i++) {
            result.push(sortArr[i].id);
        }
        return result;
    };

    function getCellsOnGrid(id, grid) {
        if (!_cells.hasOwnProperty(id) || !(_cells[id] instanceof Cell)) {
            return [];
        }

        var cell = _cells[id];
        var x0 = cell.x();
        var y0 = cell.y();
        var result = new Array();
        for (var i = 0; i < grid.length; i++) {
            if (!(grid[i] instanceof Array) || grid[i].length != 2) {
                return [];
            }
            var x = x0 + grid[i][0];
            var y = y0 + grid[i][1];
            if (x >= 0 && x < FIELD_WIDTH && y >= 0 && y < FIELD_HEIGHT) {
                result.push(_cellsXY[x][y]);
            }
        }
        return result;
    }

    this.getNearNeigbors = function getNearNeigbors(id) {
        var grid = [[0, -1],[1, 0],[0, 1],[-1, 0]];
        return getCellsOnGrid(id, grid);
    };

    this.getFarNeigbors = function getFarNeigbors(id) {
        var grid = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
        return getCellsOnGrid(id, grid);
    };

    this.getAllNeigbors = function getAllNeigbors(id) {
        var grid = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]];
        return getCellsOnGrid(id, grid);
    };

    this.getEmptyNeigbors = function(id) {
        var result = [];
        var nbrs = m_this.getNearNeigbors(id);
        for(var i = 0; i < nbrs.length; i++) {
            if(nbrs[i].isEmpty()) {
                result.push(nbrs[i]);
            }
        }
        return result;
    };

    function get3RandomEmptyNeigbors(id) {
        var result = [];
        var cells = getAllNeigbors(id);
        cells.shuffle();
        for (var i = 0; i < cells.length; i++) {
            if (cells.contains() === null) {
                result.push(cells[i]);
                if (result.length == 3) {
                    break;
                }
            }
        }
        return result;
    }

    this.getDistance = function (id0, id1) {
        var c0 = _cells[id0];
        var c1 = _cells[id1];
        if (!(c0 instanceof Cell) || !(c1 instanceof Cell)) {
            return;
        }
        return Math.sqrt(Math.pow(Math.abs(c1.x() - c0.x()), 2) + Math.pow(Math.abs(c1.y() - c0.y()), 2));
    };

    this.getCellValue = function (id) {
        var cell = _cells[id];
        if (!(cell instanceof Cell)) { return 0; }
        var result = cell.value();
        var nn = getNearNeigbors(id);
        var fn = getFarNeigbors(id);

        for (var i = 0; i < nn.length; i++) {
            if (nn.type() === cell.type()) {
                result += nn[i].value() / 2;
            }
        }
        for (var i = 0; i < fn.length; i++) {
            if (fn.type() === cell.type()) {
                result += fn[i].value() / 3;
            }
        }

        return result;
    };

    this.getPlantCells = function () {
        var result = new Array();
        for (var k in _cells) {
            if (_cells.hasOwnProperty(k) && _cells[k].is(ElementType.PLANT)) {
                result.push(_cells[k]);
            }
        }
        return result;
    };

    this.getWeedCells = function () {
        var result = new Array();
        for (var k in _cells) {
            if (_cells.hasOwnProperty(k) && _cells[k].contains() && _cells[k].is(ElementType.WEED)) {
                result.push(_cells[k]);
            }
        }
        return result;
    };

    this.getThreeRandomWeedCells = function () {
        var result = new Array();

        var cells = new Array();
        for (var x = 0; x < FIELD_WIDTH; x++) {
            for (var y = 0; y < FIELD_HEIGHT; y++) {
                if (_cells[x][y].contains() instanceof Weed) {
                    cells.push(_cells[x][y]);
                }
            }
        }
        cells.shuffle();

        for (var k = 0; k < cells.length; k++) {
            result[k] = [cells[k]];
            var nbrs = getNearNeigbors(cells[k].x(), cells[k].y());
            nbrs.shuffle();
            for (var n = 0; n < nbrs.length; n++) {
                if (nbrs[n].contains() instanceof Weed) {
                    result[k].push(nbrs[n]);
                }
            }
            if (result[k].length >= 3) {
                result[k].splice(0, 3);
                return result[k];
            }
        }

        for (var cnt = 2; cnt > 0; cnt--) {
            for (var k = 0; k < result.length; k++) {
                if (result[k].length == cnt) {
                    return result[k];
                }
            }
        }

        return [];
    };

    this.get2x2RandomPlantCells = function () {
        var result = new Array();

        var grid = [
            [[-1, 0], [-1, -1], [0, -1]],
            [[0, -1], [1, -1], [1, 0]],
            [[1, 0], [1, 1], [0, 1]],
            [[0, 1], [-1, 1], [-1, 0]]
        ];
        grid.shuffle();

        var cells = new Array();
        for (var x = 0; x < FIELD_WIDTH; x++) {
            for (var y = 0; y < FIELD_HEIGHT; y++) {
                if (_cells[x][y].contains() instanceof Plant) {
                    cells.push(_cells[x][y]);
                }
            }
        }
        cells.shuffle();

        for (var k = 0; k < cells.length; k++) {
            result[k] = [cells[k]];

            for (var n = 0; n < grid.length; n++) {
                var nbrs = getCellsOnGrid(grid[n]);
                for (var p = 0; p < nbrs.length; p++) {
                    if (nbrs[n].contains() instanceof Plant) {
                        result[k].push(nbrs[n]);
                    }
                }
            }
            if (result[k].length >= 4) {
                return result[k];
            }
        }

        for (var cnt = 3; cnt > 0; cnt--) {
            for (var k = 0; k < result.length; k++) {
                if (result[k].length == cnt) {
                    return result[k];
                }
            }
        }

        return [];
    }

    this.get2x2RandomNonFruitCells = function () {
        var result = new Array();

        var grid = [
            [[-1, 0], [-1, -1], [0, -1]],
            [[0, -1], [1, -1], [1, 0]],
            [[1, 0], [1, 1], [0, 1]],
            [[0, 1], [-1, 1], [-1, 0]]
        ];
        grid.shuffle();

        var cells = new Array();
        for (var x = 0; x < FIELD_WIDTH; x++) {
            for (var y = 0; y < FIELD_HEIGHT; y++) {
                if (_cells[x][y].contains() instanceof Seed || _cells[x][y].contains() instanceof Flower) {
                    cells.push(_cells[x][y]);
                }
            }
        }
        cells.shuffle();

        for (var k = 0; k < cells.length; k++) {
            result[k] = [cells[k]];

            for (var n = 0; n < grid.length; n++) {
                var nbrs = getCellsOnGrid(grid[n]);
                for (var p = 0; p < nbrs.length; p++) {
                    if (_cells[x][y].contains() instanceof Seed || _cells[x][y].contains() instanceof Flower) {
                        result[k].push(nbrs[n]);
                    }
                }
            }
            if (result[k].length >= 4) {
                return result[k];
            }
        }

        for (var cnt = 3; cnt > 0; cnt--) {
            for (var k = 0; k < result.length; k++) {
                if (result[k].length == cnt) {
                    return result[k];
                }
            }
        }

        return [];
    };

    this.getFruitCells = function () {
        var result = new Array();
        for (var i = 0; i < _cells.length; i++) {
            if (_cells[i].contains() instanceof Fruit) {
                result.push(_cells[i]);
            }
        }
        return result;
    };

    this.cellClicked = function (id) {
        //Ã¯Ã°Ã®Ã¢Ã¥Ã°ÃªÃ ...
        var cell = _cells[id];
        if (!(cell instanceof Cell)) { return; }
        if (cell.isSelected()) {
            cell.unselect();
            _selectedCell = null;
        }
        else {
            if (_selectedCell === null && !cell.isEmpty()) {
                cell.select();
                _selectedCell = cell;
            }

//                if(_selectedCell.contains() instanceof Seed) {
//
//                }
//                else if(_selectedCell.contains() instanceof Flower) {
//                    var cells = get3RandomEmptyNeigbors();
//                    for(var i = 0; i < cells.length; i++) {
//                        cells[i].fill(new Seed());
//                    }
//                    cell.fill(new Seed());
//                }
//                else if(_selectedCell.contains() instanceof Fruit) {
//                    var cells = get3RandomEmptyNeigbors();
//                    for(var i = 0; i < cells.length; i++) {
//                        cells[i].fill(new Seed());
//                    }
//                    cell.fill(new Seed());
//                }
        }

    };
    
    this.getNonEmptyCells = function() {
        var result = new Object();
        for(var k in _cells) {
            if(_cells.hasOwnProperty(k) && !_cells[k].isEmpty()) {
                result[k] = _cells[k].contains();
            }
        }
        return result;
    };

    this.encounter = function(id1, id2) {
        return m_this.getCellValue(_cells[id1]) > m_this.getCellValue(_cells[id2]);
    };

    this.sortByElement = function(a, b) {
        if(a.contains() === b.contains()) { return 0; }
        
        if(a.is(ElementType.SEED) || b.is(ElementType.FRUIT)) { return -1; }
        if(a.is(ElementType.FRUIT) || b.is(ElementType.SEED)) { return 1; }

        if(a.is(ElementType.WEED_SMALL) || b.is(ElementType.WEED_LARGE)) { return -1; }
        if(a.is(ElementType.WEED_LARGE) || b.is(ElementType.WEED_SMALL)) { return 1; }
    };

    _init();
};

function Cell(cX, cY, elem) {

    var m_this = this;

    var _id = GUID.getSix();
    var _elem = elem ? elem : null;
    var _selected = false;
    var _disabledIn = 0;

    this.contains = function () {
        return _elem;
    };

    this.x = function () {
        return cX;
    };
    this.y = function () {
        return cY;
    };

    this.id = function() { return _id; };

    this.refresh = function() {
        var wasDisabled = !isEnabled();
        if(_disabledIn > 0) { _disabledIn--; }
        if(wasDisabled && isEnabled()) {
            enable();
        }
        tryGrow();
    }

    this.is = function(type) {
        if(_elem == null) { return false; }
        return _elem.is(type);
    };

    this.fill = function (elem) {
        if (!(elem instanceof Element)) {
            Error.init('90AD8D84803A');
            return;
        }
        _elem = elem;
        View.fillCell(_id, elem);
    };

    this.clear = function () {
        _elem = null;
        View.clearCell(_id);
    };

    this.disable = function disable() {
        self().clear();
        _disabledIn = 3;
        View.disableCell(_id);
    };

    this.enable = function enable() {
        View.enableCell(_id);
    };

    this.isEmpty = function () {
        return _elem === null;
    };

    this.isEnabled = function isEnabled() {
        return _disabledIn == 0;
    };

    this.select = function () {
        _selected = true;
    };

    this.unselect = function () {
        _selected = false;
    };

    this.isSelected = function () {
        return _selected;
    };

    this.tryGrow = function tryGrow() {
        if(_elem === null) { return; }
        var elem = _elem.tryGrow();
        if(elem !== null) {
            _elem = elem;
            View.fillCell(_id, elem);
            return true;
        }
        return false;
    };
    
    this.slice = function() {
        _elem = m_this.fill(_elem.slice());
    };
}

// --------------------------------------------------------------------------------------------------------

function Element(types, name, next, growSpeed, value) {
    this.getTypes = function () {
        return types;
    };
    this.getName = function () {
        return Localization.look(name);
    };
    var movesToGrow = growSpeed;
    this.is = function(t) {
        for(var i = 0; i < types.length; i++) {
            if(types[i] === t) { return true; }
        }
        return false;
    };
    this.tryGrow = function () {
        if (--movesToGrow <= 0) {
            return grow();
        }
        return null;
    };
    this.value = function () {
        return value;
    };
    this.getIcon = function (initSize) {
        var sizes = [512, 256, 128, 64, 48, 32, 16];
        var size = sizes[sizes.length - 1];
        for(var i = 0; i < sizes.length - 1; i++) {
            if(sizes[i] <= initSize) { 
                size = sizes[i];
                break;
            }
        }
        return 'img/' + size + '/' + name.toLowerCase().replace(/ /g, '-') + '.png';
    };

    this.help = function () {
        --movesToGrow;
    };
    function grow() {
        return next();
    }
}

function Seed() {
    return new Element([ElementType.PLANT, ElementType.SEED], 'Seed', Flower, 2, 18);
}
function Flower() {
    return new Element([ElementType.PLANT, ElementType.FLOWER], 'Flower', Fruit, 5, 24);
}
function Fruit() {
    return new Element([ElementType.PLANT, ElementType.FRUIT], 'Fruit', Fruit, 1, 51);
}

function Weed_small() {
    return new Element([ElementType.WEED, ElementType.WEED_SMALL], 'Weed Small', Weed_medium, 1, 12);
}
function Weed_medium() {
    return new Element([ElementType.WEED, ElementType.WEED_MEDIUM], 'Weed Medium', Weed_large, 6, 30);
}
function Weed_large() {
    return new Element([ElementType.WEED, ElementType.WEED_LARGE], 'Weed Large', Weed_large, 1, 51);
}

// --------------------------------------------------------------------------------------------------------

function Item(name, actFunc) {
    this.getName = function () {
        return Localization.look(name);
    };
    this.activate = actFunc;
}

function Bucket() {
    this.prototype = new Item('Bucket of water', function () {
        Core.water();
    });
}
function Fertilizers() {
    this.prototype = new Item('Fertilizers', function () {
        Core.fertilize();
    });
}
function Poison() {
    this.prototype = new Item('Poison', function () {
        Core.poison();
    });
}

// --------------------------------------------------------------------------------------------------------

function Modifier(name, checkFunc) {
    this.getName = function () {
        return Localization.look(name);
    };
    this.check = checkFunc;
}

var Rain = new Modifier('Rain', function () {

});
var Drought = new Modifier('Drought', function () {

});
var Thieves = new Modifier('Little Thieves', function () {

});

// --------------------------------------------------------------------------------------------------------

var Core = new function () {

    var m_this = this;

    var PlayerType = {PLAYER: 0, CPU: 1};

    var _whoMoves = PlayerType.PLAYER;

    function cpuMove() {
        //...
        m_this.nextMove();
    }

    function growAll() {
        var growInterval = null;
        var i = 0;
        
        var cells = (m_this.playerMoves()) ? Field.getPlantCells() : Field.getWeedCells();
        cells.shuffle();
        
        growInterval = setInterval(function () {
            if(i == cells.length) {
                clearInterval(growInterval);
                growInterval = null;
                return;
            }
            while(i != cells.length && !cells[i++].tryGrow());
        }, 75);
    }

    function goodLuck() {
        switch (_whoMoves) {
            case PlayerType.PLAYER:
                if (Drought.check()) {
                    m_this.nextMove(true);
                    return false;
                }
                if (Thieves.check()) {
                    m_this.thieves();
                    return true;
                }
                break;
            case PlayerType.CPU:
                if (Rain.check()) {
                    m_this.nextMove(true);
                    return false;
                }
                break;
        }
        return true;
    }

    this.playerMoves = function () {
        //return true;
        return _whoMoves === PlayerType.PLAYER;
    };

    this.setItem = function (item) {
        if (!(item instanceof Item)) {
            Error.init('7D1902C804C5');
            return;
        }
        Inventory.add(item);
    };

    this.activateItem = function () {
        var item = clearItem();
        if (item != null) {
            item.activate();
        }
    };

    this.water = function () {
        var cells = Field.get2x2RandomNonFruitCells();
        for (var i = 0; i < cells.length; i++) {
            cells[i].contains().help();
        }
    };

    this.poison = function () {
        var cells = Field.getThreeRandomWeedCells();
        for (var i = 0; i < cells.length; i++) {
            cells[i].disable();
            View.refreshCell(cell);
        }
    };

    this.fertilize = function () {
        var cells = Field.get2x2RandomPlantCells();
        for (var i = 0; i < cells.length; i++) {
            cells[i].grow();
            View.refreshCell(cells[i]);
        }
    };

    this.thieves = function () {
        var cells = Field.getFruitCells();
        cells.shuffle();
        for (var i = 0; i < cells.length * (Math.random() * 0.17 + 0.33); i++) {
            cells[i].contains().slice();
            View.refreshCell(cells[i]);
        }
    };

    this.nextMove = function (lucky) {
        switch (_whoMoves) {
            case PlayerType.PLAYER:
                _whoMoves = PlayerType.CPU;
                MessageManager.init(MessageType.WARNING, Localization.look('cpu moves'));
                break;
            case PlayerType.CPU:
                _whoMoves = PlayerType.PLAYER;
                MessageManager.init(MessageType.INFO, Localization.look('your move!'));
                break;
        }
        growAll();

        if (!lucky && !goodLuck()) {
            return;
        }
        if (_whoMoves === PlayerType.CPU) {
            cpuMove();
        }
    };

    this.cellClicked = function (id) {
        Field.cellClicked(id);
    };

    this.encounter = function(id1, id2) {
        return Field.encounter(id1, id2);
    };

    this.destroy = function() {
        View.destroy();
    };
    
    this.increaseScore = function(value) {
        if(value > 0) {
            Score += value;
            View.refreshScore();
        }
    };
};

var EventsManager = new function() {

    var DeviceType = {
        DESKTOP: 0,
        MOBILE: 1
    };

    var _device = (true) ? DeviceType.DESKTOP : DeviceType.MOBILE;

    var list = new Object(); 
    list[DeviceType.DESKTOP] = {};
    list[DeviceType.MOBILE] = {
        'mousedown': 'taphold',
        'click': 'tap'
    };
    
    this.get = function(value) {
        if (typeof list[_device][value] == 'string') {
            return list[_device][value];
        }
        else {
            return value;
        }
    };
};

var MessageType = new function () {
    function O(clr) {
        if (clr.match(/^#[0-9a-f]{6}$/i) === null) {
            Error.init('7065F38DB467', [clr]);
        }
        this.getColor = function () {
            return clr;
        };
    }
    this.INFO = new O('#23B5EF');
    this.SUCCESS = new O('#24C131');
    this.WARNING = new O('#EA8800');
    this.ERROR = new O('#D10003');
};

var View = new function () {
    var m_this = this;
    
    var cellHtml = '<div id={0} class="fieldCell{1}"></div>';

    function _init() {
        var size = Field.getSize();
        var ids = Field.getIds();
        var resultHtml = '';
        for(var y = 0; y < size[1]; y++) {
            for(var x = 0; x < size[0]; x++) {
                var className = '';
                if(x == 0) {
                    className += ' beginRow';
                    if(y == 0) { className += ' nw'; }
                    if(y == size[1] - 1) { className += ' sw'; }
                }
                else if(x == size[0] - 1) {
                    className += ' endRow';
                    if(y == 0) { className += ' ne'; }
                    if(y == size[1] - 1) { className += ' se'; }
                }
                resultHtml += cellHtml.format(ids[y * size[0] + x], className);
            }
        }
        $('#gameField').html(resultHtml);
        _events();
        var cells = Field.getNonEmptyCells();
        for(var k in cells) {
            if(cells.hasOwnProperty(k)) {
                m_this.fillCell(k, cells[k]);
            }
        }
    }

    function _events() {

        var _pressed = false;
        

        $(document).delegate(".fieldCell", "scrollstart", false);

        var _selectedCells = [];
        var _selectCount = 0;
        var _selectedType = null;
        var _selectTimeout = null;
        var _neigbors = null;

        $('.fieldCell').on(EventsManager.get('click'), function (event) {
            
            if(!Core.playerMoves()) { return; }
            
            clearTimeout(_selectTimeout);
            _selectTimeout = null;
            
            var $cell = $(this);
            var cell = Field.getCell($cell[0].id);
            var elem = cell.contains();
            
            if(cell.isEmpty()) {
                if(_selectedCells.indexOf(cell) == -1) {
                    if(_selectCount > 0 && _neigbors.indexOf(cell) != -1) {
                        _selectedCells.push(cell);
                        _selectCount--;
                        $cell.addClass('selected');
                        if(_selectCount == 0 || _selectedCells.length == _neigbors.length) {
                            _selectTimeout = setTimeout(function() {
                                $('.fieldCell').removeClass('selected').removeClass('selectedPrimary');
                                for(var i = 0; i < _selectedCells.length; i++) {
                                    var cell = _selectedCells[i];
                                    if(i === 0 && cell.is(ElementType.SEED)) { 
                                        cell.clear();
                                        continue; 
                                    }
                                    cell.fill(new Seed());
                                    Core.increaseScore(150);
                                }
                                _selectedType = null;
                                _selectCount = 0;
                                _selectedCells.splice(0, _selectedCells.length);
                                Core.nextMove();
                            }, 300);
                        }
                    }
                }
                else {
                    _selectedCells.splice(_selectedCells.indexOf(cell), 1);
                    _selectCount++;
                    $cell.removeClass('selected');
                }
            } 
            else if(elem.is(ElementType.PLANT)){
                $('.fieldCell').removeClass('selected').removeClass('selectedPrimary');
                if(_selectedCells.indexOf(cell) == -1) {
                    _selectedCells.push(cell);
                    _selectedType = elem.getTypes()[1];
                    if(elem.is(ElementType.FRUIT)) {
                        _selectCount = 3;
                    }
                    else {
                        _selectCount = 1;
                    }
                    _neigbors = Field.getEmptyNeigbors(cell.id());
                    $cell.addClass('selectedPrimary');
                }
                else {
                    _selectedType = null;
                    _selectCount = 0;
                    _selectedCells.splice(0, _selectedCells.length);
                }
            }
        });

        $(document).on(EventsManager.get('click'), '.activeItem', function () {
            if (!Core.playerMoves()) {
                return;
            }
            //...
            Core.nextMove();
        });

        var skipTimeout = null;
        $('#skipMoveButton').on(EventsManager.get('mousedown'), function (event) {
            event.preventDefault();
            if (!Core.playerMoves()) {
                return;
            }
            $('#skipMoveButton > .red-blind').css('height', 0).animate({
                'width': '100%',
                'height': '100%'
            }, 900).delay(100).animate({
                'width': 0,
                'height': 0
            }, 0);
            skipTimeout = setTimeout(function () {
                Core.nextMove(true);
            }, 1000);
        });
        $('#skipMoveButton').mouseup(function () {
            if (!Core.playerMoves()) {
                return;
            }
            clearTimeout(skipTimeout);
            skipTimeout = null;
            $('#skipMoveButton > .red-blind').stop().css({
                'width': 0,
                'height': 0
            });
        });
    }

    function _eventsOff() {
        $(document).off('mousedown', '.fieldCell');
        $(document).off('mouseup', '.fieldCell');
        $(document).off('mouseover', '.fieldCell');
        $(document).off('click', '.activeItem');
        $(document).off('mousedown', '#skipMoveButton');
        $(document).off('mouseup', '#skipMoveButton');
    }

    this.showDialog = function (msgType, text) {
        $('#messageBar')
        .css({
            'bottom': '-30px',
            'background-color': msgType.getColor()
        })
        .html(text)
        .show()
        .animate({
            'bottom': 0
        }, 300)
        .delay(3000)
        .fadeOut(300);
    };

    this.fillCell = function (id, elem) {
        if ($('#'+id).length == 0) {
            Error.init('B482D3CD7F38');
            return;
        }
        $('#'+id).html('<img class="elem" src="' + elem.getIcon(50) + '" />');
    };

    this.clearCell = function (id) {
        var fieldSize = Field.getSize();
        if ($('#'+id).length == 0) {
            Error.init('B482D3CD7F38');
            return;
        }
        $('#'+id).empty();
    };

    this.activateItem = function () {

    };

    this.disableCell = function (id) {
        if ($('#'+id).length == 0) {
            Error.init('B482D3CD7F38');
            return;
        }
        $('#'+id).addClass('disabled');
    };

    this.enableCell = function (id) {
        if ($('#'+id).length == 0) {
            Error.init('B482D3CD7F38');
            return;
        }
        $('#'+id).removeClass('disabled');
    };

    this.refreshCell = function (id) {
        
    };

    this.refreshScore = function() {
        $('#scoreLabel').text(Score);
    };

    this.destroy = function() {
        _eventsOff();
        $('body').find('*:not(#messageBar)').remove();
        Error.init('000000000000');
    }

    _init();
};

var AchievementManager = new function () {

    function Achievement(name, description) {
        this.name = name;
        this.description = description;
        var _unlocked = false;
        this.unlock = function () { _unlocked = true; };
        this.unlocked = function () { return _unlocked; }
    }

    var _ach = {
        'ED3DA55C0040': new Achievement('First steps', '')
    };

    this.init = function (code) {
        var a = _ach[code.toUpperCase];
        if (a instanceof 'Achievement' && !a.unlocked()) {
            a.unlock();
            var msg = '<span style="font-weight:bold">' + Localization.look('Achievement unlocked!') + '</span> ' + Localization.look(a.name);
            MessageManager.init(MessageType.SUCCESS, msg);
        }
    };

};

var Error = new function () {

    var _errors = {
        '000000000000': 'Unknown Error',
        '0E755B21589E': 'Connection with server lost',
        '7065F38DB467': '"{0}" is not a correct color',
        '90AD8D84803A': 'Incorrect element',
        '7D1902C804C5': 'Incorrect item',
        'B482D3CD7F38': 'Cell doesn\'t exist'
    };
    
    var _criticalErrors = ['000000000000', '7065F38DB467', '90AD8D84803A', '7D1902C804C5', 'B482D3CD7F38'];

    this.init = function (code, args) {
        var message = 'Unknown Error';
        if (typeof _errors[code.toUpperCase()] == 'string') {
            message = _errors[code].format(args);
        }
        if(_criticalErrors.indexOf(code) != -1) {
            Core.destroy();
        }
        MessageManager.init(MessageType.ERROR, message);
    };


};

var MessageManager = new function () {

    var _queue = new Array();
    var _active = false;

    this.init = function (type, message) {
        _queue.push({
            type: type,
            message: message
        });

        if (!_active) {
            _active = true;
            exec();
        }
    };

    function exec() {
        if (_queue.length == 0) {
            _active = false;
            return;
        }
        View.showDialog(_queue[0].type, _queue[0].message);
        setTimeout(function () {
            _queue.splice(0, 1);
            exec();
        }, 3700);
    }
};

var GameInfo = new function () {
    this.title = function () {
        return 'Grand Harvest';
    };
    this.version = function () {
        return '0.0.9';
    };
};
});