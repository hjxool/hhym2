<template>
	<view></view>
</template>

<script setup>
import { useStore } from 'vuex';
import { 请求接口 } from '/Api/请求接口.js';

// 属性
const store = useStore();

识别用户();

// 方法
async function 识别用户() {
	uni.showLoading({
		title: '',
		mask: true
	});
	let res = await 请求接口('isManager2');
	uni.hideLoading();
	// 保存当前用户id
	store.commit('setState', {
		key: '用户ID',
		value: res.id
	});
	switch (res.身份) {
		case '用户':
			uni.reLaunch({
				url: '/pages/UserHome/UserHome'
			});
			break;
		case '管理员':
			uni.reLaunch({
				url: '/pages/ManagerHome/ManagerHome'
			});
			break;
	}
}
</script>

<style lang="less" scoped></style>
