<template>
	<view class="page colLayout">
		<view class="timeSearch rowLayout noShrink">
			<view class="rowLayout">
				<view style="color: #1989fa" @click="选择日期('入住')">{{ 日期.入住 || '入住日期' }}</view>
				<view style="margin: 0 20rpx">至</view>
				<view style="color: #1989fa" @click="选择日期('离店')">{{ 日期.离店 || '离店日期' }}</view>
			</view>
			<view class="button center" @click="选择日期('查询')">查询</view>
		</view>
		<van-search class="noShrink" :value="关键字" @change="搜索框($event)" @search="查询数据('刷新')" @clear="查询数据('刷新')" placeholder="客户名或电话或宠物名" />

		<cusScrollView :加载="查询数据" class="flexGrow">
			<view class="viewBox">
				<view class="card colLayout" v-for="item in 列表" :key="item._id">
					<view class="name">{{ item.name }}</view>
					<view class="phone">{{ item.phone }}</view>
					<view class="grid">
						<view>
							<view class="title">时间</view>
							<view>{{ item.start.replaceAll('/', '.') }} ~ {{ item.end.replaceAll('/', '.') }}</view>
						</view>
						<view>
							<view class="title">宠物</view>
							<view>{{ item.pets.map(e => e.name).join('、') }}</view>
						</view>
						<view>
							<view class="title">金额</view>
							<view style="padding-top: 10rpx">{{ item.pay }}</view>
						</view>
						<view>
							<view class="title">房间</view>
							<view>{{ item.room }}</view>
						</view>
						<view>
							<view class="title">订单状态</view>
							<view :style="{ color: 订单状态[String(item.status)].color }">{{ 订单状态[String(item.status)].label }}</view>
						</view>
					</view>
					<view class="button" @click="显示弹窗(item.pets)">查看宠物</view>
				</view>
			</view>
		</cusScrollView>
	</view>

	<PetsDetail :show="弹窗.宠物详情显示" @close="弹窗.宠物详情显示 = false" :宠物列表="弹窗.宠物详情" />

	<van-popup :show="弹窗.日期显示" position="bottom" custom-style="height: 684rpx;" @close="弹窗.日期显示 = false">
		<van-datetime-picker :value="弹窗.日期" @confirm="选择日期('选择日期', $event)" type="date" :min-date="new Date('2022/7/1').getTime()" @cancel="选择日期('取消选择')" />
	</van-popup>

	<Notify />
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue';
import cusScrollView from '/Components/cusScrollView/cusScrollView.vue';
import PetsDetail from '/Components/petsDetail/petsDetail.vue';
import Notify from '/Components/notify/notify.vue';
import { 消息 } from '/Api/提示.js';
import { useStore } from 'vuex';
import { 请求接口 } from '/Api/请求接口.js';

onBeforeUnmount(() => {
	store.commit('setState', {
		key: '提示.show',
		value: false
	});
});

// 属性
const store = useStore();
const 关键字 = ref('');
const 列表 = ref([]);
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
const 分页 = {
	total: 0,
	pageNum: 1,
	pageSize: 5
};

// 方法
async function 查询数据(type) {
	if (type == '刷新') {
		分页.pageNum = 1;
		列表.value = [];
	} else {
		if (分页.pageNum < Math.ceil(分页.total / 分页.pageSize)) {
			分页.pageNum++;
		} else {
			return;
		}
	}
	let data = {
		pageNum: 分页.pageNum,
		pageSize: 分页.pageSize,
		keyWords: 关键字.value
	};
	if (日期.value.入住) {
		data['start'] = 日期.value.入住;
	}
	if (日期.value.离店) {
		data['end'] = 日期.value.离店;
	}
	await 请求接口('orderEdit2', {
		type: '查询',
		data
	}).then(res => {
		if (res && res.data) {
			分页.total = res.total;
			列表.value.push(...res.data);
		}
	});
}
function 显示弹窗(pets) {
	弹窗.value.宠物详情显示 = true;
	弹窗.value.宠物详情 = pets.map(e => ({
		昵称: e.name,
		年龄: e.age,
		性别: e.gender,
		品种: e.breed,
		性格: e.temperament,
		是否绝育: e.isNeutered,
		是否有耳螨: e.hasEarMites,
		是否携带传染病: e.hasInfectiousDisease,
		上一次驱虫时间: e.lastDewormingDate,
		上一次疫苗时间: e.lastVaccinationDate,
		特殊要求: e.specialRequirements
	}));
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
			查询数据('刷新');
			break;
	}
}
function 搜索框({ detail: value }) {
	关键字.value = value;
}
</script>

<style lang="less" scoped>
::v-deep .van-center-enter-active,
.van-center-leave-active {
	border-radius: 32rpx;
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
		.viewBox {
			padding: 32rpx;
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
						margin-bottom: 10rpx;
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
