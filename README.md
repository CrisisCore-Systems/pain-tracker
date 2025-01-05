# Pain Tracker

A comprehensive pain tracking application that helps users monitor and analyze their pain patterns over time.

## Features

- Record detailed pain entries with:
  - Pain level (0-10 scale)
  - Pain locations
  - Associated symptoms
  - Functional impact
  - Sleep and mood impact
  - Work impact
- Visualize pain patterns with interactive charts
- Track trends and statistics
- Export data in CSV and JSON formats
- Mobile-friendly interface

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm 9 or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pain-tracker.git
cd pain-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

## Deployment

The application is configured for automatic deployment to GitHub Pages:

1. Fork this repository
2. Enable GitHub Pages in your repository settings
3. Push changes to the main branch
4. GitHub Actions will automatically build and deploy your changes

For manual deployment:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. Record Pain Entry:
   - Use the slider to indicate pain level
   - Select affected locations
   - Choose relevant symptoms
   - Add notes and additional details

2. View Analytics:
   - Switch to the Analytics tab
   - View pain trends over time
   - Analyze pain patterns by location and time of day
   - Track symptom correlations

3. Export Data:
   - Click "Export CSV" for spreadsheet-compatible format
   - Click "Export JSON" for complete data backup
   - Use exported data with healthcare providers or external tools

## Data Privacy

All data is stored locally in your browser. No data is sent to external servers.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 