// YOUR CODE HERE:

$(document).ready(function() {
  app.init();
});

window.app = {};
app.rooms = {};
app.currentRoom = 'main';
app.server = 'https://api.parse.com/1/classes/messages';
app.friends = {};

app.init = function() {
  app.fetchMessages();
  app.fetchRooms();

  $('#chats').on('click', '.username', function(event) {
    console.log('toggled');
    app.toggleFriend($(this).text());
    app.highlightFriends();
  });

  $('.submit').on('click', function(event) {
    app.handleSubmit();
  });

  $('.refresh').on('click', function(event) {
    app.refresh();
  });

  $('#roomSelect').on('change', function(event) {
    app.currentRoom = $('#roomSelect').val();
    app.refresh();
  });

  setInterval( app.refresh, 1000 );
};

app.refresh = function() {
  app.fetchMessages();
  app.fetchRooms();
  app.highlightFriends();
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

app.fetchMessages = function() {
  $.ajax({
    url: app.server,
    data: `where={ "roomname": "${app.currentRoom}" }`,
    success: function (data) {
      app.updateMessages(data.results);
    },
    dataType: 'json'
  });
};

app.fetchRooms = function() {
  app.rooms = {};
  $.ajax({
    url: app.server,
    data: 'keys=roomname',
    success: function (data) {
      // build up hash of all rooms
      _.each(data.results, function(message) {
        app.rooms[message.roomname] = true;
      });

      let roomnames = Object.keys(app.rooms);
      app.updateRooms(roomnames);
    },
    dataType: 'json'
  });
};

app.updateMessages = function(data) {
  let chats = d3.select('#chats')
    .selectAll('.chat').data(data, data => data.objectId);

  // Append new messages
  let newChats = chats.enter().insert('div', ":first-child").attr('class', 'chat');
  newChats.append('div').attr('class', 'username')
    .text(data => data.username);
  newChats.insert('div').attr('class', 'timestamp')
    .text(data => $.timeago(data.createdAt));
  newChats.insert('div').attr('class', 'message')
    .text(data => data.text);

  // Update existing chats
  chats.select('.username').text(data => data.username);
  chats.select('.timestamp').text(data => $.timeago(data.createdAt));
  chats.select('.message').text(data => data.text);

  // Remove elements
  chats.exit().remove();
};

app.updateRooms = function(roomnames) {
  let roomSelect = d3.select('#roomSelect').selectAll('option').data(roomnames);

  roomSelect.enter().append('option').text(roomname => roomname);
  roomSelect.exit().remove();
};

app.toggleFriend = function(username) {
  if ( app.friends[username] ) {
    delete app.friends[username];
  } else {
    app.friends[username] = true;
  }
};

app.highlightFriends = function() {
  $('.chat').each(function() {
    if ($(this).find('.username').text() in app.friends) {
      $(this).find('.username').addClass('friend');
      $(this).find('.message').addClass('friend-message');
    } else {
      $(this).find('.username').removeClass('friend');
      $(this).find('.message').removeClass('friend-message');
    }
  });
};

app.handleSubmit = function() {
  app.currentRoom = $('#room').val();
  let message = {
    username: $('#username').val(),
    text: $('#message').val(),
    roomname: app.currentRoom
  };
  
  app.send(message);
  app.refresh();
};
