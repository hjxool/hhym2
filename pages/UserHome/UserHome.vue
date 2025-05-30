<template>
	<view class="page colLayout">
		<userReserve v-show="导航页.select == '主页'" class="flexGrow" />
		<userOrderList v-if="导航页.select == '订单'" class="flexGrow"/>

		<van-tabbar :active="导航页.select" @change="切换页面($event)" :fixed="false">
			<van-tabbar-item name="主页" icon="shop-o">预定</van-tabbar-item>
			<van-tabbar-item name="订单" :info="导航页.num" icon="todo-list-o">我的订单</van-tabbar-item>
		</van-tabbar>
	</view>

	<Notify />
</template>

<script setup>
import userReserve from '/Components/userReserve/userReserve.vue';
import userOrderList from '/Components/userOrderList/userOrderList.vue';
import { ref } from 'vue';

// 跳转后不显示返回主页按钮
uni.hideHomeButton();
// 属性
const 导航页 = ref({
	select: '主页',
	num: ''
});

// 方法
function 切换页面({ detail }) {
	导航页.value.select = detail;
}
</script>

<style lang="less" scoped>
.page {
	overflow: hidden;
}
</style>
