# LSTM NBA Stat Predictor Frontend

## Setup

1. Make sure both CSV files are in the `public` folder:
   - `frontend_predictions.csv` - Contains predictions and actual results
   - `nba_2025_all_players_full_season_all_games.csv` - Contains all game data for previous games
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`

## Features

- Select a date from available dates in the CSV
- Search and select a player
- View predictions for the 6th game
- View previous 5 games from the full season CSV
- Compare predictions with actual results

## CSV File Locations

The CSV files should be placed at:
- `public/frontend_predictions.csv`
- `public/nba_2025_all_players_full_season_all_games.csv`

If the files are not found, copy them from the project root:
```bash
cp ../../frontend_predictions.csv public/frontend_predictions.csv
cp ../../nba_2025_all_players_full_season_all_games.csv public/nba_2025_all_players_full_season_all_games.csv
```
