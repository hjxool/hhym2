<template>
	<cusScrollView :加载="查询数据" class="scroll">
		<view class="page colLayout">
			<van-search class="noShrink" :value="关键字" @search="查询数据('刷新')" @clear="查询数据('刷新')" placeholder="客户名关键词" />

			<view class="flexGrow">
				<view class="viewBox">
					<view class="card colLayout" v-for="item in 列表" :key="item.phone">
						<view class="name">{{ item.name }}</view>
						<view class="phone">{{ item.phone }}</view>
						<view class="grid">
							<view>
								<view class="title">订单总数</view>
								<view>{{ item.订单总数 }}</view>
							</view>
							<view>
								<view class="title">在本店消费</view>
								<view>{{ item.在本店消费 }}</view>
							</view>
							<view style="grid-column-start: 1; grid-column-end: 3">
								<view class="title">从何了解</view>
								<view>{{ item.从何了解 || '无' }}</view>
							</view>
						</view>
						<view class="button" @click="显示弹窗(item.pets)">查看宠物</view>
					</view>
				</view>
			</view>
		</view>
	</cusScrollView>

	<van-popup :show="弹窗.show" @close="弹窗.show = false">
		<view class="popup">
			<view style="overflow: auto; height: 100%; padding-right: 40rpx">
				<view class="viewBox" v-for="item in 弹窗.list" :key="item.name">
					<view :class="{ row: key == '特殊要求' }" v-for="[key, value] in Object.entries(item)" :key="key">
						<view class="label">{{ key }}</view>
						<view :style="回显样式(key, value)">{{ 回显(key, value) }}</view>
					</view>
				</view>
			</view>
		</view>
	</van-popup>
</template>

<script setup>
import { ref } from 'vue';
import cusScrollView from '/Components/cusScrollView/cusScrollView.vue';

// 属性
const 关键字 = ref('');
const 列表 = ref([
	{
		name: '彰化',
		phone: '13398978787',
		订单总数: 5,
		在本店消费: 1389,
		从何了解: '奥数嗲手段是对安睡的哈岁的和',
		pets: [
			{ 昵称: '测试4', 年龄: 12, 性别: 1, 品种: '梨花', 性格: '普通', 是否绝育: 1, 是否有耳螨: 0, 是否携带传染病: 1, 上一次驱虫时间: '', 上一次疫苗时间: '', 特殊要求: '' },
			{
				昵称: '测试3',
				年龄: 1,
				性别: 0,
				品种: '银渐层',
				性格: '普通',
				是否绝育: 0,
				是否有耳螨: 0,
				是否携带传染病: 0,
				上一次驱虫时间: '',
				上一次疫苗时间: '',
				特殊要求: '还的口味口哦懂啊水浇地哦嫁鸡随鸡爹较耐送到家哦i'
			}
		]
	},
	{
		name: '测试2',
		phone: '13398978787',
		订单总数: 2,
		在本店消费: 530,
		从何了解: '',
		pets: [
			{ 昵称: '测试5', 年龄: 1, 性别: 0, 品种: '银渐层', 性格: '普通', 是否绝育: 0, 是否有耳螨: 0, 是否携带传染病: 0, 上一次驱虫时间: '', 上一次疫苗时间: '', 特殊要求: '' }
		]
	}
]);
const 弹窗 = ref({
	show: false,
	list: []
});

// 方法
async function 查询数据(type) {
	if (type == '刷新') {
	} else {
	}
}
function 回显(key, value) {
	switch (key) {
		case '年龄':
			return value;
		case '性别':
			return value ? '弟弟' : '妹妹';
		case '是否绝育':
		case '是否有耳螨':
		case '是否携带传染病':
			return value ? '是' : '否';
		default:
			return value || '无';
	}
}
function 回显样式(key, value) {
	switch (key) {
		case '是否绝育':
			return {
				color: value ? '' : '#ee0a24'
			};
		case '是否有耳螨':
		case '是否携带传染病':
			return {
				color: value ? '#ee0a24' : ''
			};
		default:
			return {
				color: ''
			};
	}
}
function 显示弹窗(pets) {
	弹窗.value.show = true;
	弹窗.value.list = pets;
}
</script>

<style lang="less" scoped>
::v-deep .van-center-enter-active,
.van-center-leave-active {
	border-radius: 32rpx;
}
.scroll {
	position: absolute;
	width: 100vw;
	height: 100vh;
	left: 0%;
	top: 0;
	overflow: hidden;
}
.page {
	overflow: hidden;
	padding-top: 32rpx;
	> .flexGrow {
		overflow: hidden;
		padding: 32rpx;
		padding-right: 0;
		> .viewBox {
			padding-right: 32rpx;
			overflow: auto;
			.card {
				background-color: #ffffff;
				border-radius: 32rpx;
				padding: 24rpx;
				box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
				gap: 16rpx;
				& + .card {
					margin-top: 40rpx;
				}
				> .name {
					font-size: 36rpx;
					font-weight: bold;
					color: #333;
				}
				> .phone {
					font-size: 32rpx;
					color: #666;
				}
				> .grid {
					display: grid;
					grid-template-columns: 1fr 1fr;
					gap: 16rpx;
					font-size: 32rpx;
					color: #444;
					.title {
						font-size: 30rpx;
						color: #888;
					}
				}
				> .button {
					margin-top: 32rpx;
					padding: 20rpx 28rpx;
					border-radius: 24rpx;
					background-color: #1989fa;
					color: #ffffff;
					font-size: 34rpx;
					font-weight: bold;
					text-align: center;
				}
			}
		}
	}
}
.popup {
	width: 80vw;
	height: 80vh;
	overflow: hidden;
	padding: 40rpx 0 40rpx 40rpx;
	.viewBox {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 20rpx;
		& + .viewBox {
			margin-top: 40rpx;
			border-top: 2rpx solid #eee;
			padding-top: 40rpx;
		}
		.row {
			grid-column-start: 1;
			grid-column-end: 3;
		}
		.label {
			color: #555;
		}
	}
}
</style>