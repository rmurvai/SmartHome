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

const mqttConfig = {
  hostname: "127.0.0.1",
  port: 9001,
  clientId: "licentaFmi" + new Date().getUTCMilliseconds(),
  username: "",
  password: "",
  subscription: "sensors/#",
};

const sensorStates = {
  co: true,
  smoke: true,
  lpg: true,
  pir: true,
  hum: true,
  temp: true,
};

const maxSample = 30;

const charts = {
  CO: null,
  LPG: null,
  Smoke: null,
  Temp: null,
  PIR: null,
};

function createChart(ctx, type, labels, data, label, yAxisLabel) {
  return new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          label: label,
          type: "line",
          backgroundColor: "rgba(0,0,0,0.1)",
          borderColor: "rgba(0,0,0,0)",
        },
      ],
    },
    options: {
      animation: false,
      responsive: true,
      scales: {
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Seconds",
            },
            ticks: {
              maxRotation: 90,
              minRotation: 90,
            },
          },
        ],
        yAxes: {
          scaleLabel: {
            display: true,
            labelString: yAxisLabel,
          },
        },
      },
    },
  });
}

function CreateChartTemp(ctx, temp, humid) {
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
                data: temp,
                backgroundColor: 'rgb(75,192,192)',
                borderColor: 'rgba(0,0,0,0)'
            }, {
                label: 'Humidity %',
                data: humid,
                type: 'line',
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderColor:'rgba(0,0,0,0)'
            }]
        }
    });
    return myChart;
}

