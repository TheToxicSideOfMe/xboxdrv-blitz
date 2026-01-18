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
git clone https://github.com/TheToxicSideOfMe/blitz.git
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

<img width="1244" height="835" alt="Screenshot_20260119_000943" src="https://github.com/user-attachments/assets/6b26ae72-6114-4483-81a6-866e4cb3c8dc" />
<img width="1250" height="841" alt="Screenshot_20260119_000858" src="https://github.com/user-attachments/assets/55b5af0c-28d1-47f6-aaf5-03307f6ffba7" />
<img width="1244" height="833" alt="Screenshot_20260119_000838" src="https://github.com/user-attachments/assets/f3b5e7c6-79cb-404a-9efd-318d15671128" />
<img width="961" height="685" alt="Screenshot_20260119_000739" src="https://github.com/user-attachments/assets/4d021d6a-9391-4a70-a41a-f7f9cd90df3a" />
<img width="804" height="599" alt="Screenshot_20260119_000712" src="https://github.com/user-attachments/assets/74a33f0b-9668-4b4c-9e08-385385628d96" />


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
