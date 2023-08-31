import logging.config
import configparser
import asyncio
import PySimpleGUI as sg
import MQTTPublisher
import SensorReader

def CreateGui(config):
    sg.theme('BlueMono')

    # Column layout
    col_left = [[sg.Text('Serial')],
        [sg.Text('Port', pad=(50, 0), size=(15, 1)),
            sg.InputText(size=(30, 1), key='_Port_')],
        [sg.Text('Baudrate', pad=(50, 0), size=(15, 1)),
            sg.InputText(size=(30, 1), key='_Baudrate_')],
        [sg.Text('Timeout', pad=(50, 0), size=(15, 1)),
            sg.InputText(size=(30, 1),key='_Timeout_')],
        [sg.Text('*Test_debug', pad=(50, 0), size=(15, 1)),
            sg.InputText(size=(30, 1),key='_debug_')],
        [sg.Text('Mqtt')],
        [sg.Text('Host', pad=(50, 0), size=(15, 1)),
            sg.InputText(size=(30, 1),key='_mHost_')],
        [sg.Text('Port', pad=(50, 0), size=(15, 1)),
            sg.InputText(size=(30, 1),key='_mPort_')],
        [sg.Text('Username', pad=(50, 0), size=(15, 1)),
            sg.InputText(size=(30, 1),key='_mUser_')],
        [sg.Text('Password', pad=(50, 0), size=(15, 1)),
            sg.InputText(password_char='*', size=(30, 1),key='_mPass_')],
        [sg.Text('Topic', pad=(50, 0), size=(15, 1)), sg.InputText(size=(30, 1),key='_mTopic_')]]
    col_right = [[sg.Text('Logging')],
            [sg.Text('Level', pad=(50, 0), size=(15, 1)),
            sg.InputText(size=(30, 1),key='_level_')],
            [sg.Text('Mail')],
            [sg.Text('From', pad=(50, 0), size=(15, 1)),
            sg.InputText(size=(30, 1),key='_From_')],
            [sg.Text('To', pad=(50, 0), size=(15, 1)), sg.InputText(size=(30, 1),key='_To_')],
            [sg.Text('key', pad=(50, 0), size=(15, 1)),
            sg.InputText(size=(30, 1),key='_key_', password_char='*')],
            [sg.Text('Notification timeout', pad=(50, 0), size=(15, 1)), sg.InputText(size=(30, 1),key='_mTime_')]]

    # Window layout
    layout = [[sg.Column(col_left, p=0),
            sg.VerticalSeparator(pad=20),
            sg.Column(col_right, p=0)],
            [sg.Text('Output data:')],
            [sg.Output(size=(150, 10), key='-OUTPUT-')],
        [sg.Button('Clear'), sg.Button('Load Defaults'), sg.Button('Load Saved'), sg.Button('Save'), sg.Button('Run')]]

    # Display the window and get values
    window = sg.Window('Run SmartHome', layout,
                    margins=(0, 0), element_padding=(0, 0))
    
    return window

def LoadDefaults(config):
    config["serial"] = {
        "port" : 'COM3',
        "baudrate" : '9600',
        "timeout" : '1',
        "isTest" : 'true'
    }

    config["mqtt"] = {
        "host" : 'localhost',
        "port" : '1883',
        "username" : 'user',
        "password" : 'test',
        "topic" : 'sensors'
    }

    config["logging"] = {
        "level" : 'INFO'
    }

    config["mail"] = {
        "from" : 'alertasenzoriarduino@gmail.com',
        "to" : 'rmurvai@gmail.com',
        "key" : '',
        "notificationTime" : '300'
    }

def populate(window, config):
    window['_Port_'].Update(config["serial"]["port"])
    window['_Baudrate_'].Update(config["serial"]["baudrate"])
    window['_Timeout_'].Update(config["serial"]["timeout"])
    window['_debug_'].Update(config["serial"]["isTest"])

    window['_mHost_'].Update(config["mqtt"]["host"])
    window['_mPort_'].Update(config["mqtt"]["port"])
    window['_mUser_'].Update(config["mqtt"]["username"])
    window['_mPass_'].Update(config["mqtt"]["password"])
    window['_mTopic_'].Update(config["mqtt"]["topic"])

    window['_level_'].Update(config["logging"]["level"])

    window['_From_'].Update(config["mail"]["from"])
    window['_To_'].Update(config["mail"]["to"])
    window['_key_'].Update(config["mail"]["key"])
    window['_mTime_'].Update(config["mail"]["notificationTime"])


