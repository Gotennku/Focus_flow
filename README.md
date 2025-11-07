# 🎯 Focus Flow

L'outil de productivité ultime combinant technique Pomodoro, blocage de distractions et insights IA. Restez concentré, suivez vos progrès et optimisez vos habitudes de travail avec des suggestions intelligentes.

![Focus Flow](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Fonctionnalités

- ⏱️ **Timer Pomodoro personnalisable** (25/5 par défaut)
- ✅ **Liste de tâches intégrée** avec estimations de temps
- 🚫 **Bloqueur de sites web** pendant les sessions de focus
- 🔕 **Suppression des notifications système**
- 📊 **Tableau de bord analytics** de productivité
- 🔥 **Suivi de séries** (streaks)
- 🎵 **Musique lo-fi** intégrée (optionnel)
- 📈 **Heatmap** des heures productives
- 🏆 **Gamification** avec badges et insights

## 🛠️ Stack Technique

- **Electron** + **React** + **TypeScript**
- **SQLite** pour l'historique des sessions
- **Zustand** pour la gestion d'état
- **Recharts** pour les visualisations
- **Vite** pour le build ultra-rapide
- Notifications natives de l'OS
- **hostile** pour le blocage de sites

## 📦 Installation

### Prérequis

- Node.js 18+
- npm ou yarn

### Installer les dépendances

```bash
npm install
```

## 🚀 Utilisation

### Mode Développement

```bash
npm run electron:dev
```

Lance l'application en mode développement avec hot-reload.

### Build Production

```bash
npm run electron:build
```

Crée les packages d'installation pour votre plateforme :
- **Windows**: `.exe` (NSIS installer)
- **macOS**: `.dmg`
- **Linux**: `.AppImage` et `.deb`

Les fichiers seront générés dans le dossier `release/`.

## 🎯 Comment ça Marche

1. **Définissez une tâche** depuis votre to-do list
2. **Lancez un Pomodoro** (25 min de focus par défaut)
3. Les **sites distrayants sont bloqués** automatiquement
4. Recevez une **notification** pour la pause (5 min)
5. Après 4 Pomodoros, profitez d'une **pause longue** (15 min)
6. Suivez vos **stats** et améliorez-vous au fil du temps

## 📊 Fonctionnalités Détaillées

### Timer Intelligent

- Timer 25 min travail / 5 min pause (personnalisable)
- Pause longue (15-30 min) tous les 4 cycles
- Affichage grand format du temps restant
- Pause/reprise/reset du timer
- Citations motivantes pendant le focus

### Gestion des Tâches

- To-do list intégrée
- Lien tâche ↔ session Pomodoro
- "Combien de Pomodoros pour cette tâche ?"
- Réorganisation par drag & drop
- Estimation vs temps réel

### Mode Focus

- ✅ Blocage de sites distractifs (YouTube, Twitter, etc.)
- ✅ Désactivation de la mise en veille
- ✅ Affichage de citations motivantes

### Analytics

- Dashboard quotidien/hebdomadaire
- Nombre de Pomodoros complétés
- Temps total de focus
- Tâches terminées
- Heatmap des heures les plus productives
- Graphiques d'évolution
- Streaks (jours consécutifs)

## ⚙️ Configuration

Accédez aux **Paramètres** pour personnaliser :

- ⏱️ Durées (travail, pause courte, pause longue)
- 🔊 Sons et musique lo-fi
- 🚫 Liste des sites à bloquer
- 🔄 Nombre de cycles avant pause longue

## 🔒 Permissions

### Blocage de Sites

Le blocage de sites nécessite des **permissions administrateur** :

- **Linux/macOS**: Modification du fichier `/etc/hosts`
- **Windows**: Modification du fichier `C:\Windows\System32\drivers\etc\hosts`

**Important**: Lancez l'application en tant qu'administrateur si le blocage ne fonctionne pas.

## 🎯 Idéal Pour

- Développeurs luttant contre la procrastination
- Étudiants avec des deadlines
- Travailleurs à distance nécessitant une structure
- Quiconque pratiquant le deep work
- Équipes suivant le temps de focus collectif

## 🧠 La Technique Pomodoro

La technique Pomodoro est une méthode de gestion du temps développée par Francesco Cirillo :

1. Choisissez une tâche
2. Réglez le timer sur 25 minutes
3. Travaillez sans interruption
4. Prenez une pause de 5 minutes
5. Après 4 Pomodoros, prenez une pause longue (15-30 min)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📝 License

MIT License - voir le fichier LICENSE pour plus de détails.

## 🔗 Liens

- [GitHub Repository](https://github.com/Gotennku/Focus_flow)
- [Report a Bug](https://github.com/Gotennku/Focus_flow/issues)
- [Request a Feature](https://github.com/Gotennku/Focus_flow/issues)

## 📸 Screenshots

*Coming soon...*

---

Fait avec ❤️ pour améliorer votre productivité
