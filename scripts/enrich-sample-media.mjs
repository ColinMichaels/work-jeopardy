import fs from 'node:fs/promises';

const USER_AGENT = 'work-jeopardy-media-enricher/1.0 (local script)';
const RETRY_DELAYS_MS = [0, 500, 1500, 3000];
const WIKIPEDIA_BATCH_SIZE = 20;
const WIKIPEDIA_BATCH_DELAY_MS = 250;
const YOUTUBE_REQUEST_DELAY_MS = 400;

const MEDIA_MAP = {
  'src/data/sample-90-sitcoms.json': [
    clue('80s-sitcoms-100', pageImage('Cheers', 'Title image for Cheers'), video('Cheers opening theme', 'Opening theme clip for Cheers')),
    clue('80s-sitcoms-200', pageImage('The Cosby Show', 'Title image for The Cosby Show'), video('The Cosby Show opening credits', 'Opening credits clip for The Cosby Show')),
    clue('80s-sitcoms-300', pageImage('Family Ties', 'Title image for Family Ties'), video('Family Ties opening credits', 'Opening credits clip for Family Ties')),
    clue('80s-sitcoms-400', pageImage('Bea Arthur', 'Promotional image associated with The Golden Girls'), video('The Golden Girls opening credits', 'Opening credits clip for The Golden Girls')),
    clue('80s-sitcoms-500', pageImage('Perfect Strangers (TV series)', 'Title image for Perfect Strangers'), video('Perfect Strangers opening credits', 'Opening credits clip for Perfect Strangers')),
    clue('90s-sitcoms-100', pageImage('Jennifer Aniston', 'Promotional image associated with Friends'), video('Friends opening credits', 'Opening theme clip for Friends')),
    clue('90s-sitcoms-200', pageImage('Seinfeld', 'Title image for Seinfeld'), video('Seinfeld opening credits', 'Opening credits clip for Seinfeld')),
    clue('90s-sitcoms-300', pageImage('The Fresh Prince of Bel-Air', 'Title image for The Fresh Prince of Bel-Air'), video('Fresh Prince of Bel-Air opening credits', 'Opening theme clip for The Fresh Prince of Bel-Air')),
    clue('90s-sitcoms-400', pageImage('Home Improvement (TV series)', 'Title image for Home Improvement'), video('Home Improvement opening credits', 'Opening credits clip for Home Improvement')),
    clue('90s-sitcoms-500', pageImage('Spin City', 'Title image for Spin City'), video('Spin City opening credits', 'Opening credits clip for Spin City')),
    clue('2000s-sitcoms-100', pageImage('Steve Carell', 'Promotional image associated with The Office'), video('The Office official trailer', 'Trailer or official clip for The Office')),
    clue('2000s-sitcoms-200', pageImage('The Big Bang Theory', 'Title image for The Big Bang Theory'), video('The Big Bang Theory opening credits', 'Opening credits clip for The Big Bang Theory')),
    clue('2000s-sitcoms-300', pageImage('Charlie Sheen', 'Promotional image associated with Two and a Half Men'), video('Two and a Half Men opening credits', 'Opening credits clip for Two and a Half Men')),
    clue('2000s-sitcoms-400', pageImage('Arrested Development', 'Title image for Arrested Development'), video('Arrested Development official trailer', 'Trailer or official clip for Arrested Development')),
    clue('2000s-sitcoms-500', pageImage('30 Rock', 'Title image for 30 Rock'), video('30 Rock official trailer', 'Trailer or official clip for 30 Rock')),
  ],
  'src/data/sample-pop-culture.json': [
    clue('movies-100', pageImage('Jurassic Park', 'Poster or title image for Jurassic Park'), video('Jurassic Park official trailer', 'Trailer for Jurassic Park')),
    clue('movies-200', pageImage('The Wizard of Oz (1939 film)', 'Poster or title image for The Wizard of Oz'), video('Wizard of Oz official trailer', 'Trailer for The Wizard of Oz')),
    clue('movies-300', pageImage('Tom Cruise', 'Promotional image associated with Mission: Impossible'), video('Mission Impossible official trailer', 'Trailer for Mission: Impossible')),
    clue('movies-400', pageImage('Inside Out (2015 film)', 'Poster or title image for Inside Out'), video('Inside Out official trailer', 'Trailer for Inside Out')),
    clue('movies-500', pageImage('Back to the Future', 'Poster or title image for Back to the Future'), video('Back to the Future official trailer', 'Trailer for Back to the Future')),
    clue('tv-100', pageImage('Jennifer Aniston', 'Promotional image associated with Friends'), video('Friends opening credits', 'Opening theme clip for Friends')),
    clue('tv-200', pageImage('Steve Carell', 'Promotional image associated with The Office'), video('The Office official trailer', 'Trailer or official clip for The Office')),
    clue('tv-300', pageImage('Game of Thrones', 'Poster or title image for Game of Thrones'), video('Game of Thrones official trailer', 'Trailer for Game of Thrones')),
    clue('tv-400', pageImage('The Simpsons', 'Title image for The Simpsons'), video('The Simpsons opening credits', 'Opening credits clip for The Simpsons')),
    clue('tv-500', pageImage('Padma Lakshmi', 'Promotional image associated with Top Chef'), video('Top Chef official trailer', 'Trailer or official clip for Top Chef')),
    clue('music-100', pageImage('Madonna', 'Photo of Madonna'), video('Madonna Like a Prayer official video', 'Official music video for Like a Prayer')),
    clue('music-200', pageImage('The Beatles', 'Photo of The Beatles'), video('The Beatles Let It Be official video', 'Official music video for Let It Be')),
    clue('music-300', pageImage('Michael Jackson', 'Photo of Michael Jackson'), video('Michael Jackson Thriller official video', 'Official music video for Thriller')),
    clue('music-400', pageImage('Beyonce', 'Photo of Beyonce'), video('Beyonce Single Ladies official video', 'Official music video for Single Ladies (Put a Ring on It)')),
    clue('music-500', pageImage('Bruce Springsteen', 'Photo of Bruce Springsteen'), video('Bruce Springsteen Born to Run official video', 'Official music video for Born to Run')),
  ],
  'src/data/sample-space-exploration.json': [
    clue('planets-100', pageImage('Mercury (planet)', 'Planet image for Mercury'), video('NASA Mercury planet', 'NASA or official educational video about Mercury')),
    clue('planets-200', pageImage('Jupiter', 'Planet image for Jupiter'), video('NASA Jupiter planet', 'NASA or official educational video about Jupiter')),
    clue('planets-300', pageImage('Saturn', 'Planet image for Saturn'), video('NASA Saturn planet', 'NASA or official educational video about Saturn')),
    clue('planets-400', pageImage('Pluto', 'Planet image for Pluto'), video('NASA Pluto New Horizons', 'NASA or official educational video about Pluto')),
    clue('planets-500', pageImage('Uranus', 'Planet image for Uranus'), video('NASA Uranus planet', 'NASA or official educational video about Uranus')),
    clue('moon-mars-100', pageImage('Moon', 'Moon image for Earth’s natural satellite'), video('NASA Moon official', 'NASA or official educational video about the Moon')),
    clue('moon-mars-200', pageImage('Apollo program', 'Program image for Apollo'), video('NASA Apollo program official', 'NASA or official video about the Apollo program')),
    clue('moon-mars-300', pageImage('Ingenuity (helicopter)', 'Mission image for Ingenuity'), video('NASA Ingenuity helicopter official', 'NASA or official video about Ingenuity')),
    clue('spacecraft-400', pageImage('James Webb Space Telescope', 'Mission image for the James Webb Space Telescope'), video('NASA James Webb Space Telescope official', 'NASA or official video about the James Webb Space Telescope')),
    clue('missions-100', pageImage('Voyager 1', 'Mission image for Voyager 1'), video('NASA Voyager 1 official', 'NASA or official video about Voyager 1')),
    clue('missions-200', pageImage('New Horizons', 'Mission image for New Horizons'), video('NASA New Horizons Pluto official', 'NASA or official video about New Horizons')),
    clue('missions-300', pageImage('OSIRIS-REx', 'Mission image for OSIRIS-REx'), video('NASA OSIRIS-REx official', 'NASA or official video about OSIRIS-REx')),
    clue('missions-400', pageImage('Perseverance (rover)', 'Mission image for Perseverance'), video('NASA Perseverance rover official', 'NASA or official video about Perseverance')),
    clue('missions-500', pageImage('Vostok programme', 'Mission image for the Vostok programme'), video('Yuri Gagarin Vostok official', 'Historical or official video about Yuri Gagarin and Vostok')),
    clue('orbits-200', pageImage('International Space Station', 'Mission image for the International Space Station'), video('International Space Station official tour', 'Official or educational video about the International Space Station')),
  ],
  'src/data/sample-solar-renewables.json': [
    clue('solar-100', pageImage('Solar power', 'Illustration or photo for solar power')),
    clue('solar-200', pageImage('Silicon', 'Photo or illustration for silicon')),
    clue('solar-400', pageImage('Photovoltaics', 'Photo or illustration for a solar array')),
    clue('solar-500', pageImage('Concentrated solar power', 'Photo or illustration for concentrated solar power')),
    clue('wind-water-100', pageImage('Electric generator', 'Photo or illustration for an electric generator')),
    clue('wind-water-200', pageImage('Turbine', 'Photo or illustration for a turbine')),
    clue('wind-water-300', pageImage('Hoover Dam', 'Photo of Hoover Dam')),
    clue('wind-water-400', pageImage('Offshore wind power', 'Photo or illustration for offshore wind power')),
    clue('storage-100', pageImage('Lithium-ion battery', 'Photo or illustration for battery storage')),
    clue('storage-300', pageImage('Electrolysis', 'Illustration for electrolysis')),
    clue('grid-200', pageImage('Power inverter', 'Photo or illustration for a power inverter')),
    clue('climate-200', pageImage('Paris Agreement', 'Image or logo for the Paris Agreement')),
    clue('clean-tech-100', pageImage('Electric car', 'Photo of an electric vehicle')),
    clue('clean-tech-200', pageImage('Geothermal energy', 'Photo or illustration for geothermal energy')),
    clue('clean-tech-500', pageImage('Smart grid', 'Illustration for a smart grid')),
  ],
  'src/data/sample-classic-trivia.json': [
    clue('capitals-100', pageImage('Ottawa', 'City image for Ottawa')),
    clue('capitals-200', pageImage('Tokyo', 'City image for Tokyo')),
    clue('capitals-300', pageImage('La Paz', 'City image for La Paz')),
    clue('capitals-400', pageImage('Canberra', 'City image for Canberra')),
    clue('capitals-500', pageImage('Rabat', 'City image for Rabat')),
    clue('books-100', pageImage('To Kill a Mockingbird', 'Cover image for To Kill a Mockingbird')),
    clue('books-200', pageImage('Nineteen Eighty-Four', 'Cover image for Nineteen Eighty-Four')),
    clue('books-300', pageImage('Moby-Dick', 'Cover image for Moby-Dick')),
    clue('books-400', pageImage('J. R. R. Tolkien', 'Author image associated with The Hobbit')),
    clue('books-500', pageImage('Pride and Prejudice', 'Cover image for Pride and Prejudice')),
    clue('science-100', pageImage('Mars', 'Planet image for Mars')),
    clue('science-500', pageImage('Isaac Newton', 'Portrait of Isaac Newton')),
    clue('history-100', pageImage('Constitution of the United States', 'Image for the U.S. Constitution')),
    clue('history-300', pageImage('Abraham Lincoln', 'Portrait of Abraham Lincoln')),
    clue('sports-400', pageImage('Rio de Janeiro', 'City image for Rio de Janeiro')),
  ],
  'src/data/sample-ai-technology.json': [
    clue('history-100', pageImage('Apple Inc.', 'Logo or photo for Apple')),
    clue('history-200', pageImage('Alan Turing', 'Portrait of Alan Turing')),
    clue('history-300', pageImage('MS-DOS', 'Screenshot or image for MS-DOS')),
    clue('history-400', pageImage('C (programming language)', 'Illustration for the C programming language')),
    clue('history-500', pageImage('ARPANET', 'Diagram or archival image for ARPANET')),
    clue('hardware-100', pageImage('Central processing unit', 'Illustration for a CPU')),
    clue('hardware-200', pageImage('Graphics processing unit', 'Illustration for a GPU')),
    clue('hardware-300', pageImage('Random-access memory', 'Illustration for RAM')),
    clue('hardware-400', pageImage('Solid-state drive', 'Illustration for a solid-state drive')),
    clue('hardware-500', pageImage('Moore\'s law', 'Illustration for Moore\'s Law')),
    clue('web-200', pageImage('Domain name', 'Illustration associated with DNS')),
    clue('web-300', pageImage('HTML', 'Illustration for HTML')),
    clue('web-400', pageImage('CSS', 'Illustration for CSS')),
    clue('code-data-100', pageImage('Douglas Crockford', 'Portrait associated with JSON')),
    clue('code-data-300', pageImage('Git', 'Illustration for Git')),
  ],
  'src/data/sample-game.json': [
    clue('ts-100', pageImage('TypeScript', 'Logo for TypeScript')),
    clue('ts-200', pageImage('TypeScript', 'Logo for TypeScript')),
    clue('ts-300', pageImage('TypeScript', 'Logo for TypeScript')),
    clue('ts-400', pageImage('TypeScript', 'Logo for TypeScript')),
    clue('ts-500', pageImage('TypeScript', 'Logo for TypeScript')),
    clue('react-100', pageImage('React (software)', 'Logo for React')),
    clue('react-200', pageImage('React (software)', 'Logo for React')),
    clue('react-300', pageImage('React (software)', 'Logo for React')),
    clue('react-400', pageImage('React (software)', 'Logo for React')),
    clue('react-500', pageImage('React (software)', 'Logo for React')),
    clue('git-100', pageImage('Git', 'Logo for Git')),
    clue('git-200', pageImage('Git', 'Logo for Git')),
    clue('git-300', pageImage('Git', 'Logo for Git')),
    clue('git-400', pageImage('Git', 'Logo for Git')),
    clue('git-500', pageImage('Git', 'Logo for Git')),
  ],
};

