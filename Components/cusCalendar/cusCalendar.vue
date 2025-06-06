<template>
	<van-calendar :show="show" type="range" @confirm="保存日期($event)" @close="emit('close')" color="#1989FA" />
</template>

<script setup>
import { useStore } from 'vuex';

// 属性
const props = defineProps(['show']);
const emit = defineEmits(['close']);
const store = useStore();

// 方法
function 保存日期({ detail }) {
	let [start, end] = detail;
	store.commit('setState', {
		key: '日期',
		value: {
			入住: `${start.getFullYear()}/${start.getMonth() + 1}/${start.getDate()}`,
			离店: `${end.getFullYear()}/${end.getMonth() + 1}/${end.getDate()}`
		}
	});
	emit('close');
}
</script>

<style lang="less" scoped></style>
