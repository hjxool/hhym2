<template>
	<cusScrollView :加载="查询数据" class="page">
		<view class="content">
			<view class="card colLayout" v-for="(item, index) in 列表" :key="item._id">
				<view class="viewBox">
					<view>
						<view class="label">姓名</view>
						<view>{{ item.name }}</view>
					</view>
					<view>
						<view class="label">时间</view>
						<view>{{ item.start.replaceAll('/', '.') }} ~ {{ item.end.replaceAll('/', '.') }} 共{{ 计算天数(item.start, item.end) }}天</view>
					</view>
					<view>
						<view class="label">房间</view>

						<view v-show="编辑.当前 != item._id">{{ item.room }}</view>
						<view v-show="编辑.当前 == item._id" @click="显示弹窗('选择房间', item)" style="color: #faad14">{{ item.room }}</view>
					</view>
					<view>
						<view class="label">金额</view>

						<view v-show="编辑.当前 != item._id" style="padding-top: 4rpx">{{ item.pay }}</view>
						<input v-show="编辑.当前 == item._id" v-model="编辑.金额" style="width: 70%" type="number" />
					</view>
				</view>

				<view class="rowLayout edit">
					<van-button v-show="!编辑.当前" @click="编辑信息('编辑', item)" size="small" type="warning" plain>编辑</van-button>
					<view v-show="编辑.当前 == item._id" class="button center" @click="编辑信息('确认', item)" style="background: #3981c6">
						<van-icon name="success" color="#fff" />
					</view>
					<view v-show="编辑.当前 == item._id" class="button center" @click="编辑.当前 = ''" style="background: #eee">
						<van-icon name="cross" />
					</view>

					<van-button @click="显示弹窗('宠物详情', item.pets)" size="small" type="info" plain style="margin-left: 20rpx">宠物详情</van-button>
				</view>

				<view class="line"></view>

				<view class="foot rowLayout">
					<view class="button center" @click="审核('通过', index)" style="background: #3981c6; color: #fff">同意</view>
					<view class="button center" @click="审核('拒绝', index)" style="background: #f4f3f3">拒绝</view>
				</view>
			</view>
		</view>
	</cusScrollView>

	<PetsDetail :show="宠物详情.show" @close="宠物详情.show = false" :宠物列表="宠物详情.list" />

	<seleceRoom :show="编辑.显示房间列表" @close="编辑.显示房间列表 = false" :房间列表="编辑.房间列表" @select="显示弹窗('选择房间', $event)" />

	<Notify @confirm="确认弹窗()" />
</template>

<script setup>
import { getCurrentInstance, onBeforeUnmount, ref } from 'vue';
import cusScrollView from '/Components/cusScrollView/cusScrollView.vue';
import Notify from '/Components/notify/notify.vue';
import PetsDetail from '/Components/petsDetail/petsDetail.vue';
import seleceRoom from '/Components/managerSelectRoom/managerSelectRoom.vue';
import { 计算天数 } from '/Api/时间参数.js';
import { 消息, 弹窗 } from '/Api/提示.js';
import { useStore } from 'vuex';
import { 请求接口 } from '/Api/请求接口.js';

onBeforeUnmount(() => {
	store.commit('setState', {
		key: '提示.show',
		value: false
	});
	channel.emit('待处理', 列表.value.length);
});

// 属性
const store = useStore();
const instance = getCurrentInstance().proxy;
const channel = instance.getOpenerEventChannel();

const 列表 = ref([]);
const 宠物详情 = ref({
	show: false,
	list: []
});
const 编辑 = ref({
	当前: '',
	房间列表: [],
	显示房间列表: false,
	金额: ''
});
const 分页 = {
	pageNum: 1,
	pageSize: 20,
	total: 0
};
const 当前编辑 = {
	index: '',
	type: ''
};

