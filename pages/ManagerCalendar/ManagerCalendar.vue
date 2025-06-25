<template>
	<cusScrollView :加载="查询数据" class="scroll">
		<view class="page">
			<view class="week">
				<view v-for="item in 星期">{{ item }}</view>
			</view>

			<view class="scrollBox">
				<view v-for="item in 日期列表" :key="item.title">
					<view class="title">{{ item.title }}</view>
					<view class="date">
						<view class="button" v-for="(day, index) in item.days" :key="index" @click="显示详情(day.detail)">
							<view :style="{ color: day.color }">{{ day.text }}</view>
							<view v-if="day.detail" class="num center">{{ day.detail.length }}</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</cusScrollView>

	<van-popup :show="详情.show" @close="详情.show = false" position="bottom" custom-style="height: 60%;" round>
		<view class="detail">
			<view class="card" v-for="item in 详情.list" :key="item.name">
				<view class="name">{{ item.name }}</view>
				<view class="phone">{{ item.phone }}</view>

				<view class="rowLayout" style="margin: 24rpx 0">
					<image class="icon" src="/Static/img/icon3.png" mode="aspectFit"></image>
					<view style="font-size: 34rpx; font-weight: bold">订单</view>
				</view>

				<view style="padding-left: 40rpx">
					<view class="order" v-for="(item2, index2) in item.orders" :key="item2.room">
						<view class="rowLayout">
							<view class="label">时间</view>
							<view>{{ item2.start.replaceAll('/', '.') }} ~ {{ item2.end.replaceAll('/', '.') }} 共{{ 计算天数(item2.start, item2.end) }}天</view>
						</view>

						<view class="rowLayout">
							<view class="label">宠物</view>
							<view>{{ item2.pets.join('、') }}</view>
						</view>

						<view class="rowLayout">
							<view class="label">房间</view>
							<view class="rowLayout flexGrow">
								<view>{{ item2.room }}</view>
								<view class="price">¥ {{ item2.pay }}</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</van-popup>
</template>

<script setup>
import cusScrollView from '/Components/cusScrollView/cusScrollView.vue';
import { ref } from 'vue';
import { 今天, 计算天数 } from '/Api/时间参数.js';

// 属性
const 星期 = ref(['日', '一', '二', '三', '四', '五', '六']);
const 日期列表 = ref([]);
const 检索范围 = {
	start: 今天,
	end: ''
};
const 详情 = ref({
	show: false,
	list: []
});
// 测试数据
let 订单 = {
	'2025/6/25': [
		{
			name: '测试1',
			phone: '1111111',
			orders: [
				{ start: '2025/6/25', end: '2025/7/1', pets: ['测试2', '测试3'], pay: '560', room: '豪华间1' },
				{ start: '2025/6/25', end: '2025/7/1', pets: ['测试4'], pay: '180', room: '标准间3' }
			]
		},
		{
			name: '测试7',
			phone: '333333333',
			orders: [
				{ start: '2025/6/25', end: '2025/7/8', pets: ['测试22', '测试33'], pay: '560', room: '豪华间1' },
				{ start: '2025/6/25', end: '2025/7/8', pets: ['测试445'], pay: '180', room: '标准间3' }
			]
		}
	],
	'2025/7/3': [
		{
			name: '测试5',
			phone: '222222222222',
			orders: [{ start: '2025/7/3', end: '2025/7/10', pets: ['测试6'], pay: '160', room: '标准间1' }]
		}
	]
};

初始化();

