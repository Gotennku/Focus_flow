import { useEffect } from 'react';
import { useStore } from '../store';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const { analytics, loadAnalytics } = useStore();

  useEffect(() => {
    loadAnalytics(30);
  }, []);

  if (!analytics) {
    return (
      <div className="analytics-container container">
        <div className="card">
          <p>Chargement des analytics...</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Prepare daily chart data (last 14 days)
  const last14Days = analytics.dailyStats.slice(-14).map(stat => ({
    date: new Date(stat.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
    pomodoros: stat.pomodoros,
    hours: (stat.focusTime / 3600).toFixed(1)
  }));

  // Prepare hourly heatmap data
  const hourlyData = analytics.hourlyHeatmap.map((count, hour) => ({
    hour: `${hour}h`,
    count
  }));

  const maxHourlyCount = Math.max(...analytics.hourlyHeatmap);

  // Calculate average stats
  const avgPomodorosPerDay =
    analytics.dailyStats.length > 0
      ? (analytics.totalPomodoros / analytics.dailyStats.length).toFixed(1)
      : '0';

  const avgFocusTimePerDay =
    analytics.dailyStats.length > 0
      ? formatTime(analytics.totalFocusTime / analytics.dailyStats.length)
      : '0m';

  return (
    <div className="analytics-container container">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📊 Analytics de Productivité</h2>
          <p className="card-subtitle">
            Vue d'ensemble de vos performances sur les 30 derniers jours
          </p>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🍅</div>
            <div className="stat-label">Total Pomodoros</div>
            <div className="stat-value">{analytics.totalPomodoros}</div>
            <div className="stat-meta">
              Moyenne : {avgPomodorosPerDay}/jour
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-label">Temps de Focus</div>
            <div className="stat-value">{formatTime(analytics.totalFocusTime)}</div>
            <div className="stat-meta">
              Moyenne : {avgFocusTimePerDay}/jour
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-label">Tâches Complétées</div>
            <div className="stat-value">{analytics.totalTasks}</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-label">Série Actuelle</div>
            <div className="stat-value">{analytics.currentStreak}</div>
            <div className="stat-meta">
              Record : {analytics.longestStreak} jours
            </div>
          </div>
        </div>

        {/* Daily Pomodoros Chart */}
        {last14Days.length > 0 && (
          <div className="chart-section">
            <h3 className="chart-title">📈 Pomodoros par jour (14 derniers jours)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={last14Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    color: 'var(--text-primary)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="pomodoros"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--primary)', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Hourly Heatmap */}
        <div className="chart-section">
          <h3 className="chart-title">🌡️ Heatmap des heures productives</h3>
          <p className="chart-subtitle">
            Identifiez vos heures les plus productives de la journée
          </p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="hour" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  color: 'var(--text-primary)'
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {hourlyData.map((entry, index) => {
                  const intensity = entry.count / maxHourlyCount;
                  const color = `rgba(99, 102, 241, ${0.3 + intensity * 0.7})`;
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="insights-section">
          <h3 className="insights-title">💡 Insights</h3>
          <div className="insights-grid">
            {analytics.currentStreak >= 7 && (
              <div className="insight-card success">
                <span className="insight-icon">🎉</span>
                <div>
                  <div className="insight-title">Série impressionnante !</div>
                  <div className="insight-text">
                    Vous avez maintenu une série de {analytics.currentStreak} jours. Continuez comme ça !
                  </div>
                </div>
              </div>
            )}

            {analytics.totalPomodoros >= 100 && (
              <div className="insight-card success">
                <span className="insight-icon">🏆</span>
                <div>
                  <div className="insight-title">Centurion du Focus</div>
                  <div className="insight-text">
                    Vous avez complété plus de 100 Pomodoros. Vous êtes un maître de la concentration !
                  </div>
                </div>
              </div>
            )}

            {analytics.hourlyHeatmap.some(count => count > 10) && (
              <div className="insight-card info">
                <span className="insight-icon">⚡</span>
                <div>
                  <div className="insight-title">Heure de pointe identifiée</div>
                  <div className="insight-text">
                    {analytics.hourlyHeatmap.indexOf(Math.max(...analytics.hourlyHeatmap))}h semble être votre heure la plus productive. Planifiez vos tâches importantes à ce moment !
                  </div>
                </div>
              </div>
            )}

            {analytics.currentStreak === 0 && analytics.totalPomodoros > 0 && (
              <div className="insight-card warning">
                <span className="insight-icon">💪</span>
                <div>
                  <div className="insight-title">Reprenez votre élan</div>
                  <div className="insight-text">
                    Votre série s'est interrompue. Lancez un Pomodoro aujourd'hui pour recommencer !
                  </div>
                </div>
              </div>
            )}

            {analytics.totalPomodoros === 0 && (
              <div className="insight-card info">
                <span className="insight-icon">🚀</span>
                <div>
                  <div className="insight-title">Commencez votre voyage</div>
                  <div className="insight-text">
                    Lancez votre premier Pomodoro pour commencer à suivre vos progrès !
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
