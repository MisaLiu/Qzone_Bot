const { _settings, bot, sql, sa } = require('./index');

bot.on('message.group', function(e) {
	// console.log(e);
	
	const fromGroup   = e.group_id;
	const fromAccount = e.sender.user_id;
	const message     = e.raw_message;
	const command     = message.split(' ').length > 1 ? message.split(' ') : [message];
	
	command[0] = command[0].substr(1);

	// 过滤机器人自身消息
	if (e.sub_type == 'self') {
		return;
	}
	
	// 过滤非审核群消息
	if (fromGroup != _settings.groupId) {
		return;
	}
	
	// 同意投稿
	if (command[0] == 'accept') {
		let query         = '';
		let uploadGuid    = command[1];
		let contentPrefix = undefined;
		let contentBack   = undefined;

		if (command.length < 2) {
			bot.sendGroupMsg(fromGroup, '指令格式不正确！');
			return;
		}

		if (!uploadGuid || uploadGuid == '') {
			bot.sendGroupMsg(fromGroup, '请输入投稿 GUID！');
			return;
		}

		if (command.length >= 3 && command[2] != '') {
			contentPrefix = command[2].replace(/\r/g, '\n');
		}

		if (command.lengtg >= 4 && command[3] != '') {
			contentBack = command[3].replace(/\r/g, '\n');
		}

		query = 'SELECT * FROM uploads WHERE guid = "' + uploadGuid + '"';
		sql.query(query, function(err, data) {
			if (err) {
				console.error('读取数据表 uploads 时出错：' + err);
				bot.sendGroupMsg(fromGroup, '执行操作时出现错误。');
				return;
			}
			
			if (data.length < 1) {
				bot.sendGroupMsg(fromGroup, '不存在该条投稿！');
				return;
			}
			
			uploadData = data[0];
			uploadData.status = 1;

			content = uploadData.content;
			content = (uploadData.annoymous == 1 ? '匿名投稿：\n' : '来自 ' + uploadData.uid + ' 的实名投稿：\n') + 
			          (contentPrefix ? contentPrefix : '') + content;
			content = content + (contentBack ? contentBack : '');

			_sendQzonePost(e.self_id, fromGroup, content);
			
			query = 'UPDATE uploads SET status = ? WHERE id = ?';
			params = [uploadData.status,
			          uploadData.id
			];
			sql.query(query, params, function(err, data) {
				if (err) {
					console.error('写入数据表 uploads 时失败：' + err);
					bot.sendGroupMsg(fromGroup, '修改时出现了错误。');
					return;
				}
					
				bot.sendGroupMsg(fromGroup, '已修改该投稿状态为通过');
				bot.sendPrivateMsg(uploadData.uid, '你的投稿 ' + uploadGuid + ' 被发布了');
			});
		});
	}
	
	// 拒绝投稿
	if (command[0] == 'refuse') {
		let query      = '';
		let params     = [];
		let uploadGuid = command[1];
		let uploadData = {};
		let content    = global.f.FormatContent(command, 2);
		
		if (command.length < 2) {
			bot.sendGroupMsg(fromGroup, '指令格式不正确！');
			return;
		}
		
		if (!uploadGuid || uploadGuid == '') {
			bot.sendGroupMsg(fromGroup, '请填写投稿 GUID！');
			return;
		}
		
		query = 'SELECT * FROM uploads WHERE guid = "' + uploadGuid + '"';
		sql.query(query, function(err, data) {
			if (err) {
				console.error('读取数据表 uploads 时出错：' + err);
				bot.sendGroupMsg(fromGroup, '执行操作时出现错误。');
				return;
			}
			
			if (data.length < 1) {
				bot.sendGroupMsg(fromGroup, '不存在该条投稿！');
				return;
			}
			
			uploadData = data[0];
			uploadData.status = -1;
			
			query = 'UPDATE uploads SET status = ? WHERE id = ?';
			params = [uploadData.status,
			          uploadData.id
			];
			sql.query(query, params, function(err, data) {
				if (err) {
					console.error('写入数据表 uploads 时失败：' + err);
					bot.sendGroupMsg(fromGroup, '修改时出现了错误。');
					return;
				}
					
				bot.sendGroupMsg(fromGroup, '已修改该投稿状态为不通过');
				bot.sendPrivateMsg(uploadData.uid, '你的投稿 ' + uploadGuid + ' 被拒绝了' + (content ? '\n理由：' + content : ''));
			});
		});
	}
	
	// 发布投稿
	if (command[0] == 'upload') {
		let query         = '';
		let uploadGuid    = command[1];
		let contentPrefix = undefined;
		let contentBack   = undefined;

		if (command.length < 2) {
			bot.sendGroupMsg(fromGroup, '指令格式不正确！');
			return;
		}

		if (!uploadGuid || uploadGuid == '') {
			bot.sendGroupMsg(fromGroup, '请输入投稿 GUID！');
			return;
		}

		if (command.length >= 3 && command[2] != '') {
			contentPrefix = command[2].replace(/\r/g, '\n');
		}

		if (command.lengtg >= 4 && command[3] != '') {
			contentBack = command[3].replace(/\r/g, '\n');
		}

		query = 'SELECT * FROM uploads WHERE guid = "' + uploadGuid + '"';
		sql.query(query, function(err, data) {
			if (err) {
				console.error('读取数据表 uploads 时出错：' + err);
				bot.sendGroupMsg(fromGroup, '执行操作时出现错误。');
				return;
			}
			
			if (data.length < 1) {
				bot.sendGroupMsg(fromGroup, '不存在该条投稿！');
				return;
			}
			
			uploadData = data[0];
			uploadData.status = 1;

			content = uploadData.content;
			content = (uploadData.annoymous == 1 ? '匿名投稿：\n' : '来自 ' + uploadData.uid + ' 的实名投稿：\n') + 
			          (contentPrefix ? contentPrefix : '') + content;
			content = content + (contentBack ? contentBack : '');

			_sendQzonePost(e.self_id, fromGroup, content);
		});
	}

	/**
	if (command[0] == 'getCookie') {
		let url = command[1];
		let cookie = undefined;

		if (!url || url == '') {
			return;
		}
		
		bot.getCookies(url).then(function(value) {
			console.log(value);

			try {
				let cookie = value.data.cookies;
				
				console.log(cookie);
				bot.sendGroupMsg(fromGroup, cookie);
			} catch (e) {
				console.error(e);
			}
		});
	}

	if (command[0] == 'getToken') {
		bot.getCsrfToken().then(function(value) {
			console.log(value);

			try {
				let token = value.data.token;
				
				console.log(token);
				bot.sendGroupMsg(fromGroup, token);
			} catch (e) {
				console.error(e);
			}
		});
	}
	**/

	// 自行发布自定义内容的空间
	if (command[0] == 'qzone') {
		let content              = global.f.FormatContent(command, 1).replace(/\r/g, '\n');

		if (command.length < 2) {
			bot.sendGroupMsg(fromGroup, '指令格式不正确！');
			return;
		}

		if (!content || content == '') {
			bot.sendGroupMsg(fromGroup, '请输入欲发送的内容！');
			return;
		}

		_sendQzonePost(e.self_id, fromGroup, content);
	}
	
	// 传话
	if (command[0] == 'say') {
		let toAccount = command[1];
		let content   = global.f.FormatContent(command, 2);
		
		if (command.length < 3) {
			bot.sendGroupMsg(fromGroup, '指令格式不正确！');
			return;
		}
		
		if (!toAccount || toAccount == '' || toAccount <= 10000) {
			bot.sendGroupMsg(fromGroup, '请填写欲发送人！');
			return;
		}
		
		if (!content || content == '') {
			bot.sendGroupMsg(fromGroup, '请填写发送内容！');
			return;
		}
		
		bot.sendPrivateMsg(toAccount, content);
		bot.sendGroupMsg(fromGroup, '已发送');
	}
		
	// 获取投稿列表
	if (command[0] == 'list') {
		let query       = '';
		let uploadCount = 0;
		let page        = 1;
		let mode        = 'all';
		let result      = '';
		
		if (command[1] && command[1] != '') {
			page = command[1];
		}
		
		query = 'SELECT * FROM uploads';
		sql.query(query, function(err, data) {
			if (err) {
				console.error('读取数据表 uploads 时失败：' + err);
				bot.sendPrivateMsg(fromAccount, '查询时出现了错误，如果一直出现错误，请联系管理员。');
				return;
			}
			
			uploadCount = data.length;
			
			query = 'SELECT * FROM uploads LIMIT ' + (page - 1) * _settings.uploadsPerPage + ',' + _settings.uploadsPerPage;
			sql.query(query, function(err, data) {
				if (err) {
					console.error('读取数据表 uploads 时失败：' + err);
					bot.sendPrivateMsg(fromAccount, '查询时出现了错误，如果一直出现错误，请联系管理员。');
					return;
				}
				
				if (data.length <= 0) {
	            	bot.sendGroupMsg(fromGroup, '没有更多投稿记录了');
					return;
	            }
				
				result = '共有 ' + uploadCount + ' 条投稿\n' +
			             'UID       投稿 ID       状态\n';
			
				for (let i = 0; i < data.length; i++) {
					result += data[i].uid + ' ' + data[i].guid + '  ';
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
		
				bot.sendGroupMsg(fromGroup, result);
			});
		});
	}
	
	// 获取投稿详情
	if (command[0] == 'detail') {
		let query      = '';
		let uploadGuid = undefined;
		let result     = '';
		
		
		if (command[1] && command[1] != '') {
			uploadGuid = command[1];
		} else {
			bot.sendGroupMsg(fromGroup, '指令格式错误！');
			return;
		}
		
		query = 'SELECT * FROM uploads WHERE guid = "' + uploadGuid + '"';
		sql.query(query, function(err, data) {
			if (err) {
				console.error('读取数据表 uploads 时出错：' + err);
				bot.sendGroupMsg(fromGroup, '执行操作时出现错误。');
				return;
			}
			
			if (data.length < 1) {
				bot.sendGroupMsg(fromGroup, '不存在该条投稿！');
				return;
			}
			
			result = '投稿 ID：' + uploadGuid + '\n' +
			         '投稿人：' + data[0].uid + '\n' +
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
			          '投稿内容：' + data[0].content;
			
			bot.sendGroupMsg(fromGroup, result);
		});
	}
	
	// 禁言用户
	if (command[0] == 'mute') {
		let toAccount = command[1];
		
		if (command.length < 2) {
			bot.sendGroupMsg(fromGroup, '指令格式不正确！');
			return;
		}
		
		if (!toAccount || toAccount <= 10000) {
			bot.sendGroupMsg(fromGroup, '请输入正确的账号！');
			return;
		}
		
		global.f.MuteUser(toAccount);
		bot.sendGroupMsg(fromGroup, '已执行操作');
	}
	
	// 解除禁言用户
	if (command[0] == 'unmute') {
		let toAccount = command[1];
		
		if (command.length < 2) {
			bot.sendGroupMsg(fromGroup, '指令格式不正确！');
			return;
		}
		
		if (!toAccount || toAccount <= 10000) {
			bot.sendGroupMsg(fromGroup, '请输入正确的账号！');
			return;
		}
		
		global.f.UnmuteUser(toAccount);
		bot.sendGroupMsg(fromGroup, '已执行操作');
	}
});

function _sendQzonePost(botId, fromGroup, content_) {
	let content              = content_.replace(/\r/g, '\n');
	let picPattern           = /\[CQ:image,file=([^\[\]]+),url=([^\[\]]+)\]/g;
	let picCodes             = [];
	let picUrls              = [];
	let picData              = [];
	let sendPostWaitingClock = null;
	let sendPostWaitingCount = 0;

	if (!content || content == '') {
		bot.sendGroupMsg(fromGroup, '请输入欲发送的内容！');
		return;
	}

	bot.sendGroupMsg(fromGroup, '请稍后，正在发送中...');

	if (picPattern.test(content)) {
		picCodes = content.match(picPattern);
		for (let i = 0; i < picCodes.length; i++) {
			let picUrl = /\[CQ:image,file=([^\[\]]+),url=([^\[\]]+)\]/.exec(picCodes[i])[2];
			picUrls.push(picUrl);
		}

		content = content.replace(/\[CQ:image,file=([^\[\]]+),url=([^\[\]]+)\]/g, '');
	}
	
	bot.getCookies('qzone.qq.com').then(function(value) {
		let cookie = value.data.cookies;
		
		bot.getCsrfToken().then(function(value) {
			let token = !value.error ? value.data.token : undefined;

			if (picUrls.length > 0) {
				for (let x = 0; x < picUrls.length; x++) {
					sa
						.get(picUrls[x])
						.end(function(err, res) {
							if (err) {
								console.error('在向 QQ 空间上传图片时出现了问题。图片地址：' + picUrls[x] + '报错：' + err);
								return;
							}

							let imgBase = res.body.toString('Base64');

							sa
								.post('https://up.qzone.qq.com/cgi-bin/upload/cgi_upload_image?g_tk=' + token)
								.set('accept-encoding', 'gzip, deflate, br')
								.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
								.set('cookie', cookie)
								.set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36')
								.send({
									uin               : botId,
									skey              : /skey=([^\;]+); /.exec(cookie)[1],
									zzpaneluin        : botId,
									zzpanelkey        : '',
									p_uin             : botId,
									p_skey            : /p_skey=([^\;]+);/.exec(cookie)[1],
									qzonetoken        : '',
									uploadtype        : 1,
									albumtype         : 7,
									exttype           : 0,
									refer             : 'shuoshuo',
									output_type       : 'jsonhtml',
									charset           : 'utf-8',
									output_charset    : 'utf-8',
									upload_hd         : 1,
									hd_width          : 2048,
									hd_height         : 10000,
									hd_quality        : 96,
									backUrls          : 'http://upbak.photo.qzone.qq.com/cgi-bin/upload/cgi_upload_image,http://119.147.64.75/cgi-bin/upload/cgi_upload_image',
									url               : 'https://up.qzone.qq.com/cgi-bin/upload/cgi_upload_image?g_tk=' + token,
									base64            : 1,
									jsonhtml_callback : 'callback',
									picfile           : imgBase,
									qzreferrer        : 'https://user.qzone.qq.com/' + botId
								})
								.end(function(err, res) {
									let result = {};

									if (err) {
										console.error('上传图片至空间时出错：' + err);
										picData.push({
											url     : '',
											albumid : '',
											lloc    : '',
											sloc    : '',
											type    : 0,
											height  : 0,
											width   : 0
										});
										return;
									}

									try {
										result = JSON.parse(res.text.substring(res.text.indexOf('frameElement.callback(') + 'frameElement.callback('.length, res.text.indexOf(');</script></body></html>')));
									} catch (e) {
										console.error('上传图片至空间时出错：' + e + '\n原文：' + res.text);
										return;
									}

									if (result.ret != 0 || !result.data) {
										console.error('上传图片至空间时出错：' + result.data.msg + result.data.ret);
										picData.push({
											url     : '',
											albumid : '',
											lloc    : '',
											sloc    : '',
											type    : 0,
											height  : 0,
											width   : 0
										});
										return;
									}
									result = result.data;

									picData.push({
										url     : result.url,
										albumid : result.albumid,
										lloc    : result.lloc,
										sloc    : result.sloc,
										type    : result.type,
										height  : result.height,
										width   : result.width
									});
								}
							);
						}
					);
				}

				sendPostWaitingClock = setInterval(function() {
					if (picData.length != picUrls.length) {
						sendPostWaitingCount += 1;

						if (sendPostWaitingCount >= 60) {
							bot.sendGroupMsg(fromGroup, '等待上传图片时消耗了过长时间，已取消本次发送')
							clearInterval(sendPostWaitingClock);
							return;

						}
					} else {
						let _picData = '';
						let _pic_bo  = '';

						for (let y = 0; y < picData.length; y++) {
							if (picData[y].url && picData[y].url != '') {
								_picData += ',' + picData[y].albumid +
											',' + picData[y].lloc +
											',' + picData[y].sloc +
											',' + picData[y].type + 
											',' + picData[y].height +
											',' + picData[y].width + ',' +
											',' + picData[y].height +
											',' + picData[y].width
								;
								_pic_bo += /b&bo=(.+)/.exec(picData[y].url)[1];

								if (y + 1 < picData.length) {
									_picData += '\t';
									_pic_bo  += ',';
								}

								if (picData.length == 1) {
									_pic_bo  += ' ' + _pic_bo;
								}
							}
						}

						let __pic_bo = _pic_bo;
						for (let z = 0; z < picData.length; z++) {
							if (z + 1 < picData.length) {
								_pic_bo += '\t' + __pic_bo;
							}
						}

						sendQzonePost(botId, cookie, token, fromGroup, content, _picData, _pic_bo);
						clearInterval(sendPostWaitingClock);
					}
				}, 1000);
			} else {
				sendQzonePost(botId, cookie, token, fromGroup, content);
			}
		});
	});
}

function sendQzonePost(botId, cookie, token, fromGroup, content, picData = '', pic_bo = '') {
	let _send = {
		syn_tweet_verson : 1,
		paramstr         : 1,
		pic_template     : '',
		richtype         : '',
		richval          : picData,
		special_url      : '',
		who              : 1,
		con              : content,
		feedversion      : 1,
		ver              : 1,
		ugc_right        : 1,
		to_sign          : 0,
		hostuin          : botId,
		code_version     : 1,
		format           : 'fs',
		qzreferrer       : 'https://user.qzone.qq.com/' + botId + '/infocenter'
	};

	if (picData != '' && pic_bo != '') {
		_send.richtype = 1;
		_send.subrichtype = 1;
		_send.pic_bo = pic_bo;
	}

	sa
		.post('https://user.qzone.qq.com/proxy/domain/taotao.qzone.qq.com/cgi-bin/emotion_cgi_publish_v6?&g_tk=' + token)
		.set('accept-encoding', 'gzip, deflate, br')
		.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8')
		.set('cookie', cookie)
		.set('user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36')
		.send(_send)
		.end(function(err, res) {
			let code = undefined;

			if (err) {
				console.error('在发送说说请求时出现了错误：', err);
				bot.sendGroupMsg(fromGroup, '发送说说时出错');
				return;

			}

			code = /"code":\s?(-?[0-9]+)/.exec(res.text)[1];

			if (code >= '0') {
				bot.sendGroupMsg(fromGroup, '发送说说成功 ' + new Date().getTime());
			} else {
				bot.sendGroupMsg(fromGroup, '发送说说失败，错误码' + code + ' ' + new Date().getTime());
			}
		}
	);
}
