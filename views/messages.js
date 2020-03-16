const recId = '5e6cce288e37ad4046a748e3';

const socket = io();
$(() => {
  $('#send-msg').click(async () => {
    const msgBody = {
      message: $('#message').val(),
      time: moment().format('hh:mm')
    };
    await sendMessage('http://localhost:4000/messages', msgBody, recId).then(() => addMessages(msgBody));
    $('#message').val('');
  });
  getMessages();
});

socket.on('private message', addMessages);

function addMessages(message) {
  $('#messages').append(`
          <p>  ${message.message} </p>
          <p>  ${message.time} </p>`);
}

function getMessages() {
  fetch('http://localhost:4000/messages')
    .then(res => {
      return res.json();
    })
    .then(data => {
      data.forEach(message => {
        addMessages(message);
      });
    });
}

async function sendMessage(url, data, recId) {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({data, recId})
  });
  return response.json();
}