function clue(clueId, ...mediaSpecs) {
  return { clueId, mediaSpecs };
}

function pageImage(pageTitle, alt) {
  return { kind: 'page-image', pageTitle, alt };
}

function video(query, alt) {
  return { kind: 'youtube-video', query, alt };
}

const textCache = new Map();
const jsonCache = new Map();
const resolvedCache = new Map();
const wikipediaImageCache = new Map();
let lastYouTubeRequestAt = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function chunk(list, size) {
  const chunks = [];

  for (let index = 0; index < list.length; index += size) {
    chunks.push(list.slice(index, index + size));
  }

  return chunks;
}

function normalizeSnippet(text) {
  return text.replace(/\s+/g, ' ').trim().slice(0, 160);
}

async function requestText(url, accept) {
  let lastError;

  for (const delayMs of RETRY_DELAYS_MS) {
    if (delayMs) {
      await sleep(delayMs);
    }

    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(15_000),
        headers: {
          Accept: accept,
          'Accept-Language': 'en-US,en;q=0.9',
          'Api-User-Agent': USER_AGENT,
          'User-Agent': USER_AGENT,
        },
        redirect: 'follow',
      });
      const text = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} for ${url}: ${normalizeSnippet(text)}`);
      }

      return text;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

async function fetchText(url, accept = 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8') {
  if (!textCache.has(url)) {
    textCache.set(url, await requestText(url, accept));
  }

  return textCache.get(url);
}

async function fetchJson(url) {
  if (!jsonCache.has(url)) {
    const text = await requestText(url, 'application/json, text/javascript;q=0.9,*/*;q=0.8');

    try {
      jsonCache.set(url, JSON.parse(text));
    } catch (error) {
      throw new Error(`Expected JSON from ${url}, received: ${normalizeSnippet(text)}`);
    }
  }

  return jsonCache.get(url);
}

function resolveWikipediaTitle(title, normalizedMap, redirectsMap) {
  let current = title;
  const seen = new Set();

  while (!seen.has(current)) {
    seen.add(current);
    const normalized = normalizedMap.get(current) ?? current;
    const redirected = redirectsMap.get(normalized) ?? redirectsMap.get(current) ?? null;
    const next = redirected ?? normalized;

    if (next === current) {
      break;
    }

    current = next;
  }

  return current;
}

async function primeWikipediaImages() {
  const requestedTitles = [
    ...new Set(
      Object.values(MEDIA_MAP)
        .flat()
        .flatMap((mapping) => mapping.mediaSpecs)
        .filter((spec) => spec.kind === 'page-image')
        .map((spec) => spec.pageTitle),
    ),
  ].filter((title) => !wikipediaImageCache.has(title));

  for (const titles of chunk(requestedTitles, WIKIPEDIA_BATCH_SIZE)) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageimages&piprop=thumbnail|original&pithumbsize=1000&redirects=1&titles=${encodeURIComponent(titles.join('|'))}`;
    let payload;

    try {
      payload = await fetchJson(url);
    } catch (error) {
      for (const title of titles) {
        wikipediaImageCache.set(title, null);
      }
      continue;
    }

    const normalizedMap = new Map((payload.query?.normalized ?? []).map(({ from, to }) => [from, to]));
    const redirectsMap = new Map((payload.query?.redirects ?? []).map(({ from, to }) => [from, to]));
    const pageByTitle = new Map((payload.query?.pages ?? []).map((page) => [page.title, page]));

    for (const title of titles) {
      const resolvedTitle = resolveWikipediaTitle(title, normalizedMap, redirectsMap);
      const page = pageByTitle.get(resolvedTitle) ?? pageByTitle.get(title) ?? null;
      const source = page?.thumbnail?.source ?? page?.original?.source ?? null;
      wikipediaImageCache.set(title, source);
    }

    await sleep(WIKIPEDIA_BATCH_DELAY_MS);
  }
}

