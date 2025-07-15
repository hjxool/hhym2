<template>
	<view class="page colLayout">
		<van-dropdown-menu class="noShrink">
			<van-dropdown-item @change="切换范围('按年', $event)" :value="选项.按年" :options="选项.按年options" />
			<van-dropdown-item @change="切换范围('按月', $event)" :value="选项.按月" :options="选项.按月options" />
			<van-dropdown-item ref="customDateRef" title="自定义">
				<view class="rowLayout row" @click="自定义.当前修改 = '开始日期'">
					<view>开始日期</view>
					<view class="text">{{ 自定义.开始日期 || '未选' }}</view>
				</view>
				<view class="rowLayout row" @click="自定义.当前修改 = '结束日期'">
					<view>结束日期</view>
					<view class="text">{{ 自定义.结束日期 || '未选' }}</view>
				</view>
				<view class="center" style="padding: 20rpx 0">
					<view class="button" @click="切换范围('自定义')">确认</view>
				</view>
			</van-dropdown-item>
		</van-dropdown-menu>

		<view class="flexGrow">
			<cusECharts v-if="加载图表" :options="数据" />
		</view>
	</view>

	<van-popup :show="自定义.当前修改" position="bottom" custom-style="height: 684rpx;" @close="自定义.当前修改 = ''">
		<van-datetime-picker :value="自定义.date" @confirm="确认($event)" type="date" :min-date="自定义.min" @cancel="自定义.当前修改 = ''" />
	</van-popup>
</template>

<script setup>
import cusECharts from '/Components/cusECharts/cusECharts.vue';
import { ref } from 'vue';
import { 请求接口 } from '/Api/请求接口.js';

// 属性
const 选项 = ref({
	按月: 0,
	按月options: [{ text: '全部月份', value: 0 }],
	按年: 0,
	按年options: []
});
const 数据 = ref({
	labels: ['1', '2', '3', '4', '5', '6', '7'],
	values: [820, 932, 901, 934, 1290, 1330, 1320],
	方向: '纵'
});
const 自定义 = ref({
	开始日期: '',
	结束日期: '',
	date: '',
	min: new Date('2022/7/1').getTime(),
	当前修改: ''
});
const 加载图表 = ref(false);
const customDateRef = ref(null);

初始化();

// 方法
function 初始化() {
	for (let i = 1; i <= 12; i++) {
		选项.value.按月options.push({
			text: `${i}月`,
			value: i
		});
	}
	let d = new Date();
	let num = d.getFullYear();
	for (let i = 0; i <= num - 2022; i++) {
		选项.value.按年options.push({
			text: `${num - i}年`,
			value: i,
			year: num - i
		});
	}
	// 默认查询本年
	查询统计结果('按年');
}
function 切换范围(type, args) {
	if (type == '自定义') {
		if (!自定义.value.开始日期 || !自定义.value.结束日期) return;
		查询统计结果('自定义');
		customDateRef.value.toggle(false);
	} else {
		switch (type) {
			case '按年':
				选项.value.按年 = args.detail;
				break;
			case '按月':
				选项.value.按月 = args.detail;
				break;
		}
		// 判断是否选了月
		if (选项.value.按月) {
			查询统计结果('按月');
		} else {
			// 只选了年
			查询统计结果('按年');
		}
	}
}
function 确认({ detail }) {
	// detail为时间戳
	if (!自定义.value.当前修改) return;
	let d = new Date(detail);
	自定义.value[自定义.value.当前修改] = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
	自定义.value.当前修改 = '';
}
function 查询统计结果(type) {
	let data = {};
	switch (type) {
		case '按年':
			data['year'] = 选项.value.按年options[选项.value.按年].year;
			break;
		case '按月':
			data['year'] = 选项.value.按年options[选项.value.按年].year;
			data['month'] = 选项.value.按月;
			break;
		case '自定义':
			data['start'] = 自定义.value.开始日期;
			data['end'] = 自定义.value.结束日期;
			break;
	}
	请求接口('incomeStatistics2', {
		type: type,
		data
	}).then(res => {
		加载图表.value || (加载图表.value = true);
		// 如果返回的是数字则添加上年月
		let labels;
		switch (type) {
			case '按年':
				labels = res.labels.map(e => `${data['year']}/${e}`);
				break;
			case '按月':
				labels = res.labels.map(e => `${data['year']}/${data['month']}/${e}`);
				break;
			case '自定义':
				labels = res.labels;
				break;
		}
		数据.value.labels = labels;
		数据.value.values = res.values;
	});
}
</script>

<style lang="less" scoped>
.page {
	> .noShrink {
		position: relative;
		z-index: 100;
		.row {
			justify-content: space-between;
			padding: 20rpx 40rpx;
		}
		.text {
			color: #66b9dd;
		}
		.button {
			padding: 10rpx 60rpx;
			background: #1e90ff;
			border-radius: 32rpx;
			color: #fff;
		}
	}
	> .flexGrow {
		margin: 40rpx;
		overflow: hidden;
		background: #fff;
		border-radius: 32rpx;
		display: grid;
		position: relative;
		z-index: 0;
	}
}
</style>
