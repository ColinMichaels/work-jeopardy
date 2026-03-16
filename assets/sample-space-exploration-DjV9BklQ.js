const n=`{
  "title": "Space Exploration Challenge",
  "subtitle": "A science-forward board about planets, missions, and life beyond Earth's atmosphere.",
  "teams": [
    {
      "id": "team-1",
      "name": "Orbit Team"
    },
    {
      "id": "team-2",
      "name": "Nova Team"
    },
    {
      "id": "team-3",
      "name": "Comet Team"
    }
  ],
  "categories": [
    {
      "id": "cat-planets",
      "title": "Planets",
      "clues": [
        {
          "id": "planets-100",
          "value": 100,
          "answer": "This planet is closest to the Sun.",
          "question": "What is Mercury?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mercury_in_true_color.jpg/960px-Mercury_in_true_color.jpg",
              "alt": "Planet image for Mercury"
            },
            {
              "type": "video",
              "src": "https://www.youtube.com/watch?v=B588JHKSlEE",
              "alt": "NASA or official educational video about Mercury"
            },
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mercury_in_true_color.jpg/330px-Mercury_in_true_color.jpg",
              "alt": "Planet image for Mercury"
            }
          ]
        },
        {
          "id": "planets-200",
          "value": 200,
          "answer": "This planet is famous for its Great Red Spot.",
          "question": "What is Jupiter?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Jupiter_OPAL_2024.png/1280px-Jupiter_OPAL_2024.png",
              "alt": "Planet image for Jupiter"
            },
            {
              "type": "video",
              "src": "https://www.youtube.com/watch?v=BsQLy1ft8M4",
              "alt": "NASA or official educational video about Jupiter"
            },
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Jupiter_OPAL_2024.png/330px-Jupiter_OPAL_2024.png",
              "alt": "Planet image for Jupiter"
            }
          ]
        },
        {
          "id": "planets-300",
          "value": 300,
          "answer": "This planet has the largest rings in the solar system.",
          "question": "What is Saturn?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/1280px-Saturn_during_Equinox.jpg",
              "alt": "Planet image for Saturn"
            },
            {
              "type": "video",
              "src": "https://www.youtube.com/watch?v=epZdZaEQhS0",
              "alt": "NASA or official educational video about Saturn"
            },
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/330px-Saturn_during_Equinox.jpg",
              "alt": "Planet image for Saturn"
            }
          ]
        },
        {
          "id": "planets-400",
          "value": 400,
          "answer": "This dwarf planet lies in the Kuiper Belt and was once classified as the ninth planet.",
          "question": "What is Pluto?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Pluto_in_True_Color_-_High-Res.png/1280px-Pluto_in_True_Color_-_High-Res.png",
              "alt": "Planet image for Pluto"
            },
            {
              "type": "video",
              "src": "https://www.youtube.com/watch?v=6l4kr36TzQ4",
              "alt": "NASA or official educational video about Pluto"
            },
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Pluto_in_True_Color_-_High-Res.png/330px-Pluto_in_True_Color_-_High-Res.png",
              "alt": "Planet image for Pluto"
            }
          ]
        },
        {
          "id": "planets-500",
          "value": 500,
          "answer": "This planet rotates on its side with an axial tilt of about 98 degrees.",
          "question": "What is Uranus?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Uranus_Voyager2_color_calibrated.png/500px-Uranus_Voyager2_color_calibrated.png",
              "alt": "Planet image for Uranus"
            },
            {
              "type": "video",
              "src": "https://www.youtube.com/watch?v=6dcfxVydbQY",
              "alt": "NASA or official educational video about Uranus"
            },
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Uranus_Voyager2_color_calibrated.png/330px-Uranus_Voyager2_color_calibrated.png",
              "alt": "Planet image for Uranus"
            }
          ]
        }
      ]
    },
    {
      "id": "cat-moon-mars",
      "title": "Moon & Mars",
      "clues": [
        {
          "id": "moon-mars-100",
          "value": 100,
          "answer": "This natural satellite orbits Earth.",
          "question": "What is the Moon?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/1280px-FullMoon2010.jpg",
              "alt": "Moon image for Earth’s natural satellite"
            },
            {
              "type": "video",
              "src": "https://www.youtube.com/watch?v=Ke6XX8FHOHM",
              "alt": "NASA or official educational video about the Moon"
            }
          ]
        },
        {
          "id": "moon-mars-200",
          "value": 200,
          "answer": "This U.S. program first landed humans on the Moon.",
          "question": "What is Apollo?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Apollo_program.svg/1280px-Apollo_program.svg.png",
              "alt": "Program image for Apollo"
            },
            {
              "type": "video",
              "src": "https://www.youtube.com/watch?v=55Jas5HrzcQ",
              "alt": "NASA or official video about the Apollo program"
            }
          ]
        },
        {
          "id": "moon-mars-300",
          "value": 300,
          "answer": "This small aircraft carried by Perseverance made the first powered flights on another planet.",
          "question": "What is Ingenuity?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Mars_helicopter_on_sol_46.png/500px-Mars_helicopter_on_sol_46.png",
              "alt": "Mission image for Ingenuity"
            },
            {
              "type": "video",
              "src": "https://www.youtube.com/watch?v=7HfzKXO7N_w",
              "alt": "NASA or official video about Ingenuity"
            }
          ]
        },
        {
          "id": "moon-mars-400",
          "value": 400,
          "answer": "This nickname is often used for Mars because of iron oxide on its surface.",
          "question": "What is the Red Planet?"
        },
        {
          "id": "moon-mars-500",
          "value": 500,
          "answer": "This giant canyon system on Mars is far larger than the Grand Canyon.",
          "question": "What is Valles Marineris?"
        }
      ]
    },
    {
      "id": "cat-spacecraft",
      "title": "Spacecraft",
      "clues": [
        {
          "id": "spacecraft-100",
          "value": 100,
          "answer": "This reusable U.S. vehicle flew NASA missions from 1981 to 2011.",
          "question": "What is the Space Shuttle?"
        },
        {
          "id": "spacecraft-200",
          "value": 200,
          "answer": "This device allows a spacecraft to change speed or direction in space.",
          "question": "What is a thruster?"
        },
        {
          "id": "spacecraft-300",
          "value": 300,
          "answer": "This kind of rocket booster or stage is designed to be used again.",
          "question": "What is a reusable rocket?"
        },
        {
          "id": "spacecraft-400",
          "value": 400,
          "answer": "This telescope launched in 2021 observes mainly in infrared and is named after a NASA administrator.",
          "question": "What is the James Webb Space Telescope?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/JWST_spacecraft_model_3.png/500px-JWST_spacecraft_model_3.png",
              "alt": "Mission image for the James Webb Space Telescope"
            },
            {
              "type": "video",
              "src": "https://www.youtube.com/watch?v=1C_zuHf6lP4",
              "alt": "NASA or official video about the James Webb Space Telescope"
            }
          ]
        },
        {
          "id": "spacecraft-500",
          "value": 500,
          "answer": "This two-word maneuver uses a planet's gravity to change a spacecraft's speed and path.",
          "question": "What is a gravity assist?",
          "dailyDouble": true
        }
      ]
    },
    {
      "id": "cat-astronomy",
      "title": "Astronomy",
      "clues": [
        {
          "id": "astronomy-100",
          "value": 100,
          "answer": "This star is at the center of our solar system.",
          "question": "What is the Sun?"
        },
        {
          "id": "astronomy-200",
          "value": 200,
          "answer": "This path followed by a planet or satellite around another body is called this.",
          "question": "What is an orbit?"
        },
        {
          "id": "astronomy-300",
          "value": 300,
          "answer": "This term describes the explosion marking the death of some massive stars.",
          "question": "What is a supernova?"
        },
        {
          "id": "astronomy-400",
          "value": 400,
          "answer": "This galaxy contains our solar system.",
          "question": "What is the Milky Way?"
        },
        {
          "id": "astronomy-500",
          "value": 500,
          "answer": "This invisible form of matter is inferred from gravity but does not emit light.",
          "question": "What is dark matter?"
        }
      ]
    },
    {
      "id": "cat-missions",
      "title": "Famous Missions",
      "clues": [
        {
          "id": "missions-100",
          "value": 100,
          "answer": "This Voyager spacecraft became the first human-made object to enter interstellar space.",
          "question": "What is Voyager 1?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Voyager_spacecraft_model.png/1280px-Voyager_spacecraft_model.png",
              "alt": "Mission image for Voyager 1"
            },
            {
              "type": "video",
              "src": "https://www.youtube.com/watch?v=aty-PMtS7Dc",
              "alt": "NASA or official video about Voyager 1"
            },
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Voyager_spacecraft_model.png/330px-Voyager_spacecraft_model.png",
              "alt": "Mission image for Voyager 1"
            }
          ]
        },
        {
          "id": "missions-200",
          "value": 200,
          "answer": "This probe took the first close-up images of Pluto in 2015.",
          "question": "What is New Horizons?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/New_Horizons_spacecraft_model_1.png/500px-New_Horizons_spacecraft_model_1.png",
              "alt": "Mission image for New Horizons"
            },
            {
              "type": "video",
              "src": "https://www.youtube.com/watch?v=EJxwWpaGoJs",
              "alt": "NASA or official video about New Horizons"
            },
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/New_Horizons_spacecraft_model_1.png/330px-New_Horizons_spacecraft_model_1.png",
              "alt": "Mission image for New Horizons"
            }
          ]
        },
        {
          "id": "missions-300",
          "value": 300,
          "answer": "This NASA mission returned a sample from asteroid Bennu to Earth.",
          "question": "What is OSIRIS-REx?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/OSIRIS-REx_spacecraft_model.png/1280px-OSIRIS-REx_spacecraft_model.png",
              "alt": "Mission image for OSIRIS-REx"
            },
            {
              "type": "video",
              "src": "https://www.youtube.com/watch?v=NYGHbl_esgw",
              "alt": "NASA or official video about OSIRIS-REx"
            },
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/OSIRIS-REx_spacecraft_model.png/330px-OSIRIS-REx_spacecraft_model.png",
              "alt": "Mission image for OSIRIS-REx"
            }
          ]
        },
        {
          "id": "missions-400",
          "value": 400,
          "answer": "This rover explores Mars in and around Jezero Crater.",
          "question": "What is Perseverance?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Perseverance-Selfie-at-Rochette-Horizontal-V2.gif/1280px-Perseverance-Selfie-at-Rochette-Horizontal-V2.gif",
              "alt": "Mission image for Perseverance"
            },
            {
              "type": "video",
              "src": "https://www.youtube.com/watch?v=SAPaWLQbU_s",
              "alt": "NASA or official video about Perseverance"
            },
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Perseverance-Selfie-at-Rochette-Horizontal-V2.gif/330px-Perseverance-Selfie-at-Rochette-Horizontal-V2.gif",
              "alt": "Mission image for Perseverance"
            }
          ]
        },
        {
          "id": "missions-500",
          "value": 500,
          "answer": "This Soviet-era program placed Yuri Gagarin into orbit in 1961.",
          "question": "What is Vostok?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Vostok_spacecraft.jpg/1280px-Vostok_spacecraft.jpg",
              "alt": "Mission image for the Vostok programme"
            },
            {
              "type": "video",
              "src": "https://www.youtube.com/watch?v=KANuFlelQ5k",
              "alt": "Historical or official video about Yuri Gagarin and Vostok"
            },
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Vostok_spacecraft.jpg/330px-Vostok_spacecraft.jpg",
              "alt": "Mission image for the Vostok programme"
            }
          ]
        }
      ]
    },
    {
      "id": "cat-orbits",
      "title": "Satellites & Orbits",
      "clues": [
        {
          "id": "orbits-100",
          "value": 100,
          "answer": "GPS and weather craft are examples of artificial versions of these objects.",
          "question": "What are satellites?"
        },
        {
          "id": "orbits-200",
          "value": 200,
          "answer": "ISS stands for this multinational orbiting laboratory.",
          "question": "What is the International Space Station?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/The_station_pictured_from_the_SpaceX_Crew_Dragon_1.jpg/1280px-The_station_pictured_from_the_SpaceX_Crew_Dragon_1.jpg",
              "alt": "Mission image for the International Space Station"
            },
            {
              "type": "video",
              "src": "https://www.youtube.com/watch?v=nmBbcNTUkOg",
              "alt": "Official or educational video about the International Space Station"
            }
          ]
        },
        {
          "id": "orbits-300",
          "value": 300,
          "answer": "This orbit keeps a satellite fixed over the same point on Earth's equator.",
          "question": "What is geostationary orbit?"
        },
        {
          "id": "orbits-400",
          "value": 400,
          "answer": "This line is commonly used as the boundary of space.",
          "question": "What is the Karman line?"
        },
        {
          "id": "orbits-500",
          "value": 500,
          "answer": "This region around Earth contains charged particles trapped by the planet's magnetic field.",
          "question": "What are the Van Allen belts?"
        }
      ]
    }
  ],
  "settings": {
    "subtractOnIncorrect": true,
    "enableLocalStorage": true,
    "storageKey": "work-jeopardy-space-exploration",
    "sounds": {
      "enabled": true,
      "volume": 0.85
    }
  },
  "finalJeopardy": {
    "enabled": true,
    "category": "Moon Landings",
    "clue": "This mission made Neil Armstrong and Buzz Aldrin the first humans to walk on the Moon.",
    "correctResponse": "What is Apollo 11?",
    "timerSeconds": 30,
    "allowNonPositiveScores": false
  }
}
`;export{n as default};
