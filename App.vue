<template>
	<view></view>
</template>

<script setup>
const 更新管理器 = uni.getUpdateManager();

更新管理器.onCheckForUpdate((res) => {
	console.log('是否有新版本：', res.hasUpdate);
});
更新管理器.onUpdateReady(() => {
	// 新版本已经下载好
	uni.showModal({
		title: '更新提示',
		content: '发现新版本，即将为您更新...',
		showCancel: false, // 不显示取消按钮 强制更新
		success(res) {
			更新管理器.applyUpdate();
		}
	});
});
更新管理器.onUpdateFailed(() => {
	uni.showToast({
		title: '新版本下载失败，请稍后重试',
		icon: 'none',
		duration: 2000
	});
});
wx.cloud.init({
	env: 'cloud1-0gzy726e39ba4d96',
	traceUser: true
});
</script>

<style lang="less">
@import '/wxcomponents/vant/common/index.wxss';
@import '/Static/公共样式.css';
</style>
