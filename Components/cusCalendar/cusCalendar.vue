<template>
	<van-calendar id="calendar" :show="show" type="range" @confirm="保存日期($event)" @close="$emit('close')" :formatter="formatter" color="#1989FA" :default-date="默认日期" />
</template>

<script setup>
import { useStore } from 'vuex';
import { watch, computed, getCurrentInstance } from 'vue';

// 属性
const instance = getCurrentInstance().proxy;

const props = defineProps(['show']);
const emit = defineEmits(['close']);
const store = useStore();
const 默认日期 = computed(() => [new Date(store.state.日期.入住), new Date(store.state.日期.离店)]);

watch(
	() => props.show,
	(value) => {
		if (value) {
			// 默认日期变了需要调用重置方法 否则会导致后续选中日期无法回显
			instance.selectComponent('#calendar').reset();
		}
	}
);

// 方法
function 保存日期({ detail }) {
	setTimeout(() => {
		let [start, end] = detail;
		store.commit('setState', {
			key: '日期',
			value: {
				入住: `${start.getFullYear()}/${start.getMonth() + 1}/${start.getDate()}`,
				离店: `${end.getFullYear()}/${end.getMonth() + 1}/${end.getDate()}`
			}
		});
	}, 200);
	emit('close');
}
function formatter(day) {
	if (!day.topInfo) {
		let time = day.date.getTime();
		for (let val of store.state.计价规则.日期规则) {
			let bs = new Date(val.start).getTime();
			let be = new Date(val.end).getTime();
			if (time >= bs && time <= be) {
				day.topInfo = `￥${val.price1}/￥${val.price2}`;
			}
		}
	}
	if (day.type === 'start') {
		day.bottomInfo = '入住';
	} else if (day.type === 'end') {
		day.bottomInfo = '离店';
	}
	return day;
}
</script>

<style lang="less" scoped></style>
