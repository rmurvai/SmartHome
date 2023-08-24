var hostname = "127.0.0.1";
var port = 9001;
var clientId = "licentaFmi";
clientId += new Date().getUTCMilliseconds();
var username = "";
var password = "";
var subscription = "sensors/#";
    
mqttClient = new Paho.MQTT.Client(hostname, port, clientId);
mqttClient.onMessageArrived = MessageArrived;
mqttClient.onConnectionLost = ConnectionLost;
    
function Login()
{
    password = $('#password').val() || null;
    username = $('#username').val() || null;
  
    Connect();
}




var max_sample = 30;
var map_time = new Array();
map_time.push(0);

var map_timeCO = new Array();
map_timeCO.push(0);

var map_timeLPG = new Array();
map_timeLPG.push(0);

var map_timeSmoke = new Array();
map_timeSmoke.push(0);

var map_timePir = new Array();
map_timePir.push(0);

var map_temp = new Array();
map_temp.push(0);

var map_humidity = new Array();
map_humidity.push(0);

var map_lpg = new Array();
map_lpg.push({ x: new Date(), y: 0 });

var map_co = new Array();
map_co.push({ x: new Date(), y: 0 });

var map_smoke = new Array();
map_smoke.push({ x: new Date(), y: 0 });

function CreateChartTemp() {
    var ctx = document.getElementById('tempChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        options: {
            legend: {
                display: true,
                labels: {
                    fontColor: 'black',
                    xAxisID: 'Time'
                }
            },
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Humidity % / Temperature \u00b0C"
                    },
                    ticks: {
                        suggestedMin: 0,    // minimum will be 0, unless there is a lower value.
                        // OR //
                        beginAtZero: true,   // minimum value will be 0.
                        suggestedMax:100
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        lavelString:'Seconds'
                    },
                    ticks: {
                        maxRotation: 90,
                        minRotation: 90
                    }
                }]
            }
        },
        data: {
            labels: map_time,
            datasets: [{
                label: "Temperature \u00b0C",
                data: map_temp,
                backgroundColor: 'rgb(75,192,192)',
                borderColor: 'rgba(0,0,0,0)'
            }, {
                label: 'Humidity %',
                data: map_humidity,
                type: 'line',
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderColor:'rgba(0,0,0,0)'
            }]
        }
    });
    return myChart;
}
var chartTemp;

function CreateChartCO() {
    var ctx = document.getElementById('coChart').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: map_timeCO,
            datasets: [{
                data: map_co,
                label: 'CO ppm',
                type: 'line',
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderColor:'rgba(0,0,0,0)'
            }]
        },
        options: {
            animation: false,
            responsive: true,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        lavelString:'Seconds'
                    },
                    ticks: {
                        maxRotation: 90,
                        minRotation: 90
                    }
                }],
                yAxes: {
                    scaleLabel: {
                        display: true,
                        labelString: 'CO ppm'
                    },
                }
            }
        }
    });
    return chart;
}
var chartCO;

function CreateChartLPG() {
    var ctx = document.getElementById('lpgChart').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: map_timeLPG,
            datasets: [{
                data: map_lpg,
                label: 'LPG ppm',
                type: 'line',
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderColor:'rgba(0,0,0,0)'
            }]
        },
        options: {
            animation: false,
            responsive: true,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        lavelString:'Seconds'
                    },
                    ticks: {
                        maxRotation: 90,
                        minRotation: 90
                    }
                }],
                yAxes: {
                    scaleLabel: {
                        display: true,
                        labelString: 'LPG ppm'
                    },
                }
            }
        }
    });
    return chart;
}
var chartLPG;

function CreateChartSmoke() {
    var ctx = document.getElementById('smokeChart').getContext('2d');
        var chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: map_timeSmoke,
            datasets: [{
                data: map_lpg,
                label: 'Smoke ppm',
                type: 'line',
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderColor:'rgba(0,0,0,0)'
            }]
        },
        options: {
            animation: false,
            responsive: true,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        lavelString:'Seconds'
                    },
                    ticks: {
                        maxRotation: 90,
                        minRotation: 90
                    }
                }],
                yAxes: {
                    scaleLabel: {
                        display: true,
                        labelString: 'Smoke ppm'
                    },
                }
            }
        }
    });
    return chart;
}
var chartSmoke;

