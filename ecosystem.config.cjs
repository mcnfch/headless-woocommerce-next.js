module.exports = {
  apps: [{
    name: 'ggd-next-woo',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3030',
    instances: 8,
    exec_mode: 'cluster',
    watch: false,
    env: {
      PORT: 3030,
      NODE_ENV: 'production'
    }
  }]
};
