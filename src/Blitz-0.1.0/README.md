# Blitz - xboxdrv GUI

A modern, user-friendly GUI for xboxdrv on Linux. Perfect for configuring non-standard game controllers that need custom button mappings.

## Features

- 🎮 Interactive button mapping (press buttons to map them)
- 💾 Save controller profiles for reuse
- 🔄 Multi-controller support
- 🎨 Clean, modern UI built with React + Tailwind
- 🚀 System tray integration - runs in background
- ⚡ Built with Tauri for native performance

## Why Blitz?

Many cheap Xbox-style controllers (especially Chinese clones) don't work out-of-the-box on Linux. xboxdrv fixes this, but configuring it via command line is painful. Blitz makes it simple.

## Installation

### Arch Linux (AUR)
```bash
yay -S blitz
```

### From Source
```bash
# Install dependencies
sudo pacman -S rust nodejs pnpm webkit2gtk gtk3 libappindicator-gtk3 xboxdrv polkit

# Clone and build
git clone https://github.com/yourusername/blitz.git
cd blitz
pnpm install
pnpm tauri build

# Binary will be in src-tauri/target/release/blitz
```

## Usage

1. Launch Blitz
2. Click "Discover Controllers" to find your controller
3. Select your controller and click "Map Buttons"
4. Follow on-screen instructions to map each button
5. Save the profile
6. Click "Start" to activate xboxdrv with your mapping

Blitz will run in your system tray. Your controller will now work as an Xbox controller!

## Screenshots

[Add screenshots here]

## Requirements

- xboxdrv
- polkit (for `pkexec` elevation)
- A controller that needs custom mapping

## Troubleshooting

**"No configuration found"**: You need to map your controller first before starting xboxdrv.

**Permission denied**: Make sure polkit is installed and working.

## Contributing

PRs welcome! This was built to scratch my own itch with a cheap controller, but I hope it helps others too.

## License

MIT
```

### `.gitignore` (add if not already there):
```
/target
/node_modules
/dist
/.svelte-kit
/package
.env
.DS_Store
*.log
src-tauri/target/