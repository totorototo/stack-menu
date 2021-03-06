# <img src="./public/logo192.png" width="24"> Ultra-Buddy

Ultra-Buddy is a progrossive web application dedicated for trail runner.

Onboarding worflow is quite simple: easy as 1,2,3!

1. Load trace (gpx, kml, ...),
2. Load timetable (csv),
3. enjoy!

Then you will be able to:

- spot runner on track (map),
- spot runner on elevation profile,
- display sections details,
- display current section details,
- follow trail runner progression.

Final thoughts:

- either works on phone, tablet or computer,
- totaly free,
- offline supported.

# Style

[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

# Continous integration

![Deploy to Now](https://badgen.net/badge/%E2%96%B2%20Deploy%20to%20Now/$%20now%20totorototo%2Fultra-buddy/black)

# Requirements

- node `^6.9.1`
- npm `^3.10.8`
- have a valid Mapbox account


# Getting Started

After confirming that your development environment meets the specified [requirements](#requirements), you can follow these steps to get the project up and running:

```bash
git clone https://github.com/totorototo/ultra-buddy.git
cd ultra-buddy
yarn install                           # Install project dependencies
```

# Mapbox configuration
- create an .env file into project root directory
- paste your MAPBOX public key inside your .env file and make sure to replace [AAA] with your key.

```bash
REACT_APP_MAPBOX_KEY=[AAA]
```


# Ignition

```bash
yarn start                     # Compile and launch packager
```

sample data could be found in /src/data

- gpx: /src/data/echappee_belle_2020.gpx
- csv: /src/data/echappee_belle2020.csv

# screen shots

<img src="./screenshots/wizard.png" width="200">
<img src="./screenshots/main.png" width="200">
<img src="./screenshots/map.png" width="200">
<img src="./screenshots/sections.png" width="200">
<img src="./screenshots/progression.png" width="200">
<img src="./screenshots/options.png" width="200">
<img src="./screenshots/stack-menu.png" width="200">

# Links:

- [Trail-Buddy](https://ultra-buddy.now.sh/)
- [Twiter](https://twitter.com/LLogicielle)
