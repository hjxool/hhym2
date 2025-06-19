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
						<view class="text3">{{ item.入住 }}至{{ item.离店 }}</view>
						<view class="text3">共{{ 计算天数(item.入住, item.离店) }}天</view>
					</view>

					<view class="rowLayout" style="margin: 0 20rpx 10rpx 20rpx">
						<van-button v-show="按钮显示('取消订单', item)" color="#ff4d4f" @click="操作('取消订单', item)" plain hairline size="small">取消订单</van-button>
						<van-button v-show="按钮显示('重新预定', item)" color="#1890ff" @click="操作('重新预定', item)" plain hairline size="small">重新预定</van-button>

						<view class="pay">{{ item.金额 }}</view>
					</view>
				</view>
			</view>
		</cusScrollView>
	</view>

	<Notify @confirm="操作('确认')" @cancel="操作('撤销')" />
</template>

<script setup>
import cusScrollView from '../cusScrollView/cusScrollView.vue';
import Notify from '/Components/notify/notify.vue';
import { 消息, 弹窗 } from '/Api/提示.js';
import { 计算天数, 今天 } from '/Api/时间参数.js';
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
		入住: '2025-7-23',
		离店: '2025-8-27',
		金额: '488',
		状态: 0,
		订单id: '198',
		联系人: '测试1',
		联系号: '133644321876',
		从何: '',
		寄养宠物: ['测试2']
	},
	{
		房间名: '豪华间',
		入住: '2025-5-23',
		离店: '2025-5-27',
		金额: '48',
		状态: 0,
		订单id: '1'
	},
	{
		房间名: '标准间1',
		入住: '2025-5-23',
		离店: '2025-5-24',
		金额: '238',
		状态: 1,
		订单id: '2'
	},
	{
		房间名: '标准间2',
		入住: '2025-5-22',
		离店: '2025-5-24',
		金额: '248',
		状态: -1,
		订单id: '3'
	},
	{
		房间名: '标准间3',
		入住: '2025-3-23',
		离店: '2025-5-24',
		金额: '268',
		状态: 1,
		订单id: '4'
	},
	{
		房间名: '标准间3',
		入住: '2025-3-23',
		离店: '2025-5-24',
		金额: '268',
		状态: 1,
		订单id: '45'
	},
	{
		房间名: '标准间3',
		入住: '2025-3-23',
		离店: '2025-5-24',
		金额: '268',
		状态: 1,
		订单id: '46'
	},
	{
		房间名: '标准间3',
		入住: '2025-3-23',
		离店: '2025-5-24',
		金额: '268',
		状态: 1,
		订单id: '47'
	}
];
let 当前操作订单;

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
async function 查询订单(type) {
	console.log('查询订单', type);
	type == '刷新' && (列表.value = []);
	return new Promise((a) => {
		setTimeout(() => {
			if (type == '刷新') {
				if (过滤显示.value.select == '全部') {
					列表.value = 总;
				} else {
					列表.value = 总.filter((e) => e.状态 == 订单状态[过滤显示.value.select]);
				}
				if (过滤显示.value.select == '全部' || 过滤显示.value.select == '待确认') {
					uni.$emit('未读消息', '已读');
				}
			}
			a();
		}, 1000);
	});
}
function 操作(type, item) {
	switch (type) {
		case '取消订单':
			弹窗(`确定取消 ${item.入住}到${item.离店} 期间的预约？`, '确认');
			当前操作订单 = item;
			break;
		case '确认':
			// 请求接口后更改订单状态 不用刷新 避免调两次接口
			当前操作订单.状态 = 订单状态['已取消'];
			break;
		case '撤销':
			当前操作订单 = null;
			break;
		case '重新预定':
			uni.navigateTo({
				url: '/pages/UserOrder/UserOrder',
				success(res) {
					res.eventChannel.emit('数据', item);
				}
			});
			
			break;
	}
}
function 按钮显示(type, item) {
	if (type == '取消订单' && item.状态 != 0) return false;
	if (type == '重新预定' && item.状态 != -1) return false;
	// 其次判断时间是否在当天之后
	let start = item.入住.replaceAll('-', '/');
	start = new Date(start).getTime();
	let today = new Date(今天).getTime();
	// 过期的待确认订单变为取消
	if (item.状态 == 0 && start < today) {
		item.状态 = -1;
	}
	return start >= today;
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
