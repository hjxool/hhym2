<template>
	<cusScrollView :加载="查询数据" class="scroll">
		<view class="page">
			<view class="card colLayout" v-for="item in 列表" :key="item.id">
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
						<view @click="显示弹窗('选择房间', item)" :style="{ color: 编辑.当前 == item.id ? '#faad14' : '' }">{{ item.room }}</view>
					</view>
					<view>
						<view class="label">金额</view>

						<view v-show="编辑.当前 != item.id">{{ item.pay }}</view>
						<input v-show="编辑.当前 == item.id" v-model="编辑.金额" style="width: 70%" type="number" />
					</view>
				</view>

				<view class="rowLayout edit">
					<van-button v-show="!编辑.当前" @click="编辑信息('编辑', item)" size="small" type="warning" plain>编辑</van-button>
					<view v-show="编辑.当前 == item.id" class="button center" @click="编辑信息('确认', item)" style="background: #3981c6">
						<van-icon name="success" color="#fff" />
					</view>
					<view v-show="编辑.当前 == item.id" class="button center" @click="编辑.当前 = ''" style="background: #eee">
						<van-icon name="cross" />
					</view>

					<van-button @click="显示弹窗('宠物详情', item.pets)" size="small" type="info" plain style="margin-left: 20rpx">宠物详情</van-button>
				</view>

				<view class="line"></view>

				<view class="foot rowLayout">
					<view class="button center" @click="审核('通过', item)" style="background: #3981c6; color: #fff">同意</view>
					<view class="button center" @click="审核('拒绝', item)" style="background: #f4f3f3">拒绝</view>
				</view>
			</view>
		</view>
	</cusScrollView>

	<van-popup :show="宠物详情.show" @close="宠物详情.show = false">
		<view class="popup">
			<view style="overflow: auto; height: 100%; padding-right: 40rpx">
				<view class="viewBox" v-for="item in 宠物详情.list" :key="item.name">
					<view :class="{ row: key == '特殊要求' }" v-for="[key, value] in Object.entries(item)" :key="key">
						<view class="label">{{ key }}</view>
						<view :style="回显样式(key, value)">{{ 回显(key, value) }}</view>
					</view>
				</view>
			</view>
		</view>
	</van-popup>

	<van-action-sheet :show="编辑.显示房间列表" :actions="编辑.房间列表" @close="编辑.显示房间列表 = false" @select="显示弹窗('选择房间', $event)" />

	<Notify @confirm="弹窗操作('确认')" @cancel="弹窗操作('取消')" />
</template>

<script setup>
import { ref } from 'vue';
import cusScrollView from '/Components/cusScrollView/cusScrollView.vue';
import Notify from '/Components/notify/notify.vue';
import { 计算天数 } from '/Api/时间参数.js';
import { 消息, 弹窗 } from '/Api/提示.js';

// 属性
const 列表 = ref([
	{
		id: '1',
		name: '测试1',
		start: '2025/6/27',
		end: '2025/6/29',
		room: '标准间1',
		pay: 500,
		pets: [
			{
				昵称: '测试3',
				年龄: 1,
				性别: 0,
				品种: '银渐层',
				性格: '普通',
				是否绝育: 0,
				是否有耳螨: 0,
				是否携带传染病: 0,
				上一次驱虫时间: '',
				上一次疫苗时间: '',
				特殊要求: '还的口味口哦懂啊水浇地哦嫁鸡随鸡爹较耐送到家哦i'
			},
			{ 昵称: '测试4', 年龄: 12, 性别: 1, 品种: '梨花', 性格: '普通', 是否绝育: 1, 是否有耳螨: 0, 是否携带传染病: 1, 上一次驱虫时间: '', 上一次疫苗时间: '', 特殊要求: '' }
		]
	},
	{
		id: '2',
		name: '测试2',
		start: '2025/7/1',
		end: '2025/7/10',
		room: '标准间3',
		pay: 200,
		pets: [
			{ 昵称: '测试5', 年龄: 1, 性别: 0, 品种: '银渐层', 性格: '普通', 是否绝育: 0, 是否有耳螨: 0, 是否携带传染病: 0, 上一次驱虫时间: '', 上一次疫苗时间: '', 特殊要求: '' }
		]
	}
]);
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

// 方法
async function 查询数据(type) {
	if (type == '刷新') {
		return new Promise((a) => {
			setTimeout(() => {
				a();
			}, 1000);
		});
	}
}
function 显示弹窗(type, args) {
	switch (type) {
		case '宠物详情':
			宠物详情.value.show = true;
			宠物详情.value.list = args;
			break;
		case '选择房间':
			编辑.value.显示房间列表 = !编辑.value.显示房间列表;
			if (编辑.value.显示房间列表) {
				编辑.value.房间列表 = [{ loading: true }];
				setTimeout(() => {
					// 根据开始结束时间查询房间可用情况
					编辑.value.房间列表 = [
						{ name: '标准间1', disabled: false },
						{ name: '标准间2', disabled: true },
						{ name: '标准间3', disabled: false },
						{ name: '豪华间1', disabled: true }
					];
				}, 1000);
			} else {
				console.log(args.detail.name);
				列表.value.find((e) => e.id == 编辑.value.当前).room = args.detail.name;
				// 保存到服务器
			}
			break;
	}
}
function 回显(key, value) {
	switch (key) {
		case '年龄':
			return value;
		case '性别':
			return value ? '弟弟' : '妹妹';
		case '是否绝育':
		case '是否有耳螨':
		case '是否携带传染病':
			return value ? '是' : '否';
		default:
			return value || '无';
	}
}
function 回显样式(key, value) {
	switch (key) {
		case '是否绝育':
			return {
				color: value ? '' : '#ee0a24'
			};
		case '是否有耳螨':
		case '是否携带传染病':
			return {
				color: value ? '#ee0a24' : ''
			};
		default:
			return {
				color: ''
			};
	}
}
function 编辑信息(type, item) {
	switch (type) {
		case '编辑':
			编辑.value.当前 = item.id;
			编辑.value.金额 = item.pay;
			break;
		case '确认':
			let num = Number(编辑.value.金额);
			if (isNaN(num)) {
				消息('请输入正确的数字', '失败');
				return;
			}
			item.pay = num;
			编辑.value.当前 = '';
			// 保存到服务器
			break;
	}
}
function 审核(type, item) {
	弹窗(`确定${type} ${item.name} ${item.start}~${item.end} ${item.room} 的预约？`, '确认');
}
function 弹窗操作(type, item) {
	switch (type) {
		case '确认':
			// 通过该订单 成功后删除该列表项
			break;
		case '取消':
			// 拒绝该订单 成功后删除该列表项
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
.label {
	color: #555;
	margin-bottom: 10rpx;
}
.page {
	padding: 32rpx;
	overflow: hidden;
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
.popup {
	width: 80vw;
	height: 80vh;
	overflow: hidden;
	padding: 40rpx 0 40rpx 40rpx;
	.viewBox {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20rpx;
		& + .viewBox {
			margin-top: 40rpx;
			border-top: 2rpx solid #eee;
			padding-top: 40rpx;
		}
		.row {
			grid-column-start: 1;
			grid-column-end: 3;
		}
	}
}
</style>
