<template>
	<cusScrollView :加载="查询数据" class="scroll">
		<view class="page colLayout">
			<view class="head">
				<view class="border button colLayout" @click="跳转('日历')">
					<image class="icon" src="/Static/img/icon1.png" mode="aspectFit"></image>
					<view class="title">日历</view>
					<view class="text">12个即将到来的客人</view>
				</view>

				<view class="border button colLayout" @click="跳转('待处理')">
					<image class="icon" src="/Static/img/icon2.png" mode="aspectFit"></image>
					<view class="title">待处理预约</view>
					<view class="text">5个待处理</view>
				</view>
			</view>

			<swiper class="border echartCards">
				<template v-if="显示图表">
					<swiper-item v-for="(item, index) in 图表" :key="index" style="overflow: hidden">
						<cusECharts :options="item" />
					</swiper-item>
				</template>
			</swiper>

			<view class="flexGrow">
				<view class="border center button" v-for="item in 功能" :key="item">{{ item }}</view>
			</view>
		</view>
	</cusScrollView>
</template>

<script setup>
import cusScrollView from '/Components/cusScrollView/cusScrollView.vue';
import cusECharts from '/Components/cusECharts/cusECharts.vue';
import { ref } from 'vue';

uni.hideHomeButton();
// 属性
const 功能 = ref(['客户', '订单', '计价规则', '单价设置', '上传图片', '添加收入']);
const 图表 = ref([
	{ X轴: ['1', '2', '3', '4', '5', '6', '7'], Y轴: [820, 932, 901, 934, 1290, 1330, 1320] },
	{ X轴: ['a', 'b', 'c', 'd', 'e', 'f', 'g'], Y轴: [560, 700, 901, 934, 1190, 1330, 1320] },
	{ X轴: ['q', 'w', 'e', 'r', 't', 'y', 'u'], Y轴: [0, 200, 260, 690, 1000, 1330, 1320] }
]);
const 显示图表 = ref(false);

// 方法
async function 查询数据(type) {
	if (type == '刷新') {
		显示图表.value = false;
		return new Promise((a) => {
			setTimeout(() => {
				setTimeout(() => {
					显示图表.value = true;
				}, 800);
				a();
			}, 1000);
		});
	}
}
function 跳转(type) {
	switch (type) {
		case '日历':
			uni.navigateTo({
				url: '/pages/ManagerCalendar/ManagerCalendar',
				success(res) {
					res.eventChannel.emit('数据');
				},
				events: {
					数据(data) {}
				}
			});
			break;
		case '待处理':
			uni.navigateTo({
				url: '/pages/ManagerHandle/ManagerHandle',
				success(res) {
					res.eventChannel.emit('数据');
				},
				events: {
					数据(data) {}
				}
			});
			break;
	}
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
.echartCards {
	height: 360rpx;
	margin-bottom: 20rpx;
	overflow: hidden;
}
</style>
