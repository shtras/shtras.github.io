var values = [
    'speed',
    'acc',
    'wagons',
    'reliability',
    'price',
    'slots',
];

var trainCount = 0;
var stopCount = 1;
var firstResult = 0;
var firstResultIdx = -1;

function getTime(label) {
    var parts = $(label).val().split(':');
    return parseInt(parts[0])*60+parseInt(parts[1]);
}

function formatTime(val) {
    var time = Math.floor(val/60) + ':' + Math.floor(val%60);
    return time;
}

function showLoad() {
    $('#load_box').show();
}

function serializeTrain(id) {
    var res = {name: $("#train_"+id+" option:selected").val()};
    for (var i in values) {
        res[values[i]] = $('#'+values[i]+'_'+id).val();
    }
    return res;
}

function deserializeTrain(id, data) {
    $('#train_'+id).val(data.name);
    for (var i in values) {
        $('#'+values[i]+'_'+id).val(data[values[i]]);
    }
}

function clear() {
    while (stopCount > 2) {
        removeStop(1);
    }
    for (i=0; i<trainCount; ++i) {
        removeTrain(i);
    }
    trainCount = 0;    
}

function load() {
    $('#load_box').hide();
    clear();
    var test = $('#load_text').val();
    var data = JSON.parse($('#load_text').val());
    deserializeTrain('base', data.train);
    var i;
    for (i=0; i<data.trains.length; ++i) {
        addTrain();
        deserializeTrain(i, data.trains[i]);
    }
    $('#resprice_'+(1)).val(data.stops[0].price);
    for (i=1; i<data.stops.length; ++i) {
        addStop();
        $('#resprice_'+(i+1)).val(data.stops[i].price);
    }
    
    $('#cond_base').val(data.cond);
    $('#wait_time').val(data.wait_time);
    $('#rtt').val(data.rtt);
    $('#hours').val(data.hours);
    $('#init_cond').val(data.init_cond);
    updateAll();
}

function save() {
    var res = {
        train: serializeTrain('base'),
        cond: $('#cond_base').val(),
        wait_time: $('#wait_time').val(),
        rtt: $('#rtt').val(),
        hours: $('#hours').val(),
        init_cond: $('#init_cond').val(),
        stops: [],
        trains: [],
    };
    var i;
    for (i=1; i<stopCount; ++i) {
        res.stops.push({price: $('#resprice_'+i).val()});
    }
    for (i=0; i<trainCount; ++i) {
        if (!$("#block_"+i).length) {
            continue;
        }
        res.trains.push(serializeTrain(i));
    }
    alert(JSON.stringify(res));
}

function calcTrain(train, length, hours) {
    var init_cond = parseInt($("#init_cond").val());
    var condition = init_cond - (100 - train.reliability)*hours/24;
    var averageCond = (init_cond-condition)/2+condition;
    var accTime = train.speed/train.acc;
    var speed = train.speed*averageCond/100;
    //(x + v*t1*numStops - (a*t1^2/2)*numStops)/v
    var resTime = (length+speed*accTime*stopCount-train.acc*accTime*accTime/2*stopCount)/speed;
    return {time: resTime, cond: condition};
}

function updateLength(){
    var cond = parseInt($("#cond_base").val());
    var wTime = getTime("#wait_time");
    var rtt = getTime("#rtt");
    var netTime = (rtt-wTime);
    var speed = $("#speed_base").val()*cond/100;
    var acc = $("#acc_base").val();
    var hours = parseInt($("#hours").val());
    var accTime = speed/acc;
    //(a*t1^2/2)*numStops + v*t2
    //t2 = t - t1*numStops;
    var length = acc*accTime*accTime/2*stopCount+speed*(netTime-accTime*stopCount);
    $("#length").val(length.toFixed(2));
}

function approximateServicing(price, condition){
    if (condition>=99) {
        return 0;
    }
    var percentage = (0.25*(100-condition)+9.5)/100;
    return price*percentage;
}

