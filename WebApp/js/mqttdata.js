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
var map_time = [0];
var map_timeCO = [0];
var map_timeLPG = [0];
var map_timeSmoke = [0];
var map_timePir = [0];
var map_temp = [0];
var map_humidity = [0];
var map_lpg = [{ x: new Date(), y: 0 }];
var map_co = [{ x: new Date(), y: 0 }];
var map_smoke = [{ x: new Date(), y: 0 }];
var map_pir = [{ x: new Date(), y: 0 }];


var chartCO, chartLPG, chartSmoke, chartTemp, chartPir;

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

// Function for create a line chart
function createChart(ctx, type, labels, data, label, yAxisLabel) {
    return new Chart(ctx, {
        type: type,
        data: {
            labels: labels,
            datasets: [{
                data: data,
                label: label,
                type: 'line',
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderColor: 'rgba(0,0,0,0)'
            }]
        },
        options: {
            animation: false,
            responsive: true,
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Seconds'
                    },
                    ticks: {
                        maxRotation: 90,
                        minRotation: 90
                    }
                }],
                yAxes: {
                    scaleLabel: {
                        display: true,
                        labelString: yAxisLabel
                    }
                }
            }
        }
    });
}

function CreateChartPir() {
    var ctx = document.getElementById('pirChart').getContext('2d');
    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: map_timePir,
            datasets: [{
                data: map_pir,
                label: 'Movement',
                type: 'bar',
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderColor:'rgba(0,0,0,0)'
            }]
        },
        options: {
            legend: {
                display: false
            },
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
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        suggestedMin: 0,
                        suggestedMax: 1,
                        stepSize: 1
                },
                gridLines: {
                    display: false
                }
            }]
            }
        }
    });
    return chart;
}

function addValueToMap(map, value) {
    if (map.length >= max_sample) {
        map.shift();
    }
    map.push(value);
    return map;
}

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

// Function to display measurment
function displayMeasurement(id, data, text) {
    var isAtRisk = false;
    if (data == undefined) {
        $(`#${id}_safe`).hide();
        $(`#${id}_ignored`).show();
        $(`#${id}_risk`).hide();
        $(`#${id}`).hide();
        $(`#${id}_text_off`).show();

        isAtRisk = false;
    } else {
        //var text = `${unit} concentration is ${data.value}`;
        $(`#${id}`).html(text);
        if (data.risk) {
            $(`#${id}_safe`).hide();
            $(`#${id}_ignored`).hide();
            $(`#${id}_risk`).show();
            $(`#${id}`).show();
            $(`#${id}_text_off`).hide();
            isAtRisk = true;
        } else {
            $(`#${id}_safe`).show();
            $(`#${id}_ignored`).hide();
            $(`#${id}_risk`).hide();
            $(`#${id}`).show();
            $(`#${id}_text_off`).hide();
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
        aux = displayMeasurement('humidity', obj.dht22.humidity, `Humidity is ${obj.dht22.humidity.value}%`);
        isAtRisk = isAtRisk || aux;
    }
    if (temp_state) {
        aux = displayMeasurement('temperature', obj.dht22.temperature, `Temperature is ${obj.dht22.temperature.value}&#8451;`);
        isAtRisk = isAtRisk || aux;
    }
    if (temp_state || hum_state)
    {
        map_temp = addValueToMap(map_temp, obj.dht22.temperature.value);
        map_humidity = addValueToMap(map_humidity, obj.dht22.humidity.value);
        map_time = addValueToMap(map_time, moment().format('LTS'));

        chartTemp.update();
    }

    if (lpg_state) {
        aux = displayMeasurement('lpg', obj.mq2.lpg, `LPG ppm concentration is ${obj.mq2.lpg.value}`);
        
        map_lpg = addValueToMap(map_lpg, obj.mq2.lpg.value);
        map_timeLPG = addValueToMap(map_timeLPG, moment().format('LTS'));

        chartLPG.update();
        isAtRisk = isAtRisk || aux;
    }
    if (smoke_state) {
        aux = displayMeasurement('smoke', obj.mq2.smoke, `Smoke ppm concentration is ${obj.mq2.smoke.value}`);
       
        map_smoke = addValueToMap(map_smoke, obj.mq2.smoke.value);
        map_timeSmoke = addValueToMap(map_timeLPG, moment().format('LTS'));

        chartSmoke.update();
        isAtRisk = isAtRisk || aux;
    }
    if (co_state) {
        aux = displayMeasurement('co', obj.mq2.co, `CO ppm concentration is ${obj.mq2.co.value}`);
        
        map_co = addValueToMap(map_co, obj.mq2.co.value);
        map_timeCO = addValueToMap(map_timeCO, moment().format('LTS'));

        chartCO.update();
        isAtRisk = isAtRisk || aux;
    }
    if (pir_state) {
        aux = displayMeasurement('pir', obj.pir.movement, `Movement is ${obj.pir.movement.value}`);
        
        map_pir = addValueToMap(map_pir, obj.pir.movement.value);
        map_timePir = addValueToMap(map_timePir, moment().format('LTS'));
        
        chartPir.update();
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

