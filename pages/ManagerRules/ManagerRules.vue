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
			<view class="rowLayout gap" v-for="(item, index) in form.自定义折扣" :key="item.大于">
				<view class="border" style="width: 300rpx">
					<view class="noShrink unit1">超过</view>
					<input class="flexGrow" v-model="item.大于" type="text" />
					<view class="unit2 center noShrink">天</view>
				</view>
				<view class="line"></view>
				<view class="border" style="width: 150rpx">
					<input class="flexGrow" v-model="item.折扣" type="text" />
					<view class="unit2 center noShrink">%</view>
				</view>
				<view class="button del center" @click="弹窗确认('自定义折扣', index)" style="width: 130rpx; height: 70rpx">删除</view>
			</view>
			<view class="button center" @click="新增('自定义折扣')">新增</view>

			<view class="title">自定义日期价格</view>
			<view class="gap" v-for="(item, index) in form.自定义日期" :key="index" style="padding-left: 20rpx; position: relative">
				<view class="border rowLayout" style="justify-content: space-evenly; width: 400rpx">
					<view>{{ item.start }}</view>
					<view class="line"></view>
					<view>{{ item.end }}</view>
				</view>
				<view class="rowLayout" style="margin-top: 20rpx">
					<view class="border center">{{ item.type }}</view>
					<view class="line"></view>
					<view class="border" style="width: 250rpx">
						<view class="noShrink unit1">¥</view>
						<input class="flexGrow" v-model="item.price" type="text" />
						<view class="unit2 center noShrink">/ 晚</view>
					</view>
				</view>
				<view class="button del center button2" @click="弹窗确认('自定义日期', index)">删除</view>
			</view>
			<view class="button center" @click="新增('自定义日期')">新增</view>
		</view>

		<view class="foot">
			<view class="button center noShrink" @click="保存()">保存</view>
		</view>
	</view>

	<Notify @confirm="弹窗操作()" />
</template>

<script setup>
import Notify from '/Components/notify/notify.vue';
import { 消息, 弹窗 } from '/Api/提示.js';
import { 今天 } from '/Api/时间参数.js';
import { ref } from 'vue';

// 属性
const form = ref({
	标准间单价: 88,
	豪华间单价: 118,
	自定义日期: [
		{ start: '2025/7/1', end: '2025/7/10', price: 68, type: '标准间' },
		{ start: '2025/7/5', end: '2025/7/9', price: 68, type: '豪华间' }
	],
	自定义折扣: [
		{ 大于: 10, 折扣: 80 },
		{ 大于: 20, 折扣: 60 }
	]
});
const 当前操作对象 = {
	key: '',
	value: ''
};

// 方法
function 弹窗确认(type, index) {
	弹窗(`确认删除？`, '确认');
	当前操作对象.key = type;
	当前操作对象.value = index;
}
function 弹窗操作() {
	form.value[当前操作对象.key].splice(当前操作对象.value, 1);
}
function 新增(type) {
	let data;
	switch (type) {
		case '自定义折扣':
			data = { 大于: '', 折扣: '' };
			break;
		case '自定义日期':
			data = { start: 今天, end: 今天, price: '', type: '标准间' };
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
	for (let val of form.value.自定义折扣) {
		if (!numReg.test(val.大于) || !numReg.test(val.折扣)) {
			消息('折扣请输入数字', '失败');
			return;
		}
	}
	for (let val of form.value.自定义日期) {
		if (!numReg.test(val.price)) {
			消息('日期价格请输入数字', '失败');
			return;
		}
	}
	// 校验列表是否有重复项
	let set = new Set();
	for (let val of form.value.自定义折扣) {
		if (set.has(val.大于)) {
			消息('存在重复的折扣规则', '失败');
			return;
		} else {
			set.add(val.大于);
		}
	}
	set = new Set();
	for (let val of form.value.自定义日期) {
		let str = `${val.start}-${val.end}-${val.type}-${val.price}`;
		if (set.has(str)) {
			消息('存在重复的日期规则', '失败');
			return;
		} else {
			set.add(str);
		}
	}
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
