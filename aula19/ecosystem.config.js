module.exports = {
  apps: [{
    name: "api-telemetria",
    script: "./server.js",
    max_memory_restart: "100M",
    env: {
      NODE_ENV: "development",
      PORT: 3000
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 8080
    }
  }]
};
