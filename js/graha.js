var GraHa = new function() {

    /*
     * �����:
     * ��� - #ffeda9
     * ������ ��������� - #eccc9a
     * ����� - #6b4d1c
     */

    Array.prototype.shuffle = function() {
        for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
    };

    function self() { return this; }

    var Score = 0;
    var Inventory = new function() {
        var _items = new Array();
        var _activeIndex = 0;
        
        this.getItems = function() { return _items; };
        
        this.getActiveItem = function() { return _items[_activeIndex] || null; }
        
        this.add = function(item) {
            if(!(item instanceof Item)) { Error.init('7D1902C804C5'); return;  }
            _items.push(item);
            _activeIndex = _items.length - 1;
        }
        
        this.slideRight = function() {
            if(_activeIndex < _items.length - 1) {
                _activeIndex++;
            }
        };
        
        this.slideLeft = function() {
            if(_activeIndex > 0) {
                _activeIndex--;
            }
        };
        
        this.activateItem = function() {
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

    // --------------------------------------------------------------------------------------------------------

    var Field = new function() {
        var FIELD_WIDTH = 7;
        var FIELD_HEIGHT = 9;
        
        this.getSize = function() {
            return [FIELD_WIDTH, FIELD_HEIGHT];
        };
        
        var _cells = new Array();
        
        function _init() {
            for(var x = 0; x < FIELD_WIDTH; x++) {
                _cells[x] = new Array();
                for(var y = 0; y < FIELD_HEIGHT; y++) {
                    _cells[x][y] = new Cell(x, y);
                }
            }
        }

        function getCellsOnGrid(cell, grid) {
            if (!(cell instanceof Cell)) { return []; }

            var x = cell.x();
            var y = cell.y();
            var result = new Array();
            for (var i = 0; i < grid.length; i++) {
                if (!(grid[i] instanceof Array) || grid[i].length != 2) { return []; }
                var x = cell.x() + grid[i][0];
                var y = _cell.y() + grid[i][1];
                if (x >= 0 && x < FIELD_WIDTH && y >= 0 && y < FIELD_HEIGHT) {
                    result.push(_cells[x][y]);
                }
            }
            return result;
        }

        this.getNearNeigbors = function getNearNeigbors(cell) {
            var grid = [ [0, -1][1, 0][0, 1][-1, 0] ];
            return getCellsOnGrid(cell, grid);
        };

        this.getFarNeigbors = function getFarNeigbors(cell) {
            var grid = [ [-1, -1], [1, -1], [1, 1], [-1, 1] ];
            return getCellsOnGrid(cell, grid);
        };

        this.getAllNeigbors = function getAllNeigbors(cell) {
            var grid = [ [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0] ];
            return getCellsOnGrid(cell, grid);
        };

        this.getDistance = function(c0, c1) {
            if(!(c0 instanceof Cell) || !(c1 instanceof Cell)) { return; }
            return Math.max(Math.abs(c1.x()-c0.x()), Math.abs(c1.y()-c0.y()));
        }

        this.getCellValue = function (cell) {
            var result = cell.value();
            var nn = getNearNeigbors(cell);
            var fn = getFarNeigbors(cell);

            for (var i = 0; i < nn.length; i++) { if (nn.type() === cell.type()) { result += nn[i].value() / 2; } }
            for (var i = 0; i < fn.length; i++) { if (fn.type() === cell.type()) { result += fn[i].value() / 3; } }

            return result;
        };

        this.getThreeRandomWeedCells = function() {
            var result = new Array();

            var cells = new Array();
            for(var x = 0; x < FIELD_WIDTH; x++) {
                for(var y = 0; y < FIELD_HEIGHT; y++) {
                    if (_cells[x][y].contains() instanceof Weed) {
                        cells.push(_cells[x][y]);
                    }
                }
            }
            cells.shuffle();

            for(var k = 0; k < cells.length; k++) {
                result[k] = [ cells[k] ];
                    var nbrs = getNearNeigbors(cells[k].x(), cells[k].y());
                nbrs.shuffle();
                for(var n = 0; n < nbrs.length; n++) {
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
        }

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
                    for(var p = 0; p < nbrs.length; p++) {
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

        this.get2x2RandomNonFruitCells = function() {
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
                    for(var p = 0; p < nbrs.length; p++) {
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

        

        _init();
    };

    function Cell(cX, cY) {

        function self() { return this; }

        var _elem = null;
        var _enabled = true;

        this.contains = function () { return _elem; }

        this.x = function () { return cX; }
        this.y = function () { return cY; }

        this.fill = function (elem) {
            if (!(elem instanceof Element)) { Error.init('90AD8D84803A'); return; }
            _elem = elem;
            View.fillCell(cX, cY, elem);
        };

        this.clear = function () {
            _elem = null;
            View.clearCell(cX, cY);
        };

        this.disable = function () {
            self().clear();
            _enabled = false;
        }

        this.enable = function () {
            _enabled = true;
        }

        this.isEnabled = function () {
            return _enabled;
        }

        this.tryGrow = function () { _elem && _elem.tryGrow(); };

        this.grow = function () { _elem && _elem.grow(); };
    }

    // --------------------------------------------------------------------------------------------------------

    var ElementType = { PLANT: 0, WEED: 1 };

    function Element(type, name, prev, next, growSpeed, value) {
        this.getType = function () { return type; }
        this.getName = function() { return Localization.look(name); };
        var movesToGrow = growSpeed;
        this.tryGrow = function() {
            if(--movesToGrow == 0) { grow(); }
        }
        this.slice = function () { return prev; }
        this.value = function () { return value; }

        function grow() { return next; }
    }
    
    // --------------------------------------------------------------------------------------------------------

    function Plant(name, prev, next, growSpeed, value) {
        this.prototype = new Element (ElementType.PLANT, name, prev, next, growSpeed, value);
    }

    function Seed() { this.prototype = new Plant('Seed', null, new Flower(), 2, 18); }        
    function Flower() { this.prototype =  new Plant('Flower', new Seed(), new Fruit(), 5, 24); }
    function Fruit() { this.prototype = new Plant('Fruit', new Flower(), new Fruit(), 1, 51); }
    
    // --------------------------------------------------------------------------------------------------------

    function Weed(name, prev, next, growSpeed) {
        this.prototype = new Element (ElementType.WEED, name, prev, next, growSpeed);
    }

    function Weed_small() { this.prototype = new Weed('Weed Small', null, new Weed_medium(), 4, 12); }    
    function Weed_medium() { this.prototype = new Weed('Weed Medium', new Weed_small(), new Weed_large(), 6, 30); }
    function Weed_large() { this.prototype = new Weed('Weed Large', new Weed_medium(), new Weed_large(), 1, 51); }
       
    // --------------------------------------------------------------------------------------------------------
    
    function Item(name, actFunc) {
        this.getName = function () { return Localization.look(name); };
        this.activate = actFunc;
    }
            
    function Bucket() {
        this.prototype = new Item('Bucket of water', function() {

        });
    }
    function Fertilizers() {
        this.prototype = new Item('Fertilizers', function() {
            Core.fertilize();
        });
    }
    function Poison() {
        this.prototype = new Item('Poison', function() {
            Core.poison();
        });
    }

    // --------------------------------------------------------------------------------------------------------

    function Modifier(name, checkFunc) {  
        this.getName = function () { return Localization.look(name); };
        this.check = checkFunc;
    }

    var Rain = new Modifier('Rain', function() {
        
    }); 
    
    var Drought = new Modifier('Drought', function() {
        
    }); 

    var Thieves = new Modifier('Little Thieves', function() {
        
    }); 

    // --------------------------------------------------------------------------------------------------------

    var Core = new function () {
        
        function self() { return this; }
        
        var PlayerType = { PLAYER: 0, CPU: 1 };
        
        var whoMoves = PlayerType.PLAYER;
        
        this.playerMoves = function() { return whoMoves === PlayerType.PLAYER; };
        
        this.setItem = function (item) {
            if (!(item instanceof Item)) { Error.init('7D1902C804C5'); return; }
            Inventory.add(item);
        };

        this.activateItem = function () {
            var item = clearItem();
            if (item != null) {
                item.activate();
            }
        };

        this.poison = function () {
            var cells = Field.getThreeRandomWeedCells();
            for (var i = 0; i < cells.length; i++) {
                cells[i].disable();
                View.refreshCell(cell);
            }
        }

        this.fertilize = function () {
            var cells = Field.get2x2RandomPlantCells();
            for (var i = 0; i < cells.length; i++) {
                cells[i].grow();
                View.refreshCell(cells[i]);
            }
        };

        this.thieves = function thieves() {
            var cells = Field.getFruitCells();
            cells.shuffle();
            for (var i = 0; i < cells.length * (Math.random() * 0.17 + 0.33) ; i++) {
                cells[i].contains().slice();
                View.refreshCell(cells[i]);
            }
        };

        this.nextMove = function nextMove(lucky) {
            switch(whoMoves) {
                case PlayerType.PLAYER: whoMoves = PlayerType.CPU; break;
                case PlayerType.CPU: whoMoves = PlayerType.PLAYER; break;
            }
            if(!lucky && !goodLuck()) { return; }
            
        };
        
        function goodLuck() {
            switch(whoMoves) {
                case PlayerType.PLAYER: 
                    if(Drought.check()) { 
                        nextMove(true);
                        return false;
                    }
                    if(Thieves.check()) { 
                        thieves();
                        return true;
                    }
                    break;
                case PlayerType.CPU: 
                    if(Rain.check()) { 
                        nextMove(true);
                        return false;
                    }
                    break;
            }
            return true;
        }
    };

    var MessageType = new function() {
        function O (clr) {
            if(clr.match(/^#[0-9a-f]{6}$/i) === null) { Error.init('7065F38DB467', [clr]); }
            this.getColor = function() { return clr; }
        }
        this.INFO = new O('#26D337');
        this.WARNING = new O('#EA8800');
        this.ERROR = new O('#D10003');
    };
    
    var View = new function () {
        function self() { return this; }

        function _init() {
            _events();
        }

        function _events() {
            $('body').click('.fieldCell', function () {
                if(!Core.playerMoves()) { return; }
                //...
                Core.nextMove();
            });
            
            $('body').click('.activeItem', function () {
                if(!Core.playerMoves()) { return; }
                //...
                Core.nextMove();
            });
            
            var skipTimeout = null;
            $('body').mousedown('#skipMoveButton', function () {
                if(!Core.playerMoves()) { return; }
                skipTimeout = setTimeout(function() {
                    Core.nextMove(true);
                }, 1500);
            });
            $('body').mouseup('#skipMoveButton', function () {
                clearTimeout(skipTimeout);
                skipTimeout = null;
            });
        }

        this.showDialog = function (msgType, text) {
            $('#errorBar')
            .css({
                'bottom': '-18px',
                'background-color': msgType.getColor()
            })
            .text(text)
            .show()
            .animate({
                    'bottom': 0
                }, 300)
            .delay(3000)
            .fadeOut(300);
        };
        
        this.fillCell = function (x, y, elem) {
            var fieldSize = Field.getSize();
            if (x < 0 || x >= fieldSize[0] || y < 0 || y >= fieldSize[1]) { Error.init('B482D3CD7F38', [x, y]); return; }
            $('.fieldCell').eq(y * fieldSize[0] + x).html('<img class="elem" src="'+ elem.iconSmall +'" />');
        };

        this.clearCell = function (x, y) {
            var fieldSize = Field.getSize();
            if (x < 0 || x >= fieldSize[0] || y < 0 || y >= fieldSize[1]) { Error.init('B482D3CD7F38', [x, y]); return; }
            $('.fieldCell').eq(y * fieldSize[0] + x).empty();
        };

        this.activateItem = function() {

        };

        this.disableCell = function(x, y) {
            self().clearCell(x, y);
            $('.fieldCell[x="' + x + '"][y="' + y + '"]').addClass('disabled');
        };

        this.enableCell = function (x, y) {
            $('.fieldCell[x="' + x + '"][y="' + y + '"]').removeClass('disabled');
        };

        this.refreshCell = function (cell) {
        };

        _init();
    };
    
    var Language = new function() {
        this.EN = 'English';
        this.RU = '�������';
        this.DE = 'Deutsch';
    };
    
    var Localization = new function() {
        var L = Language.EN;
        
        this.changeLanguage = function() {
            var first = null;
            var found = false;
            for(var k in Language) {
                if(first === null) { first = Language[k]; }
                if(found === true) {
                    L = Language[k];
                    break;
                }
                if(L === Language[k]) {
                    found = true;
                }
            }
        };
        
        var list = new Object();
        list[Language.EN] = { };
        list[Language.RU] = {
            'Seed': '����',
            'Flower': '������',
            'Fruit': '����',
            'Weed Small': '����� ������',
            'Weed Medium': '������� ������',
            'Weed Large': '������� ������',
            'Bucket of water': '����� ����',
            'Fertilizers': '���������',
            'Poison': '��',
            'Rain': '�����',
            'Drought': '������',
            'Little Thieves': '�������'
        };
        list[Language.DE] = {};
        
        this.look = function(text) {
            if(typeof list[L][text] == 'string') {
                return list[text][L];
            }
            else {
                return text;
            }
        }
    };
    
    var Error = new function() {
        
        function self() { return this; }
        
        var _errors = {
            '0E755B21589E': 'Connection with server lost',
            '7065F38DB467': '"{0}" is not a correct color',
            '90AD8D84803A': 'Incorrect element',
            '7D1902C804C5': 'Incorrect item',
            'B482D3CD7F38': 'Cell coordinates ({0}, {1}) are out of bounds'
        };
        
        var _errorState = false;
        var _queue = new Array();
        
        this.init = function(code, args) {
            if(typeof _errors[code] == 'string') {
                _queue.push(_errors[code].format(args));
                if(!_errorState) {
                    _errorState = true;
                    _exec();
                }
            }
        };
        
        function _exec() {
            if(_queue.length == 0) {
                _errorState = false;
                return;
            }
            View.showDialog(MessageType.ERROR, _queue[0]);
            setTimeout(function() {
                _queue.splice(0, 1);
                _exec();
            }, 3700);
        }
    };
    
    var GameInfo = new function() {
        this.title = function() { return 'Grand Harvest'; };
        this.version = function() { return '0.0.5'; };
    };
};



