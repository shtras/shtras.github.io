var trains = {
    swallow: {
        name: 'Swallow',
        speed: 60,
        acc: 9,
        wagons: 3,
        reliability: 60,
        price: 15000,
        service: 0,
    },
    raven: {
        name: 'Raven',
        speed: 85,
        acc: 2,
        wagons: 4,
        reliability: 50,
        price: 35000,
        service: 0,
    },
    rhino: {
        name: 'Rhinoceros',
        speed: 70,
        acc: 18,
        wagons: 4,
        reliability: 70,
        price: 70000,
        service: 0,
    },
    donkey: {
        name: 'Donkey',
        speed: 60,
        acc: 2,
        wagons: 7,
        reliability: 40,
        price: 100000,
        service: 0,
    },
    falcon: {
        name: 'Falcon',
        speed: 160,
        acc: 19,
        wagons: 4,
        reliability: 60,
        price: 135000,
        service: 0,
    },
    mole: {
        name: 'Mole',
        speed: 120,
        acc: 10,
        wagons: 5,
        reliability: 80,
        price: 150000,
        service: 0,
    },
    kite: {
        name: 'Red Kite',
        speed: 100,
        acc: 6,
        wagons: 6,
        reliability: 95,
        price: 0,
        service: 0,
    },
    bat: {
        name: 'Bat',
        speed: 95,
        acc: 13,
        wagons: 6,
        reliability: 50,
        price: 165000,
        service: 0,
    },
    panther: {
        name: 'Panther',
        speed: 180,
        acc: 3,
        wagons: 5,
        reliability: 85,
        price: 175000,
        service: 0,
    },
    bear: {
        name: 'Black bear',
        speed: 75,
        acc: 13,
        wagons: 8,
        reliability: 60,
        price: 200000,
        service: 0,
    },
    lynx: {
        name: 'Lynx',
        speed: 160,
        acc: 17,
        wagons: 5,
        reliability: 80,
        price: 150000,
        service: 0,
    },
    boar: {
        name: 'Boar',
        speed: 130,
        acc: 11,
        wagons: 6,
        reliability: 50,
        price: 225000,
        service: 0,
    },
    elephant: {
        name: 'Elephant',
        speed: 65,
        acc: 3,
        wagons: 11,
        reliability: 40,
        price: 300000,
        service: 0,
    },
    bull: {
        name: 'Bull',
        speed: 110,
        acc: 5,
        wagons: 7,
        reliability: 90,
        price: 0,
        service: 0,
    },
};

var values = [
    'speed',
    'acc',
    'wagons',
    'reliability',
    'price',
    'service',
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
    var refSpd = getRefValue("speed");
    var desSpd = getDesValue("speed");
    var refAcc = getRefValue("acc");
    var desAcc = getDesValue("acc");
    var hours = parseInt($("#hours").val());
    var desCond = 100-(100-getDesValue("reliability"))*hours/24;
    var averageCond = (100-desCond)/2+desCond;
    desSpd = desSpd*averageCond/100;
    var accTime = refSpd/refAcc;
    var length = refAcc*accTime*accTime/2+refSpd*(oneWayTime-accTime);
    var desAccTime = desSpd/desAcc;
    var resTime = (length+desSpd*desAccTime-desAcc*desAccTime*desAccTime/2)/desSpd*2 + wTime;
    var ph1 = parseInt($("#price").val())*(3600/rtt)*getRefValue("wagons");
    var ph2 = parseInt($("#price").val())*(3600/resTime)*getDesValue("wagons");
    $("#res").html('Reference income/h: '+ph1.toFixed(2)+'<br/>'+
                   'Average target income/h: '+ph2.toFixed(2)+'<br/>'+
                   'Net income: '+(ph2*hours).toFixed(2)+'<br/>'+
                   'Average trip time: '+formatTime(resTime)+'<br/>'+
                   'Condition in the end: '+desCond.toFixed(2)+'<br/>');
}

function initAll() {
    for (var i in trains) {
        var train = trains[i];
        $("#ref_train").append($("<option></option>").attr("value", i).text(train.name));
        $("#des_train").append($("<option></option>").attr("value", i).text(train.name));
        train.service = Math.round(train.price*0.17);
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
    $("#recalc").click(function(){recalc();});
}

$(document).ready(function() {
    initAll();
    registerCallbacks();
});