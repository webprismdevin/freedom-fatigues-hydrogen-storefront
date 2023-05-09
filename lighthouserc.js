module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      pattern: '🚥 MiniOxygen server started',
      url: ['http://localhost:3000/'],
      numberOfRuns: 3,
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
