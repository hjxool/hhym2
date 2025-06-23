<template>
	<cusScrollView :加载="查询数据" class="scroll">
		<view class="page">
			<view class="week">
				<view v-for="item in 星期">{{ item }}</view>
			</view>

			<view class="scrollBox">
				<view v-for="item in 日期列表">
					<view class="title">{{ item.month }}</view>
					<view class="date">
						<view class="" v-for="day in item.days">{{ day.text }}</view>
					</view>
				</view>
			</view>
		</view>
	</cusScrollView>
</template>

<script setup>
import cusScrollView from '/Components/cusScrollView/cusScrollView.vue';
import { ref } from 'vue';
import { 今天 } from '/Api/时间参数.js';

// 属性
const 星期 = ref(['日', '一', '二', '三', '四', '五', '六']);
const 日期列表 = ref([]);

初始化();

// 方法
async function 查询数据(type) {
	if (type == '刷新') {
		return new Promise(a => {
			setTimeout(() => {
				a();
			}, 1000);
		});
	}
}
function 初始化() {
	日期列表.value.push(构造月(今天));
	// 下个月
	// 边界条件判断 如果是12月就是年份加1 否则月份加1
	let arr = 今天.split('/');
	if (arr[1] == 12) {
		日期列表.value.push(构造月(`${Number(arr[0]) + 1}/1/1`));
	} else {
		日期列表.value.push(构造月(`${arr[0]}/${Number(arr[1]) + 1}/1`));
	}
}
function 构造月(str) {
	// 传入日期如果不是1号 则将前面的日期样式改为灰色
	let arr = str.split('/');
	let year = arr[0];
	let month = arr[1];
	let day = arr[2];
	let result = {
		month: ''
	};
}
</script>

<style lang="less" scoped>
.scroll {
	position: absolute;
	width: 100vw;
	height: 100vh;
	left: 0%;
	top: 0;
	overflow: hidden;
}
.page {
	padding: 0 32rpx 80rpx;
	display: grid;
	grid-template-rows: 80rpx auto;
	overflow: hidden;
	background: #fff;
	border-radius: 20rpx;
	> .week {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		align-items: center;
		justify-items: center;
		font-size: 32rpx;
	}
	> .scrollBox {
		overflow: auto;
		font-size: 32rpx;
		.title {
			font-weight: bold;
			padding: 40rpx 0;
		}
		.date {
			display: grid;
			grid-template-columns: repeat(7, 1fr);
			grid-template-rows: 100rpx;
			align-items: center;
			justify-items: center;
			.color1 {
				color: rgba(128, 128, 128, 0.6);
			}
		}
	}
}
</style>
