<template>
	<van-popup :show="props.show" @close="$emit('close')">
		<view class="popup">
			<view style="overflow: auto; height: 100%; padding-right: 40rpx">
				<view class="viewBox" v-for="item in props.宠物列表" :key="item.name">
					<view :class="{ row: key == '特殊要求' }" v-for="[key, value] in Object.entries(item)" :key="key">
						<view class="label">{{ key }}</view>
						<view :style="回显样式(key, value)">{{ 回显(key, value) }}</view>
					</view>
				</view>
			</view>
		</view>
	</van-popup>
</template>

<script setup>
import { ref } from 'vue';

// 属性
const props = defineProps(['宠物列表', 'show']);

// 方法
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
		.label {
			color: #555;
			margin-bottom: 10rpx;
		}
	}
}
</style>
