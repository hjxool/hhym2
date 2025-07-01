<template>
	<cusScrollView :加载="查询数据" class="scroll">
		<view class="page colLayout">
			<van-tabs class="noShrink" :active="导航栏.active" @change="切换显示($event)">
				<van-tab v-for="item in 导航栏.options" :key="item" :title="item" :name="item" />
			</van-tabs>

			<view class="flexGrow">
				<view class="grid">
					<view v-for="item in 列表[导航栏.active]" :key="item.id" :style="{ background: item.url }"></view>

					<van-icon name="plus" size="60rpx" />
				</view>
			</view>
		</view>
	</cusScrollView>
</template>

<script setup>
import cusScrollView from '/Components/cusScrollView/cusScrollView.vue';
import { ref } from 'vue';

// 属性
const 导航栏 = ref({
	active: '相册',
	options: ['相册', '房间']
});
const 列表 = ref({
	相册: [],
	房间: []
});

for (let i = 0; i < 15; i++) {
	列表.value.相册.push({
		id: `${i}`,
		url: 'red'
	});
}

// 方法
async function 查询数据(type) {
	if (type == '刷新') {
	}
}
function 切换显示({ detail }) {
	导航栏.value.active = detail.title;
	// 查询
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
	overflow: hidden;
	> .flexGrow {
		overflow: hidden;
		padding: 20rpx;
		padding-right: 0;
		> .grid {
			height: 100%;
			overflow: auto;
			padding-right: 20rpx;
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 10rpx;
			grid-auto-rows: 200rpx;
		}
	}
}
</style>
