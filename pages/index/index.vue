<template>
	<view></view>
</template>

<script setup>
import { 请求接口 } from '/Api/请求接口.js';

识别用户();

// 方法
async function 识别用户() {
	uni.showLoading();
	let res = await 请求接口('isManager2');
	uni.hideLoading();
	switch (res.身份) {
		case '用户':
			uni.reLaunch({
				url: '/pages/UserHome/UserHome'
			});
			break;
		case '管理员':
			// 跳转管理员界面
			break;
	}
}
</script>

<style lang="less" scoped></style>
