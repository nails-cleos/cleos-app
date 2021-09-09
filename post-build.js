const { exec } = require('child_process');

let command;

console.info('run in environment: ', process.env.ENVIRONMENT);

if (process.env.ENVIRONMENT === 'production') {
  command = exec('ng build --prod');
} else if (process.env.ENVIRONMENT === 'staging') {
  command = exec('ng build --configuration=staging');
} else {
  command = exec('ng build --configuration=pwa');
}

if (command !== undefined) {
  command.stdout.on('data', (data) => {
    console.info(data);
  });

  command.stderr.on('data', (data) => {
    console.error(data);
  });

  command.on('close', (code) => {
    console.info(`child process exited with code ${code}`);
  });
} else {
  console.error('process.env.ENVIRONMENT: ' + process.env.ENVIRONMENT);
}
