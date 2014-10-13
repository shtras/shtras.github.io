var values = [
    'speed',
    'acc',
    'wagons',
    'reliability',
    'price',
    'service',
    'slots',
];

var trainCount = 0;
var stopCount = 1;

function getTime(label) {
    var parts = $(label).val().split(':');
    return parseInt(parts[0])*60+parseInt(parts[1]);
}

function formatTime(val) {
    var time = Math.floor(val/60) + ':' + Math.floor(val%60);
    return time;
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
    var servCost = approximateServicing(trainPrice, cond);
    $("#incomeph_"+id).val(perHour.toFixed(2));
    $("#income_"+id).val((income).toFixed(2));
    $("#condition_"+id).val(cond.toFixed(2));
    $("#trip_time_"+id).val(formatTime(time));
    $("#servcost_"+id).val(servCost.toFixed(0));
    $("#net_income_"+id).val((income-servCost).toFixed(2));
    $("#net_income_slot_"+id).val((income/train.slots-servCost).toFixed(2));
}

function removeTrain(id){
    $("#block_"+id).remove();
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
            .append(document.createTextNode('Condition')))
        .append($("<div/>").attr("class", "right")
            .append($("<input/>").attr('id', 'condition_'+id).attr('readonly', '')))
        .append($("<br/>"))
        .append($("<div/>").attr("class", "left")
            .append(document.createTextNode('Service cost')))
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
            .append($("<input/>").attr('id', 'net_income_slot_'+id).attr('readonly', '')));
           
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
    if (stopCount == 1) {
        return;
    }
    --stopCount;
    $('#stop_'+stopCount).remove();
    $('#br_'+stopCount).remove();
    updateAll();
}

function addTrain() {
    var myCount = trainCount;
    var select = $("<select/>").attr("id", 'train_'+myCount).change(function(){updateValues(myCount);updateResult(myCount);});
    for (var i in trains) {
        var train = trains[i];
        select.append($("<option></option>").attr("value", i).text(train.name));
    }
    var trainBlock = $("<div/>").attr("class", "train_details").attr("id", "block_"+myCount).append(select)
        .append($("<br/>"))
        .append($('<a/>').text('Show/hide details').attr('href', '#').click(function(event){
            event.preventDefault();
            $('#details_'+myCount).toggle();
        })).append($('<br/>'));
    
    var detailsDiv = $('<div/>').attr('id', 'details_'+myCount);
    for (var i in values) {
        var value = values[i];
        detailsDiv
        .append($("<div/>").attr("class", "left")
            .append(document.createTextNode(value+': '))
        ).append($("<div/>").attr("class", "right")
            .append($("<input/>").attr("id", value+'_'+myCount).change(function(){updateResult(myCount);}))
        ).append($("<br/>"));
    }
    detailsDiv.hide();
    trainBlock.append(detailsDiv);
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
            .append($("<input/>").attr("id", value+"_base").change(function(){udateAll();}))
        ).append($("<br/>"));
    }
    
    for (var i in values) {
        var value = values[i];
        $("#desired")
        .append(document.createTextNode(value+': '))
        .append($("<input/>").attr("id", "des_"+value).change(function(){udateAll();}));
    }
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
}

$(document).ready(function() {
    initAll();
    registerCallbacks();
});
