<template>
	<view class="body" @click="跳转相册()">
		<swiper @change="轮播事件($event)" autoplay circular style="width: 100%; height: 100%; position: relative">
			<swiper-item v-for="item in 图片列表" :key="item._id">
				<view class="center">
					<CusImage class="bgImg" :src="item.cloudUrl" />
				</view>
			</swiper-item>
		</swiper>

		<view v-if="图片列表.length" class="count rowLayout">{{ 当前索引 + 1 }} / {{ 图片列表.length }}</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { 请求接口 } from '/Api/请求接口.js';
import CusImage from '/Components/cusImage/cusImage.vue';

// 属性
const 图片列表 = ref([]);
const 当前索引 = ref(0);

请求接口('photoUpload2', {
	type: '查询',
}).then((res) => {
	if (res && typeof res == 'object') {
		图片列表.value = res;
	}
});

// 方法
function 轮播事件({ detail: { current } }) {
	当前索引.value = current;
}
function 跳转相册() {
	uni.navigateTo({
		url: '/pages/UserPhotos/UserPhotos',
		success(res) {
			res.eventChannel.emit('图片列表', 图片列表.value);
		},
	});
}
</script>

<style lang="less" scoped>
@import '/Static/公共样式.css';
.body {
	position: relative;
	height: 400rpx;
	margin: 0 20rpx;
	border-radius: 20rpx;
	overflow: hidden;
	.center {
		width: 100%;
		height: 100%;
	}
	> .count {
		position: absolute;
		width: 100rpx;
		height: 40rpx;
		background: rgba(0, 0, 0, 0.6);
		bottom: 20rpx;
		right: 20rpx;
		border-radius: 20rpx;
		color: #fff;
		font-size: 20rpx;
		justify-content: center;
	}
}
</style>
