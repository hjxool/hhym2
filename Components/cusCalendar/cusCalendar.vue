<template>
	<van-calendar :show="show" type="range" @confirm="保存日期($event)" @close="emit('close')" :formatter="formatter" color="#1989FA" />
</template>

<script setup>
import { useStore } from 'vuex';
import { watch } from 'vue';

// 属性
const props = defineProps(['show']);
const emit = defineEmits(['close']);
const store = useStore();
let 初始化 = true;

watch(
	() => props.show,
	(value) => {
		if (value && 初始化) {
			// 该组件只在show为true时初始日期才有type 所以等到打开弹窗时再执行格式化
			formatter = formatterFn;
		}
	}
);

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
let formatter = (day) => {
	return day;
};
function formatterFn(day) {
	const month = day.date.getMonth() + 1;
	const date = day.date.getDate();
	if (初始化) {
		// 回显
		let { 入住, 离店 } = store.state.日期;
		let start = new Date(入住).getTime();
		let end = new Date(离店).getTime();
		let cur = day.date.getTime();
		// 回显前先清空原状态
		if (day.type == 'start' || day.type == 'end' || day.type == 'middle') {
			day.type = '';
			day.bottomInfo = '';
		}
		// 重新添加开始到结束之间的日期
		if (cur == start) {
			day.type = 'start';
		} else if (cur == end) {
			day.type = 'end';
			// 因为该组件初始化始终是最开始的前两天 因此回显的全局日期始终在组件原状态之后
			// 所有在回显完最后一个日期后改变标识 不再进行初始化
			初始化 = false;
		} else if (cur > start && cur < end) {
			day.type = 'middle';
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
