const express = require('express');
const path = require('path');
const https = require('https');
const fs = require('fs');
const app = express();

// Serve static files
app.use(express.static(__dirname + '/dist/cleos'));

// Send all requests to index.html
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname + '/dist/cleos/index.html'));
});

const HTTP_PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 443;

app.listen(HTTP_PORT);

const certDir = './cert';
const keyPath = `${certDir}/espaciocleos.com.key`;
const certPath = `${certDir}/espaciocleos.com.crt`;
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
  const privateKey = fs.readFileSync(keyPath);
  const certificate = fs.readFileSync(certPath);
  const httpsServer = https.createServer(
    { key: privateKey, cert: certificate }, app,
  );

  httpsServer.listen(HTTPS_PORT, () => {
    console.log(`Server https starting on port : ${HTTPS_PORT}`);
  });
}
