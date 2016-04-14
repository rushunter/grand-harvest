var Language = new function () {
    this.EN = 'English';
    this.RU = 'Русский';
    this.DE = 'Deutsch';
};

var Localization = new function () {
    var L = Language.RU;

    this.changeLanguage = function () {
        var first = null;
        var found = false;
        for (var k in Language) {
            if (first === null) {
                first = Language[k];
            }
            if (found === true) {
                L = Language[k];
                break;
            }
            if (L === Language[k]) {
                found = true;
            }
        }
    };

    var list = new Object();
    list[Language.EN] = {};
    list[Language.RU] = {
        'seed': 'Семя',
        'flower': 'Цветок',
        'fruit': 'Плод',
        'weed small': 'Малый сорняк',
        'weed medium': 'Средний сорняк',
        'weed large': 'Большой сорняк',
        'bucket of water': 'Ведро воды',
        'fertilizers': 'Удобрения',
        'poison': 'Яд',
        'rain': 'Дождь',
        'drought': 'Засуха',
        'little thieves': 'Воришки',
        'achievement unlocked!': 'Открыто достижение!',
        'first steps': 'Первые шаги'
    };
    list[Language.DE] = {};

    this.look = function (text) {
        if (typeof list[L][text.toLowerCase()] == 'string') {
            return list[L][text.toLowerCase()];
        }
        else {
            return text;
        }
    };
};