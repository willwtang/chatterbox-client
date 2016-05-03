// YOUR CODE HERE:

$(document).ready(function() {
  app.init();
});

window.app = {};
app.server = 'https://api.parse.com/1/classes/messages';

app.init = function() {
  app.fetch();

  $('#chats').on('click', '.username', function(event) {
    app.addFriend($(this));
  });

  $('.submit').on('click', function(event) {
    app.handleSubmit();
  });

  $('.refresh').on('click', function(event) {
    app.clearMessages();
    app.fetch();
  });
};

app.send = function(message) {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: (data) => {
      // console.log('chatterbox: POST success');
      // console.log(data);
    },
    error: (data) => {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      // console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function() {
  $.ajax({
    url: app.server,
    success: function (data) {
      // console.log('chatterbox: GET success');
      var rooms = {};
      _.each(data.results, function(message) {
        for (var property in message) {
          message[property] = _.escape(message[property]);
        }

        app.addMessage(message);
        rooms[message.roomname] = true;
      });
      
      for (var roomname in rooms) {
        app.addRoom(roomname);
      }
    },
    dataType: 'json'
  });
};

app.clearMessages = function() {
  $('#chats').empty();
};

app.addMessage = function(message) {
  let $chat = $(`<div class="chat"></div>`);
  let $username = $(`<div class="username"> ${message.username} </div>`);
  let $message = $(`<div class="text"> ${message.text} </div>`);

  $chat.append($username);
  $chat.append($message);
  $('#chats').append($chat);
};

app.addRoom = function(roomName) {
  let $roomOption = $(`<option> ${roomName} </option>`);
  $('#roomSelect').append($roomOption);
};

app.addFriend = function($username) {
  $username.toggleClass('friend');
};

app.handleSubmit = function() {
  let message = {
    username: $('#username').val(),
    text: $('#message').val(),
    roomname: 'lobby'
  };

  app.send(message);
  app.clearMessages();
  app.fetch();
};
