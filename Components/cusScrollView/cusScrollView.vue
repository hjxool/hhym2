<template>
	<scroll-view @refresherrefresh="下拉刷新()" :refresher-triggered="下拉动画" @scrolltolower="上拉加载()" scroll-y="true" refresher-enabled="true" style="height: 100%">
		<slot></slot>
		<!-- 上拉加载占位 必须用v-if -->
		<view v-if="上拉动画" class="center" style="height: 80rpx">
			<van-loading color="#808080" type="spinner" />
		</view>
	</scroll-view>
</template>

<script setup>
import { ref } from 'vue';

// 属性
const props = defineProps(['加载']);
const 下拉动画 = ref(true);
const 上拉动画 = ref(false);

// 方法
async function 下拉刷新() {
	下拉动画.value = true;
	await props.加载('刷新');
	下拉动画.value = false;
}
async function 上拉加载() {
	// 防止重复触发
	if (上拉动画.value) return;
	上拉动画.value = true;
	await props.加载('加载');
	上拉动画.value = false;
}
</script>

<style lang="less" scoped>
@import '/Static/公共样式.css';
</style>
