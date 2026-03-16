const e=`{
  "title": "Solar & Renewable Energy",
  "subtitle": "A clean-energy board covering solar, wind, storage, and the grid.",
  "teams": [
    {
      "id": "team-1",
      "name": "Sun Team"
    },
    {
      "id": "team-2",
      "name": "Wind Team"
    },
    {
      "id": "team-3",
      "name": "Grid Team"
    }
  ],
  "categories": [
    {
      "id": "cat-solar",
      "title": "Solar Basics",
      "clues": [
        {
          "id": "solar-100",
          "value": 100,
          "answer": "This rooftop technology uses photovoltaic panels to make electricity from sunlight.",
          "question": "What is solar power?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Electrical_and_Mechanical_Services_Department_Headquarters_Photovoltaics.jpg/1280px-Electrical_and_Mechanical_Services_Department_Headquarters_Photovoltaics.jpg",
              "alt": "Illustration or photo for solar power"
            }
          ]
        },
        {
          "id": "solar-200",
          "value": 200,
          "answer": "This element, common in sand, is used in many solar cells.",
          "question": "What is silicon?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/SiliconCroda.jpg/960px-SiliconCroda.jpg",
              "alt": "Photo or illustration for silicon"
            }
          ]
        },
        {
          "id": "solar-300",
          "value": 300,
          "answer": "This measure describes the power of sunlight hitting a given area.",
          "question": "What is solar irradiance?"
        },
        {
          "id": "solar-400",
          "value": 400,
          "answer": "A field of many solar panels working together is often called this.",
          "question": "What is a solar array?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/SoSie%2BSoSchiff_Ansicht.jpg/1280px-SoSie%2BSoSchiff_Ansicht.jpg",
              "alt": "Photo or illustration for a solar array"
            }
          ]
        },
        {
          "id": "solar-500",
          "value": 500,
          "answer": "This type of solar plant uses mirrors to concentrate sunlight into heat before generating electricity.",
          "question": "What is concentrated solar power?",
          "dailyDouble": true,
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Crescent_Dunes_Solar_December_2014.JPG/1280px-Crescent_Dunes_Solar_December_2014.JPG",
              "alt": "Photo or illustration for concentrated solar power"
            }
          ]
        }
      ]
    },
    {
      "id": "cat-wind-water",
      "title": "Wind & Water",
      "clues": [
        {
          "id": "wind-water-100",
          "value": 100,
          "answer": "Inside a wind turbine, this machine converts rotation into electricity.",
          "question": "What is a generator?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Modern_Steam_Turbine_Generator.jpg/1280px-Modern_Steam_Turbine_Generator.jpg",
              "alt": "Photo or illustration for an electric generator"
            }
          ]
        },
        {
          "id": "wind-water-200",
          "value": 200,
          "answer": "Hydroelectric plants use moving water to spin this component.",
          "question": "What is a turbine?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Dampfturbine_Montage01.jpg/1280px-Dampfturbine_Montage01.jpg",
              "alt": "Photo or illustration for a turbine"
            }
          ]
        },
        {
          "id": "wind-water-300",
          "value": 300,
          "answer": "This famous dam on the Colorado River produces hydroelectric power for the American Southwest.",
          "question": "What is Hoover Dam?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Ansel_Adams_-_National_Archives_79-AAB-01.jpg/1280px-Ansel_Adams_-_National_Archives_79-AAB-01.jpg",
              "alt": "Photo of Hoover Dam"
            }
          ]
        },
        {
          "id": "wind-water-400",
          "value": 400,
          "answer": "Wind farms built in coastal waters are described with this one-word location term.",
          "question": "What is offshore?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Alpha_Ventus_Windmills.JPG/1280px-Alpha_Ventus_Windmills.JPG",
              "alt": "Photo or illustration for offshore wind power"
            }
          ]
        },
        {
          "id": "wind-water-500",
          "value": 500,
          "answer": "This term compares a power plant's actual output to its maximum possible output over time.",
          "question": "What is capacity factor?"
        }
      ]
    },
    {
      "id": "cat-storage",
      "title": "Energy Storage",
      "clues": [
        {
          "id": "storage-100",
          "value": 100,
          "answer": "These rechargeable packs help store solar power for later use in homes and on the grid.",
          "question": "What are batteries?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Li_ion_laptop_battery.jpg/1280px-Li_ion_laptop_battery.jpg",
              "alt": "Photo or illustration for battery storage"
            }
          ]
        },
        {
          "id": "storage-200",
          "value": 200,
          "answer": "This unit, often shortened to kWh, measures stored or used electrical energy.",
          "question": "What is a kilowatt-hour?"
        },
        {
          "id": "storage-300",
          "value": 300,
          "answer": "This process uses electricity to split water into hydrogen and oxygen.",
          "question": "What is electrolysis?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Hofmann_voltameter_fr.svg/1280px-Hofmann_voltameter_fr.svg.png",
              "alt": "Illustration for electrolysis"
            }
          ]
        },
        {
          "id": "storage-400",
          "value": 400,
          "answer": "Pumped-storage hydro works by moving water uphill to store this kind of energy.",
          "question": "What is potential energy?"
        },
        {
          "id": "storage-500",
          "value": 500,
          "answer": "This term describes using many distributed batteries, EVs, or devices together like one coordinated power resource.",
          "question": "What is a virtual power plant?"
        }
      ]
    },
    {
      "id": "cat-grid",
      "title": "Grid & Efficiency",
      "clues": [
        {
          "id": "grid-100",
          "value": 100,
          "answer": "LED bulbs use less of this than incandescent bulbs for similar light.",
          "question": "What is electricity?"
        },
        {
          "id": "grid-200",
          "value": 200,
          "answer": "This device converts solar panels' DC electricity into the AC used by most buildings.",
          "question": "What is an inverter?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/M%C3%BCllberg_Speyer_-_2.JPG/1280px-M%C3%BCllberg_Speyer_-_2.JPG",
              "alt": "Photo or illustration for a power inverter"
            }
          ]
        },
        {
          "id": "grid-300",
          "value": 300,
          "answer": "Homes may receive bill credits under this policy for extra solar power sent back to the grid.",
          "question": "What is net metering?"
        },
        {
          "id": "grid-400",
          "value": 400,
          "answer": "Long-distance power lines usually operate at this type of voltage to reduce losses.",
          "question": "What is high voltage?"
        },
        {
          "id": "grid-500",
          "value": 500,
          "answer": "This highly efficient electric appliance moves heat instead of creating it with direct resistance.",
          "question": "What is a heat pump?"
        }
      ]
    },
    {
      "id": "cat-climate",
      "title": "Climate & Policy",
      "clues": [
        {
          "id": "climate-100",
          "value": 100,
          "answer": "Renewables generally emit far less of this greenhouse gas than coal when generating electricity.",
          "question": "What is carbon dioxide?"
        },
        {
          "id": "climate-200",
          "value": 200,
          "answer": "This 2015 international climate pact aims to limit global warming.",
          "question": "What is the Paris Agreement?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/ParisAgreement.svg/1280px-ParisAgreement.svg.png",
              "alt": "Image or logo for the Paris Agreement"
            }
          ]
        },
        {
          "id": "climate-300",
          "value": 300,
          "answer": "Utilities may face this type of standard requiring a share of their electricity to come from renewables.",
          "question": "What is a renewable portfolio standard?"
        },
        {
          "id": "climate-400",
          "value": 400,
          "answer": "This market-based system limits emissions and lets companies trade allowances.",
          "question": "What is cap-and-trade?"
        },
        {
          "id": "climate-500",
          "value": 500,
          "answer": "In the United States, this 2022 law created major clean-energy tax incentives; its initials are IRA.",
          "question": "What is the Inflation Reduction Act?"
        }
      ]
    },
    {
      "id": "cat-clean-tech",
      "title": "Clean Tech",
      "clues": [
        {
          "id": "clean-tech-100",
          "value": 100,
          "answer": "EV stands for this kind of vehicle.",
          "question": "What is an electric vehicle?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/IBMTorontoSoftwareLabEVChargers4.jpg/1280px-IBMTorontoSoftwareLabEVChargers4.jpg",
              "alt": "Photo of an electric vehicle"
            }
          ]
        },
        {
          "id": "clean-tech-200",
          "value": 200,
          "answer": "This renewable source taps heat from beneath Earth's surface.",
          "question": "What is geothermal energy?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/NesjavellirPowerPlant_edit2.jpg/1280px-NesjavellirPowerPlant_edit2.jpg",
              "alt": "Photo or illustration for geothermal energy"
            }
          ]
        },
        {
          "id": "clean-tech-300",
          "value": 300,
          "answer": "Biogas is often produced when organic waste breaks down without this gas.",
          "question": "What is oxygen?"
        },
        {
          "id": "clean-tech-400",
          "value": 400,
          "answer": "Recovering materials from used solar panels, batteries, and electronics is called this.",
          "question": "What is recycling?"
        },
        {
          "id": "clean-tech-500",
          "value": 500,
          "answer": "This term describes a smarter electricity system that uses sensors, software, and automation to respond to demand.",
          "question": "What is a smart grid?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Staying_big_or_getting_smaller.jpg/1280px-Staying_big_or_getting_smaller.jpg",
              "alt": "Illustration for a smart grid"
            }
          ]
        }
      ]
    }
  ],
  "settings": {
    "subtractOnIncorrect": true,
    "enableLocalStorage": true,
    "storageKey": "work-jeopardy-solar-renewables",
    "sounds": {
      "enabled": true,
      "volume": 0.85
    }
  },
  "finalJeopardy": {
    "enabled": true,
    "category": "Solar Terms",
    "clue": "This effect, named for light and electricity, lets many panels convert sunlight directly into electrical current.",
    "correctResponse": "What is the photovoltaic effect?",
    "timerSeconds": 30,
    "allowNonPositiveScores": false
  }
}
`;export{e as default};
