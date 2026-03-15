const DEFAULT_STATE = {
  mode: 'new-game',
  agentMode: 'repo-agent',
  theme: '',
  audience: '',
  era: '',
  genre: '',
  tone: 'balanced',
  mediaCoverage: 'focused',
  categoryCount: '6',
  clueCount: '5',
  teamCount: '3',
  finalJeopardy: 'include',
  categorySeeds: '',
  details: '',
  mediaImage: true,
  mediaVideo: true,
  mediaAudio: false,
  sourcePreferences:
    'Official YouTube watch URLs for videos; Apple/iTunes album or single artwork for covers; Wikipedia or Wikimedia artist photos for portraits; use real, verified URLs only; prefer one image and one video per selected clue when practical; include alt text for every media item.',
  gameTitle: '',
  gameSubtitle: '',
  targetFilename: '',
  existingFile: '',
  focusCategories: '',
  preserveClues: 'yes',
  keepExistingMedia: 'keep',
};

const NEW_GAME_EXAMPLE = {
  ...DEFAULT_STATE,
  mode: 'new-game',
  agentMode: 'repo-agent',
  theme: '90s pop deep cuts',
  audience: 'Music nerds who still know TRL-era radio and album cuts',
  era: '1990-1999',
  genre: 'Pop',
  tone: 'deep-cut',
  mediaCoverage: 'link-soup',
  categorySeeds:
    'Hit Singles\nAlbums\nArtists\nOne-Hit Wonders\nSoundtracks\nMTV + TRL',
  details:
    'Bias toward slightly harder clues than the existing sample boards. Use media on as many clues as possible. Prefer official videos instead of lyric videos. Include album art and artist photos where it helps.',
  gameTitle: '90s Pop Deep Cuts',
  gameSubtitle: 'A more obsessive board for people who still remember the CD booklet.',
  targetFilename: 'src/data/sample-90s-pop-deep-cuts.json',
};

const ENRICH_EXAMPLE = {
  ...DEFAULT_STATE,
  mode: 'enrich-media',
  agentMode: 'repo-agent',
  theme: 'Space exploration sample media enrichment',
  audience: 'Mixed office crowd',
  era: '1960s to present',
  genre: 'Space exploration',
  tone: 'balanced',
  mediaCoverage: 'link-soup',
  existingFile: 'src/data/sample-space-exploration.json',
  focusCategories: 'All categories, but prioritize Missions, Spacecraft, and Planets',
  details:
    'Keep the existing clue text unless a clue is factually weak. Add image and video media to as many clues as practical. Prefer NASA imagery, ESA imagery, Wikimedia photos, and official NASA YouTube links.',
};

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function inferTitle(state) {
  if (state.gameTitle.trim()) {
    return state.gameTitle.trim();
  }

  const parts = [state.era, state.genre, state.theme]
    .map((item) => item.trim())
    .filter(Boolean);

  return parts.length ? parts.join(' ').replace(/\s+/g, ' ') : 'New Game Title';
}

function inferFilename(state) {
  if (state.targetFilename.trim()) {
    return state.targetFilename.trim();
  }

  const base = slugify(inferTitle(state)) || 'new-gameset';
  return `src/data/sample-${base}.json`;
}

function mediaTypes(state) {
  return [
    state.mediaImage ? 'image' : '',
    state.mediaVideo ? 'video' : '',
    state.mediaAudio ? 'audio' : '',
  ].filter(Boolean);
}

function mediaCoverageInstruction(value) {
  switch (value) {
    case 'broad':
      return 'Attach verified media to multiple clues per category, with broad but still curated coverage.';
    case 'link-soup':
      return 'Bias aggressively toward link soup: attach verified media to as many clues as practical without inventing or guessing URLs.';
    case 'focused':
    default:
      return 'Focus on the strongest demo clues first, then expand if the matches stay confident.';
  }
}

function toneInstruction(value) {
  switch (value) {
    case 'casual':
      return 'Keep the board accessible for a mixed audience and avoid too many specialist deep cuts.';
    case 'deep-cut':
      return 'Make the board meaningfully nerdier than a default party-trivia set, while keeping each clue defensible.';
    case 'expert':
      return 'Assume a specialist audience and allow harder category concepts and clue wording.';
    case 'balanced':
    default:
      return 'Keep the board balanced, readable, and fair for a general meeting audience.';
  }
}

function finalJeopardyInstruction(value) {
  switch (value) {
    case 'require':
      return 'Include a valid Final Jeopardy round.';
    case 'omit':
      return 'Do not include Final Jeopardy.';
    case 'include':
    default:
      return 'Include Final Jeopardy only if it improves the set.';
  }
}

