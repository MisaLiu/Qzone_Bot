const { file } = require('./index');

global.v = {};

var muteList = [];

file.readFile('./muteList.json', function(err, data) {
	if (err) {
		console.error('读取 muteList.json 时出错，将使用空数组：' + err);
		return;
	}
	
	try {
		muteList = JSON.parse(data);
	} catch (e) {
		console.error('解析 muteList.json 时出错，将使用空数组：' + e);
		muteList = [];
	}
	
	global.v.muteList = muteList;
	global.muteList = muteList;
});

var f = {
	CurrentDateText: function() {
		let date = new Date();
		let output = date.getFullYear() + '-' +
			AddZero((date.getMonth() + 1)) + '-' +
			AddZero(date.getDate()) + ' ' +
			AddZero(date.getHours()) + ':' +
			AddZero(date.getMinutes()) + ':' +
			AddZero(date.getSeconds());
		
		return output;
	},

	CompareDateWithToday: function(date) {
		let _date = new Date(date);
		let _today = new Date();
		
		_date = new Date(_date.getFullYear(), _date.getMonth(), _date.getDate());
		_today = new Date(_today.getFullYear(), _today.getMonth(), _today.getDate());
		
		return (_today.getTime() - _date.getTime()) / (1*24*60*60*1000);
	},
	
	guid: function() {
		return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	},
	
	FormatContent: function(command, index) {
		let result = command[index];
		
		if (command.length < index) {
			return false;
		}
		
		for (let i = 0; i < command.length - index - 1; i++) {
			result += ' ' + command[i + index + 1];
		}
		
		return result;
	},

	TimeToText: function(time) {
		let _time  = undefined;

		if (time instanceof Date) {
			_time = time;
		} else {
			_time = new Date(time);
		}

		let year = _time.getFullYear();
		let month = _time.getMonth() + 1;
		let date = _time.getDate();
		
		let hour = _time.getHours();
		let minute = _time.getMinutes();
		let second = _time.getSeconds();
		
		return year + '-' + AddZero(month) + '-' + AddZero(date) + ' ' + AddZero(hour) + ':' + AddZero(minute) + ':' + AddZero(second);
	},
	
	MuteUser: function(uid) {
		for (let i = 0; i < global.v.muteList.length; i++) {
			if (global.v.muteList[i] == uid) {
				return;
			}
		}
		
		global.v.muteList.push(uid);
		
		file.writeFile('./muteList.json', JSON.stringify(global.v.muteList, null, 2), function(err) {
			if (err) {
				console.error('写入 muteList.json 时失败：' + err);
			}
		});
	},
	
	UnmuteUser: function(uid) {
		for (let i = 0; i < global.v.muteList.length; i++) {
			if (global.v.muteList[i] == uid) {
				global.v.muteList.splice(i, 1);
				
				file.writeFile('./muteList.json', JSON.stringify(global.v.muteList, null, 2), function(err) {
					if (err) {
						console.error('写入 muteList.json 时失败：' + err);
					}
				});
			}
		}
	},
	
	IsMuted: function(uid) {
		for (let i = 0; i < global.v.muteList.length; i++) {
			if (global.v.muteList[i] == uid) {
				return true;
			}
		}
		
		return false;
	}
}

global.f = f;

function AddZero(num) {
	let result = num.toString();

	if (result.length == 1) {
		result = '0' + result;
	}

	return result;
}