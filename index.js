const _QQ = {
	uin: 0123456789,
	pwd: '0123456789abcd'
};
const _database = {
	host     : 'localhost',
	port     : '3306',
	user     : 'qzone_bot',
	password : 'qzone_bot',
	database : 'qzone_bot'
};
const _settings = {
	groupId: 0123456789,
	uploadsPerPage: 10,
	dailyUploadTime: 5
};

const { createClient } = require('oicq');
const sa = require('superagent');;
const file = require('fs');
const mysql = require('mysql');

const client = createClient(_QQ.uin, {platform: 2});
const sql = mysql.createConnection(_database);

client.on('system.login.slider', function (data) {
	process.stdin.once('data', (input) => {
		this.sliderLogin(input);
	});
}); 

client.on('system.login.device', function (data) {
	process.stdin.once('data', () => {
		this.login();
	});
});

setTimeout(function() {
	client.login(_QQ.pwd);
}, 1000);

exports._settings = _settings;
exports.bot = client;
exports.sa = sa;
exports.file = file;
exports.sql = sql;

require('./global-function.js');

require('./private-message.js');
require('./group-message.js');
require('./request-event.js');