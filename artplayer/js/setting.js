var stray = {
	'start': function() {
		stray.ArtPlayer();
	},
	'ArtPlayer': function() {
	    Artplayer.CONTEXTMENU = false; //是否开启右键菜单
		Artplayer.PLAYBACK_RATE = [0.5, 0.75, 1, 1.25, 1.5, 2, 3]; //视频倍速
		stray.ad = new Artplayer({
			container: '#artplayer', //播放器ID
			title: '繁星影视', //视频标题，目前会出现在视频截图和迷你模式下
			theme: '#165dff', //进度条颜色
			url: config.url, //视频播放地址
			type: stray.videotype(config.url), //视频类型
			poster: 'artplayer/img/poster.png', //视频背景
			flip: true, //是否视频翻转
			pip: false, //是否显示画中画按钮
			loop: false, //是否循环播放 默认: false
			lock: true, //是否在移动端显示一个锁定按钮
			volume: 1, //声音默认1
			setting: true, //显示设置面板的开关按钮
			muted: false, //是否默认静音
			autoplay: true, //是否自动播放
			backdrop: true, //是否显示播放器背景
			autoSize: false, //自动调整播放器尺寸以隐藏黑边
			autoMini: true, //当播放器滚动到浏览器视口以外时，自动进入迷你播放模式
			screenshot: false, //显示视频截图功能
			fastForward: true, //是否在移动端添加长按视频快进功能
			fullscreen: false, //是否在底部控制栏里显示播放器窗口全屏按钮 
			fullscreenWeb: false,  //是否在底部控制栏里显示播放器网页全屏按钮
			aspectRatio: true, //是否显示视频长宽比功能，会出现在 设置面板 和 右键菜单 里
			playbackRate: true, //是否显示视频播放速度功能，会出现在 设置面板 和 右键菜单 里
			miniProgressBar: false, //迷你进度条，只在播放器失去焦点后且正在播放时出现
			hotkey: true, //是否启用快捷键
			airplay: true, //是否启用 Airplay 功能
			playsInline: true, //移动端是否使用 playsInline 模式
			autoOrientation: true, //是否在移动端的网页全屏时，根据视频尺寸和视口尺寸，旋转播放器
			lang: navigator.language.toLowerCase(),
			whitelist: ['*'],
			icons: {
				loading: '<img width="130" heigth="130" src="artplayer/img/loading.gif">',
				state: '<img width="150" heigth="150" src="artplayer/img/state.svg">',
				indicator: '<img width="16" heigth="16" src="artplayer/img/indicator.svg">',
			},
			customType: {
				m3u8: playM3u8,
				flv: playFlv,
				ts: playTs,
				mpd: playMpd,
			},
		});
	},
	'videotype': function(url) {
		if (url.indexOf('.m3u8') > 0) {
			thetype = 'm3u8';
		} else if (url.indexOf('.flv') > 0) {
			thetype = 'flv';
		} else if (url.indexOf('.ts') > 0) {
			thetype = 'ts';
		} else if (url.indexOf('.mpd') > 0) {
			thetype = 'mpd';
		} else if (url.indexOf('.mp4') > 0) {
			thetype = 'mp4';
		} else if (url.indexOf('.ogg') > 0) {
			thetype = 'ogg';
		} else if (url.indexOf('.webm') > 0) {
			thetype = 'webm';
		} else {
			thetype = 'm3u8';
		}
		return thetype;
	},
}

//播放地址是m3u8类型加载
function playM3u8(video, url, art) {
	if (Hls.isSupported()) {
		var config = {maxBufferLength: 120,}
		const hls = new Hls(config);
		hls.loadSource(url);
		hls.attachMedia(video);
		art.hls = hls;
		art.once('url', () => hls.destroy());
		art.once('destroy', () => hls.destroy());
	} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
		video.src = url;
	} else {
		art.notice.show = 'Unsupported playback format: m3u8';
	}
}

//播放地址是flv类型加载
function playFlv(video, url, art) {
	if (flvjs.isSupported()) {
		const flv = flvjs.createPlayer({type: 'flv', url});
		flv.attachMediaElement(video);
		flv.load();
		art.flv = flv;
		art.once('url', () => flv.destroy());
		art.once('destroy', () => flv.destroy());
	} else {
		art.notice.show = 'Unsupported playback format: flv';
	}
}

//播放地址是ts类型加载
function playTs(video, url, art) {
	if (mpegts.isSupported()) {
		const ts = new mpegts.createPlayer({type: 'mse', url});
		ts.attachMediaElement(video);
		ts.load();
		art.ts = ts;
		art.once('url', () => ts.destroy());
		art.once('destroy', () => ts.destroy());
	} else {
		art.notice.show = 'Unsupported playback format: ts';
	}
}

//播放地址是mpd类型加载
function playMpd(video, url, art) {
	if (dashjs.supportsMediaSource()) {
		const dash = dashjs.MediaPlayer().create();
		dash.initialize(video, url, art.option.autoplay);
		art.dash = dash;
		art.once('url', () => dash.destroy());
		art.once('destroy', () => dash.destroy());
	} else {
		art.notice.show = 'Unsupported playback format: mpd';
	}
}
