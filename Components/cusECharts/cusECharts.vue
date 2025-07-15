<template>
	<view v-show="props.options" class="viewBox">
		<ec-canvas canvas-id="mychart" :ec="ec" />
	</view>
</template>

<script setup>
import { ref, watch } from 'vue';
// 不能用
// import * as echarts from '/wxcomponents/ec-canvas/echarts.js';
const echarts = require('../../wxcomponents/ec-canvas/echarts.js');

// 属性
const props = defineProps(['options']);
const ec = ref({
	// 配置项
	onInit: initChart
	// lazyLoad: true
	// 禁止触屏事件
	// disableTouch: true
});
let chartObj;
// 监听数据发生变化时 重新渲染
watch(
	() => props.options,
	(options) => {
		if (!options?.labels || !options.values) return;
		let o = {
			series: [
				{
					data: options.values
				}
			]
		};
		// 判断更新哪个轴
		if (props.options.方向 == '横') {
			o['xAxis'] = {
				data: options?.labels
			};
		} else {
			o['yAxis'] = {
				data: options?.labels
				// axisLabel: {
				// 	// 14天以内 每一天都显示 超过14天的依次递减显示
				// 	interval: Math.floor(options.labels.length / 7) - 1
				// }
			};
		}
		chartObj.setOption(o);
	},
	{ deep: true }
);

// 方法
function initChart(canvas, width, height, dpr) {
	if (!props.options) return;
	const chart = echarts.init(canvas, null, {
		width: width,
		height: height,
		devicePixelRatio: dpr
	});
	canvas.setChart(chart);
	let option = {};
	if (props.options.方向 == '横') {
		option['xAxis'] = {
			type: 'category',
			data: props.options.labels || [],
			axisTick: { show: false } // 刻度
		};
		option['yAxis'] = {
			type: 'value'
		};
		option['grid'] = {
			top: 16,
			bottom: 5,
			left: 10,
			right: 10,
			containLabel: true
		};
		option['series'] = [
			{
				data: props.options.values || [],
				type: 'line',
				smooth: true,
				symbol: 'none' // 不显示折线上的点
			}
		];
	} else if (props.options.方向 == '纵') {
		option['tooltip'] = {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow'
			},
			formatter: function (params) {
				let args = params[0];
				let date = args.name;
				return `${date}: ${args.value}元`;
			}
		};
		option['xAxis'] = {
			type: 'value',
			axisLine: { show: false }, // 隐藏坐标轴线
			axisTick: { show: false }, // 隐藏刻度线
			axisLabel: { show: false }, // 隐藏数值标签
			show: true // 保持为 true，避免布局错乱
		};
		option['yAxis'] = {
			type: 'category',
			data: props.options.labels || [],
			axisTick: { show: false }
		};
		option['grid'] = {
			left: 10,
			right: 20,
			top: 20,
			bottom: 15,
			containLabel: true //是否把坐标轴算作网格区域
		};
		option['series'] = [
			{
				data: props.options.values || [],
				type: 'bar',
				label: {
					normal: {
						show: true //是否在柱体上显示文字
					}
				}
			}
		];
	}
	chart.setOption(option);
	chartObj = chart;
	return chart;
}
</script>

<style lang="less" scoped>
.viewBox {
	overflow: hidden;
	width: 100%;
	height: 100%;
	display: grid;
	position: relative;
}
ec-canvas {
	width: 100%;
	height: 100%;
	overflow: hidden;
}
</style>