// 方法
async function 查询数据(type) {
	if (type == '刷新') {
		return new Promise((a) => {
			setTimeout(() => {
				let list = Object.entries(订单);
				for (let month of 日期列表.value) {
					for (let day of month.days) {
						day.detail = null;
						for (let [start, value] of list) {
							if (day.date == start) {
								day.detail = value;
							}
						}
					}
				}
				a();
			}, 1000);
		});
	}
}
async function 初始化() {
	日期列表.value = [];
	日期列表.value.push(构造月(今天));
	// 下个月
	// 边界条件判断 如果是12月就是年份加1 否则月份加1
	let arr = 今天.split('/');
	let nextMonth;
	if (arr[1] == 12) {
		nextMonth = `${Number(arr[0]) + 1}/1/1`;
	} else {
		nextMonth = `${arr[0]}/${Number(arr[1]) + 1}/1`;
	}
	日期列表.value.push(构造月(nextMonth));
	// 查询当月和下个月的订单
	arr = nextMonth.split('/');
	let year;
	let month;
	if (arr[1] == 12) {
		year = Number(arr[0]) + 1;
		month = 1;
	} else {
		year = Number(arr[0]);
		month = Number(arr[1]) + 1;
	}
	let total = new Date(year, month, 0).getDate();
	let start = 今天;
	检索范围.end = `${year}/${month}/${total}`;
	// 测试数据
	查询数据('刷新');
}
function 构造月(str) {
	// 传入日期如果不是1号 则将前面的日期样式改为灰色
	let arr = str.split('/');
	let year = Number(arr[0]);
	let month = Number(arr[1]);
	let day = Number(arr[2]);
	let result = {
		title: `${year}年${month}月`,
		days: []
	};
	//获取当月1号是周几
	let week = new Date(`${year}/${month}/1`).getDay();
	// 当月1号以前的日期用空格代替
	for (let i = 0; i < week; i++) {
		result.days.push({
			text: '',
			color: '',
			detail: ''
		});
	}
	// 填入当月日期
	let total = new Date(year, month, 0).getDate();
	for (let i = 1; i <= total; i++) {
		result.days.push({
			text: i,
			color: i < day ? 'rgba(128, 128, 128, 0.6)' : '',
			detail: '',
			date: `${year}/${month}/${i}`
		});
	}
	// 计算剩余天数 剩余天数用空格
	for (let i = 1; i < 35 - result.days.length; i++) {
		result.days.push({
			text: '',
			color: '',
			detail: ''
		});
	}

	return result;
}
function 显示详情(detail) {
	if(!detail) return
	详情.value.show = true;
	详情.value.list = detail;
}
</script>

<style lang="less" scoped>
.scroll {
	position: absolute;
	width: 100vw;
	height: 100vh;
	left: 0%;
	top: 0;
	overflow: hidden;
}
.page {
	padding: 0 32rpx 80rpx;
	display: grid;
	grid-template-rows: 80rpx auto;
	overflow: hidden;
	background: #fff;
	border-radius: 20rpx;
	> .week {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		align-items: center;
		justify-items: center;
		font-size: 32rpx;
	}
	> .scrollBox {
		overflow: auto;
		.title {
			font-weight: bold;
			padding: 40rpx 0;
		}
		.date {
			display: grid;
			grid-template-columns: repeat(7, 1fr);
			grid-auto-rows: 100rpx;
			align-items: center;
			justify-items: center;
			.num {
				position: absolute;
				left: 80%;
				bottom: 80%;
				font-size: 28rpx;
				color: #fff;
				font-weight: 500;
				background: #ee0a24;
				border: 1px solid #fff;
				width: 40rpx;
				height: 40rpx;
				border-radius: 50%;
			}
		}
	}
}
.detail {
	height: 100%;
	overflow: auto;
	> .card {
		margin: 40rpx;
		background: #fef6f5;
		border-radius: 24rpx;
		box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.12);
		border: 1rpx solid #e5e5e5;
		padding: 32rpx;
		transition: box-shadow 0.3s ease;
		.name {
			font-size: 40rpx;
			font-weight: 500;
		}
		.phone {
			font-size: 28rpx;
			margin-top: 20rpx;
		}
		.icon {
			width: 50rpx;
			height: 50rpx;
			margin-right: 20rpx;
		}
		.order {
			font-size: 28rpx;
			& + .order {
				margin-top: 40rpx;
			}
			.label {
				margin-right: 20rpx;
			}
			.price {
				margin-left: auto;
				color: #e54d42;
				font-weight: bold;
			}
		}
	}
}
</style>
