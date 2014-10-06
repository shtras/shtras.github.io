var trains = {
    swallow: {
        name: 'Swallow',
        speed: 60,
        acc: 9,
        wagons: 3,
    },
    raven: {
        name: 'Raven',
        speed: 85,
        acc: 2,
        wagons: 4,
    },
    rhino: {
        name: 'Rhinoceros',
        speed: 70,
        acc: 18,
        wagons: 4,
    },
    donkey: {
        name: 'Donkey',
        speed: 60,
        acc: 2,
        wagons: 6,
    },
    falcon: {
        name: 'Falcon',
        speed: 160,
        acc: 19,
        wagons: 4,
    },
    mole: {
        name: 'Mole',
        speed: 120,
        acc: 10,
        wagons: 5,
    },
    bat: {
        name: 'Bat',
        speed: 95,
        acc: 13,
        wagons: 6,
    },
    bear: {
        name: 'Black bear',
        speed: 75,
        acc: 13,
        wagons: 8,
    },
    panther: {
        name: 'Panther',
        speed: 180,
        acc: 3,
        wagons: 5
    },
    lynx: {
        name: 'Lynx',
        speed: 160,
        acc: 17,
        wagons: 5,
    },
    boar: {
        name: 'Boar',
        speed: 130,
        acc: 11,
        wagons: 6,
    },
    elephant: {
        name: 'Elephant',
        speed: 65,
        acc: 3,
        wagons: 11,
    },
    bull: {
        name: 'Bull',
        speed: 110,
        acc: 5,
        wagons: 7,
    },
};

var values = [
    'speed',
    'acc',
    'wagons',
];

function getTime(label) {
    var dbg1 = $("#wait_time").val();
    var dbg2 = $(label).val();
    var parts = $(label).val().split(':');
    return parseInt(parts[0])*60+parseInt(parts[1]);
}

function formatTime(val) {
    var time = Math.floor(val/60) + ':' + Math.floor(val%60);
    return time;
}

function getRefValue(value) {
    return $("#ref_"+value).val();
}

function getDesValue(value) {
    return $("#des_"+value).val();
}

function recalc() {
    var wTime = getTime("#wait_time");
    var rtt = getTime("#rtt");
    var oneWayTime = (rtt-wTime)/2;
    var accTime = getRefValue("speed")/getRefValue("acc");
    var length = getRefValue("acc")*accTime*accTime/2+getRefValue("speed")*(oneWayTime-accTime);
    var desAccTime = getDesValue("speed")/getDesValue("acc");
    var resTime = (length+getDesValue("speed")*desAccTime-getDesValue("acc")*desAccTime*desAccTime/2)/getDesValue("speed")*2 + wTime;
    $("#result").val(formatTime(resTime));
    var ph1 = parseInt($("#price").val())*(3600/rtt)*getRefValue("wagons");
    var ph2 = parseInt($("#price").val())*(3600/resTime)*getDesValue("wagons");
    $("#ph1").val(ph1.toFixed(2));
    $("#ph2").val(ph2.toFixed(2));
}

function initSelects() {
    for (var i in trains) {
        var train = trains[i];
        $("#ref_train").append($("<option></option>").attr("value", i).text(train.name));
        $("#des_train").append($("<option></option>").attr("value", i).text(train.name));
    }
    
    for (var i in values) {
        var value = values[i];
        $("#reference")
        .append(document.createTextNode(value+': '))
        .append($("<input/>").attr("id", "ref_"+value).change(function(){recalc()}));
    }
    
    for (var i in values) {
        var value = values[i];
        $("#desired")
        .append(document.createTextNode(value+': '))
        .append($("<input/>").attr("id", "des_"+value).change(function(){recalc()}));
    }
    updateValues('ref');
    updateValues('des');
}

function updateValues(prefix) {
    var train = trains[$("#"+prefix+"_train option:selected").val()];
    if (!train) {
        return;
    }
    
    for (var i in values) {
        var value = values[i];
        $("#"+prefix+'_'+value).val(train[value]);
    }
}

function registerCallbacks() {
    $("#ref_train").change(function() {
        updateValues("ref");
        recalc();
    });
    $("#des_train").change(function() {
        updateValues("des");
        recalc();
    });
    $("#wait_time").change(function(){recalc();});
    $("#rtt").change(function(){recalc();});
    $("#price").change(function(){recalc();});
}

$(document).ready(function() {
    initSelects();
    registerCallbacks();
});