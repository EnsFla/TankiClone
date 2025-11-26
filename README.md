# Tanki Online Classic Clone 🎮

A faithful recreation of the classic web-based Tanki Online game. Battle with tanks in this multiplayer 3D browser game!

![Tanki Clone](https://img.shields.io/badge/Game-Tanki%20Clone-green)
![Multiplayer](https://img.shields.io/badge/Multiplayer-Socket.io-blue)
![3D](https://img.shields.io/badge/3D-Three.js-orange)

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/EnsFla/TankiClone.git
cd TankiClone

# Install dependencies
npm install

# Start the server
npm start
```

### Play the Game

1. Open your browser and go to `http://localhost:3000`
2. Enter your player name
3. Visit the Garage to select your hull and turret
4. Create a new game room or join an existing one
5. Battle!

### Play with Friends

Share your IP address with friends so they can connect:
- Find your local IP (e.g., `192.168.1.100`)
- Friends connect to `http://YOUR_IP:3000`

## 🎮 Controls

| Key | Action |
|-----|--------|
| W | Move Forward |
| S | Move Backward |
| A | Turn Left |
| D | Turn Right |
| Mouse | Aim Turret |
| Left Click | Fire |
| Tab | Scoreboard |
| Enter | Open Chat |
| Escape | Menu |

## 🛡️ Hulls

| Hull | HP | Speed | Description |
|------|-----|-------|-------------|
| **Wasp** | 100 | ★★★★★ | Lightning fast, paper thin armor |
| **Hornet** | 150 | ★★★★☆ | Quick and agile scout |
| **Viking** | 200 | ★★★☆☆ | Balanced all-rounder |
| **Dictator** | 280 | ★★☆☆☆ | Solid medium tank |
| **Titan** | 350 | ★☆☆☆☆ | Heavy assault tank |
| **Mammoth** | 450 | ★☆☆☆☆ | Ultimate fortress on tracks |

## 🔫 Turrets

| Turret | Damage | Type | Special |
|--------|--------|------|---------|
| **Smoky** | 25 | Cannon | Fast reload, reliable |
| **Firebird** | 5/tick | Flamethrower | Burns enemies over time |
| **Freeze** | 4/tick | Ice Cannon | Slows enemies by 50% |
| **Isida** | 8/tick | Beam | Heals allies or damages foes |
| **Thunder** | 80 | Heavy Cannon | Splash damage |
| **Railgun** | 100 | Sniper | Piercing long-range shot |
| **Ricochet** | 30 | Plasma | Bounces off walls 3x |
| **Shaft** | 120 | Sniper | Charge for max damage |

## 🗺️ Maps

- **Sandbox** - Open training ground with simple cover
- **Silence** - Urban combat with buildings and lanes
- **Kungur** - Industrial area with ramps and heights

## 🎯 Game Modes

- **Deathmatch (DM)** - Free for all, 20 kills to win
- **Team Deathmatch (TDM)** - Red vs Blue, 50 team kills to win
- **Capture the Flag (CTF)** - Capture the enemy flag 3 times

## 🛠️ Tech Stack

- **Frontend**: Three.js, Vanilla JavaScript
- **Backend**: Node.js, Express
- **Multiplayer**: Socket.io
- **No external 3D models** - All tanks built with code!

## 📁 Project Structure

```
TankiClone/
├── server/
│   ├── index.js          # Main server
│   ├── GameManager.js    # Room management
│   ├── GameRoom.js       # Game logic
│   └── Player.js         # Player state
├── client/
│   ├── index.html        # Main page
│   ├── css/style.css     # Styling
│   └── js/
│       ├── main.js       # Entry point
│       ├── Game.js       # Game engine
│       ├── Tank.js       # Tank entities
│       ├── Network.js    # Multiplayer
│       └── ...
├── package.json
└── README.md
```

## 🎉 Credits

Inspired by the original Tanki Online (2009-era Flash version).
This is a fan recreation for educational and nostalgic purposes.

## 📄 License

MIT License - Feel free to modify and share!

---

**Have fun and may the best tanker win!** 🏆