function CreateChartPir(ctx, pir) {
    var chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: map_timePir,
            datasets: [{
                data: pir,
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

function initializeCharts() {
    const ctxCO = document.getElementById("coChart").getContext("2d");
    const ctxLPG = document.getElementById("lpgChart").getContext("2d");
    const ctxSmoke = document.getElementById("smokeChart").getContext("2d");
    const ctxTemp = document.getElementById("tempChart").getContext("2d");
    const ctxPIR = document.getElementById("pirChart").getContext("2d");

    charts.CO = createChart(ctxCO, "bar", map_timeCO, map_co, "CO ppm concentration", "ppm");
    charts.LPG = createChart(ctxLPG, "bar", map_timeLPG, map_lpg, "LPG ppm concentration", "ppm");
    charts.Smoke = createChart(ctxSmoke, "bar", map_timeSmoke, map_smoke, "Smoke ppm concentration", "ppm");
    charts.Temp = CreateChartTemp(ctxTemp,map_temp,map_humidity);
    charts.PIR = CreateChartPir(ctxPIR,map_pir);

}

function toggleSensor(sensor) {
  sensorStates[sensor] = !sensorStates[sensor];
  updateSensorVisibility(sensor);
}

function updateSensorVisibility(sensor) {
  $(`#${sensor}_sensor`).children().each(function () {
    if (!$(this).hasClass("onoffswitch")) {
      if (sensorStates[sensor]) {
        $(this).addClass("opacity100").removeClass("opacity20");
      } else {
        $(this).addClass("opacity20").removeClass("opacity100");
      }
    }
  });
}

function displayMeasurement(id, data, text) {
  if (data === undefined) {
    $(`#${id}_safe`).hide();
    $(`#${id}_ignored`).show();
    $(`#${id}_risk`).hide();
    $(`#${id}`).hide();
    $(`#${id}_text_off`).show();

    return false;
  } else {
    $(`#${id}`).html(text);
    if (data.risk) {
      $(`#${id}_safe`).hide();
      $(`#${id}_ignored`).hide();
      $(`#${id}_risk`).show();
      $(`#${id}`).show();
      $(`#${id}_text_off`).hide();
      return true;
    } else {
      $(`#${id}_safe`).show();
      $(`#${id}_ignored`).hide();
      $(`#${id}_risk`).hide();
      $(`#${id}`).show();
      $(`#${id}_text_off`).hide();
      return false;
    }
  }
}

function addValueToMap(map, value) {
  if (map.length >= maxSample) {
    map.shift();
  }
  map.push(value);
  return map;
}

function onoff_sensor(sensor) {
  if (sensorStates[sensor]) {
    toggleSensor(sensor);
  } else {
    toggleSensor(sensor);
  }
}

function onoff_co() {
    onoff_sensor("co");
}
function onoff_smoke() {
    onoff_sensor("smoke");
}
function onoff_lpg() {
    onoff_sensor("lpg");
}
function onoff_pir() {
    onoff_sensor("pir");
}
function onoff_hum() {
    onoff_sensor("hum");
}
function onoff_temp() {
    onoff_sensor("temp");
}

function init() {
    initializeCharts();
    mqttClient = new Paho.MQTT.Client(mqttConfig.hostname, mqttConfig.port, mqttConfig.clientId);
    mqttClient.onMessageArrived = MessageArrived;
    mqttClient.onConnectionLost = ConnectionLost;
}

function Login() {
  mqttConfig.password = $('#password').val() || null;
  mqttConfig.username = $('#username').val() || null;

  Connect();
}

/*Initiates a connection to the MQTT broker*/
function Connect() {
  mqttClient.connect({
    onSuccess: Connected,
    onFailure: ConnectionFailed,
    keepAliveInterval: 10,
    userName: mqttConfig.username,
    password: mqttConfig.password,
  });
}

/*Callback for successful MQTT connection */
function Connected() {
  $('#connectionStatus').addClass('connectionStatusOk').removeClass('connectionStatusFailed');
  $('#connectionString').text('Connected to mqtt server');
  console.log("Connected");
  mqttClient.subscribe(mqttConfig.subscription);
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

/*Callback for incoming message processing */
function MessageArrived(message) {
  console.log(message.destinationName + " : " + message.payloadString);
  var obj = JSON.parse(message.payloadString);

  var isAtRisk = false;
  var aux;
  if (sensorStates.hum) {
    aux = displayMeasurement('humidity', obj.dht22.humidity, `Humidity is ${obj.dht22.humidity.value}%`);
    isAtRisk = isAtRisk || aux;
  }
  if (sensorStates.temp) {
    aux = displayMeasurement('temperature', obj.dht22.temperature, `Temperature is ${obj.dht22.temperature.value}°C`);
    isAtRisk = isAtRisk || aux;
  }
  if (sensorStates.temp || sensorStates.hum) {
    map_temp = addValueToMap(map_temp, obj.dht22.temperature.value);
    map_humidity = addValueToMap(map_humidity, obj.dht22.humidity.value);
    map_time = addValueToMap(map_time, moment().format('LTS'));
    charts.Temp.update();
  }

  if (sensorStates.lpg) {
    aux = displayMeasurement('lpg', obj.mq2.lpg, `LPG ppm concentration is ${obj.mq2.lpg.value}`);
    map_lpg = addValueToMap(map_lpg, obj.mq2.lpg.value);
    map_timeLPG = addValueToMap(map_timeLPG, moment().format('LTS'));
    charts.LPG.update();
    isAtRisk = isAtRisk || aux;
  }
  if (sensorStates.smoke) {
    aux = displayMeasurement('smoke', obj.mq2.smoke, `Smoke ppm concentration is ${obj.mq2.smoke.value}`);
    map_smoke = addValueToMap(map_smoke, obj.mq2.smoke.value);
    map_timeSmoke = addValueToMap(map_timeSmoke, moment().format('LTS'));
    charts.Smoke.update();
    isAtRisk = isAtRisk || aux;
  }
  if (sensorStates.co) {
    aux = displayMeasurement('co', obj.mq2.co, `CO ppm concentration is ${obj.mq2.co.value}`);
    map_co = addValueToMap(map_co, obj.mq2.co.value);
    map_timeCO = addValueToMap(map_timeCO, moment().format('LTS'));
    charts.CO.update();
    isAtRisk = isAtRisk || aux;
  }
  if (sensorStates.pir) {
    aux = displayMeasurement('pir', obj.pir.movement, `Movement is ${obj.pir.movement.value}`);
    map_pir = addValueToMap(map_pir, obj.pir.movement.value);
    map_timePir = addValueToMap(map_timePir, moment().format('LTS'));
    charts.PIR.update();
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