// 方法
async function 查询数据(type) {
	if (type == '刷新') {
		分页.pageNum = 1;
		列表.value = [];
	} else {
		if (分页.pageNum < Math.ceil(分页.total / 分页.total)) {
			分页.pageNum++;
		} else {
			// 已经是最后一页就不进行查询
			return;
		}
	}
	await 请求接口('orderEdit2', {
		type: '查询',
		data: {
			pageSize: 分页.pageSize,
			pageNum: 分页.pageNum,
			status: 0
		}
	}).then((res) => {
		if (res && res.data) {
			分页.total = res?.total || 0;
			列表.value.push(...res.data);
		}
	});
}
function 显示弹窗(type, args) {
	switch (type) {
		case '宠物详情':
			宠物详情.value.show = true;
			宠物详情.value.list = args.map((e) => ({
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
			break;
		case '选择房间':
			if (编辑.value.显示房间列表) {
				编辑.value.显示房间列表 = false;
				列表.value.find((e) => e._id == 编辑.value.当前).room = args;
			} else {
				编辑.value.显示房间列表 = true;
			}
			break;
	}
}
function 编辑信息(type, item) {
	switch (type) {
		case '编辑':
			编辑.value.当前 = item._id;
			编辑.value.金额 = item.pay;
			请求接口('useableRoom2', {
				start: item.start,
				end: item.end
			}).then((res) => {
				编辑.value.房间列表 = res;
			});
			break;
		case '确认':
			let num = Number(编辑.value.金额);
			if (isNaN(num)) {
				消息('请输入正确的数字', '失败');
				return;
			}
			item.pay = num;
			编辑.value.当前 = '';
			uni.showLoading({
				title: '',
				mask: true
			});
			请求接口('orderEdit2', {
				type: '编辑',
				data: {
					_id: item._id,
					pay: item.pay,
					room: item.room
				}
			}).then((res) => {
				uni.hideLoading();
				if (!res) {
					查询数据('刷新');
				}
			});
			break;
	}
}
function 审核(type, index) {
	当前编辑.index = index;
	当前编辑.type = type;
	let item = 列表.value[index];
	弹窗(`确定 ${type} ${item.name} ${item.start}~${item.end} ${item.room} 的预约？`, '确认');
}
function 确认弹窗() {
	uni.showLoading({
		title: '',
		mask: true
	});
	let item = 列表.value[当前编辑.index];
	请求接口('orderEdit2', {
		type: '编辑',
		data: {
			_id: item._id,
			status: 当前编辑.type == '通过' ? 1 : -1,
			userId: item.userId // 通过订单的话要统计用户支出
		}
	}).then((res) => {
		uni.hideLoading();
		if (res) {
			列表.value.splice(当前编辑, 1);
		}
	});
}
</script>

<style lang="less" scoped>
::v-deep .van-center-enter-active,
.van-center-leave-active {
	border-radius: 32rpx;
}
.label {
	color: #555;
	margin-bottom: 10rpx;
}
.content {
	padding: 32rpx;
	.card {
		padding: 24rpx;
		border-radius: 12rpx;
		background-color: #ffffff;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		& + .card {
			margin-top: 40rpx;
		}
		> .viewBox {
			display: grid;
			grid-template-columns: 30% auto;
			gap: 20rpx;
			input {
				background: #eee;
				box-shadow: inset 0px 4rpx 10rpx rgba(0, 0, 0, 0.1);
				border-radius: 16rpx;
				padding: 6rpx 10rpx;
				font-size: 30rpx;
			}
		}
		.line {
			height: 2rpx;
			background-color: #eeeeee;
			margin: 20rpx 0;
		}
		> .edit {
			align-self: flex-end;
			> .button {
				border-radius: 20rpx;
				width: 100rpx;
				height: 50rpx;
				& + .button {
					margin-left: 20rpx;
				}
			}
		}
		> .foot {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 20rpx;
			padding: 0 20rpx;
			> .button {
				border-radius: 32rpx;
				padding: 26rpx 0;
			}
		}
	}
}
</style>
