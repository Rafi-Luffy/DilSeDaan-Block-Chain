module.exports = {
  apps: [
    {
      name: 'dilsedaan-backend',
      script: 'dist/server.js',
      cwd: '/var/www/dilsedaan/current/apps/backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/dilsedaan/backend-error.log',
      out_file: '/var/log/dilsedaan/backend-out.log',
      log_file: '/var/log/dilsedaan/backend-combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max-old-space-size=1024',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'dilsedaan-backend-backup',
      script: 'dist/server.js',
      cwd: '/var/www/dilsedaan/current/apps/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: '/var/log/dilsedaan/backend-backup-error.log',
      out_file: '/var/log/dilsedaan/backend-backup-out.log',
      log_file: '/var/log/dilsedaan/backend-backup-combined.log',
      time: true,
      max_memory_restart: '512M',
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
      watch: false,
      max_restarts: 5,
      min_uptime: '10s'
    }
  ],
  
  deploy: {
    production: {
      user: 'deploy',
      host: ['dilsedaan.com'],
      ref: 'origin/main',
      repo: 'git@github.com:your-org/dilsedaan-platform.git',
      path: '/var/www/dilsedaan',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt-get install git'
    }
  }
};
