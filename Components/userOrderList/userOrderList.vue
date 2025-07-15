<template>
	<view class="body colLayout">
		<van-tabs class="noShrink" :active="过滤显示.select" @change="切换过滤条件($event)">
			<van-tab v-for="item in 过滤显示.options" :title="item" :key="item"></van-tab>
		</van-tabs>

		<cusScrollView :加载="查询订单" style="flex-grow: 1; overflow: hidden">
			<view class="listBox">
				<view class="card" v-for="item in 列表" :key="item._id">
					<view class="head rowLayout">
						<view class="text1">{{ item.room }}</view>
						<view :class="['text2', 状态格式化('样式', item.status)]">{{ 状态格式化('文字', item.status) }}</view>
					</view>

					<view class="info colLayout">
						<view>{{ item.start }}至{{ item.end }}</view>
						<view>共{{ 计算天数(item.start, item.end) }}天</view>
						<view class="rowLayout">
							<view>🐱 {{ item.pets.map((e) => e.name).join('、') }}</view>
							<view @click="操作('显示弹窗', item.pets)" style="color: #1989fa; margin-left: auto; font-size: 32rpx">查看</view>
						</view>
					</view>

					<view class="rowLayout" style="margin: 0 20rpx 10rpx 20rpx">
						<van-button v-show="按钮显示('取消订单', item)" color="#ff4d4f" @click="操作('取消订单', item)" plain hairline size="small">取消订单</van-button>
						<van-button v-show="按钮显示('重新预定', item)" color="#1890ff" @click="操作('重新预定', item)" plain hairline size="small">重新预定</van-button>

						<view class="pay">{{ item.pay }}</view>
					</view>
				</view>
			</view>
		</cusScrollView>
	</view>

	<PetsDetail :show="宠物详情.show" @close="宠物详情.show = false" :宠物列表="宠物详情.list" />
</template>

<script setup>
import cusScrollView from '../cusScrollView/cusScrollView.vue';
import PetsDetail from '/Components/petsDetail/petsDetail.vue';
import { 弹窗 } from '/Api/提示.js';
import { 计算天数, 今天 } from '/Api/时间参数.js';
import { ref } from 'vue';
import { 请求接口 } from '/Api/请求接口.js';
import { useStore } from 'vuex';

// 属性
const store = useStore();
const 过滤显示 = ref({
	select: '全部',
	options: ['全部', '待确认', '已完成', '已取消']
});
const 列表 = ref([]);
const 订单状态 = {
	待确认: 0,
	已完成: 1,
	已取消: -1
};
let 总列表 = [];
let 当前操作订单;
const 宠物详情 = ref({
	show: false,
	list: []
});
const 分页 = {
	pageNum: 1,
	pageSize: 20,
	total: 0
};

// setup中子组件默认封闭 父组件无法直接访问子组件内容
// 需要用defineExpose明确需要暴露的属性和方法
defineExpose({
	操作,
	查询订单 // 从重新预约跳转回订单列表时要刷新数据
});