async function fetchYouTubeSearch(query) {
  const waitMs = Math.max(0, YOUTUBE_REQUEST_DELAY_MS - (Date.now() - lastYouTubeRequestAt));

  if (waitMs) {
    await sleep(waitMs);
  }

  lastYouTubeRequestAt = Date.now();
  return fetchText(`https://www.youtube.com/results?hl=en&search_query=${encodeURIComponent(query)}`);
}

function extractYouTubeId(html) {
  const patterns = [/"videoId":"([A-Za-z0-9_-]{11})"/g, /watch\?v=([A-Za-z0-9_-]{11})/g];

  for (const pattern of patterns) {
    const videoIds = [...new Set([...html.matchAll(pattern)].map((match) => match[1]))];

    if (videoIds.length) {
      return videoIds[0];
    }
  }

  return null;
}

async function resolveMedia(spec) {
  const key = JSON.stringify(spec);
  if (resolvedCache.has(key)) {
    return resolvedCache.get(key);
  }

  let resolved = null;

  if (spec.kind === 'page-image') {
    const src = wikipediaImageCache.get(spec.pageTitle) ?? null;
    if (src) {
      resolved = { type: 'image', src, alt: spec.alt };
    }
  }

  if (spec.kind === 'youtube-video') {
    try {
      const html = await fetchYouTubeSearch(spec.query);
      const match = extractYouTubeId(html);
      if (match) {
        resolved = {
          type: 'video',
          src: `https://www.youtube.com/watch?v=${match}`,
          alt: spec.alt,
        };
      }
    } catch (error) {
      resolved = null;
    }
  }

  resolvedCache.set(key, resolved);
  return resolved;
}