function buildCommonHeader(state) {
  const lines = [
    'You are helping author content for the Work Jeopardy project.',
    '',
    'Repo context:',
    '- Schema reference: `docs/GAME_SCHEMA.md`',
    '- Authoring guide: `docs/AI_GAMESET_AUTHORING.md`',
    '- Bundled games live under `src/data/`',
    '- The app shows `answer` first and reveals `question` second',
    '- Media entries use `{ "type": "image" | "audio" | "video", "src": "...", "alt": "..." }`',
    '',
    'Project requirements:',
    `- Theme: ${state.theme.trim() || 'Choose a strong theme from the other details below'}`,
    `- Audience: ${state.audience.trim() || 'General meeting audience'}`,
    `- Era / year range: ${state.era.trim() || 'No fixed range provided'}`,
    `- Genre / domain: ${state.genre.trim() || 'No fixed genre provided'}`,
    `- Tone: ${toneInstruction(state.tone)}`,
    `- Board shape: ${state.categoryCount} categories x ${state.clueCount} clues`,
    `- Team count: ${state.teamCount}`,
    `- Final Jeopardy: ${finalJeopardyInstruction(state.finalJeopardy)}`,
  ];

  if (state.categorySeeds.trim()) {
    lines.push(`- Category seeds: ${state.categorySeeds.trim().split('\n').join('; ')}`);
  }

  if (state.details.trim()) {
    lines.push(`- Extra details: ${state.details.trim()}`);
  }

  return lines.join('\n');
}

