const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 3100;
const sshNamespace = io.of('/ssh')
const SSHClient = require('ssh2').Client;
const ssh = new SSHClient();
const utf8 = require('utf8');

sshNamespace.on('connection', socket => {
  console.log('socket.id:', socket.id)
  socket.on('init_data', res => {
    console.log(res)
    initSSH(socket, res)
  })
})

http.listen(port, () => {
  let address = getIPAddress()
  address.forEach(item => {
    console.log(`listening on http://${getIPAddress()}:${port}`);
  })
});

function getIPAddress () {
  var interfaces = require('os').networkInterfaces();
  var address = [];
  for(var devName in interfaces){
      var iface = interfaces[devName];
      for(var i=0;i<iface.length;i++){
          var alias = iface[i];
          if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
              // return alias.address;
              address.push(alias.address)
          }
      }
  }
  return address
}

function initSSH (socket, config) {
  console.log(config)
  ssh.on('ready', () => {
    ssh.shell((err, stream) => {
      if (err) {
        socket.emit('shell_error', '\r\n*** SSH SHELL ERROR: ' + err.message + ' ***\r\n');
      }
      socket.on('ssh_client_data', data => {
        stream.write(data);
      });
      stream.on('data', d => {
        socket.emit('ssh_server_data', utf8.decode(d.toString('binary')));
      }).on('close', () => {
        console.log('close');
        ssh.end();
      });
    });
  }).on('close', () => {
    socket.emit('connect_closed', '\r\n*** SSH CONNECTION CLOSED ***\r\n');
  }).on('error', err => {
    console.log(err);
    socket.emit('connect_error', '\r\n*** SSH CONNECTION ERROR: ' + err.message + ' ***\r\n');
  }).connect({
      host: config.ip,
      port: 22,
      username: config.username,
      password: config.password
    });
}