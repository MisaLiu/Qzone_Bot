const { _settings, bot } = require('./index');


// 处理好友申请，默认通过
bot.on('request.friend.add', function(e) {
	bot.setFriendAddRequest(e.flag, true);
	bot.sendGroupMsg(_settings.groupId, '有新用户加入了频道：' + e.user_id);
	setTimeout(function() {
		bot.sendPrivateMsg(e.user_id, '你好呀，欢迎加入本频道！\n发送 /help 获取帮助菜单');
	}, 4000);
});

// 处理邀请进群事件，默认不通过
bot.on('request.group.invite', function(e) {
	bot.setGroupAddRequest(e.flag, false);
});
