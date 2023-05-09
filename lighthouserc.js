module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run preview',
      pattern: '🚥 MiniOxygen server started',
      url: ['http://localhost:3000/'],
      numberOfRuns: 1,
    },
    upload: {
      target: 'temporary-public-storage',
    },
    assert: {
      preset: 'lighthouse:no-pwa',
      'categories:performance': ['warn', {minScore: 0.9}],
      'categories:accessibility': ['error', {minScore: 0.9}],
      'categories:best-practices': ['error', {minScore: 0.9}],
      'categories:seo': ['error', {minScore: 0.9}],
    },
  },
};
