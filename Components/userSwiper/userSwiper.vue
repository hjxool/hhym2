<template>
	<view class="body">
		<swiper @change="轮播事件($event)" autoplay circular style="width: 100%; height: 100%;position: relative;">
			<swiper-item v-for="item in 测试" :key="item">
				<view class="center" :style="{ background: item }">{{ item }}</view>
			</swiper-item>
		</swiper>

		<view v-if="测试.length" class="count rowLayout">{{ 当前索引 + 1 }} / {{ 测试.length }}</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';

// 属性
const 测试 = ref(['#1E90FF', '#90EE90', '#D2B48C']);
const 当前索引 = ref(0);

// 方法
function 轮播事件({ detail: { current } }) {
	当前索引.value = current;
}
</script>

<style lang="less" scoped>
@import '/Static/公共样式.css';
.body {
	position: relative;
	height: 400rpx;
	margin: 0 20rpx;
	border-radius: 20rpx;
	overflow: hidden;
	.center {
		width: 100%;
		height: 100%;
	}
	> .count {
		position: absolute;
		width: 100rpx;
		height: 40rpx;
		background: rgba(0, 0, 0, 0.6);
		bottom: 20rpx;
		right: 20rpx;
		border-radius: 20rpx;
		color: #fff;
		font-size: 20rpx;
		justify-content: center;
	}
}
</style>
