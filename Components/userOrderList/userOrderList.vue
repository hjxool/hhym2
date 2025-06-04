<template>
	<view class="body colLayout">
		<van-tabs class="noShrink" :active="过滤显示.select" @change="切换过滤条件($event)">
			<van-tab v-for="item in 过滤显示.options" :title="item" :key="item"></van-tab>
		</van-tabs>

		<cusScrollView :加载="查询订单" style="flex-grow: 1; overflow: hidden">
			<view class="listBox">
				<view class="card" v-for="item in 列表" :key="item.订单id">
					<view class="head rowLayout">
						<view class="text1">{{ item.房间名 }}</view>
						<view :class="['text2', 状态格式化('样式', item.状态)]">{{ 状态格式化('文字', item.状态) }}</view>
					</view>

					<view style="padding: 20rpx 30rpx">
						<view class="text3">{{ item.入住时间 }}至{{ item.离店时间 }}</view>
						<view class="text3">共{{ 计算天数(item.入住时间, item.离店时间) }}天</view>
					</view>

					<view class="rowLayout" style="margin: 0 20rpx 10rpx 20rpx">
						<van-button v-show="item.状态 == 0" color="#ff4d4f" plain hairline size="small">取消订单</van-button>
						<van-button v-show="item.状态 == -1" color="#1890ff" plain hairline size="small">重新预定</van-button>

						<view class="pay">{{ item.金额 }}</view>
					</view>
				</view>
			</view>
		</cusScrollView>
	</view>
</template>

<script setup>
import cusScrollView from '../cusScrollView/cusScrollView.vue';
import { 计算天数 } from '/Api/时间参数.js';
import { ref } from 'vue';

// 属性
const 过滤显示 = ref({
	select: '全部',
	options: ['全部', '待确认', '已完成', '已取消']
});
const 列表 = ref([]);
const 订单状态 = {
	待确认: 0,
	已完成: 1,
	已取消: -1
};
// 测试数据
let 总 = [
	{
		房间名: '豪华间',
		入住时间: '2025-5-23',
		离店时间: '2025-5-27',
		金额: '488',
		状态: 0,
		订单id: '1'
	},
	{
		房间名: '标准间1',
		入住时间: '2025-5-23',
		离店时间: '2025-5-24',
		金额: '238',
		状态: 1,
		订单id: '2'
	},
	{
		房间名: '标准间2',
		入住时间: '2025-5-22',
		离店时间: '2025-5-24',
		金额: '248',
		状态: -1,
		订单id: '3'
	},
	{
		房间名: '标准间3',
		入住时间: '2025-3-23',
		离店时间: '2025-5-24',
		金额: '268',
		状态: 1,
		订单id: '4'
	},
	{
		房间名: '标准间3',
		入住时间: '2025-3-23',
		离店时间: '2025-5-24',
		金额: '268',
		状态: 1,
		订单id: '45'
	},
	{
		房间名: '标准间3',
		入住时间: '2025-3-23',
		离店时间: '2025-5-24',
		金额: '268',
		状态: 1,
		订单id: '46'
	},
	{
		房间名: '标准间3',
		入住时间: '2025-3-23',
		离店时间: '2025-5-24',
		金额: '268',
		状态: 1,
		订单id: '47'
	}
];
初始化();

// 方法
function 切换过滤条件({ detail }) {
	过滤显示.value.select = detail.title;
	switch (detail.title) {
		case '全部':
			列表.value = 总;
			break;
		default:
			列表.value = 总.filter((e) => e.状态 == 订单状态[detail.title]);
			break;
	}
}
function 初始化() {
	过滤显示.value.select = '全部';
	// 查询订单
	列表.value = 总;
}
function 状态格式化(type, value) {
	switch (value) {
		case 0:
			return type == '样式' ? 'color1' : '待确认';
		case 1:
			return type == '样式' ? 'color2' : '已完成';
		case -1:
			return type == '样式' ? 'color3' : '已取消';
	}
}
async function 查询订单(args) {
	console.log(args);
	return new Promise((a) => {
		setTimeout(() => {
			a();
		}, 2000);
	});
}
</script>

<style lang="less" scoped>
.body {
	overflow: hidden;
	height: 100%;
	.listBox {
		padding: 20rpx;
		> .card {
			border: 1rpx solid #e6e6e6;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
			border-radius: 10rpx;
			overflow: hidden;
			background: #fff;
			& + .card {
				margin-top: 20rpx;
			}
			> .head {
				justify-content: space-between;
				margin: 20rpx 30rpx 0 30rpx;
				padding-bottom: 20rpx;
				border-bottom: 1rpx solid #e6e6e6;
				> .text1 {
					font-size: 30rpx;
					font-weight: bold;
				}
				> .text2 {
					font-size: 26rpx;
				}
				> .color1 {
					color: #faad14;
				}
				> .color2 {
					color: #52c41a;
				}
				> .color3 {
					color: #999;
				}
			}
			.text3 {
				font-size: 26rpx;
				color: #666;
				& + .text3 {
					margin-top: 20rpx;
				}
			}
			.pay {
				color: #ff4d4f;
				font-size: 36rpx;
				font-weight: bold;
				margin-left: auto;
				&::before {
					content: '￥';
					display: inline-block;
					font-size: 30rpx;
					margin-right: 10rpx;
				}
			}
		}
	}
}
</style>
