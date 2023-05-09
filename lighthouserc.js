module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      pattern: '🚥 MiniOxygen server started at',
      url: ['http://localhost:3000/'],
      staticDistDir: './dist',
      numberOfRuns: 1,
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      preset: 'lighthouse:recommended',
    },
  },
};
