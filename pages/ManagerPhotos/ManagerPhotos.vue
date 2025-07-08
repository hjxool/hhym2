<template>
	<cusScrollView :加载="查询数据" class="scroll">
		<view class="page colLayout">
			<van-tabs class="noShrink" :active="导航栏.active" @change="切换显示($event)">
				<van-tab v-for="item in 导航栏.options" :key="item" :title="item" :name="item" />
			</van-tabs>

			<view class="flexGrow">
				<view class="grid">
					<view
						:class="{ del: item.是否删除, check: item.check }"
						v-for="item in 列表[导航栏.active]"
						:key="item.id"
						@touchstart="点击('start', $event, item)"
						@touchend="点击('end', $event, item)"
						:style="{ background: item.url }"
					>
						<view v-show="item.是否删除" class="button" @touchend.stop="点击('确认删除', item)">删除</view>
						<view v-show="item.check" class="center">
							<van-icon name="success" color="#fff" size="40rpx" />
						</view>
					</view>

					<van-icon name="plus" size="60rpx" />
				</view>
			</view>
		</view>
	</cusScrollView>

	<Notify @confirm="点击('弹窗确认')" @cancel="点击('弹窗取消')" />
</template>

<script setup>
import cusScrollView from '/Components/cusScrollView/cusScrollView.vue';
import Notify from '/Components/notify/notify.vue';
import { 消息, 弹窗 } from '/Api/提示.js';
import { onBeforeUnmount, ref } from 'vue';
import { useStore } from 'vuex';

onBeforeUnmount(() => {
	store.commit('setState', {
		key: '提示.show',
		value: false
	});
});

// 属性
const store = useStore();
const 导航栏 = ref({
	active: '相册',
	options: ['相册', '房间']
});
const 列表 = ref({
	相册: [],
	房间: []
});
let 触屏timer;
let 开始时间;
let 操作对象;

for (let i = 0; i < 15; i++) {
	列表.value.相册.push({
		id: `${i}`,
		url: '#00BFFF',
		check: false,
		是否删除: false
	});
}

// 方法
async function 查询数据(type) {
	if (type == '刷新') {
	}
}
function 切换显示({ detail }) {
	// 清除状态
	for (let val of 列表.value[导航栏.value.active]) {
		val.是否删除 = false;
		val.check = false;
	}
	导航栏.value.active = detail.title;
	// 查询
}
function 点击(type, ...args) {
	if (type == 'start') {
		开始时间 = args[0].timeStamp;
		操作对象 = args[1];
		触屏timer = setTimeout(() => {
			for (let val of 列表.value[导航栏.value.active]) {
				val.是否删除 = false;
			}
			// 普通状态下才能进入删除状态
			if (!操作对象.check) {
				操作对象.是否删除 = true;
			}
		}, 800);
	} else if (type == 'end') {
		let 触屏持续时间 = args[0].timeStamp - 开始时间;
		if (触屏持续时间 < 800) {
			// 普通点击
			clearTimeout(触屏timer);
			// 删除状态时 取消删除
			let find = false;
			for (let val of 列表.value[导航栏.value.active]) {
				if (val.是否删除) {
					find = true;
				}
				val.是否删除 = false;
			}
			if (find) return;
			// 普通状态下 选中目标
			args[1].check = !args[1].check;
		}
	} else if (type == '确认删除') {
		操作对象 = args[0];
		弹窗(`确定删除该图片？`, '确认');
	} else if (type == '弹窗确认') {
		操作对象.是否删除 = false;
		// 删除数据库对应记录
	} else if (type == '弹窗取消') {
		操作对象.是否删除 = false;
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
			> .del {
				border: 10rpx solid #ff4500;
				display: flex;
				justify-content: center;
				align-items: center;
				> .button {
					padding: 10rpx 40rpx;
					border-radius: 20rpx;
					background: #ff4500;
					color: #fff;
					font-size: 32rpx;
				}
			}
			> .check {
				position: relative;
				border: 10rpx solid #67c23a;
				> .center {
					position: absolute;
					right: 10rpx;
					bottom: 10rpx;
					width: 40rpx;
					height: 40rpx;
					border-radius: 50%;
					background: #67c23a;
				}
			}
		}
	}
}
</style>