// 方法
function 切换过滤条件({ detail }) {
	过滤显示.value.select = detail.title;
	switch (detail.title) {
		case '全部':
			列表.value = 总列表;
			break;
		default:
			列表.value = 总列表.filter((e) => e.status == 订单状态[detail.title]);
			break;
	}
}
function 状态格式化(type, value) {
	switch (value) {
		case 0:
			return type == '样式' ? 'color1' : '待确认';
		case 1:
			return type == '样式' ? 'color2' : '已完成';
		case -1:
			return type == '样式' ? 'color3' : '已取消';
	}
}
async function 查询订单(type) {
	if (type == '刷新') {
		// 重置数据
		列表.value = [];
		总列表 = [];
		分页.pageNum = 1;
	} else {
		// 没有下一页就不进行请求
		if (分页.pageNum < Math.ceil(分页.total / 分页.pageSize)) {
			分页.pageNum++;
		} else {
			return;
		}
	}
	let res = await 请求接口('orderEdit2', {
		type: '查询',
		data: {
			pageNum: 分页.pageNum,
			pageSize: 分页.pageSize,
			userId: store.state.用户ID
		}
	});
	if (res) {
		分页.total = res.total;
		总列表.push(...res.data);
		if (type == '刷新') {
			if (过滤显示.value.select == '全部') {
				列表.value = 总列表;
			} else {
				列表.value = 总列表.filter((e) => e.status == 订单状态[过滤显示.value.select]);
			}
			if (过滤显示.value.select == '全部' || 过滤显示.value.select == '待确认') {
				uni.$emit('未读消息', '已读');
			}
		} else {
			// 当前分类下加载下一页
			if (过滤显示.value.select == '全部') {
				// 全部下 直接将新数据添加到显示列表
				列表.value.push(...res.data);
			} else {
				// 其他类别下 返回的数据过滤后再添加到显示列表
				let list = res.data.filter((e) => e.status == 订单状态[过滤显示.value.select]);
				列表.value.push(...list);
			}
		}
	}
}
function 操作(type, item) {
	switch (type) {
		case '取消订单':
			弹窗(`确定取消 ${item.start}到${item.end} 期间的预约？`, '确认');
			当前操作订单 = item;
			break;
		case '确认':
			// 请求接口后更改订单状态 不用刷新 避免调两次接口
			uni.showLoading({
				title: '',
				mask: true
			});
			请求接口('orderEdit2', {
				type: '编辑',
				data: {
					_id: 当前操作订单._id,
					status: 订单状态['已取消']
				}
			}).then((res) => {
				uni.hideLoading();
				if (res) {
					当前操作订单.status = 订单状态['已取消'];
				}
			});
			break;
		case '撤销':
			当前操作订单 = null;
			break;
		case '重新预定':
			uni.navigateTo({
				url: '/pages/UserOrder/UserOrder',
				success(res) {
					res.eventChannel.emit('数据', item);
				}
			});
			break;
		case '显示弹窗':
			宠物详情.value.show = true;
			宠物详情.value.list = item.map((e) => ({
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
			break;
	}
}
function 按钮显示(type, item) {
	if (type == '取消订单' && item.status != 0) return false;
	if (type == '重新预定' && item.status != -1) return false;
	// 其次判断时间是否在当天之后
	let start = item.start.replaceAll('-', '/');
	start = new Date(start).getTime();
	let today = new Date(今天).getTime();
	// 过期的待确认订单变为取消
	if (item.status == 0 && start < today) {
		item.status = -1;
	}
	return start >= today;
}
</script>

<style lang="less" scoped>
.body {
	overflow: hidden;
	height: 100%;
	.listBox {
		padding: 20rpx;
		> .card {
			border: 1rpx solid #e6e6e6;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
			border-radius: 10rpx;
			overflow: hidden;
			background: #fff;
			& + .card {
				margin-top: 20rpx;
			}
			> .head {
				justify-content: space-between;
				margin: 20rpx 30rpx 0 30rpx;
				padding-bottom: 20rpx;
				border-bottom: 1rpx solid #e6e6e6;
				> .text1 {
					font-size: 30rpx;
					font-weight: bold;
				}
				> .text2 {
					font-size: 26rpx;
				}
				> .color1 {
					color: #faad14;
				}
				> .color2 {
					color: #52c41a;
				}
				> .color3 {
					color: #999;
				}
			}
			> .info {
				padding: 20rpx 30rpx;
				font-size: 26rpx;
				color: #666;
				gap: 20rpx;
			}
			.pay {
				color: #ff4d4f;
				font-size: 36rpx;
				font-weight: bold;
				margin-left: auto;
				&::before {
					content: '￥';
					display: inline-block;
					font-size: 30rpx;
					margin-right: 10rpx;
				}
			}
		}
	}
}
</style>