function buildMediaBlock(state) {
  const selectedTypes = mediaTypes(state);
  const sourcePreference = state.sourcePreferences.trim();

  return [
    '',
    'Media requirements:',
    `- Request media types: ${selectedTypes.length ? selectedTypes.join(', ') : 'none selected; default to image + video if useful'}`,
    `- Coverage target: ${mediaCoverageInstruction(state.mediaCoverage)}`,
    '- Use real, verified media URLs only. Do not invent URLs.',
    '- If a media match is ambiguous or low-confidence, skip it and note the gap rather than guessing.',
    '- Favor concise alt text that describes the asset plainly.',
    '- Prefer official video uploads over lyric videos, mirrored uploads, or fan edits whenever possible.',
    '- Prefer stable image sources such as album art, single art, museum/archive images, or Wikimedia-hosted photos when relevant.',
    sourcePreference ? `- Source preferences: ${sourcePreference}` : '',
    '- When practical, add both an image and a video to the same clue to demonstrate the app lightbox and embedded playback behavior.',
    '- Keep the clue text itself readable on screen even when media is attached.',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildOutputBlock(state, isNewGame) {
  if (state.agentMode === 'json-only') {
    return [
      '',
      'Deliverables:',
      isNewGame
        ? '- Return one complete JSON object, matching the schema for the new game.'
        : '- Return the complete updated JSON object for the existing game after enrichment.',
      '- After the JSON object, provide a short summary of the board and a short review note about any weak or skipped media matches.',
      '- Keep the JSON valid and hand-editable.',
    ].join('\n');
  }

  return [
    '',
    'Repo-agent workflow:',
    isNewGame
      ? `- Create the new game JSON at \`${inferFilename(state)}\`.`
      : `- Open and update \`${state.existingFile.trim() || 'src/data/sample-game.json'}\`.`,
    isNewGame
      ? '- If the new board should be selectable in the app, register it in `src/data/bundled-games.ts`.'
      : '- Preserve the existing board structure unless a fix is needed for correctness or media coverage.',
    '- Validate the JSON before finishing.',
    '- Run `npm run build` after the content changes.',
    '- Return a short summary, the edited file paths, and any clues or media assets that still need human review.',
  ].join('\n');
}

function buildNewGamePrompt(state) {
  return [
    buildCommonHeader(state),
    '',
    'Task:',
    `- Create a new Jeopardy-style game titled "${inferTitle(state)}".`,
    `- Suggested subtitle: ${state.gameSubtitle.trim() || 'Generate one only if it helps the board.'}`,
    `- Suggested output path: ${inferFilename(state)}`,
    '- Create short, readable category names.',
    '- Increase difficulty with clue value.',
    '- Keep clues defensible, factual, and meeting-ready.',
    '- Use unique ids throughout.',
    buildMediaBlock(state),
    '',
    'Authoring rules:',
    '- The visible clue text belongs in `answer`.',
    '- The revealed Jeopardy-style response belongs in `question`.',
    '- Keep clue wording concise enough for a shared screen.',
    '- Use `notes` only when genuinely helpful for the host.',
    '- Do not fabricate media, facts, artist names, or file paths.',
    '- Prefer media on clue types where it materially improves the experience, such as songs, artists, album clues, film scenes, product images, or archival footage.',
    buildOutputBlock(state, true),
  ].join('\n');
}

function buildEnrichmentPrompt(state) {
  const existingFile = state.existingFile.trim() || 'src/data/sample-game.json';
  const focusCategories = state.focusCategories.trim() || 'All categories';
  const preserveInstruction =
    state.preserveClues === 'yes'
      ? 'Preserve existing clue wording unless a clue is factually wrong or blocks good media matching.'
      : 'You may tighten clue wording if it materially improves correctness or media matching.';
  const existingMediaInstruction =
    state.keepExistingMedia === 'replace'
      ? 'Replace weak or broken media when you can verify a better asset.'
      : 'Keep working media and only add or extend coverage unless an asset is clearly broken.';

  return [
    buildCommonHeader(state),
    '',
    'Task:',
    `- Enrich the existing board at \`${existingFile}\` with additional media.`,
    `- Focus categories: ${focusCategories}`,
    `- ${preserveInstruction}`,
    `- ${existingMediaInstruction}`,
    '- Add media to as many clues as practical within the selected coverage target.',
    '- Keep the JSON schema valid and do not break existing ids.',
    buildMediaBlock(state),
    '',
    'Enrichment rules:',
    '- Favor clues where media adds obvious value: songs, albums, artists, locations, products, spacecraft, famous photos, trailers, or demos.',
    '- Avoid attaching media that is misleading, low-confidence, or too generic to help the clue.',
    '- Keep any new media arrays ordered intentionally, usually image first and video second.',
    '- If a clue already has useful media, extend it only when the additional asset adds a new mode such as image + video.',
    buildOutputBlock(state, false),
  ].join('\n');
}

export function buildPrompt(state) {
  return state.mode === 'enrich-media' ? buildEnrichmentPrompt(state) : buildNewGamePrompt(state);
}

function getFormState() {
  const read = (id) => document.getElementById(id);

  return {
    mode: read('mode').value,
    agentMode: read('agent-mode').value,
    theme: read('theme').value,
    audience: read('audience').value,
    era: read('era').value,
    genre: read('genre').value,
    tone: read('tone').value,
    mediaCoverage: read('media-coverage').value,
    categoryCount: read('category-count').value,
    clueCount: read('clue-count').value,
    teamCount: read('team-count').value,
    finalJeopardy: read('final-jeopardy').value,
    categorySeeds: read('category-seeds').value,
    details: read('details').value,
    mediaImage: read('media-image').checked,
    mediaVideo: read('media-video').checked,
    mediaAudio: read('media-audio').checked,
    sourcePreferences: read('source-preferences').value,
    gameTitle: read('game-title').value,
    gameSubtitle: read('game-subtitle').value,
    targetFilename: read('target-filename').value,
    existingFile: read('existing-file').value,
    focusCategories: read('focus-categories').value,
    preserveClues: read('preserve-clues').value,
    keepExistingMedia: read('keep-existing-media').value,
  };
}

function applyState(state) {
  const merged = { ...DEFAULT_STATE, ...state };

  for (const [key, value] of Object.entries(merged)) {
    const elementId = key
      .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
      .replace('agent-mode', 'agent-mode');
    const element =
      document.getElementById(elementId) ||
      document.querySelector(`[name="${key}"]`);

    if (!element) {
      continue;
    }

    if (element.type === 'checkbox') {
      element.checked = Boolean(value);
    } else {
      element.value = String(value);
    }
  }

  syncModePanels();
  updatePrompt();
}

function syncModePanels() {
  const mode = document.getElementById('mode').value;
  document.getElementById('new-game-panel').hidden = mode !== 'new-game';
  document.getElementById('enrich-panel').hidden = mode !== 'enrich-media';
}

function setStatus(message) {
  document.getElementById('copy-status').textContent = message;
}

function updatePrompt() {
  syncModePanels();
  const state = getFormState();

  if (!state.gameTitle.trim() && state.mode === 'new-game' && state.theme.trim()) {
    const proposedTitle = [state.era.trim(), state.genre.trim(), state.theme.trim()]
      .filter(Boolean)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (proposedTitle) {
      document.getElementById('game-title').placeholder = proposedTitle;
    }
  }

  if (!state.targetFilename.trim() && state.mode === 'new-game') {
    document.getElementById('target-filename').placeholder = inferFilename(state);
  }

  document.getElementById('prompt-output').value = buildPrompt(state);
}

async function copyPrompt() {
  const promptText = document.getElementById('prompt-output').value;

  try {
    await navigator.clipboard.writeText(promptText);
    setStatus('Prompt copied to clipboard.');
  } catch {
    document.getElementById('prompt-output').focus();
    document.getElementById('prompt-output').select();
    setStatus('Clipboard copy failed; the prompt has been selected for manual copy.');
  }
}

function downloadPrompt() {
  const promptText = document.getElementById('prompt-output').value;
  const blob = new Blob([promptText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'work-jeopardy-agent-prompt.txt';
  link.click();
  URL.revokeObjectURL(url);
  setStatus('Prompt downloaded.');
}

function initBuilder() {
  const form = document.getElementById('builder-form');
  if (!form) {
    return;
  }

  form.addEventListener('input', () => {
    setStatus('');
    updatePrompt();
  });
  form.addEventListener('change', () => {
    setStatus('');
    updatePrompt();
  });

  document.getElementById('copy-prompt').addEventListener('click', copyPrompt);
  document.getElementById('copy-prompt-bottom').addEventListener('click', copyPrompt);
  document.getElementById('download-prompt').addEventListener('click', downloadPrompt);
  document.getElementById('load-new-example').addEventListener('click', () => {
    applyState(NEW_GAME_EXAMPLE);
    setStatus('Loaded a new-game example.');
  });
  document.getElementById('load-enrich-example').addEventListener('click', () => {
    applyState(ENRICH_EXAMPLE);
    setStatus('Loaded an enrichment example.');
  });

  applyState(DEFAULT_STATE);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBuilder, { once: true });
  } else {
    initBuilder();
  }
}
