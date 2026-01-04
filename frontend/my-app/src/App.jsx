import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('predictor') // 'predictor' or 'about'
  const [data, setData] = useState([])
  const [gameData, setGameData] = useState([])
  const [averagesData, setAveragesData] = useState([])
  const [modelStats, setModelStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [playerSearch, setPlayerSearch] = useState('')
  const [playerGames, setPlayerGames] = useState([])
  const [playerGames10, setPlayerGames10] = useState([])
  const [prediction, setPrediction] = useState(null)
  const [actualGame, setActualGame] = useState(null)
  const [averages, setAverages] = useState(null)
  const [graphView, setGraphView] = useState('5games') // '5games' or '10games'

  useEffect(() => {
    // Load prediction CSV data
    const baseUrl = import.meta.env.BASE_URL || '/'
    fetch(`${baseUrl}frontend_predictions.csv`)
      .then(response => response.text())
      .then(text => {
        const lines = text.split('\n').filter(line => line.trim())
        if (lines.length === 0) {
          setLoading(false)
          return
        }
        
        // Parse CSV header
        const headers = lines[0].split(',').map(h => h.trim())
        const rows = []
        
        // Parse CSV rows (simple parser - handles basic CSV)
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',')
            const row = {}
            headers.forEach((header, index) => {
              let value = values[index]?.trim() || ''
              // Handle boolean strings
              if (value === 'True') value = true
              if (value === 'False') value = false
              row[header] = value
            })
            rows.push(row)
          }
        }
        
        setData(rows)
        
        // Load game data CSV
        return fetch(`${baseUrl}nba_2025_all_players_full_season_all_games.csv`)
      })
      .then(response => {
        if (!response) {
          setLoading(false)
          return
        }
        return response.text()
      })
      .then(text => {
        if (!text) {
          setLoading(false)
          return
        }
        
        // Parse the game data CSV (skip first 2 header rows)
        const lines = text.split('\n').filter(line => line.trim())
        if (lines.length < 3) {
          setLoading(false)
          return
        }
        
        const gameRows = []
        
        for (let i = 2; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',')
            const playerName = values[3]?.trim() || ''
            
            // Skip non-player rows
            if (!playerName || playerName === 'Reserves' || playerName === 'Starters' || playerName === 'Did Not Play') {
              continue
            }
            
            // Parse the game data
            const gameDate = values[0]?.trim() || ''
            const team = values[1]?.trim() || ''
            const opponent = values[2]?.trim() || ''
            const mp = values[4]?.trim() || ''
            const fg = parseFloat(values[5]) || 0
            const fga = parseFloat(values[6]) || 0
            const fgPct = parseFloat(values[7]) || 0
            const threeP = parseFloat(values[8]) || 0
            const threePA = parseFloat(values[9]) || 0
            const threePct = parseFloat(values[10]) || 0
            const ft = parseFloat(values[11]) || 0
            const fta = parseFloat(values[12]) || 0
            const ftPct = parseFloat(values[13]) || 0
            const orb = parseFloat(values[14]) || 0
            const drb = parseFloat(values[15]) || 0
            const trb = parseFloat(values[16]) || 0
            const ast = parseFloat(values[17]) || 0
            const stl = parseFloat(values[18]) || 0
            const blk = parseFloat(values[19]) || 0
            const tov = parseFloat(values[20]) || 0
            const pf = parseFloat(values[21]) || 0
            const pts = parseFloat(values[22]) || 0
            const gmSc = parseFloat(values[23]) || 0
            const plusMinus = parseFloat(values[24]) || 0
            
            // Convert MP (MM:SS) to seconds
            let minutesPlayed = 0
            if (mp && mp.includes(':')) {
              const [mins, secs] = mp.split(':').map(Number)
              minutesPlayed = (mins * 60) + secs
            }
            
            // Skip if no valid data
            if (!gameDate || !pts) {
              continue
            }
            
            gameRows.push({
              date: gameDate,
              player_name: playerName,
              team: team,
              opponent: opponent,
              minutes_played: minutesPlayed,
              points: pts,
              field_goals: fg,
              field_goal_attempts: fga,
              field_goal_percentage: fgPct,
              three_pointers: threeP,
              three_point_attempts: threePA,
              three_point_percentage: threePct,
              free_throws: ft,
              free_throw_attempts: fta,
              free_throw_percentage: ftPct,
              offensive_rebounds: orb,
              defensive_rebounds: drb,
              total_rebounds: trb,
              assists: ast,
              steals: stl,
              blocks: blk,
              turnovers: tov,
              personal_fouls: pf,
              game_score: gmSc,
              plus_minus: plusMinus
            })
          }
        }
        
        setGameData(gameRows)
        
        // Load averages CSV
        return fetch(`${baseUrl}player_averages_for_frontend.csv`)
      })
      .then(response => {
        if (!response) {
          setLoading(false)
          return
        }
        return response.text()
      })
      .then(text => {
        if (!text) {
          setLoading(false)
          return
        }
        
        // Parse averages CSV
        const lines = text.split('\n').filter(line => line.trim())
        if (lines.length === 0) {
          setLoading(false)
          return
        }
        
        const headers = lines[0].split(',').map(h => h.trim())
        const avgRows = []
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',')
            const row = {}
            headers.forEach((header, index) => {
              let value = values[index]?.trim() || ''
              if (value === '') value = null
              else if (value !== 'None' && !isNaN(value)) {
                value = parseFloat(value)
              }
              row[header] = value
            })
            avgRows.push(row)
          }
        }
        
        setAveragesData(avgRows)
        
        // Load model improvement stats CSV
        return fetch(`${baseUrl}model_improvement_analysis.csv`)
      })
      .then(response => {
        if (!response || response.status === 404) {
          setLoading(false)
          return
        }
        return response.text()
      })
      .then(text => {
        if (!text) {
          setLoading(false)
          return
        }
        
        // Parse model stats CSV
        const lines = text.split('\n').filter(line => line.trim())
        if (lines.length === 0) {
          setLoading(false)
          return
        }
        
        const headers = lines[0].split(',').map(h => h.trim())
        const statsRows = []
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',')
            const row = {}
            headers.forEach((header, index) => {
              let value = values[index]?.trim() || ''
              if (value === '' || value === 'None') value = null
              else if (!isNaN(value) && value !== '') {
                value = parseFloat(value)
              }
              row[header] = value
            })
            statsRows.push(row)
          }
        }
        
        setModelStats(statsRows)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading CSV:', error)
        setLoading(false)
      })
  }, [])

  // Format minutes from seconds
  const formatMinutes = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get unique dates
  const dates = [...new Set(data.map(row => row.date))].filter(Boolean).sort()

  // Get unique players (filtered by search)
  const allPlayers = [...new Set(data.map(row => row.player_name))].filter(Boolean).sort()
  const filteredPlayers = allPlayers.filter(player =>
    player.toLowerCase().includes(playerSearch.toLowerCase())
  )

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setPlayerGames([])
    setPlayerGames10([])
    setPrediction(null)
    setActualGame(null)
    setAverages(null)
    if (selectedPlayer) {
      loadPlayerData(selectedPlayer, date)
    }
  }

  // Handle player selection
  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player)
    setPlayerSearch('')
    if (selectedDate) {
      loadPlayerData(player, selectedDate)
    }
  }

  // Load player's previous 5 games and prediction
  const loadPlayerData = (playerName, date) => {
    // Filter data for this player and date
    const playerDateData = data.filter(
      row => row.player_name === playerName && row.date === date
    )

    if (playerDateData.length === 0) {
      setPlayerGames([])
      setPrediction(null)
      setActualGame(null)
      return
    }

    // Check if player played
    const played = playerDateData[0].played === true || playerDateData[0].played === 'True'
    
    // Organize prediction data
    const pred = {}
    playerDateData.forEach(row => {
      if (row.stat) {
        pred[row.stat] = {
          predicted: parseFloat(row.predicted) || 0,
          actual: row.actual ? parseFloat(row.actual) : null,
          difference: row.difference ? parseFloat(row.difference) : null
        }
      }
    })

    setPrediction(pred)
    setActualGame({
      played: played,
      team: playerDateData[0].team || '',
      opponent: playerDateData[0].opponent || ''
    })

    // Get averages for this player and date
    const playerAverages = averagesData.find(
      row => row.player_name === playerName && row.date === date
    )
    
    if (playerAverages) {
      setAverages({
        avg5: {
          points: playerAverages.avg_5_points,
          total_rebounds: playerAverages.avg_5_total_rebounds,
          assists: playerAverages.avg_5_assists,
          steals: playerAverages.avg_5_steals,
          blocks: playerAverages.avg_5_blocks,
          turnovers: playerAverages.avg_5_turnovers,
          field_goal_percentage: playerAverages.avg_5_field_goal_percentage,
          three_point_percentage: playerAverages.avg_5_three_point_percentage,
          free_throw_percentage: playerAverages.avg_5_free_throw_percentage,
          minutes_played: playerAverages.avg_5_minutes_played,
          game_score: playerAverages.avg_5_game_score,
          plus_minus: playerAverages.avg_5_plus_minus
        },
        avg10: {
          points: playerAverages.avg_10_points,
          total_rebounds: playerAverages.avg_10_total_rebounds,
          assists: playerAverages.avg_10_assists,
          steals: playerAverages.avg_10_steals,
          blocks: playerAverages.avg_10_blocks,
          turnovers: playerAverages.avg_10_turnovers,
          field_goal_percentage: playerAverages.avg_10_field_goal_percentage,
          three_point_percentage: playerAverages.avg_10_three_point_percentage,
          free_throw_percentage: playerAverages.avg_10_free_throw_percentage,
          minutes_played: playerAverages.avg_10_minutes_played,
          game_score: playerAverages.avg_10_game_score,
          plus_minus: playerAverages.avg_10_plus_minus
        }
      })
    } else {
      setAverages(null)
    }

    // Get previous games from gameData CSV
    const dateObj = new Date(date)
    const playerGamesBeforeDate = gameData
      .filter(game => {
        if (game.player_name !== playerName || !game.date) return false
        const gameDate = new Date(game.date)
        return gameDate < dateObj
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort descending (most recent first)

    // Get last 5 games
    const games5 = playerGamesBeforeDate.slice(0, 5).reverse() // Reverse to show oldest to newest
    
    // Get last 10 games
    const games10 = playerGamesBeforeDate.slice(0, 10).reverse()

    // Format games for display (5 games)
    const formattedGames5 = games5.map((game, index) => ({
      date: game.date,
      team: game.team,
      opponent: game.opponent,
      mp: formatMinutes(game.minutes_played),
      pts: game.points.toFixed(1),
      trb: game.total_rebounds.toFixed(1),
      ast: game.assists.toFixed(1),
      stl: game.steals.toFixed(1),
      blk: game.blocks.toFixed(1),
      tov: game.turnovers.toFixed(1),
      fgPct: (game.field_goal_percentage * 100).toFixed(1),
      threePct: (game.three_point_percentage * 100).toFixed(1),
      ftPct: (game.free_throw_percentage * 100).toFixed(1),
      gmSc: game.game_score.toFixed(1),
      plusMinus: game.plus_minus.toFixed(1),
      // For graph
      points: game.points,
      gameNumber: index + 1
    }))

    // Format games for display (10 games)
    const formattedGames10 = games10.map((game, index) => ({
      date: game.date,
      team: game.team,
      opponent: game.opponent,
      mp: formatMinutes(game.minutes_played),
      pts: game.points.toFixed(1),
      trb: game.total_rebounds.toFixed(1),
      ast: game.assists.toFixed(1),
      stl: game.steals.toFixed(1),
      blk: game.blocks.toFixed(1),
      tov: game.turnovers.toFixed(1),
      fgPct: (game.field_goal_percentage * 100).toFixed(1),
      threePct: (game.three_point_percentage * 100).toFixed(1),
      ftPct: (game.free_throw_percentage * 100).toFixed(1),
      gmSc: game.game_score.toFixed(1),
      plusMinus: game.plus_minus.toFixed(1),
      // For graph
      points: game.points,
      gameNumber: index + 1
    }))

    setPlayerGames(formattedGames5)
    setPlayerGames10(formattedGames10)
  }

  // Format stat name for display
  const formatStatName = (stat) => {
    const statMap = {
      'points': 'PTS',
      'total_rebounds': 'TRB',
      'assists': 'AST',
      'steals': 'STL',
      'blocks': 'BLK',
      'turnovers': 'TOV',
      'field_goal_percentage': 'FG%',
      'three_point_percentage': '3P%',
      'free_throw_percentage': 'FT%',
      'minutes_played': 'MP',
      'game_score': 'GmSc',
      'plus_minus': '+/-'
    }
    return statMap[stat] || stat
  }

  // Format stat name for display
  const formatStatNameForAbout = (stat) => {
    const statMap = {
      'points': 'Points',
      'total_rebounds': 'Total Rebounds',
      'assists': 'Assists',
      'steals': 'Steals',
      'blocks': 'Blocks',
      'turnovers': 'Turnovers',
      'field_goal_percentage': 'Field Goal %',
      'three_point_percentage': 'Three Point %',
      'free_throw_percentage': 'Free Throw %',
      'minutes_played': 'Minutes Played',
      'game_score': 'Game Score',
      'plus_minus': 'Plus/Minus'
    }
    return statMap[stat] || stat
  }

  if (loading) {
    return <div className="loading">Loading data...</div>
  }

  // About Page Component
  if (currentPage === 'about') {
    const overallStats = modelStats.find(row => row.stat === 'OVERALL')
    const statRows = modelStats.filter(row => row.stat !== 'OVERALL')
    
    return (
      <div className="app">
        {/* Fixed Header */}
        <div className="header">
          <h1 className="title">LSTM NBA Stat Predictor</h1>
          <div className="header-right">
            {currentPage === 'predictor' && (
              <div className="search-controls">
                <div className="search-group">
                  <label htmlFor="date-select-about">Date:</label>
                  <select
                    id="date-select-about"
                    value={selectedDate}
                    onChange={(e) => handleDateSelect(e.target.value)}
                    className="select-input"
                  >
                    <option value="">Select Date</option>
                    {dates.map(date => (
                      <option key={date} value={date}>
                        {new Date(date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="search-group player-search-group">
                  <label htmlFor="player-search-about">Player:</label>
                  <div className="player-select-wrapper">
                    <input
                      id="player-search-about"
                      type="text"
                      placeholder="Search player..."
                      value={playerSearch || selectedPlayer || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        setPlayerSearch(value)
                        if (value && selectedPlayer) {
                          setSelectedPlayer('')
                          setPlayerGames([])
                          setPrediction(null)
                          setActualGame(null)
                        }
                      }}
                      onFocus={(e) => {
                        if (selectedPlayer && !playerSearch) {
                          setPlayerSearch(selectedPlayer)
                          setSelectedPlayer('')
                        }
                      }}
                      className="search-input"
                    />
                    {playerSearch && filteredPlayers.length > 0 && !selectedPlayer && (
                      <div className="player-dropdown">
                        {filteredPlayers.slice(0, 10).map(player => (
                          <div
                            key={player}
                            className="player-option"
                            onClick={() => {
                              handlePlayerSelect(player)
                            }}
                          >
                            {player}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="nav-controls">
              <button 
                className={`nav-button ${currentPage === 'predictor' ? 'active' : ''}`}
                onClick={() => setCurrentPage('predictor')}
              >
                Predictor
              </button>
              <button 
                className={`nav-button ${currentPage === 'about' ? 'active' : ''}`}
                onClick={() => setCurrentPage('about')}
              >
                About & Stats
              </button>
            </div>
          </div>
        </div>

        {/* About Page Content */}
        <div className="about-content">
          {/* Left Side - About Section */}
          <div className="about-section">
            <h2>About the Model</h2>
            
            <div className="about-text">
              <h3>Purpose</h3>
              <p>
                This LSTM (Long Short-Term Memory) neural network model is designed to predict NBA player 
                statistics by analyzing patterns in a player's recent game performance. The model takes 
                the previous 5 consecutive games as input and predicts the 6th game's statistics.
              </p>

              <h3>Model Architecture</h3>
              <p>
                The model uses a 2-layer LSTM architecture with 128 hidden units per layer, dropout 
                regularization (0.2 for LSTM, 0.3 for fully connected layers), and fully connected 
                layers for output prediction. The model was trained on all games up to March 1, 2025, 
                using 100 epochs with Adam optimizer and learning rate scheduling.
              </p>

              <h3>Training Data</h3>
              <p>
                The model was trained on comprehensive NBA player statistics including:
              </p>
              <ul>
                <li>Basic stats: Points, Rebounds (Offensive, Defensive, Total), Assists, Steals, Blocks, Turnovers, Personal Fouls</li>
                <li>Shooting stats: Field Goals, Field Goal Attempts, Field Goal %, Three Pointers, Three Point Attempts, Three Point %, Free Throws, Free Throw Attempts, Free Throw %</li>
                <li>Game metrics: Minutes Played, Game Score, Plus/Minus</li>
              </ul>
              <p>
                <strong>Note:</strong> Advanced statistics (True Shooting %, Effective Field Goal %, Usage %, Offensive/Defensive Rating, Box Plus/Minus) were excluded from the model to focus on more directly observable game statistics.
              </p>

              <h3>Testing & Evaluation</h3>
              <p>
                The model's performance was evaluated on games from March 29 to April 2, 2025. 
                Predictions were compared against:
              </p>
              <ul>
                <li><strong>5-Game Average:</strong> Simple average of the player's last 5 games</li>
                <li><strong>10-Game Average:</strong> Simple average of the player's last 10 games</li>
                <li><strong>Actual Results:</strong> The actual game statistics</li>
              </ul>

              <h3>Normalization</h3>
              <p>
                To ensure fair comparison across players with different performance levels, errors 
                are normalized by each player's range of actual values. This allows the model's 
                performance to be evaluated relative to each player's typical stat range, rather 
                than using absolute differences.
              </p>

              <h3>Key Metrics</h3>
              <p>
                The statistics shown on the right display:
              </p>
              <ul>
                <li><strong>Average Improvement:</strong> Percentage improvement of the model over simple averaging methods</li>
                <li><strong>Success Rate:</strong> Percentage of predictions where the model outperformed the averaging method</li>
                <li><strong>Average Errors:</strong> Mean absolute error for each prediction method</li>
              </ul>

              {overallStats && (
                <div className="overall-summary">
                  <h3>Overall Performance</h3>
                  <p>
                    Across all statistics and players, the model shows:
                  </p>
                  <ul>
                    {overallStats.avg_improvement_vs_avg5_pct !== null && (
                      <li>
                        <strong>{overallStats.avg_improvement_vs_avg5_pct > 0 ? '+' : ''}{overallStats.avg_improvement_vs_avg5_pct.toFixed(2)}%</strong> 
                        {' '}improvement vs 5-game average
                      </li>
                    )}
                    {overallStats.avg_improvement_vs_avg10_pct !== null && (
                      <li>
                        <strong>{overallStats.avg_improvement_vs_avg10_pct > 0 ? '+' : ''}{overallStats.avg_improvement_vs_avg10_pct.toFixed(2)}%</strong> 
                        {' '}improvement vs 10-game average
                      </li>
                    )}
                    {overallStats.success_rate_vs_avg5_pct !== null && (
                      <li>
                        <strong>{overallStats.success_rate_vs_avg5_pct.toFixed(1)}%</strong> 
                        {' '}success rate vs 5-game average
                      </li>
                    )}
                    {overallStats.success_rate_vs_avg10_pct !== null && (
                      <li>
                        <strong>{overallStats.success_rate_vs_avg10_pct.toFixed(1)}%</strong> 
                        {' '}success rate vs 10-game average
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Stats Table */}
          <div className="stats-section">
            <h2>Model Performance by Stat</h2>
            {modelStats.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Stat</th>
                    <th>Improvement vs Avg (5)</th>
                    <th>Success Rate (5)</th>
                    <th>Improvement vs Avg (10)</th>
                    <th>Success Rate (10)</th>
                    <th>Model Error</th>
                    <th>Avg (5) Error</th>
                    <th>Avg (10) Error</th>
                  </tr>
                </thead>
                <tbody>
                  {statRows.map((row, index) => (
                    <tr key={index}>
                      <td className="stat-name">{formatStatNameForAbout(row.stat)}</td>
                      <td className={row.avg_improvement_vs_avg5_pct > 0 ? 'positive' : 'negative'}>
                        {row.avg_improvement_vs_avg5_pct !== null 
                          ? (row.avg_improvement_vs_avg5_pct > 0 ? '+' : '') + row.avg_improvement_vs_avg5_pct.toFixed(2) + '%'
                          : '-'}
                      </td>
                      <td>
                        {row.success_rate_vs_avg5_pct !== null 
                          ? row.success_rate_vs_avg5_pct.toFixed(1) + '%'
                          : '-'}
                      </td>
                      <td className={row.avg_improvement_vs_avg10_pct > 0 ? 'positive' : 'negative'}>
                        {row.avg_improvement_vs_avg10_pct !== null 
                          ? (row.avg_improvement_vs_avg10_pct > 0 ? '+' : '') + row.avg_improvement_vs_avg10_pct.toFixed(2) + '%'
                          : '-'}
                      </td>
                      <td>
                        {row.success_rate_vs_avg10_pct !== null 
                          ? row.success_rate_vs_avg10_pct.toFixed(1) + '%'
                          : '-'}
                      </td>
                      <td>{row.avg_model_error !== null ? row.avg_model_error.toFixed(3) : '-'}</td>
                      <td>{row.avg_avg5_error !== null ? row.avg_avg5_error.toFixed(3) : '-'}</td>
                      <td>{row.avg_avg10_error !== null ? row.avg_avg10_error.toFixed(3) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>Model statistics not available. Please run calculate_model_improvement.py to generate the analysis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Fixed Header */}
      <div className="header">
        <h1 className="title">LSTM NBA Stat Predictor</h1>
        <div className="header-right">
          {currentPage === 'predictor' && (
            <div className="search-controls">
              <div className="search-group">
                <label htmlFor="date-select">Date:</label>
                <select
                  id="date-select"
                  value={selectedDate}
                  onChange={(e) => handleDateSelect(e.target.value)}
                  className="select-input"
                >
                  <option value="">Select Date</option>
                  {dates.map(date => (
                    <option key={date} value={date}>
                      {new Date(date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </option>
                  ))}
                </select>
              </div>
              <div className="search-group player-search-group">
                <label htmlFor="player-search">Player:</label>
                <div className="player-select-wrapper">
                  <input
                    id="player-search"
                    type="text"
                    placeholder="Search player..."
                    value={playerSearch || selectedPlayer || ''}
                    onChange={(e) => {
                      const value = e.target.value
                      setPlayerSearch(value)
                      // Clear selected player when user starts typing
                      if (value && selectedPlayer) {
                        setSelectedPlayer('')
                        setPlayerGames([])
                        setPrediction(null)
                        setActualGame(null)
                      }
                    }}
                    onFocus={(e) => {
                      // When focusing, show search if there's a selected player
                      if (selectedPlayer && !playerSearch) {
                        setPlayerSearch(selectedPlayer)
                        setSelectedPlayer('')
                      }
                    }}
                    className="search-input"
                  />
                  {playerSearch && filteredPlayers.length > 0 && !selectedPlayer && (
                    <div className="player-dropdown">
                      {filteredPlayers.slice(0, 10).map(player => (
                        <div
                          key={player}
                          className="player-option"
                          onClick={() => {
                            handlePlayerSelect(player)
                          }}
                        >
                          {player}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="nav-controls">
            <button 
              className={`nav-button ${currentPage === 'predictor' ? 'active' : ''}`}
              onClick={() => setCurrentPage('predictor')}
            >
              Predictor
            </button>
            <button 
              className={`nav-button ${currentPage === 'about' ? 'active' : ''}`}
              onClick={() => setCurrentPage('about')}
            >
              About & Stats
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Previous 5 Games Table */}
        <div className="table-container">
          <h2>Previous 5 Games</h2>
          {playerGames.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Opp</th>
                  <th>MP</th>
                  <th>PTS</th>
                  <th>TRB</th>
                  <th>AST</th>
                  <th>STL</th>
                  <th>BLK</th>
                  <th>TOV</th>
                  <th>FG%</th>
                  <th>3P%</th>
                  <th>FT%</th>
                  <th>GmSc</th>
                  <th>+/-</th>
                </tr>
              </thead>
              <tbody>
                {playerGames.map((game, index) => (
                  <tr key={index}>
                    <td>{new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td>{game.opponent}</td>
                    <td>{game.mp}</td>
                    <td>{game.pts}</td>
                    <td>{game.trb}</td>
                    <td>{game.ast}</td>
                    <td>{game.stl}</td>
                    <td>{game.blk}</td>
                    <td>{game.tov}</td>
                    <td>{game.fgPct}%</td>
                    <td>{game.threePct}%</td>
                    <td>{game.ftPct}%</td>
                    <td>{game.gmSc}</td>
                    <td>{game.plusMinus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>Select a date and player to view previous games</p>
            </div>
          )}

          {/* Graph Section */}
          {(playerGames.length > 0 || playerGames10.length > 0) && prediction && (
            <div className="graph-section">
              <div className="graph-header">
                <h3>Points Trend</h3>
                <div className="graph-toggle">
                  <button
                    className={graphView === '5games' ? 'active' : ''}
                    onClick={() => setGraphView('5games')}
                  >
                    5 Games
                  </button>
                  <button
                    className={graphView === '10games' ? 'active' : ''}
                    onClick={() => setGraphView('10games')}
                  >
                    10 Games
        </button>
                </div>
              </div>
              <div className="graph-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={(() => {
                      const games = graphView === '5games' ? playerGames : playerGames10
                      const gameData = games.map(g => ({ 
                        game: `G${g.gameNumber}`, 
                        predicted: null,
                        actual: null,
                        points: g.points 
                      }))
                      
                      // Add predicted point
                      gameData.push({ 
                        game: 'Pred', 
                        predicted: prediction.points?.predicted || 0,
                        actual: null,
                        points: null
                      })
                      
                      // Add actual point if available
                      if (actualGame?.played && prediction.points?.actual !== null) {
                        gameData.push({ 
                          game: 'Actual', 
                          predicted: null,
                          actual: prediction.points.actual,
                          points: null
                        })
                      }
                      
                      return gameData
                    })()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis 
                      dataKey="game" 
                      stroke="#e0e0e0"
                      tick={{ fill: '#e0e0e0', fontSize: 12 }}
                    />
                    <YAxis 
                      stroke="#e0e0e0"
                      tick={{ fill: '#e0e0e0', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#2d2d2d', 
                        border: '1px solid #555',
                        color: '#e0e0e0'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ color: '#e0e0e0' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="points" 
                      name="Previous Games"
                      stroke="#667eea" 
                      strokeWidth={2}
                      dot={{ fill: '#667eea', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      name="Predicted"
                      stroke="#4caf50" 
                      strokeWidth={2}
                      dot={{ fill: '#4caf50', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      name="Actual"
                      stroke="#f44336" 
                      strokeWidth={2}
                      dot={{ fill: '#f44336', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Predicted vs Averages vs Actual Table */}
        <div className="table-container">
          <h2>Predicted 6th Game {actualGame?.played && actualGame.team && `(${actualGame.team} vs ${actualGame.opponent})`}</h2>
          {!actualGame?.played && selectedDate && selectedPlayer ? (
            <div className="no-game-message">
              <p>This player did not play on {new Date(selectedDate).toLocaleDateString()}</p>
            </div>
          ) : prediction ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stat</th>
                  <th>Model</th>
                  <th>Avg (5)</th>
                  <th>Avg (10)</th>
                  {Object.values(prediction).some(v => v.actual !== null) && <th>Actual</th>}
                </tr>
              </thead>
              <tbody>
                {Object.entries(prediction).map(([stat, values]) => {
                  const avg5Val = averages?.avg5?.[stat]
                  const avg10Val = averages?.avg10?.[stat]
                  
                  return (
                    <tr key={stat}>
                      <td className="stat-name">{formatStatName(stat)}</td>
                      <td className="model-value">
                        {stat === 'minutes_played' 
                          ? formatMinutes(values.predicted)
                          : stat.includes('percentage')
                          ? (values.predicted * 100).toFixed(1) + '%'
                          : values.predicted.toFixed(1)}
                      </td>
                      <td className="avg-value">
                        {avg5Val !== null && avg5Val !== undefined ? (
                          stat === 'minutes_played' 
                            ? formatMinutes(avg5Val)
                            : stat.includes('percentage')
                            ? (avg5Val * 100).toFixed(1) + '%'
                            : avg5Val.toFixed(1)
                        ) : '-'}
                      </td>
                      <td className="avg-value">
                        {avg10Val !== null && avg10Val !== undefined ? (
                          stat === 'minutes_played' 
                            ? formatMinutes(avg10Val)
                            : stat.includes('percentage')
                            ? (avg10Val * 100).toFixed(1) + '%'
                            : avg10Val.toFixed(1)
                        ) : '-'}
                      </td>
                      {values.actual !== null && (
                        <td className="actual-value">
                          {stat === 'minutes_played' 
                            ? formatMinutes(values.actual)
                            : stat.includes('percentage')
                            ? (values.actual * 100).toFixed(1) + '%'
                            : values.actual.toFixed(1)}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>Select a date and player to view predictions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
