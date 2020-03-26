
//users connected to the server
var users = {};

//when a user connects to our sever
module.exports = {
  wssHandler: function (connection) {

    //when server gets a message from a connected user
    connection.on('message', function (message) {
      console.log('message received', message)
      var data;

      //accepting only JSON messages
      try {
        data = JSON.parse(message);
      } catch (e) {
        console.log('Invalid JSON');
        data = {};
      }

      //switching type of the user message
      switch (data.type) {

        //when a user tries to login --> replace this with our existing login route
        case "join":
          console.log(`User "${data.name}" registering`);
          // console.log('login data object', data)
          //if anyone is logged in with this username then refuse 
          if (users[data.id]) {
            console.log(`User "${data.name}" is already registered`)
          } else {
            //save user connection on the server 
            // NB EACH USER HAS THEIR OWN CONNECTION => LABELLED WITH THEIR USER ID
            users[data.id] = connection;
            connection.name = data.id;
            // console.log('users object', users)
            console.log(`Login success: User "${data.name}" is now registered`)
          }
          break;

        case 'receiveCall':
          console.log('Calling: ', data.callee.name);
          var callee = users[data.callee.id];
          // if (conn != null) {
            //setting that UserA connected with UserB
            // connection.caller = data.caller.id;
            sendTo(callee, {
              type: 'receiveCall',
              // name: connection.name,
              caller: data.caller,
              callee: data.callee
            });
            console.log('caller', data.caller)
            console.log('callee', data.callee)
          // }
          break;

        case 'offer':
          //for ex. UserA wants to call UserB
          console.log('Sending offer to: ', data.name);
          //if UserB exists then send him offer details
          var caller = users[data.caller.id];
          // if (caller != null) {
            //setting that UserA connected with UserB
            // connection.otherName = data.name;
            sendTo(caller, {
              type: 'offer',
              offer: data.offer,
              caller: data.caller,
              callee: data.callee
            });
          // }
          break;

        case 'answer':
          console.log('Sending answer to: ', data.name);
          //for ex. UserB answers UserA
          var callee = users[data.callee.id];
          // if (callee != null) {
            // connection.otherName = data.name;
            sendTo(conn, {
              type: 'answer',
              answer: data.answer,
              caller: data.caller,
              callee: data.callee
            });
          // }
          break;

        case 'candidate':
          console.log('Sending candidate to:', data.name);
          var caller = users[data.caller.id];
          // if (caller != null) {
            sendTo(caller, {
              type: 'candidate',
              candidate: data.candidate,
              caller: data.caller,
              callee: data.callee
            });
          // }
          break;

        case 'leave':
          console.log('Disconnecting from', data.partner.name);
          var conn = users[data.partner.id];
          //notify the other user so he can disconnect his peer connection
          // if (conn != null) {
            sendTo(conn, {
              type: 'leave',
              partner: data.partner
            });
          // }
          break;

        default:
          sendTo(connection, {
            type: 'error',
            message: 'Command not found: ' + data.type
          });
          break;
      }
    });

    connection.on('close', function () {
      if (connection.name) {
        delete users[connection.name];
        console.log("connection", connection)
        console.log("othername", connection.otherName)
        if (connection.otherName) {
          console.log('Disconnecting from ', connection.otherName);
          var conn = users[connection.otherName];
          conn.otherName = null;

          if (conn != null) {
            sendTo(conn, {
              type: 'leave'
            });
          }
        }
      }
    });
  }
};

function sendTo(connection, message) {
  connection.send(JSON.stringify(message));
}