function CreateChartPir() {
    var ctx = document.getElementById('pirChart').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: map_timePir,
            datasets: [{
                data: map_lpg,
                label: 'Movement',
                type: 'bar',
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderColor:'rgba(0,0,0,0)'
            }]
        },
        options: {
            animation: false,
            responsive: true,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        lavelString:'Seconds'
                    },
                    ticks: {
                        maxRotation: 90,
                        minRotation: 90
                    }
                }],
                yAxes: {
                    scaleLabel: {
                        display: true,
                        labelString: 'Movement'
                    },
                }
            }
        }
    });
    return chart;
}
var chartPir;

var co_state = true;
function onoff_co() {
    if (co_state) {
        co_state = false;
        $('#co_sensor').children().each(function () {
            if ($(this).hasClass("onoffswitch") == false) {
                $(this).addClass('opacity20').removeClass('opacity100');
            }
        });

    } else {
        co_state = true;
        $('#co_sensor').children().each(function () {
            if ($(this).hasClass("onoffswitch")== false) {
                $(this).addClass('opacity100').removeClass('opacity20');
            }
        });
    }
}

var smoke_state = true;
function onoff_smoke() {
    if (smoke_state) {
        smoke_state = false;
         $('#smoke_sensor').children().each(function () {
            if ($(this).hasClass("onoffswitch") == false) {
                $(this).addClass('opacity20').removeClass('opacity100');
            }
        });
        
    } else {
        smoke_state = true;
        $('#smoke_sensor').children().each(function () {
            if ($(this).hasClass("onoffswitch")== false) {
                $(this).addClass('opacity100').removeClass('opacity20');
            }
        });
    }
}


var lpg_state = true;
function onoff_lpg() {
    if (lpg_state) {
        lpg_state = false;
        $('#lpg_sensor').children().each(function () {
            if ($(this).hasClass("onoffswitch") == false) {
                $(this).addClass('opacity20').removeClass('opacity100');
            }
        });
        
    } else {
        lpg_state = true;
        $('#lpg_sensor').children().each(function () {
            if ($(this).hasClass("onoffswitch")== false) {
                $(this).addClass('opacity100').removeClass('opacity20');
            }
        });
    }
}


var pir_state = true;
function onoff_pir() {
    if (pir_state) {
        pir_state = false;
        $('#pir_sensor').children().each(function () {
            if ($(this).hasClass("onoffswitch") == false) {
                $(this).addClass('opacity20').removeClass('opacity100');
            }
        });
        
    } else {
        pir_state = true;
        $('#pir_sensor').children().each(function () {
            if ($(this).hasClass("onoffswitch")== false) {
                $(this).addClass('opacity100').removeClass('opacity20');
            }
        });
    }
}


var hum_state = true;
function onoff_hum() {
    if (hum_state) {
        hum_state = false;
        $('#hum_sensor').children().each(function () {
            if ($(this).hasClass("onoffswitch") == false) {
                $(this).addClass('opacity20').removeClass('opacity100');
            }
        });
        
    } else {
        hum_state = true;
        $('#hum_sensor').children().each(function () {
            if ($(this).hasClass("onoffswitch")== false) {
                $(this).addClass('opacity100').removeClass('opacity20');
            }
        });
    }
}


var temp_state = true;
function onoff_temp() {
    if (temp_state) {
        temp_state = false;
        $('#temp_sensor').children().each(function () {
            if ($(this).hasClass("onoffswitch") == false) {
                $(this).addClass('opacity20').removeClass('opacity100');
            }
        });
        
    } else {
        temp_state = true;
        $('#temp_sensor').children().each(function () {
            if ($(this).hasClass("onoffswitch")== false) {
                $(this).addClass('opacity100').removeClass('opacity20');
            }
        });
    }
}

/*Initiates a connection to the MQTT broker*/
function Connect(){
	mqttClient.connect({
	onSuccess: Connected,
	onFailure: ConnectionFailed,
	keepAliveInterval: 10,
	userName: username,
	password: password});
}

/*Callback for successful MQTT connection */
function Connected() {
    $('#connectionStatus').addClass('connectionStatusOk').removeClass('connectionStatusFailed');
    $('#connectionString').text('Connected to mqtt server');
	console.log("Connected");
    mqttClient.subscribe(subscription);
    if ($('#left_pic').hasClass("grayscaleblur") == true) {
        $('#left_pic').removeClass('grayscaleblur');
    }
    if ($('#sensors').hasClass("grayscaleblur") == true) {
        $('#sensors').removeClass('grayscaleblur');
    }
    $('#logindiv').hide();
}

