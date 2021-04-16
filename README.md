# Ubit Gesture Mapper

<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-8-orange.svg?style=for-the-badge)](#contributors)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

[![micro:bit](https://img.shields.io/badge/micro%3Abit-v2-%2300ED00?style=for-the-badge&logo=micro:bit)](https://microbit.org/new-microbit/)
[![Node](https://img.shields.io/badge/Node-v14+-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v17-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Redux](https://img.shields.io/badge/Redux-v7.2-764ABC?style=for-the-badge&logo=redux)](https://redux.js.org/)
[![Python](https://img.shields.io/badge/Python-3-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2-FF6F00?style=for-the-badge&logo=TensorFlow)](https://www.tensorflow.org/)

## Installing

### Client

```bash
cd client
npm i
```

### Server

It is recommended to use a python virtual environment or similar to avoid all the dependancies being added system wide to your python install.

To do this on windows:

```bash
cd server
python -m venv venv
venv\Sripts\activate
```

Note the script to activate the venv may be slightly different on other platforms.

Then installing the dependancies once the virtual environment is active:

```bash
pip install -r requirements.txt
```

Also if you're installing right now you'll need to ensure the database is created before it can be used. From the venv run:

```bash
python database.py
```

Should be good to go then. This will be unnecessary with a future change.

## Running

To run both the client and server respectively it is:

```bash
cd client
npm start
```

```bash
cd server
flask run
```

### Ngrok

Both the server and the client need to be ngrokked. Also the ngrokked url needs to be set in the client. Currently that url is located at the top of client/src/features/recorder/Recorder.txt

```bash
npm install --global ngrok
```

```bash
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

## All Contributors ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/maxlkin"><img src="https://avatars.githubusercontent.com/u/16273613?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Max Larkin</b></sub></a><br /><a href="https://github.com/WIT-IoT-Apps-2021/ubit-gesture-mapper/commits?author=maxlkin" title="Code">💻</a> <a href="#ideas-maxlkin" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/DylanGore"><img src="https://avatars.githubusercontent.com/u/2760449?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dylan Gore</b></sub></a><br /><a href="https://github.com/WIT-IoT-Apps-2021/ubit-gesture-mapper/commits?author=DylanGore" title="Code">💻</a> <a href="#ideas-DylanGore" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/JackP2112"><img src="https://avatars.githubusercontent.com/u/35736615?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jack Power</b></sub></a><br /><a href="#ideas-JackP2112" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/aaccttrr"><img src="https://avatars.githubusercontent.com/u/34109635?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Adam Cotter</b></sub></a><br /><a href="#ideas-aaccttrr" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/robert-solomon12"><img src="https://avatars.githubusercontent.com/u/35696882?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Robert Solomon</b></sub></a><br /><a href="#ideas-robert-solomon12" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/junshuong"><img src="https://avatars.githubusercontent.com/u/45827759?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jun-Shuo Ng</b></sub></a><br /><a href="#ideas-junshuong" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://www.wit.ie/"><img src="https://avatars.githubusercontent.com/u/48127747?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ashraf Mustafa</b></sub></a><br /><a href="#ideas-ashraf-mustafa" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/ewanhills"><img src="https://avatars.githubusercontent.com/u/23585924?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ewan Hills</b></sub></a><br /><a href="#ideas-ewanhills" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
