<template>
	<view class="viewBox">
		<ec-canvas canvas-id="mychart" :ec="ec" />
	</view>
</template>

<script setup>
import { ref } from 'vue';
// 不能用
// import * as echarts from '/wxcomponents/ec-canvas/echarts.js';
const echarts = require('../../wxcomponents/ec-canvas/echarts.js');

// 属性
const props = defineProps(['options'])
const ec = ref({
	// 配置项
	onInit: initChart,
	// lazyLoad: true
	// 禁止触屏事件
	disableTouch: true,
});
let chartObj;

// 方法
function initChart(canvas, width, height, dpr) {
	const chart = echarts.init(canvas, null, {
		width: width,
		height: height,
		devicePixelRatio: dpr
	});
	canvas.setChart(chart);
	let option = {
		xAxis: {
			type: 'category',
			data: props.options.X轴 || []
		},
		yAxis: {
			type: 'value'
		},
		grid: {
			top: 16,
			bottom: 5,
			left: 10,
			right: 10,
			containLabel: true
		},
		series: [
			{
				data: props.options.Y轴 || [],
				type: 'line',
				smooth: true,
				symbol: 'none', // 不显示折线上的点
			}
		]
	};
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
