<template>
	<view class="page colLayout">
		<view class="flexGrow">
			<view class="title">房间单价</view>
			<view class="rowLayout gap">
				<view style="margin-right: 20rpx">标准间</view>
				<view class="border" style="width: 250rpx">
					<view class="noShrink unit1">¥</view>
					<input class="flexGrow" v-model="form.标准间单价" type="text" />
					<view class="unit2 center noShrink">/ 晚</view>
				</view>
			</view>
			<view class="rowLayout gap">
				<view style="margin-right: 20rpx">豪华间</view>
				<view class="border" style="width: 250rpx">
					<view class="noShrink unit1">¥</view>
					<input class="flexGrow" v-model="form.豪华间单价" type="text" />
					<view class="unit2 center noShrink">/ 晚</view>
				</view>
			</view>

			<view class="title">自定义长期折扣</view>
			<view class="rowLayout gap" v-for="(item, index) in form.自定义折扣" :key="index">
				<view class="border" style="width: 300rpx">
					<view class="noShrink unit1">超过</view>
					<input class="flexGrow" v-model="item.moreThan" type="text" />
					<view class="unit2 center noShrink">天</view>
				</view>
				<view class="line"></view>
				<view class="border" style="width: 150rpx">
					<input class="flexGrow" v-model="item.discount" type="text" />
					<view class="unit2 center noShrink">%</view>
				</view>
				<view class="button del center" @click="显示弹窗('自定义折扣', index)" style="width: 130rpx; height: 70rpx">删除</view>
			</view>
			<view class="button center" @click="新增('自定义折扣')">新增</view>

			<view class="title">自定义日期价格</view>
			<view class="gap" v-for="(item, index) in form.自定义日期" :key="index" style="padding-left: 20rpx; position: relative">
				<view class="border rowLayout" style="justify-content: space-evenly; width: 400rpx">
					<view @click="显示弹窗('start', item)">{{ item.start }}</view>
					<view class="line"></view>
					<view @click="显示弹窗('end', item)">{{ item.end }}</view>
				</view>
				<view class="rowLayout" style="margin-top: 20rpx">
					<view>标准间</view>
					<view class="line"></view>
					<view class="border" style="width: 250rpx">
						<view class="noShrink unit1">¥</view>
						<input class="flexGrow" v-model="item.price1" type="text" />
						<view class="unit2 center noShrink">/ 晚</view>
					</view>
				</view>
				<view class="rowLayout" style="margin-top: 20rpx">
					<view>豪华间</view>
					<view class="line"></view>
					<view class="border" style="width: 250rpx">
						<view class="noShrink unit1">¥</view>
						<input class="flexGrow" v-model="item.price2" type="text" />
						<view class="unit2 center noShrink">/ 晚</view>
					</view>
				</view>
				<view class="button del center button2" @click="显示弹窗('自定义日期', index)">删除</view>
			</view>
			<view class="button center" @click="新增('自定义日期')">新增</view>
		</view>

		<view class="foot">
			<view class="button center noShrink" @click="保存()">保存</view>
		</view>
	</view>

	<Notify @confirm="弹窗操作()" />

	<van-popup :show="编辑.显示日期" position="bottom" custom-style="height: 684rpx;" @close="编辑.显示日期 = false">
		<van-datetime-picker :value="编辑.日期" @confirm="显示弹窗('选择日期', $event)" :title="编辑.日期选择器标题" :min-date="new Date('2022/7/10').getTime()" type="date" />
	</van-popup>
</template>

<script setup>
import Notify from '/Components/notify/notify.vue';
import { 消息, 弹窗 } from '/Api/提示.js';
import { 今天 } from '/Api/时间参数.js';
import { onBeforeUnmount, ref } from 'vue';
import { useStore } from 'vuex';
import { 请求接口 } from '/Api/请求接口.js';

onBeforeUnmount(() => {
	store.commit('setState', {
		key: '提示.show',
		value: false,
	});
});

// 属性
const store = useStore();
const form = ref({
	标准间单价: 88,
	豪华间单价: 118,
	自定义日期: [],
	自定义折扣: [],
});
const 当前操作对象 = {
	key: '',
	value: '',
};
const 编辑 = ref({
	当前编辑: '',
	当前编辑类型: '',
	日期: '',
	显示日期: false,
	日期选择器标题: '',
});
let 配置id;

初始化();

