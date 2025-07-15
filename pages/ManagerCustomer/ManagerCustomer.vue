<template>
	<cusScrollView :加载="查询数据" class="scroll">
		<view class="page colLayout">
			<van-search class="noShrink" :value="关键字" @change="搜索框($event)" @search="查询数据('刷新')" @clear="查询数据('刷新')" placeholder="宠物名或客户名或联系号码" />

			<view class="flexGrow">
				<view class="viewBox">
					<view class="card colLayout" v-for="item in 列表" :key="item._id">
						<view class="name">{{ item.name }}</view>
						<view class="phone">{{ item.phone }}</view>
						<view class="grid">
							<view>
								<view class="title">订单总数</view>
								<view>{{ item.orderCount }}</view>
							</view>
							<view>
								<view class="title">在本店消费</view>
								<view>{{ item.totalAmount }}</view>
							</view>
							<view style="grid-column-start: 1; grid-column-end: 3">
								<view class="title">从何了解</view>
								<view>{{ item.knowFrom || '无' }}</view>
							</view>
						</view>
						<view class="button" @click="显示弹窗(item.pets)">查看宠物</view>
					</view>
				</view>
			</view>
		</view>
	</cusScrollView>

	<PetsDetail :show="弹窗.show" @close="弹窗.show = false" :宠物列表="弹窗.list" />
</template>

<script setup>
import { ref } from 'vue';
import cusScrollView from '/Components/cusScrollView/cusScrollView.vue';
import PetsDetail from '/Components/petsDetail/petsDetail.vue';
import { 请求接口 } from '/Api/请求接口.js';

// 属性
const 关键字 = ref('');
const 列表 = ref([]);
const 弹窗 = ref({
	show: false,
	list: []
});
const 分页 = {
	total: 0,
	pageNum: 1,
	pageSize: 5
};

// 方法
async function 查询数据(type) {
	if (type == '刷新') {
		分页.pageNum = 1;
		列表.value = [];
	} else {
		if (分页.pageNum < Math.ceil(分页.total / 分页.pageSize)) {
			分页.pageNum++;
		} else {
			return;
		}
	}
	请求接口('userEdit2', {
		type: '查询',
		data: {
			pageNum: 分页.pageNum,
			pageSize: 分页.pageSize,
			keyWords: 关键字.value
		}
	}).then((res) => {
		if (res && res.data) {
			分页.total = res.total;
			列表.value.push(...res.data);
		}
	});
}
function 显示弹窗(pets) {
	弹窗.value.show = true;
	弹窗.value.list = pets.map((e) => ({
		昵称: e.name,
		年龄: e.age,
		性别: e.gender,
		品种: e.breed,
		性格: e.temperament,
		是否绝育: e.isNeutered,
		是否有耳螨: e.hasEarMites,
		是否携带传染病: e.hasInfectiousDisease,
		上一次驱虫时间: e.lastDewormingDate,
		上一次疫苗时间: e.lastVaccinationDate,
		特殊要求: e.specialRequirements
	}));
}
function 搜索框({ detail: value }) {
	关键字.value = value;
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
	> .flexGrow {
		overflow: hidden;
		padding: 32rpx;
		padding-right: 0;
		> .viewBox {
			padding-right: 32rpx;
			overflow: auto;
			height: 100%;
			.card {
				background-color: #ffffff;
				border-radius: 32rpx;
				padding: 24rpx;
				box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.06);
				gap: 16rpx;
				position: relative;
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
						margin-bottom: 10rpx;
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
</style>