def SaveValuesToConfig(values, config):
    config["serial"]["port"] = values['_Port_']
    config["serial"]["baudrate"] = values['_Baudrate_']
    config["serial"]["timeout"] = values['_Timeout_']
    config["serial"]["isTest"] = values['_debug_']

    config["mqtt"]["host"] = values['_mHost_']
    config["mqtt"]["port"] = values['_mPort_']
    config["mqtt"]["username"] = values['_mUser_']
    config["mqtt"]["password"] = values['_mPass_']
    config["mqtt"]["topic"] = values['_mTopic_']

    config["logging"]["level"] = values['_level_']

    config["mail"]["from"] = values['_From_']
    config["mail"]["to"] = values['_To_']
    config["mail"]["key"] = values['_key_']
    config["mail"]["notificationTime"] = values['_mTime_']


def asyncronReadAndPublishData(config):
    asyncio.run(ReadAndPublishData(config))


async def ReadAndPublishData(config):
    # Configure logging
    logging.basicConfig(
        level=config.get("logging", "level", fallback="INFO"),
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[logging.StreamHandler()],
    )

    # Instantiate SensorReader and MqttPublisher objects
    async with SensorReader.SensorReader(config["serial"]["port"],
                            int(config["serial"]["baudrate"]),
                            int(config["serial"]["timeout"])) as sensor_reader:
        mqtt_publisher = MQTTPublisher.WebPublisher(config["mqtt"]["host"],
                                    int(config["mqtt"]["port"]),
                                    config["mqtt"]["username"],
                                    config["mqtt"]["password"],
                                    config["mail"]["key"],
                                    config["mail"]["from"],
                                    config["mail"]["to"],
                                    int(config["mail"]["notificationTime"]))

        # Start read and publish tasks
        topic = config["mqtt"]["topic"]
        tasks = [read_and_publish(sensor_reader, mqtt_publisher, topic)]
        await asyncio.gather(*tasks)

async def read_and_publish(sensor_reader, mqtt_publisher, topic):
    while True:
        data = await sensor_reader.read_data()
        if data is not None:
            await mqtt_publisher.publish(topic, data)

def main():
    # read if we have config.ini, if not load default
    config = configparser.ConfigParser()
    try:
        readed = config.read("config.ini")
        if not readed:
            LoadDefaults(config)
            with open('config.ini', 'w') as configfile:    # save
                config.write(configfile)
    except Exception:
        print("error reading config file, load default")
        LoadDefaults(config)
        with open('config.ini', 'w') as configfile:    # save
            config.write(configfile)

    #create the gui
    window = CreateGui(config)
        
    while True:             # Event Loop
        event, values = window.read()
        if values and values['_Port_']:
            SaveValuesToConfig(values, config)

        #print(event, values)
        if event in (sg.WIN_CLOSED, 'Exit'):
            #save the config
            with open('config.ini', 'w') as configfile:    # save
                config.write(configfile)
            break
        if event == 'Clear':
            window['-OUTPUT-'].update('')
        if event == 'Load Defaults':
            LoadDefaults(config)
            with open('config.ini', 'w') as configfile:    # save
                config.write(configfile)
            print("Loaded succesfull default configuration and saved to the configuration file!")
            # populate the gui
            populate(window, config)
        if event == 'Load Saved':
            try:
                config.read("config.ini")
                print("Loaded succesfull configuration file!")
            except Exception:
                print("Error reading config file, load default")
                LoadDefaults(config)
                with open('config.ini', 'w') as configfile:    # save
                    config.write(configfile)
            # populate the gui
            populate(window, config)
        if event == 'Save':
            with open('config.ini', 'w') as configfile:    # save
                config.write(configfile)
                print("Configuration saved!")
        if event == 'Run':
            window.perform_long_operation(lambda:
                                          asyncronReadAndPublishData(config),
                                          '-END KEY-')
            
    window.close()

if __name__ == "__main__":
    main()
