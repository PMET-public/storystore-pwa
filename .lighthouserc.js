module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/'],
      startServerCommand: 'npm start',
      startServerReadyPattern: 'listen|Ready',
      startServerReadyTimeout: 30000,
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};