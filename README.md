# Pain Tracker

A comprehensive tool for tracking and managing chronic pain and injuries. Built with React, TypeScript, and Vite.

## Features

- Pain entry form with multiple sections
- Pain level tracking and visualization
- WCB report generation
- Local storage for data persistence
- Fully accessible and keyboard navigable
- Responsive design

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/crisiscore-systems/pain-tracker.git
cd pain-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Deployment

The project is set up for deployment to GitHub Pages:

1. Create a new repository on GitHub named `pain-tracker`
2. Push your code to GitHub:
```bash
git remote add origin https://github.com/crisiscore-systems/pain-tracker.git
git branch -M main
git push -u origin main
```
3. Run `npm run deploy` to build and deploy to GitHub Pages
4. Your site will be available at: https://crisiscore-systems.github.io/pain-tracker

For other platforms:

1. Build the project:
```bash
npm run build
```

2. The `dist` directory will contain the production-ready files
3. Deploy the contents of `dist` to your hosting platform

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 