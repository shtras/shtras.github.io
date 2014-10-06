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

var trainCount=0;

function getTime(label) {
    var parts = $(label).val().split(':');
    return parseInt(parts[0])*60+parseInt(parts[1]);
}

function formatTime(val) {
    var time = Math.floor(val/60) + ':' + Math.floor(val%60);
    return time;
}

function calcTrain(train, length, hours) {
    var condition = 100 - (100 - train.reliability)*hours/24;
    var averageCond = (100-condition)/2+condition;
    var accTime = train.speed/train.acc;
    var speed = train.speed*averageCond/100;
    var resTime = (length+speed*accTime-train.acc*accTime*accTime/2)/speed*2;
    return {time: resTime, cond: condition};
}

function updateLength(){
    var cond = parseInt($("#cond_base").val());
    var wTime = getTime("#wait_time");
    var rtt = getTime("#rtt");
    var oneWayTime = (rtt-wTime)/2;
    var speed = $("#speed_base").val()*cond/100;
    var acc = $("#acc_base").val();
    var hours = parseInt($("#hours").val());
    var accTime = speed/acc;
    var length = acc*accTime*accTime/2+speed*(oneWayTime-accTime);
    $("#length").val(length);
}

function updateResult(id){
    var train = {
        speed: parseInt($("#speed_"+id).val()),
        acc: parseInt($("#acc_"+id).val()),
        reliability: parseInt($("#reliability_"+id).val()),
        wagons: parseInt($("#wagons_"+id).val()),
    };
    var length = parseFloat($("#length").val());
    var hours = $("#hours").val();
    var res = calcTrain(train, length, hours);
    var time = res.time;
    var cond = res.cond;
    time += getTime('#wait_time');
    var perHour = parseInt($("#price").val())*(3600/time)*train.wagons;
    $("#income_"+id).val(perHour.toFixed(2));
    $("#net_income_"+id).val((perHour*hours).toFixed(2));
    $("#condition_"+id).val(cond.toFixed(2));
    $("#trip_time_"+id).val(formatTime(time));
}

function removeTrain(id){
    $("#block_"+id).remove();
}

function addResultBlock(id){
    var block = $("<div/>")
        .append($("<div/>").attr("class", "left")
            .append(document.createTextNode('Avg income')))
        .append($("<div/>").attr("class", "right")
            .append($("<input/>").attr('id', 'income_'+id)))
        .append($("<br/>"))
        .append($("<div/>").attr("class", "left")
            .append(document.createTextNode('Net Income')))
        .append($("<div/>").attr("class", "right")
            .append($("<input/>").attr('id', 'net_income_'+id)))
        .append($("<br/>"))
        .append($("<div/>").attr("class", "left")
            .append(document.createTextNode('Avg trip time')))
        .append($("<div/>").attr("class", "right")
            .append($("<input/>").attr('id', 'trip_time_'+id)))
        .append($("<br/>"))
        .append($("<div/>").attr("class", "left")
            .append(document.createTextNode('Condition')))
        .append($("<div/>").attr("class", "right")
            .append($("<input/>").attr('id', 'condition_'+id)));
           
    return block;
}

function addTrain() {
    var myCount = trainCount;
    var select = $("<select/>").attr("id", 'train_'+myCount).change(function(){updateValues(myCount);updateResult(myCount);});
    for (var i in trains) {
        var train = trains[i];
        select.append($("<option></option>").attr("value", i).text(train.name));
    }
    var trainBlock = $("<div/>").attr("class", "train_details").attr("id", "block_"+myCount).append(select)
        .append($("<br/>"));
    
    for (var i in values) {
        var value = values[i];
        trainBlock
        .append($("<div/>").attr("class", "left")
            .append(document.createTextNode(value+': '))
        ).append($("<div/>").attr("class", "right")
            .append($("<input/>").attr("id", value+'_'+myCount).change(function(){updateResult(myCount)}))
        ).append($("<br/>"));
    }
    trainBlock.append($("<input/>").attr('type', 'submit').val('Remove').click(function(){removeTrain(myCount);}));
    trainBlock.append(addResultBlock(myCount));
    $("#trains_select").append(trainBlock);
    updateValues(myCount);
    ++trainCount;
}

function updateAll() {
    updateLength();
    for (var i=0; i<trainCount; ++i) {
        updateResult(i);
    }
}

function initAll() {
    for (var i in trains) {
        var train = trains[i];
        $("#train_base").append($("<option></option>").attr("value", i).text(train.name));
        train.service = Math.round(train.price*0.17);
    }
    
    for (var i in values) {
        var value = values[i];
        $("#reference")
        .append($("<div/>").attr("class", "left")
            .append(document.createTextNode(value+': '))
        ).append($("<div/>").attr("class", "right")
            .append($("<input/>").attr("id", value+"_base").change(function(){udateAll()}))
        ).append($("<br/>"));
    }
    
    for (var i in values) {
        var value = values[i];
        $("#desired")
        .append(document.createTextNode(value+': '))
        .append($("<input/>").attr("id", "des_"+value).change(function(){udateAll()}));
    }
    updateValues('base');
}

function updateValues(suffix) {
    var train = trains[$("#train_"+suffix+" option:selected").val()];
    if (!train) {
        return;
    }
    
    for (var i in values) {
        var value = values[i];
        $('#'+value+'_'+suffix).val(train[value]);
    }
}

function registerCallbacks() {
    $("#train_base").change(function() {
        updateValues("base");
        updateAll();
    });
    $("#wait_time").change(function(){updateAll();});
    $("#rtt").change(function(){updateAll();});
    $("#price").change(function(){updateAll();});
    $("#cond_base").change(function(){updateAll();});
    $("#hours").change(function(){updateAll();});
    $("#recalc").click(function(){updateAll();});
    $("#add_train").click(function(){addTrain();});
}

$(document).ready(function() {
    initAll();
    registerCallbacks();
});
