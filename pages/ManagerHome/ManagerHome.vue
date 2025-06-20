<template>
	<view class="page colLayout">
		<view class="head">
			<view class="border button colLayout">
				<image class="icon" src="/Static/img/icon1.png" mode="aspectFit"></image>
				<view class="title">日历</view>
				<view class="text">12个即将到来的客人</view>
			</view>

			<view class="border button colLayout">
				<image class="icon" src="/Static/img/icon2.png" mode="aspectFit"></image>
				<view class="title">待处理预约</view>
				<view class="text">5个待处理</view>
			</view>
		</view>

		<view id="echartCards" class="border"></view>

		<view class="flexGrow">
			<view class="border center button" v-for="item in 功能">{{ item }}</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';

uni.hideHomeButton();
// 属性
const 图表卡片 = ref([]);
const 功能 = ref(['客户', '订单', '计价规则', '单价设置', '上传图片', '添加收入']);
</script>

<style lang="less" scoped>
.page {
	padding: 40rpx 20rpx;
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	> .head {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20rpx;
		margin-bottom: 20rpx;
		> .button {
			align-items: center;
			justify-content: space-evenly;
			height: 300rpx;
			> .icon {
				height: 150rpx;
				width: 100%;
			}
			> .title {
				font-size: 32rpx;
				// color: #1a1a1a;
				color: #696969;
				font-weight: bold;
			}
			> .text {
				font-size: 24rpx;
				color: #485261;
			}
		}
	}
	.border {
		background-color: #ffffff;
		border-radius: 32rpx;
		border: 2rpx solid #e2e2e2;
		box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.06);
	}
	> .flexGrow {
		overflow-x: hidden;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-auto-rows: 100rpx;
		gap: 20rpx;
		font-size: 32rpx;
		color: #696969;
	}
}
#echartCards {
	height: 360rpx;
	margin-bottom: 20rpx;
}
</style>
