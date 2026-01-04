import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// For GitHub Pages: if repo is not username.github.io, set base to repo name
// Set REPO_NAME environment variable in workflow, or manually set base here
// If you see a white screen, manually set your repo name below:
const repoName = process.env.REPO_NAME || ''
// If REPO_NAME is not set, you can manually set it here (remove the comment and set your repo name):
// const repoName = 'FinalNBAStatEstimator' // Replace with your actual repo name

const base = repoName && repoName !== 'username.github.io' ? `/${repoName}/` : '/'

export default defineConfig({
  plugins: [react()],
  base: base,
})
