<template>
	<cusScrollView :加载="查询数据" class="scroll">
		<view class="page">
			<view class="card colLayout" v-for="item in 列表">
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
						<view>{{ item.room }}</view>
					</view>
					<view>
						<view class="label">金额</view>
						<view>{{ item.pay }}</view>
					</view>
				</view>

				<van-button @click="显示弹窗(item.pets)" size="small" type="info" plain style="align-self: flex-end">宠物详情</van-button>

				<view class="line"></view>

				<view class="foot rowLayout">
					<view class="button center" style="background: #3981c6; color: #fff">确认</view>
					<view class="button center" style="background: #f4f3f3">取消</view>
				</view>
			</view>
		</view>
	</cusScrollView>

	<van-popup :show="弹窗.show" @close="弹窗.show = false">
		<view class="popup">
			<view style="overflow: auto; height: 100%; padding-right: 40rpx">
				<view class="viewBox" v-for="item in 弹窗.list" :key="item.name">
					<view :class="{ row: key == '特殊要求' }" v-for="[key, value] in Object.entries(item)">
						<view class="label">{{ key }}</view>
						<view class="text" :style="回显样式(key, value)">{{ 回显(key, value) }}</view>
					</view>
				</view>
			</view>
		</view>
	</van-popup>
</template>

<script setup>
import { ref } from 'vue';
import cusScrollView from '/Components/cusScrollView/cusScrollView.vue';
import { 计算天数 } from '/Api/时间参数.js';

// 属性
const 列表 = ref([
	{
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
const 弹窗 = ref({
	show: false,
	list: []
});

// 方法
async function 查询数据(type) {
	if (type == '刷新') {
		return new Promise(a => {
			setTimeout(() => {
				a();
			}, 1000);
		});
	}
}
function 显示弹窗(pets) {
	弹窗.value.show = true;
	弹窗.value.list = pets;
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
		}
		.line {
			height: 2rpx;
			background-color: #eeeeee;
			margin: 20rpx 0;
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
