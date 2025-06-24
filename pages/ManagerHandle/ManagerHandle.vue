<template>
	<cusScrollView :加载="查询数据" class="scroll">
		<view class="page">
			<view class="card" v-for="item in 列表">
				<view class="viewBox">
					<view>
						<view class="label">姓名</view>
						<view>{{ item.name }}</view>
					</view>
					<view>
						<view class="label">时间</view>
						<view>{{ item.start.replaceAll('/', '.') }} ~ {{ item.end.replaceAll('/', '.') }} 共{{ 计算天数(item.start, item.end) }}天</view>
					</view>
					<view>
						<view class="label">房间</view>
						<view>{{ item.room }}</view>
					</view>
					<view>
						<view class="label">金额</view>
						<view>{{ item.pay }}</view>
					</view>
					<van-button size="mini" type="info" plain>宠物详情</van-button>
				</view>

				<view class="line"></view>

				<view class="foot rowLayout">
					<view class="button center" style="background: #3981c6; color: #fff">确认</view>
					<view class="button center" style="background: #f4f3f3">取消</view>
				</view>
			</view>
		</view>
	</cusScrollView>
</template>

<script setup>
import { ref } from 'vue';
import cusScrollView from '/Components/cusScrollView/cusScrollView.vue';
import { 计算天数 } from '/Api/时间参数.js';

// 属性
const 列表 = ref([
	{
		name: '测试1',
		start: '2025/6/27',
		end: '2025/6/29',
		room: '标准间1',
		pay: 500,
		pets: [
			{ name: '测试3', age: 1, 性别: 0, 品种: '银渐层', 性格: '普通', 绝育: 0, 耳螨: 0, 传染病: 0, 驱虫时间: '', 疫苗时间: '', 要求: '' },
			{ name: '测试4', age: 12, 性别: 1, 品种: '梨花', 性格: '普通', 绝育: 1, 耳螨: 0, 传染病: 0, 驱虫时间: '', 疫苗时间: '', 要求: '' }
		]
	},
	{
		name: '测试2',
		start: '2025/7/1',
		end: '2025/7/10',
		room: '标准间3',
		pay: 200,
		pets: [{ name: '测试5', age: 1, 性别: 0, 品种: '银渐层', 性格: '普通', 绝育: 0, 耳螨: 0, 传染病: 0, 驱虫时间: '', 疫苗时间: '', 要求: '' }]
	}
]);

// 方法
async function 查询数据(type) {
	if (type == '刷新') {
		return new Promise((a) => {
			setTimeout(() => {
				a();
			}, 1000);
		});
	}
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
	padding: 32rpx;
	overflow: hidden;
	.card {
		padding: 24rpx;
		border-radius: 12rpx;
		background-color: #ffffff;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		&+.card{
			margin-top: 40rpx;
		}
		> .viewBox {
			display: grid;
			grid-template-columns: 1fr 1fr;
		}
		.label {
			color: #555;
		}
		.line {
			height: 2rpx;
			background-color: #eeeeee;
			margin: 20rpx 0;
		}
		> .foot {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 20rpx;
			padding: 0 20rpx;
			> .button {
				border-radius: 32rpx;
				padding: 32rpx 0;
			}
		}
	}
}
</style>
