# GitHub Pages Deployment

This repository deploys to GitHub Pages with GitHub Actions from
[`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml).

## One-Time Setup

1. Make sure the repository is pushed to GitHub.
2. Open the GitHub repository settings.
3. Go to `Pages`.
4. Set the source to `GitHub Actions`.

GitHub will then publish the site at a URL like:

```text
https://<github-user>.github.io/<repo-name>/
```

For this repository, that should be:

```text
https://colinmichaels.github.io/work-jeopardy/
```

## Automatic Deploys

The Pages workflow runs when changes are pushed to either of these branches:

- `dev`
- `master`

That means merges into either branch will trigger a fresh build and deployment automatically.
The workflow can also be run manually from the `Actions` tab through `workflow_dispatch`.

## Build And Deploy Flow

The workflow:

1. Checks out the repository
2. Installs dependencies with `npm ci`
3. Runs `npm run build`
4. Uploads `dist/` as the Pages artifact
5. Deploys that artifact to GitHub Pages

## Notes

- The current Vite config uses relative asset paths, which works well for GitHub Pages project sites.
- The deployed site is a static frontend only. No backend setup is required.
- GitHub Pages hosts a single live site for the repository, so whichever deployment from `dev` or `master` runs most recently becomes the live version.
- For a local production build, run `npm run build`.