// 方法
function 初始化() {
	uni.showLoading({
		title: '',
		mask: true,
	});
	请求接口('ruleEdit2', {
		type: '查询',
	}).then((res) => {
		uni.hideLoading();
		if (res && typeof res == 'object') {
			配置id = res._id;
			form.value.标准间单价 = res.roomPrice1 || 0;
			form.value.豪华间单价 = res.roomPrice2 || 0;
			let discounts = res.discounts || [];
			form.value.自定义折扣 = discounts.map((e) => ({
				moreThan: e.moreThan,
				discount: e.discount * 100,
			}));
			form.value.自定义日期 = res.datePrices || [];
		}
	});
}
function 显示弹窗(type, value) {
	switch (type) {
		case '自定义折扣':
		case '自定义日期':
			弹窗(`确认删除？`, '确认');
			当前操作对象.key = type;
			当前操作对象.value = value;
			break;
		case 'start':
		case 'end':
			编辑.value.当前编辑 = value;
			编辑.value.当前编辑类型 = type;
			编辑.value.日期选择器标题 = type == 'start' ? '起始日期' : '结束日期';
			编辑.value.显示日期 = true;
			编辑.value.日期 = value[type] ? new Date(value[type]).getTime() : Date.now();
			break;
		case '选择日期':
			编辑.value.显示日期 = false;
			let d = new Date(value.detail);
			编辑.value.当前编辑[编辑.value.当前编辑类型] = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
			break;
	}
}
function 弹窗操作() {
	form.value[当前操作对象.key].splice(当前操作对象.value, 1);
}
function 新增(type) {
	let data;
	switch (type) {
		case '自定义折扣':
			data = { moreThan: '', discount: '' };
			break;
		case '自定义日期':
			data = { start: 今天, end: 今天, price1: form.value.标准间单价, price2: form.value.豪华间单价 };
			break;
	}
	form.value[type].push(data);
}
function 保存() {
	let numReg = /^\d+(\.\d+)?$/;
	if (!numReg.test(form.value.标准间单价) || !numReg.test(form.value.豪华间单价)) {
		消息('房间单价请输入数字', '失败');
		return;
	}
	let set = new Set();
	for (let val of form.value.自定义折扣) {
		if (!numReg.test(val.moreThan) || !numReg.test(val.discount)) {
			消息('折扣请输入数字', '失败');
			return;
		}
		// 校验列表是否有重复项
		if (set.has(val.moreThan)) {
			消息('存在重复的折扣规则', '失败');
			return;
		} else {
			set.add(val.moreThan);
		}
	}
	for (let val of form.value.自定义日期) {
		if (!numReg.test(val.price1) || !numReg.test(val.price2)) {
			消息('日期价格请输入数字', '失败');
			return;
		}
		let s = new Date(val.start).getTime();
		let e = new Date(val.end).getTime();
		if (s > e) {
			消息('起始日期不能大于结束日期', '失败');
			return;
		}
	}
	// 日期不能有重叠
	if (判断日期区间是否重叠(form.value.自定义日期)) {
		消息('日期区间不允许重叠', '失败');
		return;
	}

	uni.showLoading({
		title: '',
		mask: true,
	});
	请求接口('ruleEdit2', {
		type: '编辑',
		data: {
			_id: 配置id,
			roomPrice1: Number(form.value.标准间单价),
			roomPrice2: Number(form.value.豪华间单价),
			discounts: form.value.自定义折扣.map(({ moreThan, discount }) => ({
				moreThan: Number(moreThan),
				discount: discount / 100,
			})),
			datePrices: form.value.自定义日期.map(({ start, end, price1, price2 }) => ({
				start,
				end,
				price1: Number(price1),
				price2: Number(price2),
			})),
		},
	}).then(() => {
		uni.hideLoading();
		setTimeout(() => {
			uni.navigateBack();
		}, 300);
	});
}
function 判断日期区间是否重叠(data) {
	// 先拷贝一份 然后按开始日期升序
	let list = data.map((e) => ({
		start: new Date(e.start),
		end: new Date(e.end),
	}));
	list.sort((a, b) => a.start - b.start);
	for (var i = 0; i < list.length - 1; i++) {
		// 排过序的区间 如果前一个的结束时间比后一个的开始时间大 则说明重叠
		if (list[i].end >= list[i + 1].start) {
			return true;
		}
	}
	return false;
}
</script>

<style lang="less" scoped>
.title {
	font-size: 32rpx;
	margin-bottom: 24rpx;
	font-weight: bold;
	&:not(:nth-of-type(1)) {
		margin-top: 40rpx;
	}
}
.border {
	border: 1px solid #b3b3b3;
	border-radius: 16rpx;
	display: flex;
	padding: 0 20rpx;
	height: 70rpx;
	> .unit1 {
		margin-right: 20rpx;
		align-self: center;
	}
	> .unit2 {
		padding-left: 20rpx;
		border-left: 1px solid #b3b3b3;
		color: #b3b3b3;
	}
	> .flexGrow {
		height: 100%;
	}
}
.gap + .gap {
	margin-top: 20rpx;
}
.line {
	width: 20rpx;
	height: 2rpx;
	background: #050205;
	margin: 0 10rpx;
}
.page {
	background-color: #fff;
	border-top: 1px solid #b3b3b3;
	color: #050205;
	overflow: hidden;
	> .flexGrow {
		padding: 24rpx;
		overflow: auto;
		> .rowLayout {
			padding-left: 20rpx;
		}
		> .button {
			margin: 20rpx 40rpx 0;
			border-radius: 32rpx;
			padding: 26rpx 0;
			background: #3981c6;
			color: #fff;
		}
		.del {
			color: #fff;
			background: #f0662d;
			border-radius: 16rpx;
			margin-left: auto;
		}
		.button2 {
			position: absolute;
			height: 90%;
			right: 0;
			width: 100rpx;
			top: 50%;
			transform: translateY(-50%);
		}
	}
	> .foot {
		padding: 40rpx 20rpx 60rpx;
		border-top: 1px solid #b3b3b3;
		> .button {
			border-radius: 32rpx;
			padding: 26rpx 0;
			background: #3981c6;
			color: #fff;
		}
	}
}
</style>
