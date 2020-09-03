var util = require('util');
var http = require('http');




function runDockerCommand(params, callback) {


    var post_req = null;

    if (params.method == "POST" || params.method == "DELETE") {

        http_request = http.request(params, function(res) {
            var body = "";
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                body += chunk;
            });
            res.on('end', function() {
                callback(body);
            });

        });

        if(params.params!=null){
          http_request.write(JSON.stringify(params.params));
        }
    } else if (params.method == "GET") {
        http_request = http.get(params, function(res) {
            var body = "";
            res.setEncoding('utf8');
            res.on('data', function(chunk) {
                body += chunk;
            });
            res.on('end', function() {
                callback(body);
            });
        });
    }

    http_request.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    http_request.end();

}




function provisionContainer(image,callback){

  var PublishAllPorts=false;


  runDockerCommand({
      socketPath: '/var/run/docker.sock',
      path: '/containers/create',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
      },
      params: {
          "AttachStdin": true,
          "AttachStdout": true,
          "AttachStderr": true,
          "Tty": true,
          "OpenStdin": true,
          "StdinOnce": true,
          "Env": [
              "SSH_PASSWORD_AUTHENTICATION=true"
          ],
          "Image": image,
          "Volumes": {
            "/volumes/data": {}
          },
          "Links": ["sshloadbalancer:nginx"],
          "NetworkDisabled": false,
          "ExposedPorts": {
             "22/tcp": {}
          },
            "HostConfig": {
            "NetworkMode": 'backend',
            "PublishAllPorts": PublishAllPorts
          }
      }
  }, function(body) {
      var respArr = JSON.parse(body + '');
      var ContainerID = respArr.Id;

      //Create Docker Container
      runDockerCommand({
          socketPath: '/var/run/docker.sock',
          path: '/containers/'+ContainerID+'/json',
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
          },
          params: null
      }, function(body) {
        //Container Start
        runDockerCommand({
            socketPath: '/var/run/docker.sock',
            path: '/containers/'+ContainerID+'/start',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            params: null
        }, function(body) {
          runDockerCommand({
              socketPath: '/var/run/docker.sock',
              path: '/containers/'+ContainerID+'/json',
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Cache-Control': 'no-cache'
              },
              params: null
          }, function(body) {
              var respArr = JSON.parse(body + '');
              console.log("Container Created:");
              if(respArr.NetworkSettings){
                IPAddress = respArr.NetworkSettings.Networks.backend.IPAddress;
                callback(IPAddress,ContainerID);
              }
          });

        });
      });
  });


}

function removeContainer(ContainerID){

  console.log("Preparing Container for Removal:");
  console.log("Stopping: "+ContainerID);

  runDockerCommand({
      socketPath: '/var/run/docker.sock',
      path: '/containers/'+ContainerID+'/stop',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
      },
      params: {}
  }, function(body) {

      console.log("Remove: "+ContainerID);

    runDockerCommand({
        socketPath: '/var/run/docker.sock',
        path: '/containers/'+ContainerID,
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        },
        params: {}
    }, function(body) {

      console.log("Removal Debug: "+ContainerID);
      console.log(body);

    });

  });


}


// exports the variables and functions above so that other modules can use them
module.exports.runDockerCommand = runDockerCommand;
module.exports.provisionContainer = provisionContainer;
module.exports.removeContainer = removeContainer;
