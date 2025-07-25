<template>
	<van-popup :show="props.show && props.房间列表.length" @close="$emit('close')">
		<view class="popup">
			<CusImage class="bgImg" src="cloud://cloud1-0gzy726e39ba4d96.636c-cloud1-0gzy726e39ba4d96-1320186052/room.png" />
			<view class="room" v-for="item in 房间" :class="[item.disabled ? 'disabled' : '']" :style="房间样式(item)" @click="选房(item)">
				{{ item.disabled ? '占用' : '' }}
			</view>
		</view>
	</van-popup>
</template>

<script setup>
import CusImage from '/Components/cusImage/cusImage.vue';
import { ref, watch } from 'vue';

// 属性
const props = defineProps(['房间列表', 'show']);
const emit = defineEmits(['select']);

const 房间 = ref({
	标准间1: { left: 4, top: 14, width: 138, height: 168, disabled: false, name: '标准间1' },
	标准间2: { left: 27, top: 14, width: 140, height: 168, disabled: false, name: '标准间2' },
	标准间3: { left: 73, top: 10.5, width: 140, height: 169, disabled: false, name: '标准间3' },
	标准间4: { left: 73, top: 25, width: 140, height: 169, disabled: false, name: '标准间4' },
	标准间5: { left: 4, top: 28.5, width: 140, height: 169, disabled: false, name: '标准间5' },
	标准间6: { left: 27, top: 28.5, width: 140, height: 169, disabled: false, name: '标准间6' },
	标准间7: { left: 50, top: 28.5, width: 140, height: 169, disabled: false, name: '标准间7' },
	标准间8: { left: 27, top: 51.5, width: 140, height: 169, disabled: false, name: '标准间8' },
	标准间9: { left: 50, top: 51.5, width: 138, height: 169, disabled: false, name: '标准间9' },
	标准间10: { left: 35.7, top: 75, width: 179, height: 167, disabled: false, name: '标准间10' },
	标准间11: { left: 66, top: 75, width: 180, height: 167, disabled: false, name: '标准间11' },
	豪华间1: { left: 50, top: 10.5, width: 140, height: 208, disabled: false, name: '豪华间1' },
	豪华间2: { left: 4.4, top: 75, width: 184, height: 167, disabled: false, name: '豪华间2' }
});

watch(
	() => props.房间列表,
	(value) => {
		if (!value.length) return;
		// 更新房间状态
		for (let val of props.房间列表) {
			房间.value[val.name].disabled = val.disabled;
		}
	}
);

// 方法
function 房间样式(item) {
	return {
		left: `${item.left}%`,
		top: `${item.top}%`,
		width: `${item.width}rpx`,
		height: `${item.height}rpx`
	};
}
function 选房(item) {
	if (item.disabled) return;
	emit('select', item.name);
}
</script>

<style lang="less" scoped>
.popup {
	width: 80vw;
	height: 80vh;
	overflow: hidden;
	position: relative;
	z-index: 10;
}
.room {
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
}
.disabled {
	background: rgba(0, 0, 0, 0.2);
	font-size: 34rpx;
	color: red;
	font-weight: bold;
}
</style>