/*Callback for failed connection*/
function ConnectionFailed(res) {
    $('#connectionStatus').addClass('connectionStatusFailed').removeClass('connectionStatusOk');
    $('#connectionString').text('Failed to connect to mqtt server');
    console.log("Connect failed:" + res.errorMessage);
    $('#password').val('');
    $('#username').val('');
    if ($('#left_pic').hasClass("grayscaleblur") == false) {
        $('#left_pic').addClass('grayscaleblur');
    }
    if ($('#sensors').hasClass("grayscaleblur") == false) {
        $('#sensors').addClass('grayscaleblur');
    }
    $('#logindiv').show();
}

/*Callback for lost connection*/
function ConnectionLost(res) {
	if (res.errorCode !== 0) {
		console.log("Connection lost:" + res.errorMessage);
		Connect();
	}
}

function DisplayHumidityMeasurement(data) {
    var isAtRisk = false;
    if (data == undefined) {
        $('#humidity_safe').hide();
        $('#humidity_ignored').show();
        $('#humidity_risk').hide();
        $('#humidity').hide();
        $('#humidity_text_off').show();
        
        isAtRisk = false;
    }
    else {
        var humidity_text = 'Humidity is {0}%';
        humidity_text = humidity_text.replace('{0}', data.value);
        $('#humidity').text(humidity_text);
        if (data.risk) {
        
            $('#humidity_safe').hide();
            $('#humidity_ignored').hide();
            $('#humidity_risk').show();
            $('#humidity').show();
            $('#humidity_text_off').hide();
            
            isAtRisk = true;
        }
        else {
            $('#humidity_safe').show();
            $('#humidity_ignored').hide();
            $('#humidity_risk').hide();
            $('#humidity').show();
            $('#humidity_text_off').hide();
            
            isAtRisk = false;
        }
    }
    return isAtRisk;
}

function DisplayTemperatureMeasurement(data) {
    var isAtRisk = false;
    if (data == undefined) {
        $('#temperature_safe').hide();
        $('#temperature_ignored').show();
        $('#temperature_risk').hide();
        $('#temperature').hide();
        $('#temperature_text_off').show();
        
        isAtRisk = false;
    }
    else {
        var temperature_text = 'Temperature is {0} &#8451;';
        temperature_text = temperature_text.replace('{0}', data.value);
        $('#temperature').html(temperature_text);
        if (data.risk) {
        
            $('#temperature_safe').hide();
            $('#temperature_ignored').hide();
            $('#temperature_risk').show();
            $('#temperature').show();
            $('#temperature_text_off').hide();
            isAtRisk = true;
        }
        else {
            $('#temperature_safe').show();
            $('#temperature_ignored').hide();
            $('#temperature_risk').hide();
            $('#temperature').show();
            $('#temperature_text_off').hide();
            isAtRisk = false;
        }
    }
    return isAtRisk;
}

function DisplayLPGMeasurement(data)
{
    isAtRisk = false;
    if (data == undefined) {
        $('#lpg_safe').hide();
        $('#lpg_ignored').show();
        $('#lpg_risk').hide();
        $('#lpg').hide();
        $('#lpg_text_off').show();
        
        isAtRisk = false;
    }
    else {
        var text = 'LPG ppm concentration is {0}';
        text = text.replace('{0}', data.value);
        $('#lpg').html(text);
        if (data.risk){
            $('#lpg_safe').hide();
            $('#lpg_ignored').hide();
            $('#lpg_risk').show();
            $('#lpg').show();
            $('#lpg_text_off').hide();    
            isAtRisk = true;
        }
        else {
            $('#lpg_safe').show();
            $('#lpg_ignored').hide();
            $('#lpg_risk').hide();
            $('#lpg').show();
            $('#lpg_text_off').hide();
            isAtRisk = false;
        }
    }
    return isAtRisk;
}

