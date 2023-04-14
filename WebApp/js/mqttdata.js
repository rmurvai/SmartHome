		var hostname = "127.0.0.1";
        var port = 9001;
        var clientId = "licentaFmi";
        clientId += new Date().getUTCMilliseconds();
        var username = "user";
        var password = "test";
        var subscription = "sensors/#";

        mqttClient = new Paho.MQTT.Client(hostname, port, clientId);
        mqttClient.onMessageArrived = MessageArrived;
        mqttClient.onConnectionLost = ConnectionLost;


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
}

/*Callback for failed connection*/
function ConnectionFailed(res) {
    $('#connectionStatus').addClass('connectionStatusFailed').removeClass('connectionStatusOk');
    $('#connectionString').text('Disconnected from mqtt server');
	console.log("Connect failed:" + res.errorMessage);
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
        humidity_text = humidity_text.replace('{0}', data);
        $('#humidity').text(humidity_text);
        if (data < 40) {
        
            $('#humidity_safe').hide();
            $('#humidity_ignored').hide();
            $('#humidity_risk').show();
            $('#humidity').show();
            $('#humidity_text_off').hide();
            
            isAtRisk = true;
        }
        else if (data <= 60) {
            $('#humidity_safe').show();
            $('#humidity_ignored').hide();
            $('#humidity_risk').hide();
            $('#humidity').show();
            $('#humidity_text_off').hide();
            
            isAtRisk = false;
        }
        else {
        
            $('#humidity_safe').hide();
            $('#humidity_ignored').hide();
            $('#humidity_risk').show();
            $('#humidity').show();
            $('#humidity_text_off').hide();
            isAtRisk = true;
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
        temperature_text = temperature_text.replace('{0}', data);
        $('#temperature').html(temperature_text);
        if (data < 8) {
        
            $('#temperature_safe').hide();
            $('#temperature_ignored').hide();
            $('#temperature_risk').show();
            $('#temperature').show();
            $('#temperature_text_off').hide();
            isAtRisk = true;
        }
        else if (data <= 35) {
            $('#temperature_safe').show();
            $('#temperature_ignored').hide();
            $('#temperature_risk').hide();
            $('#temperature').show();
            $('#temperature_text_off').hide();
            isAtRisk = false;
        }
        else {
        
            $('#temperature_safe').hide();
            $('#temperature_ignored').hide();
            $('#temperature_risk').show();
            $('#temperature').show();
            $('#temperature_text_off').hide();    
            isAtRisk = true;
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
        text = text.replace('{0}', data);
        $('#lpg').html(text);
        if (data <= 100) {
            $('#lpg_safe').show();
            $('#lpg_ignored').hide();
            $('#lpg_risk').hide();
            $('#lpg').show();
            $('#lpg_text_off').hide();
            isAtRisk = false;
        }
        else {
        
            $('#lpg_safe').hide();
            $('#lpg_ignored').hide();
            $('#lpg_risk').show();
            $('#lpg').show();
            $('#lpg_text_off').hide();    
            isAtRisk = true;
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
        text = text.replace('{0}', data);
        $('#smoke').html(text);
        if (data <= 100) {
            $('#smoke_safe').show();
            $('#smoke_ignored').hide();
            $('#smoke_risk').hide();
            $('#smoke').show();
            $('#smoke_text_off').hide();
            isAtRisk = false;
        }
        else {
        
            $('#smoke_safe').hide();
            $('#smoke_ignored').hide();
            $('#smoke_risk').show();
            $('#smoke').show();
            $('#smoke_text_off').hide();    
            isAtRisk = true;
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
        text = text.replace('{0}', data);
        $('#co').html(text);
        if (data <= 100) {
            $('#co_safe').show();
            $('#co_ignored').hide();
            $('#co_risk').hide();
            $('#co').show();
            $('#co_text_off').hide();
            isAtRisk = false;
        }
        else {
        
            $('#co_safe').hide();
            $('#co_ignored').hide();
            $('#co_risk').show();
            $('#co').show();
            $('#co_text_off').hide();    
            isAtRisk = true;
        }
    }
    return isAtRisk;
}

/*Callback for incoming message processing */
function MessageArrived(message) {
    console.log(message.destinationName + " : " + message.payloadString);
    var obj = JSON.parse(message.payloadString);

    var isAtRisk = false;
    isAtRisk = isAtRisk || DisplayHumidityMeasurement(obj.dht22.humidity);
    isAtRisk = isAtRisk || DisplayTemperatureMeasurement(obj.dht22.temperature);
    isAtRisk = isAtRisk || DisplayLPGMeasurement(obj.mq2.lpg);
    isAtRisk = isAtRisk || DisplaySmokeMeasurement(obj.mq2.smoke);
    isAtRisk = isAtRisk || DisplayCOMeasurement(obj.mq2.co);
        
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