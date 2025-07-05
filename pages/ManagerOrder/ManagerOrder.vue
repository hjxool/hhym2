<template>
	<cusScrollView :加载="查询数据" class="scroll">
		<view class="page colLayout">
			<view class="timeSearch rowLayout noShrink">
				<view class="rowLayout">
					<view style="color: #1989fa" @click="选择日期('入住')">{{ 日期.入住 || '入住日期' }}</view>
					<view style="margin: 0 20rpx">至</view>
					<view style="color: #1989fa" @click="选择日期('离店')">{{ 日期.离店 || '离店日期' }}</view>
				</view>
				<view class="button center" @click="选择日期('查询')">查询</view>
			</view>
			<van-search class="noShrink" :value="关键字" @search="查询数据('刷新')" @clear="查询数据('刷新')" placeholder="客户名或电话或宠物名" />

			<view class="flexGrow">
				<view class="viewBox">
					<view class="card colLayout" v-for="item in 列表" :key="item.phone">
						<view class="name">{{ item.name }}</view>
						<view class="phone">{{ item.phone }}</view>
						<view class="grid">
							<view>
								<view class="title">时间</view>
								<view>{{ item.start.replaceAll('/', '.') }} ~ {{ item.end.replaceAll('/', '.') }}</view>
							</view>
							<view>
								<view class="title">宠物</view>
								<view>{{ item.pets.map(e => e.昵称).join('、') }}</view>
							</view>
							<view>
								<view class="title">金额</view>
								<view style="padding-top: 10rpx">{{ item.金额 }}</view>
							</view>
							<view>
								<view class="title">房间</view>
								<view>{{ item.房间 }}</view>
							</view>
							<view>
								<view class="title">订单状态</view>
								<view :style="{ color: 订单状态[item.订单状态].color }">{{ 订单状态[item.订单状态].label }}</view>
							</view>
						</view>
						<view class="button" @click="显示弹窗(item.pets)">查看宠物</view>
					</view>
				</view>
			</view>
		</view>
	</cusScrollView>

	<PetsDetail :show="弹窗.宠物详情显示" @close="弹窗.宠物详情显示 = false" :宠物列表="弹窗.宠物详情" />

	<van-popup :show="弹窗.日期显示" position="bottom" custom-style="height: 684rpx;" @close="弹窗.日期显示 = false">
		<van-datetime-picker :value="弹窗.日期" @confirm="选择日期('选择日期', $event)" type="date" :min-date="new Date('2022/7/1').getTime()" @cancel="选择日期('取消选择')" />
	</van-popup>

	<Notify />
</template>

<script setup>
import { ref } from 'vue';
import cusScrollView from '/Components/cusScrollView/cusScrollView.vue';
import PetsDetail from '/Components/petsDetail/petsDetail.vue';
import Notify from '/Components/notify/notify.vue';
import { 消息 } from '/Api/提示.js';

// 属性
const 关键字 = ref('');
const 列表 = ref([
	{
		name: '彰化',
		phone: '13398978787',
		start: '2025/7/1',
		end: '2025/7/12',
		金额: 320,
		房间: '标准间2',
		订单状态: -1,
		pets: [
			{ 昵称: '测试4', 年龄: 12, 性别: 1, 品种: '梨花', 性格: '普通', 是否绝育: 1, 是否有耳螨: 0, 是否携带传染病: 1, 上一次驱虫时间: '', 上一次疫苗时间: '', 特殊要求: '' },
			{ 昵称: '测试6', 年龄: 12, 性别: 1, 品种: '梨花', 性格: '普通', 是否绝育: 1, 是否有耳螨: 0, 是否携带传染病: 1, 上一次驱虫时间: '', 上一次疫苗时间: '', 特殊要求: '' }
		]
	},
	{
		name: '测试2',
		phone: '13398978787',
		start: '2025/8/1',
		end: '2025/8/12',
		金额: 1320,
		房间: '标准间1',
		订单状态: 1,
		pets: [
			{ 昵称: '测试5', 年龄: 1, 性别: 0, 品种: '银渐层', 性格: '普通', 是否绝育: 0, 是否有耳螨: 0, 是否携带传染病: 0, 上一次驱虫时间: '', 上一次疫苗时间: '', 特殊要求: '' }
		]
	}
]);
const 弹窗 = ref({
	宠物详情显示: false,
	宠物详情: [],
	日期显示: false,
	日期: ''
});
const 订单状态 = ref({
	'-1': {
		label: '已取消',
		color: '#999'
	},
	1: {
		label: '已完成',
		color: '#52c41a'
	},
	0: {
		label: '待确认',
		color: '#faad14'
	}
});
const 日期 = ref({
	入住: '',
	离店: '',
	当前操作: ''
});

// 方法
async function 查询数据(type) {
	if (type == '刷新') {
	} else {
	}
}
function 显示弹窗(pets) {
	弹窗.value.宠物详情显示 = true;
	弹窗.value.宠物详情 = pets;
}
function 选择日期(type, e) {
	switch (type) {
		case '入住':
		case '离店':
			日期.value.当前操作 = type;
			弹窗.value.日期显示 = true;
			弹窗.value.日期 = 日期.value[type] ? new Date(日期.value[type]).getTime() : Date.now();
			break;
		case '选择日期':
			弹窗.value.日期显示 = false;
			let d = new Date(e.detail);
			日期.value[日期.value.当前操作] = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
			break;
		case '取消选择':
			弹窗.value.日期显示 = false;
			日期.value[日期.value.当前操作] = '';
			break;
		case '查询':
			// 校验
			if (!日期.value.入住 && !日期.value.离店) {
				return;
			}
			if (日期.value.入住 && 日期.value.离店) {
				let s = new Date(日期.value.入住);
				let e = new Date(日期.value.离店);
				if (s >= e) {
					消息('入住日期不能大于等于离店日期', '失败');
					return;
				}
			}
			查询数据();
			break;
	}
}
</script>

<style lang="less" scoped>
::v-deep .van-center-enter-active,
.van-center-leave-active {
	border-radius: 32rpx;
}
.scroll {
	position: absolute;
	width: 100vw;
	height: 100vh;
	left: 0%;
	top: 0;
	overflow: hidden;
}
.page {
	overflow: hidden;
	> .timeSearch {
		height: 100rpx;
		padding: 0 40rpx;
		justify-content: space-between;
		background: #ffffff;
		> .button {
			padding: 10rpx 40rpx;
			background: #1989fa;
			border-radius: 16rpx;
			color: #ffffff;
		}
	}
	> .flexGrow {
		overflow: hidden;
		padding: 32rpx;
		padding-right: 0;
		> .viewBox {
			padding-right: 32rpx;
			overflow: auto;
			.card {
				background-color: #ffffff;
				border-radius: 32rpx;
				padding: 24rpx;
				box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
				gap: 16rpx;
				position: relative;
				& + .card {
					margin-top: 40rpx;
				}
				> .name {
					font-size: 36rpx;
					font-weight: bold;
					color: #333;
				}
				> .phone {
					font-size: 32rpx;
					color: #666;
				}
				> .grid {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 16rpx;
					font-size: 32rpx;
					color: #444;
					.title {
						font-size: 30rpx;
						color: #888;
					}
				}
				> .button {
					margin-top: 32rpx;
					padding: 20rpx 28rpx;
					border-radius: 24rpx;
					background-color: #1989fa;
					color: #ffffff;
					font-size: 34rpx;
					font-weight: bold;
					text-align: center;
				}
			}
		}
	}
}
</style>
