// YOUR CODE HERE:
window.app = {};
app.server = 'https://api.parse.com/1/classes/messages';

app.init = function() {

};

app.send = function(message) {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: (data) => {
      console.log('chatterbox: POST success');
      console.log(data);
    },
    error: (data) => {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function() {
  $.ajax({
    url: app.server,
    success: function (data) {
      console.log('chatterbox: GET success');
      console.log(data);
    },
    dataType: 'json'
  });
};

app.clearMessages = function() {
  $('#chats').empty();
};

app.addMessage = function(message) {
  let messageString = message.username + ': ' + message.text;
  let $message = $('<div>' + messageString + '</div>');
  $('#chats').append($message);
};