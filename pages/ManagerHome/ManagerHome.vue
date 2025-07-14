<template>
	<cusScrollView :加载="查询数据" class="scroll">
		<view class="page colLayout">
			<view class="head">
				<view class="border button colLayout" @click="跳转('日历')">
					<image class="icon" src="/Static/img/icon1.png" mode="aspectFit"></image>
					<view class="title">日历</view>

					<view v-if="日历接待数" class="rowLayout">
						<view class="text2">{{ 日历接待数 }}</view>
						<view class="text">个即将到来的客人</view>
					</view>
					<view v-else class="text">没有客人呦</view>
				</view>

				<view class="border button colLayout" @click="跳转('待处理')">
					<image class="icon" src="/Static/img/icon2.png" mode="aspectFit"></image>
					<view class="title">待处理预约</view>

					<view v-if="待处理订单数" class="rowLayout">
						<view class="text2">{{ 待处理订单数 }}</view>
						<view class="text">个待处理</view>
					</view>
					<view v-else class="text">没有待处理的工作呦</view>
				</view>
			</view>

			<swiper class="border echartCards" @click="跳转('统计')">
				<template v-if="图表.show">
					<swiper-item v-for="(item, index) in 图表.data" :key="index" style="overflow: hidden">
						<cusECharts :options="item" />
					</swiper-item>
				</template>
			</swiper>

			<view class="flexGrow">
				<view class="border center button" v-for="item in 功能" @click="跳转(item.page)" :key="item.name">{{ item.name }}</view>
			</view>
		</view>
	</cusScrollView>
</template>

<script setup>
import cusScrollView from '/Components/cusScrollView/cusScrollView.vue';
import cusECharts from '/Components/cusECharts/cusECharts.vue';
import { ref } from 'vue';
import { 请求接口 } from '/Api/请求接口.js';
import { 今天 } from '/Api/时间参数.js';

uni.hideHomeButton();
// 属性
const 功能 = ref([
	{ name: '客户', page: '/pages/ManagerCustomer/ManagerCustomer' },
	{ name: '订单', page: '/pages/ManagerOrder/ManagerOrder' },
	{ name: '计价规则', page: '/pages/ManagerRules/ManagerRules' },
	{ name: '上传图片', page: '/pages/ManagerPhotos/ManagerPhotos' },
	{ name: '添加收入', page: '/pages/ManagerAddOrder/ManagerAddOrder' }
]);
const 图表 = ref({
	show: false,
	data: []
});
const 待处理订单数 = ref(0);
const 日历接待数 = ref(0);

// 方法
async function 查询数据(type) {
	if (type == '刷新') {
		图表.value.show = false;
		// 分别查询日期接口、订单接口、统计接口
		let { start, end } = 计算月份();
		请求接口('calendarSearch2', {
			start,
			end
		}).then((res) => {
			日历接待数.value = res.total || 0;
		});
		请求接口('orderEdit2', {
			type: '查询',
			data: {
				pageSize: 20,
				pageNum: 1,
				status: 0
			}
		}).then((res) => {
			待处理订单数.value = res?.total || 0;
		});
		图表查询();
	}
}
function 跳转(type) {
	switch (type) {
		case '日历':
			uni.navigateTo({
				url: '/pages/ManagerCalendar/ManagerCalendar'
			});
			break;
		case '待处理':
			uni.navigateTo({
				url: '/pages/ManagerHandle/ManagerHandle',
				events: {
					// 处理完订单返回外层显示的数据
					待处理(data) {
						待处理订单数.value = data || 0;
					}
				}
			});
			break;
		case '统计':
			uni.navigateTo({
				url: '/pages/ManagerStatistics/ManagerStatistics'
			});
			break;
		default:
			uni.navigateTo({
				url: type
			});
			break;
	}
}
function 计算月份() {
	let arr = 今天.split('/');
	let nextMonth;
	if (arr[1] == 12) {
		nextMonth = `${Number(arr[0]) + 1}/1/1`;
	} else {
		nextMonth = `${arr[0]}/${Number(arr[1]) + 1}/1`;
	}
	arr = nextMonth.split('/');
	let year = arr[0];
	let month = arr[1];
	let total = new Date(year, month, 0).getDate();
	return {
		start: 今天,
		end: `${year}/${month}/${total}`
	};
}
function 图表查询() {
	// 以当前所在周进行查询
	let week = new Date(今天).getDay(); // 0(周日)到6(周六)
	let 偏差值 = week == 0 ? 6 : week - 1;
	let 周一 = new Date(今天);
	// setDate是Date实例上的 不能直接用Date.setDate
	// setDate很智能 传入正数则对应某一天 传入0则设置为上个月最后一天
	// 传入负数则从上个月最后一天往前推算 传入大于当月天数则顺延到下个月
	周一.setDate(周一.getDate() - 偏差值);
	let 周末 = new Date(今天);
	周末.setDate(周一.getDate() + 6);
	let res1 = 请求接口('incomeStatistics2', {
		type: '自定义',
		data: {
			start: `${周一.getFullYear()}/${周一.getMonth() + 1}/${周一.getDate()}`,
			end: `${周末.getFullYear()}/${周末.getMonth() + 1}/${周末.getDate()}`
		}
	});
	let arr = 今天.split('/');
	let res2 = 请求接口('incomeStatistics2', {
		type: '按月',
		data: {
			year: arr[0],
			month: arr[1]
		}
	});
	let res3 = 请求接口('incomeStatistics2', {
		type: '按年',
		data: {
			year: arr[0]
		}
	});
	// 所有数据回来后一起渲染 否则后面后面几条数据渲染不上去
	Promise.all([res1, res2, res3]).then(([data1, data2, data3]) => {
		图表.value.show = true;
		图表.value.data[0] = { 方向: '横', ...data1 };
		图表.value.data[1] = { 方向: '横', ...data2 };
		图表.value.data[2] = { 方向: '横', ...data3 };
	});
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
			.text {
				font-size: 24rpx;
				color: #485261;
			}
			.text2 {
				font-weight: bold;
				color: #faad14;
				position: relative;
				bottom: 3rpx;
				margin-right: 10rpx;
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
.echartCards {
	height: 360rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
}
</style>
