<template>
	<view class="body rowLayout" @click="显示日历 = true">
		<view class="rowLayout flexGrow">
			<view class="date">{{ 入住.日期 }}</view>
			<view class="text">{{ 入住.text }}入住</view>

			<view class="date">{{ 离店.日期 }}</view>
			<view class="text">{{ 离店.text }}离店</view>
		</view>

		<view class="noShrink total">共{{ store.getters.总天数 }}天</view>
		<van-icon name="arrow" />
	</view>

	<CusCalendar :show="显示日历" @close="显示日历 = false" />
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { 判断是哪一天 } from '/Api/时间参数.js';
import { useStore } from 'vuex';
import CusCalendar from '../cusCalendar/cusCalendar.vue';

// 属性
const store = useStore();
const 入住 = ref({
	日期: '',
	text: ''
});
const 离店 = ref({
	日期: '',
	text: ''
});
const 显示日历 = ref(false);

watch(
	() => store.state.日期,
	(value) => {
		入住.value = 格式化日期(value.入住);
		离店.value = 格式化日期(value.离店);
	},
	{ immediate: true }
);

// 方法
function 格式化日期(date) {
	date = date.replaceAll('-', '/');
	let arr = date.split('/');
	let m = Number(arr[1]);
	let d = Number(arr[2]);
	let 日期 = `${m < 10 ? '0' + m : m}月${d < 10 ? '0' + d : d}日`;
	return {
		日期,
		text: 判断是哪一天(date)
	};
}
</script>

<style lang="less" scoped>
@import '/Static/公共样式.css';
.body {
	background: #fff;
	border-radius: 20rpx;
	margin: 0 20rpx 20rpx 20rpx;
	padding: 32rpx 20rpx;
	justify-content: space-between;
	.date {
		font-weight: bold;
		font-size: 28rpx;
		margin-right: 10rpx;
	}
	.text {
		font-size: 24rpx;
		margin-right: 10rpx;
	}
	.total {
		font-size: 28rpx;
		margin-right: 10rpx;
	}
}
</style>
