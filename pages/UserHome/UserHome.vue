<template>
	<view class="page colLayout">
		<UserReserve v-show="导航页.select == '主页'" class="flexGrow" />
		<UserOrderList v-if="导航页.select == '订单'" class="flexGrow" ref="ordersRef" />

		<van-tabbar :active="导航页.select" @change="切换页面($event)" :fixed="false">
			<van-tabbar-item name="主页" icon="shop-o">预定</van-tabbar-item>
			<van-tabbar-item name="订单" :info="导航页.num" icon="todo-list-o">我的订单</van-tabbar-item>
		</van-tabbar>
	</view>

	<Notify @confirm="弹窗操作('确认')" @cancel="弹窗操作('取消')" />
</template>

<script setup>
import UserReserve from '/Components/userReserve/userReserve.vue';
import UserOrderList from '/Components/userOrderList/userOrderList.vue';
import Notify from '/Components/notify/notify.vue';
import { onBeforeUnmount, ref, watch } from 'vue';
import { useStore } from 'vuex';

// 跳转后不显示返回主页按钮
uni.hideHomeButton();
// 属性
const store = useStore();
const 导航页 = ref({
	select: '主页',
	num: ''
});
const ordersRef = ref(null);

uni.$on('未读消息', type => {
	switch (type) {
		case '新增':
			ordersRef.value.查询订单('刷新');
			if (!导航页.value.num) {
				导航页.value.num = 1;
			} else {
				导航页.value.num++;
			}
			break;
		case '已读':
			导航页.value.num = '';
			break;
	}
});

onBeforeUnmount(() => {
	uni.$off('未读消息');
});

watch(
	() => store.state.日期,
	() => {
		store.dispatch('更新房间可用状态');
	},
	{ immediate: true }
);

// 方法
function 切换页面({ detail }) {
	导航页.value.select = detail;
}
function 弹窗操作(type) {
	switch (type) {
		case '确认':
			ordersRef.value.操作('确认');
			break;
		case '取消':
			ordersRef.value.操作('撤销');
			break;
	}
}
</script>

<style lang="less" scoped>
.page {
	overflow: hidden;
	> .flexGrow {
		overflow: hidden;
	}
}
</style>
