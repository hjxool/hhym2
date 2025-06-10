<template>
	<view class="page">
		<view class="img" v-for="item in 图片列表" @click="放大查看(item)" :style="{ background: item }"></view>

		<van-overlay :show="弹窗.show" @click="弹窗.show = false">
			<view class="pop center">
				<view class="img" :style="{ background: 弹窗.url }"></view>
			</view>
		</van-overlay>
	</view>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue';

// 属性
const instance = getCurrentInstance().proxy;
const channel = instance.getOpenerEventChannel();

const 图片列表 = ref([]);
const 弹窗 = ref({
	show: false,
	url: ''
});

channel.on('图片列表', (data) => {
	图片列表.value = data;
});

// 方法
function 放大查看(img) {
	弹窗.value.show = true;
	弹窗.value.url = img;
}
</script>

<style lang="less" scoped>
@import '/Static/公共样式.css';
.page {
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: repeat(auto-fill, 380rpx);
	grid-auto-flow: 380rpx;
	padding: 0 20rpx;
	grid-gap: 20rpx;
	> .img {
		border-radius: 20rpx;
		overflow: hidden;
		object-fit: contain;
	}
}
.pop {
	width: 100vw;
	height: 100vh;
	> .img {
		width: 80%;
		height: 80%;
	}
}
</style>
