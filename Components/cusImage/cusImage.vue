<template>
	<view class="body" @click="$emit('点击事件')">
		<image class="bgImg" :src="props.src" :mode="props.裁剪 || 'aspectFit'" @load="loading = false" @error="error = true"></image>

		<view class="popup center" :style="{ opacity: loading ? 1 : 0 }">
			<van-loading type="spinner" color="#969799" />
		</view>

		<view class="popup center" :style="{ opacity: error ? 1 : 0 }" style="transition: none">加载失败</view>
	</view>
</template>

<script setup>
import { ref, watch } from 'vue';

// 属性
const props = defineProps(['src', '裁剪']);
const loading = ref(true);
const error = ref(false);
// 有新图片传入时重置loading
watch(
	() => props.src,
	(value) => {
		if (value) {
			loading.value = true;
			error.value = false;
		}
	},
	{ immediate: true }
);
</script>

<style lang="less" scoped>
@import '/Static/公共样式.css';

.body {
	position: relative;
	z-index: 10;
	width: 100%;
	height: 100%;
}
.popup {
	position: absolute;
	left: 0%;
	top: 0%;
	width: 100%;
	height: 100%;
	z-index: 10;
	background: #f7f8fa;
	transition: all 0.3s;
	color: #969799;
	font-size: 32rpx;
}
</style>
