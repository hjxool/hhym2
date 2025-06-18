<template>
	<view class="viewBox" @click="滑动位置 = 0">
		<view class="content" @touchstart="滑动('开始', $event)" @touchmove="滑动('移动', $event)" @touchend="滑动('结束')" :style="{ transform: `translateX(${滑动位置}rpx)` }">
			<view class="left" :style="宽度(props.left)">
				<slot name="left"></slot>
			</view>

			<slot></slot>

			<view class="right" :style="宽度(props.right)">
				<slot name="right"></slot>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';

// 属性
const props = defineProps(['left', 'right', 'disable']);
let 起始位置;
const 滑动位置 = ref(0);

// 方法
function 宽度(value) {
	let num = Number(value);
	if (isNaN(num)) {
		return {
			width: value
		};
	} else {
		return {
			width: `${value}rpx`
		};
	}
}
function 滑动(type, event) {
	// 禁用滑动时 不执行
	if (props.disable) return;

	if (type == '开始') {
		起始位置 = event.touches[0].clientX;
	} else if (type == '移动') {
		let moveX = event.touches[0].clientX - 起始位置;
		// 限制滑动范围
		if (moveX > 0) {
			// 因为是正数 所以要用min取最小数
			滑动位置.value = Math.min(moveX, props.left || 0);
		} else {
			// 因为是负数 所以用max取最小数
			滑动位置.value = Math.max(moveX, -(props.right || 0));
		}
	} else if (type == '结束') {
		// @touchend事件没有event
		let left = props.left || 0;
		let right = props.right || 0;
		if (滑动位置.value > left / 2) {
			// 往右移动是正数 直接比大小 超过一半就显示全部
			滑动位置.value = left;
		} else if (滑动位置.value < -(right / 2)) {
			// 往左移动是负数
			滑动位置.value = -right;
		} else {
			// 没超过界限 还原位置
			滑动位置.value = 0;
		}
	}
}
function 归位() {}
</script>

<style lang="less" scoped>
@import '/Static/公共样式.css';

.viewBox {
	overflow: hidden;
	width: 100%;
	height: 100%;
	display: grid;
	> .content {
		position: relative;
		display: grid;
		transition: transform 0.3s ease-out;
		> .left {
			position: absolute;
			right: 100%;
			top: 0;
			height: 100%;
			display: grid;
		}
		> .right {
			position: absolute;
			left: 100%;
			top: 0;
			height: 100%;
			display: grid;
		}
	}
}
</style>
