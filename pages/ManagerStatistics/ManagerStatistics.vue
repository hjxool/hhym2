<template>
	<view class="page colLayout">
		<van-dropdown-menu class="noShrink">
			<van-dropdown-item @change="切换范围('按年', $event)" :value="选项.按年" :options="选项.按年options" />
			<van-dropdown-item @change="切换范围('按月', $event)" :value="选项.按月" :options="选项.按月options" />
			<van-dropdown-item title="自定义">
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
		<van-datetime-picker :value="自定义.date" @confirm="确认($event)" type="date" :min-date="自定义.min" />
	</van-popup>
</template>

<script setup>
import cusECharts from '/Components/cusECharts/cusECharts.vue';
import { ref } from 'vue';

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
const 时间范围 = {
	year: '',
	month: ''
};
const 自定义 = ref({
	开始日期: '',
	结束日期: '',
	date: '',
	min: new Date('2022/7/1').getTime(),
	当前修改: ''
});
const 加载图表 = ref(false);

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
	时间范围.year = num;
	for (let i = 0; i <= num - 2022; i++) {
		选项.value.按年options.push({
			text: `${num - i}年`,
			value: i,
			year: num - i
		});
	}
	setTimeout(() => {
		加载图表.value = true;
	}, 500);
}
function 切换范围(type, { detail: value }) {
	if (type == '自定义') {
		if (!自定义.value.开始日期 || !自定义.value.结束日期) return;
		console.log(自定义.value.开始日期, 自定义.value.结束日期);
	} else {
		switch (type) {
			case '按年':
				时间范围.year = 选项.value.按年options[value].year;
				break;
			case '按月':
				时间范围.month = 选项.value.按月options[value].value;
				break;
		}
		if (时间范围.month) {
			// 查某月
			let total = new Date(时间范围.year, 时间范围.month, 0).getDate();
			console.log(`${时间范围.year}/${时间范围.month}/1`, `${时间范围.year}/${时间范围.month}/${total}`);
		} else {
			// 查全年
			console.log(`${时间范围.year}/1/1`, `${时间范围.year}/12/31`);
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