function updateResult(id){
    if (!$("#block_"+id).length) {
        return;
    }
    if (id == firstResultIdx) {
        updateAll();
        return;
    }
    var train = {
        speed: parseInt($("#speed_"+id).val()),
        acc: parseInt($("#acc_"+id).val()),
        reliability: parseInt($("#reliability_"+id).val()),
        wagons: parseInt($("#wagons_"+id).val()),
        slots: parseInt($("#slots_"+id).val()),
    };
    var length = parseFloat($("#length").val());
    var hours = $("#hours").val();
    var res = calcTrain(train, length, hours);
    var time = res.time;
    var cond = res.cond;
    time += getTime('#wait_time');
    var resPrice = 0;
    for (var i=1; i<stopCount; ++i) {
        resPrice += parseInt($('#resprice_'+i).val());
    }
    var trainPrice = parseInt($("#price_"+id).val());
    var perHour = resPrice*(3600/time)*train.wagons;
    var income = perHour*hours;
    var servCost = approximateServicing(trainPrice, cond)/train.slots;
    var tonsPerHour = (3600/time)*train.wagons/train.slots;
    var tons = tonsPerHour * hours;
    var result = income/train.slots-servCost;
    var percent = 100;
    
    if (firstResultIdx == -1) {
        firstResultIdx = id;
        firstResult = result;
    } else {
        percent = result/firstResult*100;
    }
    
    $("#incomeph_"+id).val(perHour.toFixed(2));
    $("#income_"+id).val((income).toFixed(2));
    $("#condition_"+id).val(cond.toFixed(2));
    $("#trip_time_"+id).val(formatTime(time));
    $("#tons_"+id).val(tons.toFixed(0));
    $("#servcost_"+id).val(servCost.toFixed(0));
    $("#net_income_"+id).val((income-servCost).toFixed(2));
    $("#net_income_slot_"+id).val((result).toFixed(2));
    $("#comparison_"+id).val((percent).toFixed(2)+'%');
}

function removeTrain(id){
    if (!$("#block_"+id).length) {
        return;
    }
    $("#block_"+id).remove();
    if (firstResultIdx == id) {
        updateAll();
    }
}

function addResultBlock(id){
    var block = $("<div/>")
        .append($("<div/>").attr("class", "left")
            .append(document.createTextNode('Avg income/h')))
        .append($("<div/>").attr("class", "right")
            .append($("<input/>").attr('id', 'incomeph_'+id).attr('readonly', '')))
        .append($("<br/>"))
        .append($("<div/>").attr("class", "left")
            .append(document.createTextNode('Total Income')))
        .append($("<div/>").attr("class", "right")
            .append($("<input/>").attr('id', 'income_'+id).attr('readonly', '')))
        .append($("<br/>"))
        .append($("<div/>").attr("class", "left")
            .append(document.createTextNode('Avg trip time')))
        .append($("<div/>").attr("class", "right")
            .append($("<input/>").attr('id', 'trip_time_'+id).attr('readonly', '')))
        .append($("<br/>"))
        .append($("<div/>").attr("class", "left")
            .append(document.createTextNode('Tons/slot')))
        .append($("<div/>").attr("class", "right")
            .append($("<input/>").attr('id', 'tons_'+id).attr('readonly', '')))
        .append($("<br/>"))
        .append($("<div/>").attr("class", "left")
            .append(document.createTextNode('Condition')))
        .append($("<div/>").attr("class", "right")
            .append($("<input/>").attr('id', 'condition_'+id).attr('readonly', '')))
        .append($("<br/>"))
        .append($("<div/>").attr("class", "left")
            .append(document.createTextNode('Service/slot')))
        .append($("<div/>").attr("class", "right")
            .append($("<input/>").attr('id', 'servcost_'+id).attr('readonly', '')))
        .append($("<br/>"))
        .append($("<div/>").attr("class", "left")
            .append(document.createTextNode('Net Income')))
        .append($("<div/>").attr("class", "right")
            .append($("<input/>").attr('id', 'net_income_'+id).attr('readonly', '')))
        .append($("<br/>"))
        .append($("<div/>").attr("class", "left")
            .append(document.createTextNode('Net Inc/slot')))
        .append($("<div/>").attr("class", "right")
            .append($("<input/>").attr('id', 'net_income_slot_'+id).attr('readonly', '')))
        .append($("<br/>"))
        .append($("<div/>").attr("class", "left")
            .append(document.createTextNode('Comparison')))
        .append($("<div/>").attr("class", "right")
            .append($("<input/>").attr('id', 'comparison_'+id).attr('readonly', '')));
           
    return block;
}

