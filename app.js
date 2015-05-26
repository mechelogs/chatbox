//Inspired by https://www.youtube.com/watch?v=pNKNYLv2BpQ
//server
var express = require('express'),
	app = express(), 
	server = require('http').createServer(app),
	io = require('socket.io').listen(server);
	nicknames = []; //array of all nicknames connected to chat

server.listen(1110);

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

//connecting to index.html's data
//function(socket) is the socket the client is using
io.sockets.on('connection', function(socket) {
	//all the socket code goes in here

	socket.on('new user', function(data, callback) {
		if (nicknames.indexOf(data) != -1) {
			callback(false); //checking if indexof whatever nickname is not -1, meaning exists, 
			//then send false to callback
		} else {
			callback(true);
			//add to socket, convenient cuz storing nickname of each user, which has its own socket within socket itself
			socket.nickname = data;
			//add to array
			nicknames.push(socket.nickname);
			updateNicknames();
		}
	});

	function updateNicknames() {
		io.sockets.emit('usernames', nicknames);
	}

	socket.on('send message', function(data) {
		//this sends to everyone including me
		io.sockets.emit('new message', {msg: data, nick: socket.nickname});
		//this sends to everyone except me
		//socket.broadcast.emit('new message', data); 
	});
	socket.on('disconnect', function(data) {
		if(!socket.nickname) return;
		nicknames.splice(nicknames.indexOf(socket.nickname), 1); //gets rid of elements in the array, first being parameter to start
		updateNicknames();
	});
});