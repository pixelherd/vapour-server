//require our websocket library 
// would this need to be wrapped around the http server during merge?
// --> can we / should we have two websocket instances using different packages or should we merge both into socket.io?
var WebSocketServer = require('ws').Server;

//creating a websocket server at port 9090 
var wss = new WebSocketServer({ port: 9090 });

//users that connected to the server
var users = {};

//when a user connects to our sever 
wss.on('connection', function (connection) {
  console.log("user connected");

  //when server gets a message from a connected user 
  connection.on('message', function (message) {
    var data;

    //accepting only JSON messages 
    try {
      data = JSON.parse(message);
    } catch (e) {
      console.log("Invalid JSON");
      data = {};
    }

    //switching type of the user message 
    switch (data.type) {

      //when a user tries to login --> replace this with our existing login route
      case "login":
        console.log(`User "${data.name}" login attempt`);
        //if anyone is logged in with this username then refuse 
        if (users[data.name]) {
          sendTo(connection, {
            type: "login",
            success: false
          });
          console.log(`Login failed: User "${data.name}" is already in`)
        } else {
          //save user connection on the server 
          users[data.name] = connection;
          connection.name = data.name;
          sendTo(connection, {
            type: "login",
            success: true
          });
          console.log(`Login success: User "${data.name}" is now logged in`)
        }
        break;

      // continue merging from here:
      case "offer":
        //for ex. UserA wants to call UserB 
        console.log("Sending offer to: ", data.name);
        //if UserB exists then send him offer details 
        var conn = users[data.name];
        if (conn != null) {
          //setting that UserA connected with UserB 
          connection.otherName = data.name;
          sendTo(conn, {
            type: "offer",
            offer: data.offer,
            name: connection.name
          });
        }
        break;

      case "answer":
        console.log("Sending answer to: ", data.name);
        //for ex. UserB answers UserA 
        var conn = users[data.name];
        if (conn != null) {
          connection.otherName = data.name;
          sendTo(conn, {
            type: "answer",
            answer: data.answer
          });
        }
        break;

      case "candidate":
        console.log("Sending candidate to:", data.name);
        var conn = users[data.name];
        if (conn != null) {
          sendTo(conn, {
            type: "candidate",
            candidate: data.candidate
          });
        }
        break;

      case "leave":
        console.log("Disconnecting from", data.name);
        var conn = users[data.name];
        conn.otherName = null;
        //notify the other user so he can disconnect his peer connection 
        if (conn != null) {
          sendTo(conn, {
            type: "leave"
          });
        }
        break;

      default:
        sendTo(connection, {
          type: "error",
          message: "Command no found: " + data.type
        });
        break;
    }
  });

  connection.on("close", function () {

    if (connection.name) {
      delete users[connection.name];

      if (connection.otherName) {
        console.log("Disconnecting from ", connection.otherName);
        var conn = users[connection.otherName];
        conn.otherName = null;

        if (conn != null) {
          sendTo(conn, {
            type: "leave"
          });
        }
      }
    }
  });
});

function sendTo(connection, message) {
  connection.send(JSON.stringify(message));
}