# Deploying to GitHub Pages

This React app with recharts can be deployed to GitHub Pages. Follow these steps:

## Prerequisites

1. Make sure your repository is on GitHub
2. Ensure both CSV files are in the `public` folder:
   - `frontend_predictions.csv`
   - `nba_2025_all_players_full_season_all_games.csv`

## Deployment Steps

### Option 1: Using GitHub Actions (Recommended)

1. Create a `.github/workflows/deploy.yml` file in your repository root:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/my-app/package-lock.json
      
      - name: Install dependencies
        working-directory: frontend/my-app
        run: npm ci
      
      - name: Build
        working-directory: frontend/my-app
        run: npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: frontend/my-app/dist
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. In your GitHub repository:
   - Go to Settings → Pages
   - Under "Source", select "GitHub Actions"
   - Save

3. Push your code and the workflow will automatically deploy

### Option 2: Manual Deployment

1. Build the app:
   ```bash
   cd frontend/my-app
   npm install
   npm run build
   ```

2. The `dist` folder contains the built files

3. Push the `dist` folder contents to the `gh-pages` branch:
   ```bash
   # Install gh-pages if needed: npm install -g gh-pages
   cd dist
   git init
   git add .
   git commit -m "Deploy to GitHub Pages"
   git branch -M gh-pages
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin gh-pages
   ```

4. In GitHub repository settings → Pages, select the `gh-pages` branch

## Important Notes

- **Base Path**: If your app is not at the root of the domain, update `vite.config.js` to set the `base` property
- **CSV Files**: Make sure both CSV files are in the `public` folder before building
- **Recharts**: Works perfectly on GitHub Pages as it's client-side only

## Troubleshooting

- If charts don't appear, check the browser console for errors
- Ensure CSV files are accessible (check Network tab)
- Verify the build completed successfully