function addStop() {
    var myCount = stopCount;
    var stopBlock = $("<div/>").attr("class", "train_details").attr("id", "stop_"+myCount)
    .append($("<div/>").attr("class", "left")
        .append(document.createTextNode('Resource price: '))
    ).append($("<div/>").attr("class", "right")
        .append($("<input/>").attr("id", 'resprice_'+myCount).val(0).change(function(){updateAll();})));
    $('#stops').append(stopBlock)
    .append($('<br/>').attr('id', 'br_'+myCount));
    ++stopCount;
    updateAll();
}

function removeStop() {
    if (stopCount == 2) {
        return;
    }
    --stopCount;
    $('#stop_'+stopCount).remove();
    $('#br_'+stopCount).remove();
    updateAll();
}

function createTrainSelect(id, remButton) {
    var select = $("<select/>").attr("id", 'train_'+id).change(function(){updateValues(id);updateResult(id);});
    for (var i in trains) {
        var train = trains[i];
        select.append($("<option></option>").attr("value", i).text(train.name));
    }
    var trainBlock = $("<div/>").attr("class", "train_details").attr("id", "block_"+id).append(select)
        .append($("<br/>"))
        .append($('<a/>').text('Show/hide details').attr('href', '#').click(function(event){
            event.preventDefault();
            $('#details_'+id).toggle();
        })).append($('<br/>'));
    
    var detailsDiv = $('<div/>').attr('id', 'details_'+id);
    for (var i in values) {
        var value = values[i];
        detailsDiv
        .append($("<div/>").attr("class", "left")
            .append(document.createTextNode(value+': '))
        ).append($("<div/>").attr("class", "right")
            .append($("<input/>").attr("id", value+'_'+id).change(function(){updateResult(id);}))
        ).append($("<br/>"));
    }
    detailsDiv.hide();
    trainBlock.append(detailsDiv);
    if (remButton) {
        trainBlock.append($("<input/>").attr('type', 'submit').val('Remove').click(function(){removeTrain(id);}));
        trainBlock.append(addResultBlock(id));
    }
    return trainBlock;
}

function addTrain() {
    var myCount = trainCount;
    var trainBlock = createTrainSelect(myCount, true);
    $("#trains_select").append(trainBlock);
    updateValues(myCount);
    ++trainCount;
}

function updateAll() {
    updateLength();
    firstResultIdx = -1;
    firstResult = 0;
    for (var i=0; i<trainCount; ++i) {
        updateResult(i);
    }
}

function initAll() {
    var trainBlock = createTrainSelect('base', false);
    $('#ref_train').append(trainBlock);
    addStop();
    updateValues('base');
}

function updateValues(suffix) {
    var train = trains[$("#train_"+suffix+" option:selected").val()];
    train.slots = train.slots||1;
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
    $("#init_cond").change(function(){updateAll();});
    $("#hours").change(function(){updateAll();});
    $("#recalc").click(function(){updateAll();});
    $("#add_train").click(function(){addTrain();});
    $("#add_stop").click(function(){addStop();});
    $("#remove_stop").click(function(){removeStop();});
    $("#save").click(function(){save();});
    $("#load").click(function(){showLoad();});
    $("#do_load").click(function(){load();});
}

$(document).ready(function() {
    initAll();
    registerCallbacks();
});
