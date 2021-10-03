const { _settings, bot } = require('./index');


// 处理好友申请，默认通过
bot.on('request.friend.add', function(e) {
	bot.setFriendAddRequest(e.flag, true);
	bot.sendGroupMsg(_settings.groupId, '有新用户加入了频道：' + e.user_id);
	setTimeout(function() {
		bot.sendPrivateMsg(e.user_id, '你好呀，欢迎加入本频道！\n请先阅读 https://www.kancloud.cn/himlaos_misa/midrai_channel_docs/2484124 以获取必要的信息');
	}, 4000);
});

// 处理邀请进群事件，默认不通过
bot.on('request.group.invite', function(e) {
	bot.setGroupAddRequest(e.flag, false);
});