function DisplaySmokeMeasurement(data)
{
    var isAtRisk = false;
    if (data == undefined) {
        $('#smoke_safe').hide();
        $('#smoke_ignored').show();
        $('#smoke_risk').hide();
        $('#smoke').hide();
        $('#smoke_text_off').show();
        
        isAtRisk = false;
    }
    else {
        var text = 'Smoke ppm concentration is {0}';
        text = text.replace('{0}', data.value);
        $('#smoke').html(text);
        if (data.risk){
        
            $('#smoke_safe').hide();
            $('#smoke_ignored').hide();
            $('#smoke_risk').show();
            $('#smoke').show();
            $('#smoke_text_off').hide();    
            isAtRisk = true;
        }
        else {
            $('#smoke_safe').show();
            $('#smoke_ignored').hide();
            $('#smoke_risk').hide();
            $('#smoke').show();
            $('#smoke_text_off').hide();
            isAtRisk = false;
        }
    }
    return isAtRisk;
}

function DisplayCOMeasurement(data)
{
    var isAtRisk = false;
    if (data == undefined) {
        $('#co_safe').hide();
        $('#co_ignored').show();
        $('#co_risk').hide();
        $('#co').hide();
        $('#co_text_off').show();
        
        isAtRisk = false;
    }
    else {
        //https://www.kidde.com/home-safety/en/us/support/help-center/browse-articles/articles/what-are-the-carbon-monoxide-levels-that-will-sound-the-alarm.html
        var text = 'CO ppm concentration is {0}';
        text = text.replace('{0}', data.value);
        $('#co').html(text);
        if (data.risk) {
        
            $('#co_safe').hide();
            $('#co_ignored').hide();
            $('#co_risk').show();
            $('#co').show();
            $('#co_text_off').hide();    
            isAtRisk = true;
        }
        else {
            $('#co_safe').show();
            $('#co_ignored').hide();
            $('#co_risk').hide();
            $('#co').show();
            $('#co_text_off').hide();
            isAtRisk = false;
        }
    }
    return isAtRisk;
}


/*Callback for incoming message processing */
function MessageArrived(message) {
    console.log(message.destinationName + " : " + message.payloadString);
    var obj = JSON.parse(message.payloadString);

    var isAtRisk = false;
    var aux;
    if (hum_state) {
        aux = DisplayHumidityMeasurement(obj.dht22.humidity);
        //map_humidity = AddValueToMap(map_humidity, obj.dht22.humidity.value);
        isAtRisk = isAtRisk || aux;
    }
    if (temp_state) {
        aux = DisplayTemperatureMeasurement(obj.dht22.temperature);
        
        
        isAtRisk = isAtRisk || aux;
    }
    if (temp_state || hum_state)
    {
        if (map_temp.length >= max_sample) {
            map_temp.shift();
            map_humidity.shift();
            map_time.shift();
        }
        map_temp.push(obj.dht22.temperature.value);
        map_humidity.push(obj.dht22.humidity.value);
        map_time.push(moment().format('LTS'));

        chartTemp.update();
    }

    if (lpg_state) {
        aux = DisplayLPGMeasurement(obj.mq2.lpg);
        if (map_lpg.length >= max_sample) {
            map_lpg.shift();
            map_timeLPG.shift();
        }
        map_lpg.push(obj.mq2.lpg.value);
        map_timeLPG.push(moment().format('LTS'));

        chartLPG.update();
        isAtRisk = isAtRisk || aux;
    }
    if (smoke_state) {
        aux = DisplaySmokeMeasurement(obj.mq2.smoke);
        if (map_smoke.length >= max_sample) {
            map_smoke.shift();
            map_timeSmoke.shift();
        }
        map_smoke.push(obj.mq2.smoke.value);
        map_timeSmoke.push(moment().format('LTS'));

        chartSmoke.update();
        isAtRisk = isAtRisk || aux;
    }
    if (co_state) {
        aux = DisplayCOMeasurement(obj.mq2.co);
        if (map_co.length >= max_sample) {
            map_co.shift();
            map_timeCO.shift();
        }
        map_co.push(obj.mq2.co.value);
        map_timeCO.push(moment().format('LTS'));

        chartCO.update();

        isAtRisk = isAtRisk || aux;
    }

    if (isAtRisk) {
        $('#right_pic_safe').hide();
        $('#right_text_safe').hide();
        $('#right_text_ignored').hide();
        $('#right_pic_ignored').hide();
        $('#right_pic_risk').show();
        $('#right_text_risk').show();
    } else {
        $('#right_pic_safe').show();
        $('#right_text_safe').show();
        $('#right_text_ignored').hide();
        $('#right_pic_ignored').hide();
        $('#right_pic_risk').hide();
        $('#right_text_risk').hide();
    }
}

