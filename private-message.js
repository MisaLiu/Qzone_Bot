const { _settings, bot, sql } = require('./index');

bot.on('message.private', function(e) {
	// console.log(e);
	
	const fromAccount = e.user_id;
	const message     = e.raw_message;
	const command     = message.split(' ').length > 1 ? message.split(' ') : [message];
	
	command[0] = command[0].substr(1);

	// 过滤机器人自己的消息
	if (e.sub_type == 'self') {
		return;
	}
	
	if (command[0] == 'help' || command[0] == 'start') { // 发送帮助文档
		let output = '欢迎加入本频道！\n' +
			'本频道由一群热爱小爱老师但却对其生态环境及官方无可奈何的用户运营。\n\n' +
			'→关于本频道投稿的说明请看 https://www.kancloud.cn/himlaos_misa/midrai_channel_docs/2484124 \n' +
			'→如何使用频道？指令说明请看 https://www.kancloud.cn/himlaos_misa/midrai_channel_docs/2484125 \n' +
			'→想要加入频道运营组？请看 https://www.kancloud.cn/himlaos_misa/midrai_channel_docs/2484124 \n' +
			'At ' + global.f.CurrentDateText();
		
		if (!bot.sendPrivateMsg(fromAccount, output)) {
			console.error('发送私聊消息时出错');
		}
	}
	
	if (command[0] == 'say') { // 传话
		let content = global.f.FormatContent(command, 1);
		
		// 检测是否被 Ban
		if (global.f.IsMuted(fromAccount)) {
			bot.sendPrivateMsg(fromAccount, '抱歉，您已被管理员禁言，无法执行该操作。');
			return;
		}
		
		if (command.length < 2) {
			bot.sendPrivateMsg(fromAccount, '指令格式错误！\n你可以使用 /help 来查看帮助');
			return;
		}
		
		if (!content || content == '') {
			bot.sendPrivateMsg(fromAccount, '欲发送的内容不能为空！');
			return;
		}
		
		bot.sendGroupMsg(_settings.groupId, '来自 ' + fromAccount + ' 的消息：\n' + content);
		bot.sendPrivateMsg(fromAccount, '已发送');
	}
	
	if (command[0] == 'upload') { // 发送投稿
		let _annoymous = command[1].toLowerCase();
		let _content   = global.f.FormatContent(command, 2);
		let query      = '';
		let params     = [];
		let userData   = {};
		let uploadData = {};
		
		// 检测是否被 Ban
		if (global.f.IsMuted(fromAccount)) {
			bot.sendPrivateMsg(fromAccount, '抱歉，您已被管理员禁言，无法执行该操作。');
			return;
		}
		
		// 过滤格式不正确的指令
		if (command.length < 3) {
			bot.sendPrivateMsg(fromAccount, '指令格式错误！\n你可以使用 /help 来查看帮助');
			return;
		}
		
		// 判定指令参数
		if (!_annoymous || (_annoymous != 'true' && _annoymous != 'false')) {
			bot.sendPrivateMsg(fromAccount, '请选择是否匿名！');
			return;
		}
		
		// 判断投稿内容
		if (!_content || _content == '') {
			bot.sendPrivateMsg(fromAccount, '投稿内容不能为空！');
			return;
		}
		
		query = 'SELECT * FROM users WHERE uid = ' + fromAccount;
		sql.query(query, function(err, data) {
			if (err) {
				console.error('读取数据表 users 时失败：' + err);
				bot.sendPrivateMsg(fromAccount, '投稿时出现了错误，如果一直出现错误，请联系管理员。');
				return;
			}
			
			if (data.length <= 0) {
				userData = {
					id             : null,
					uid            : fromAccount,
					todayUploads   : 0,
					lastUploadTime : new Date(),
					status         : 0
				};
			} else {
				userData = data[0];
			}
			
			if (userData.todayUploads < _settings.dailyUploadTime || global.f.CompareDateWithToday(userData.lastUploadTime.getTime()) >= 1) {
				if (global.f.CompareDateWithToday(userData.lastUploadTime.getTime()) >= 1) {
					userData.todayUploads = 1;
				} else {
					userData.todayUploads += 1;
				}
				uploadData = {
					id        : null,
					guid      : global.f.guid(),
					uid       : fromAccount,
					annoymous : (_annoymous == 'true' ? 1 : 0),
					content   : _content,
					date      : new Date(),
					status    : 0
				};
				
				query = 'INSERT INTO uploads (id, guid, uid, annoymous, content, date, status) VALUES (NULL, ?, ?, ?, ?, CURRENT_TIMESTAMP, 0)';
				params = [uploadData.guid,
						  uploadData.uid,
						  uploadData.annoymous,
						  uploadData.content
				];
				sql.query(query, params, function(err, data) {
					if (err) {
						console.error('写入数据表 uploads 时失败：' + err);
						bot.sendPrivateMsg(fromAccount, '投稿时出现了错误，如果一直出现错误，请联系管理员。');
						return;
					}
					
					if (userData.id) {
						query = 'UPDATE users SET todayUploads = ?, lastUploadTime = CURRENT_TIMESTAMP WHERE id = ?';
						params = [userData.todayUploads,
								  userData.id
						];
					} else {
						query = 'INSERT INTO users (id, uid, todayUploads, lastUploadTime, status) VALUES (NULL, ?, ?, CURRENT_TIMESTAMP, 0)';
						params = [userData.uid,
								  userData.todayUploads
						];
					}
					
					sql.query(query, params, function(err, data) {
						if (err) {
							console.error('写入数据表 users 时失败：' + err);
							bot.sendPrivateMsg(fromAccount, '投稿时出现了错误，如果一直出现错误，请联系管理员。');
							return;
						}
						
						bot.sendPrivateMsg(fromAccount, '投稿成功！\n该投稿 ID 为 ' +
								uploadData.guid + '，如有问题可保存该 ID 并联系频道主。'
						);
						bot.sendGroupMsg(_settings.groupId, '收到来自 ' + fromAccount + ' 的' +
								(uploadData.annoymous == 1 ? '匿名' : '实名') + '投稿：\n' +
								uploadData.content + '\n' +
								'投稿 ID：' + uploadData.guid
						);
					});
				});
				
			} else {
				bot.sendPrivateMsg(fromAccount, '您今天的投稿次数已用完，请明天再来投稿。');
				return;
				
			}
		});
	}
	
	if (command[0] == 'my') { // 查看自己的投稿
		let query       = '';
		let uploadCount = 0;
		let page        = 1;
		let uploadGuid  = undefined;
		let mode        = 'all';
		let result      = '';
		
		// 检测是否被 Ban
		if (global.f.IsMuted(fromAccount)) {
			bot.sendPrivateMsg(fromAccount, '抱歉，您已被管理员禁言，无法执行该操作。');
			return;
		}
		
		if (command[1] && command[1] != '') {
			if (command[1].length <= 3) {
				page = command[1];
			} else {
				uploadGuid = command[1];
			}
		}
		
		if (uploadGuid) {
			query = 'SELECT * FROM uploads WHERE uid = ' + fromAccount + ' AND guid = "' + uploadGuid + '"';
			sql.query(query, function(err, data) {
				if (err) {
					console.error('读取数据表 uploads 时失败：' + err);
					bot.sendPrivateMsg(fromAccount, '查询时出现了错误，如果一直出现错误，请联系管理员。');
					return;
				}
				
				if (data.length <= 0) {
	            	bot.sendPrivateMsg(fromAccount, '不存在该条投稿！');
					return;
	            }
				
				result = '投稿 ID：' + data[0].guid + '\n' +
				         '投稿时间：' + global.f.TimeToText(data[0].date) + '\n' +
				         '是否匿名：' + (data[0].annoymous == 1 ? '是' : '否') + '\n' +
				         '投稿状态：';
				switch (data[0].status) {
					case 0:
						result += '审核中';
						break;
					case 1:
						result += '已发表';
						break;
					case -1:
						result += '不通过';
						break;
					default:
						result += '未知状态';
				}
				result += '\n' +
				          '投稿内容：\n' + data[0].content;
				
				bot.sendPrivateMsg(fromAccount, result);
			});
			
		} else {
			query = 'SELECT * FROM uploads WHERE uid = ' + fromAccount;
			sql.query(query, function(err, data) {
				if (err) {
					console.error('读取数据表 uploads 时失败：' + err);
					bot.sendPrivateMsg(fromAccount, '查询时出现了错误，如果一直出现错误，请联系管理员。');
					return;
				}
				
				uploadCount = data.length;
				
				query = 'SELECT * FROM uploads WHERE uid = ' + fromAccount + ' LIMIT ' + (page - 1) * _settings.uploadsPerPage + ',' + _settings.uploadsPerPage;
				sql.query(query, function(err, data) {
					if (err) {
						console.error('读取数据表 uploads 时失败：' + err);
						bot.sendPrivateMsg(fromAccount, '查询时出现了错误，如果一直出现错误，请联系管理员。');
						return;
					}
					
					if (data.length <= 0) {
		            	bot.sendPrivateMsg(fromAccount, '没有更多投稿记录了');
						return;
		            }
					
					result = '您共有 ' + uploadCount + ' 条投稿\n' +
				             '投稿 ID              状态\n';
				
					for (let i = 0; i < data.length; i++) {
						result += data[i].guid + '  ';
						switch (data[i].status) {
							case 0:
								result += '审核中';
								break;
							case 1:
								result += '已发表';
								break;
							case -1:
								result += '不通过';
								break;
							default:
								result += '未知状态';
						}
						
						result += '\n';
					}
					result += '第 ' + page + ' 页，共 ' + Math.ceil(uploadCount / _settings.uploadsPerPage) + ' 页';
			
					bot.sendPrivateMsg(fromAccount, result);
				});
			});
		}
	}
});