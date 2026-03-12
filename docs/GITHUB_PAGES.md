# GitHub Pages Deployment

This project can be published as a static GitHub Pages demo using the `gh-pages` package.

## One-Time Setup

1. Make sure the repo is pushed to GitHub.
2. Install dependencies:

```bash
npm install
```

3. Confirm the repo remote points at the correct GitHub repository:

```bash
git remote -v
```

## Publish The Demo

Run:

```bash
npm run deploy
```

What this does:

1. Runs `npm run build`
2. Builds the static app into `dist/`
3. Publishes `dist/` to the `gh-pages` branch

## Enable GitHub Pages In The Repo

After the first deploy:

1. Open the GitHub repository settings.
2. Go to `Pages`.
3. Set the source to `Deploy from a branch`.
4. Choose the `gh-pages` branch.
5. Choose the `/ (root)` folder.

GitHub will then publish the site at a URL like:

```text
https://<github-user>.github.io/<repo-name>/
```

For this repository, that should be:

```text
https://colinmichaels.github.io/work-jeopardy/
```

## Updating The Demo

Any time you want to refresh the hosted demo:

1. Commit your changes locally.
2. Run `npm run deploy`.
3. Wait for GitHub Pages to refresh.

## Notes

- The current Vite config uses relative asset paths, which works well for GitHub Pages project sites.
- The deployed site is a static frontend only. No backend setup is required.
- If you change the game JSON or sounds, rerun `npm run deploy` to publish the new build.