function mergeMedia(existingMedia, resolvedMedia) {
  const merged = [];
  const seen = new Set();

  for (const media of [...resolvedMedia, ...existingMedia]) {
    if (!media?.type || !media?.src) {
      continue;
    }

    const key = `${media.type}:${media.src}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(media);
  }

  return merged;
}

function clueSatisfiesSpec(clueConfig, spec) {
  const media = Array.isArray(clueConfig.media) ? clueConfig.media : [];

  if (spec.kind === 'page-image') {
    return media.some((item) => item.type === 'image');
  }

  if (spec.kind === 'youtube-video') {
    return media.some((item) => item.type === 'video');
  }

  return false;
}

async function enrichFile(filePath, mappings) {
  const config = JSON.parse(await fs.readFile(filePath, 'utf8'));
  const clueById = new Map();

  for (const category of config.categories ?? []) {
    for (const clueConfig of category.clues ?? []) {
      clueById.set(clueConfig.id, clueConfig);
    }
  }

  const missing = [];
  let updated = 0;

  for (const mapping of mappings) {
    const clueConfig = clueById.get(mapping.clueId);

    if (!clueConfig) {
      missing.push({ clueId: mapping.clueId, reason: 'clue not found' });
      continue;
    }

    const resolvedMedia = [];
    const unresolvedSpecs = [];
    const existingMedia = clueConfig.media ?? [];

    for (const spec of mapping.mediaSpecs) {
      if (clueSatisfiesSpec(clueConfig, spec)) {
        continue;
      }

      const media = await resolveMedia(spec);

      if (media) {
        resolvedMedia.push(media);
      } else {
        unresolvedSpecs.push(spec.kind === 'page-image' ? spec.pageTitle : spec.query);
      }
    }

    const mergedMedia = mergeMedia(existingMedia, resolvedMedia);
    const changed = JSON.stringify(mergedMedia) !== JSON.stringify(existingMedia);

    if (!mergedMedia.length) {
      missing.push({ clueId: mapping.clueId, reason: 'no media resolved', unresolved: unresolvedSpecs });
      continue;
    }

    if (unresolvedSpecs.length) {
      missing.push({
        clueId: mapping.clueId,
        reason: 'some media could not be resolved',
        unresolved: unresolvedSpecs,
      });
    }

    if (changed) {
      clueConfig.media = mergedMedia;
      updated += 1;
    }
  }

  await fs.writeFile(filePath, `${JSON.stringify(config, null, 2)}\n`);
  return { updated, missing };
}

async function main() {
  const summary = [];
  await primeWikipediaImages();

  for (const [filePath, mappings] of Object.entries(MEDIA_MAP)) {
    const result = await enrichFile(filePath, mappings);
    summary.push({
      filePath,
      requested: mappings.length,
      updated: result.updated,
      missing: result.missing,
    });
  }

  console.log(JSON.stringify(summary, null, 2));
}

await main();
