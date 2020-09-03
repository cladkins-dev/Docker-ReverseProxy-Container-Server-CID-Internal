var tcpProxy = require('tcp-proxy');
var net = require('net');

var docker=require('./docker-api.js');

var port=parseInt(process.argv[3])?parseInt(process.argv[3]):22;
var proxyPort = port;
var tcpServerPort = port;



var containerIP="172.19.0.0";
var canCreateConnection=true;
var image=process.argv[2]?process.argv[2]:"sickp/centos-sshd:latest";

var remove_container_on_disconnect=process.argv[4]?process.argv[4]:true;

console.log("Using Image: "+image+" for current switchboard.");
console.log("Remove Image on Disconnect is set to:"+remove_container_on_disconnect);
// proxy server
var proxy = net.createServer(function (socket) {

    console.log('Client connected to proxy, provisioning new container.');

    if(canCreateConnection){
      docker.provisionContainer(image,function(containerIP,containerID){
        console.log("Create new container: "+containerID);


        socket.on('end', function (src) {
            console.log('Client disconnected from proxy, cleaning up container...');
            console.log("Remove Image on Disconnect is set to:"+remove_container_on_disconnect);

            if(remove_container_on_disconnect==="true"){
              docker.removeContainer(containerID);
            }
        });

        console.log('Client connecting to: '+containerIP);


        socket.on('error', function (err) {
            console.log('Error: ' + err.soString());
        });



        // Create a new connection to the TCP server
        setTimeout(function(){
          client = net.connect(tcpServerPort,containerIP);
          // 2-way pipe between client and TCP server
          socket.pipe(client).pipe(socket);
        }, 1000);


      canCreateConnection=false;

    });

  }else{
    canCreateConnection=true;
  }



});

proxy.listen(proxyPort);
