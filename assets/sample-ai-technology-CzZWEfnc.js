const n=`{
  "title": "AI & Technology",
  "subtitle": "A board spanning machine learning, computing history, hardware, and the web.",
  "teams": [
    {
      "id": "team-1",
      "name": "Model Team"
    },
    {
      "id": "team-2",
      "name": "Vector Team"
    },
    {
      "id": "team-3",
      "name": "Circuit Team"
    }
  ],
  "categories": [
    {
      "id": "cat-ai-basics",
      "title": "AI Basics",
      "clues": [
        {
          "id": "ai-basics-100",
          "value": 100,
          "answer": "This field builds systems that perform tasks associated with human intelligence.",
          "question": "What is artificial intelligence?"
        },
        {
          "id": "ai-basics-200",
          "value": 200,
          "answer": "These examples are used to teach a machine learning model.",
          "question": "What is training data?"
        },
        {
          "id": "ai-basics-300",
          "value": 300,
          "answer": "Large language models repeatedly predict the next unit of text, often called this.",
          "question": "What is a token?"
        },
        {
          "id": "ai-basics-400",
          "value": 400,
          "answer": "In AI, this term describes made-up details presented confidently as facts.",
          "question": "What is a hallucination?"
        },
        {
          "id": "ai-basics-500",
          "value": 500,
          "answer": "This branch of AI uses multi-layer neural networks and large data sets.",
          "question": "What is deep learning?",
          "dailyDouble": true
        }
      ]
    },
    {
      "id": "cat-ml",
      "title": "Machine Learning",
      "clues": [
        {
          "id": "ml-100",
          "value": 100,
          "answer": "This task predicts one of several labels, such as spam or not spam.",
          "question": "What is classification?"
        },
        {
          "id": "ml-200",
          "value": 200,
          "answer": "This task predicts a number, such as sales or temperature.",
          "question": "What is regression?"
        },
        {
          "id": "ml-300",
          "value": 300,
          "answer": "A model that memorizes training data too closely suffers from this.",
          "question": "What is overfitting?"
        },
        {
          "id": "ml-400",
          "value": 400,
          "answer": "This dataset split is used during tuning, before the final test set.",
          "question": "What is the validation set?"
        },
        {
          "id": "ml-500",
          "value": 500,
          "answer": "This ensemble method combines many decision trees.",
          "question": "What is a random forest?"
        }
      ]
    },
    {
      "id": "cat-history",
      "title": "Computing History",
      "clues": [
        {
          "id": "history-100",
          "value": 100,
          "answer": "This company launched the Macintosh in 1984.",
          "question": "What is Apple?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1280px-Apple_logo_black.svg.png",
              "alt": "Logo or photo for Apple"
            }
          ]
        },
        {
          "id": "history-200",
          "value": 200,
          "answer": "This British mathematician lends his name to a famous test of machine intelligence.",
          "question": "Who is Alan Turing?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Alan_turing_header.jpg/500px-Alan_turing_header.jpg",
              "alt": "Portrait of Alan Turing"
            }
          ]
        },
        {
          "id": "history-300",
          "value": 300,
          "answer": "This early PC operating system was commonly called DOS.",
          "question": "What is MS-DOS?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/StartingMsdos.png/120px-StartingMsdos.png",
              "alt": "Screenshot or image for MS-DOS"
            }
          ]
        },
        {
          "id": "history-400",
          "value": 400,
          "answer": "Dennis Ritchie created this programming language at Bell Labs.",
          "question": "What is C?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/The_C_Programming_Language_logo.svg/1280px-The_C_Programming_Language_logo.svg.png",
              "alt": "Illustration for the C programming language"
            }
          ]
        },
        {
          "id": "history-500",
          "value": 500,
          "answer": "This U.S. research network is widely considered a precursor to the modern internet.",
          "question": "What is ARPANET?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Arpanet_logical_map%2C_march_1977.png/960px-Arpanet_logical_map%2C_march_1977.png",
              "alt": "Diagram or archival image for ARPANET"
            }
          ]
        }
      ]
    },
    {
      "id": "cat-web",
      "title": "Web & Internet",
      "clues": [
        {
          "id": "web-100",
          "value": 100,
          "answer": "These four letters stand for the secure form of HTTP.",
          "question": "What is HTTPS?"
        },
        {
          "id": "web-200",
          "value": 200,
          "answer": "This system translates domain names into IP addresses.",
          "question": "What is DNS?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/An_annotated_example_of_a_domain_name.png/960px-An_annotated_example_of_a_domain_name.png",
              "alt": "Illustration associated with DNS"
            }
          ]
        },
        {
          "id": "web-300",
          "value": 300,
          "answer": "This markup language structures most webpages.",
          "question": "What is HTML?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/HTML5_logo_and_wordmark.svg/1280px-HTML5_logo_and_wordmark.svg.png",
              "alt": "Illustration for HTML"
            }
          ]
        },
        {
          "id": "web-400",
          "value": 400,
          "answer": "This stylesheet language controls layout and presentation on the web.",
          "question": "What is CSS?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Official_CSS_Logo.svg/1280px-Official_CSS_Logo.svg.png",
              "alt": "Illustration for CSS"
            }
          ]
        },
        {
          "id": "web-500",
          "value": 500,
          "answer": "This browser scripting language powers interactivity on most modern sites.",
          "question": "What is JavaScript?"
        }
      ]
    },
    {
      "id": "cat-hardware",
      "title": "Hardware & Chips",
      "clues": [
        {
          "id": "hardware-100",
          "value": 100,
          "answer": "CPU stands for this.",
          "question": "What is central processing unit?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Intel_i9-14900KF_CPU.jpg/1280px-Intel_i9-14900KF_CPU.jpg",
              "alt": "Illustration for a CPU"
            }
          ]
        },
        {
          "id": "hardware-200",
          "value": 200,
          "answer": "GPU stands for this.",
          "question": "What is graphics processing unit?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Generic_block_diagram_of_a_GPU.svg/1280px-Generic_block_diagram_of_a_GPU.svg.png",
              "alt": "Illustration for a GPU"
            }
          ]
        },
        {
          "id": "hardware-300",
          "value": 300,
          "answer": "This volatile memory stores active programs while power is on.",
          "question": "What is RAM?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Swissbit_2GB_PC2-5300U-555.jpg/1280px-Swissbit_2GB_PC2-5300U-555.jpg",
              "alt": "Illustration for RAM"
            }
          ]
        },
        {
          "id": "hardware-400",
          "value": 400,
          "answer": "This storage device has no moving parts and is often abbreviated SSD.",
          "question": "What is a solid-state drive?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2023_Dysk_SSD_Patriot_P210_2TB.jpg/1280px-2023_Dysk_SSD_Patriot_P210_2TB.jpg",
              "alt": "Illustration for a solid-state drive"
            }
          ]
        },
        {
          "id": "hardware-500",
          "value": 500,
          "answer": "This law observed that transistor counts on chips tended to roughly double over time.",
          "question": "What is Moore's Law?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Moore%27s_Law_Transistor_Count_1970-2020.png/1280px-Moore%27s_Law_Transistor_Count_1970-2020.png",
              "alt": "Illustration for Moore's Law"
            }
          ]
        }
      ]
    },
    {
      "id": "cat-code-data",
      "title": "Code & Data",
      "clues": [
        {
          "id": "code-data-100",
          "value": 100,
          "answer": "This key-value format with braces is common for APIs and config files.",
          "question": "What is JSON?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Douglas_Crockford%2C_February_2013.jpg/1280px-Douglas_Crockford%2C_February_2013.jpg",
              "alt": "Portrait associated with JSON"
            }
          ]
        },
        {
          "id": "code-data-200",
          "value": 200,
          "answer": "SQL is used to query this kind of structured data system.",
          "question": "What is a relational database?"
        },
        {
          "id": "code-data-300",
          "value": 300,
          "answer": "This version control tool manages commits, branches, and merges.",
          "question": "What is Git?",
          "media": [
            {
              "type": "image",
              "src": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Git_session.svg/1280px-Git_session.svg.png",
              "alt": "Illustration for Git"
            }
          ]
        },
        {
          "id": "code-data-400",
          "value": 400,
          "answer": "This open-source kernel powers many servers and Android devices.",
          "question": "What is Linux?"
        },
        {
          "id": "code-data-500",
          "value": 500,
          "answer": "API stands for this phrase.",
          "question": "What is application programming interface?"
        }
      ]
    }
  ],
  "settings": {
    "subtractOnIncorrect": true,
    "enableLocalStorage": true,
    "storageKey": "work-jeopardy-ai-technology",
    "sounds": {
      "enabled": true,
      "volume": 0.85
    }
  },
  "finalJeopardy": {
    "enabled": true,
    "category": "Web History",
    "clue": "Tim Berners-Lee is credited with inventing this information system of linked documents on the internet.",
    "correctResponse": "What is the World Wide Web?",
    "timerSeconds": 30,
    "allowNonPositiveScores": false
  }
}
`;export{n as default};
