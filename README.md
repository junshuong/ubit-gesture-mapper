# Ubit Gesture Mapper

## Installing

### Client
```
cd client
npm i
```

### Server
It is recommended to use a python virtual environment or similar to avoid all the dependancies being added system wide to your python install.

To do this on windows:
```
cd server
python -m venv venv
venv\Sripts\activate
```
Note the script to activate the venv may be slightly different on other platforms.

Then installing the dependancies once the virtual environment is active:
```
pip install -r requirements.txt
```

Also if you're installing right now you'll need to ensure the database is created before it can be used. From the venv run:

```
python database.py
```
Should be good to go then. This will be unnecessary with a future change.

## Running

To run both the client and server respectively it is:
```
cd client
npm start
```

```
cd server
flask run
```

### Ngrok
Both the server and the client need to be ngrokked. Also the ngrokked url needs to be set in the client. Currently that url is located at the top of client/src/features/recorder/Recorder.txt

```
npm install --global ngrok
```

```
ngrok http -region=eu 8080
```

Note default ports of server and client are 5000 and 8000 respectively.

## Garbage that needs to be done

- [ ] Remove some boilerplate code still hanging around.
- [x] Update this readme with more garbage to be done.
- [ ] Create new page to store different modules, where they can be created, access their training, and map to some sound.
  - [ ] Creation of models to allow name identifier, count of relevant frames (Maybe this needs to be a general amount to make things easier. We are always collecting these ticks anyway, so always run through the 100 ticks? I don't think that this would decrease accuracy on models that only need simple gestures i.e. ones that can be seen in ~20 ticks)
  - [ ] Accessing training of models at any time to provide more data (if user identifies poor model accuracy, allow them to train further.)
- [ ] Encode models on the server to pass to the client.
  - [ ] Saving of models on the server.
- [ ] Upgrade the models from their very simplistic current model.
- [ ] Add tensorflow js to the client and create a component to work with it. Ez.
  - [ ] Handle conversion of realtime data to tensors to feed into the model.
  - [ ] Pass out the results to be used by other components.
- [ ] Create a bunch of bad training data.
- [ ] Audio component
  - [ ] Handle a number of different audio sounds/files
  - [ ] Play them according to the state of the currently active model.

---

## Contributions and Thanks
This project was developed by Internet of Things Applications class 2021 taught by Jason Berry.

Based and influenced by code from https://github.com/WIT-IoT-Apps-2021/microbit-ble-vue
