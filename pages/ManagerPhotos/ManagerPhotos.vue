<template>
	<cusScrollView :加载="查询数据" class="page" @touchend="点击('清除标记')">
		<view class="grid">
			<view
				:class="{ del: 删除 == item._id, check: 勾选 == item._id }"
				class="center"
				v-for="(item, index) in 列表"
				:key="item._id"
				@touchstart="点击('start', $event, item)"
				@touchend.stop="点击('end', $event, item)"
			>
				<view v-show="删除 == item._id" class="button" @touchend.stop="点击('确认删除', item)" style="background: #ff4500">删除</view>
				<view v-show="勾选 == item._id" class="button" @touchend.stop="点击('更新图片', item, index + 1)" style="background: #67c23a">更新</view>

				<CusImage class="bgImg" :src="item.cloudUrl" />
			</view>

			<van-icon @click="点击('新增图片')" name="plus" size="60rpx" />
		</view>
	</cusScrollView>

	<Notify @confirm="点击('弹窗确认')" @cancel="点击('弹窗取消')" />
</template>

<script setup>
import cusScrollView from '/Components/cusScrollView/cusScrollView.vue';
import Notify from '/Components/notify/notify.vue';
import CusImage from '/Components/cusImage/cusImage.vue';
import { 消息, 弹窗 } from '/Api/提示.js';
import { onBeforeUnmount, ref } from 'vue';
import { useStore } from 'vuex';
import { 请求接口 } from '/Api/请求接口.js';

onBeforeUnmount(() => {
	store.commit('setState', {
		key: '提示.show',
		value: false,
	});
});

// 属性
const store = useStore();
const 列表 = ref([]);
const 删除 = ref('');
const 勾选 = ref('');
let 触屏timer;
let 开始时间;
let 操作对象; // 需要一个中间变量暂存 如果只用删除无法实现长按效果

// 方法
async function 查询数据(type) {
	if (type == '刷新') {
		await 请求接口('photoUpload2', {
			type: '查询',
		}).then((res) => {
			if (res && typeof res == 'object') {
				列表.value = res;
			}
		});
	}
}
async function 点击(type, ...args) {
	if (type == 'start') {
		开始时间 = args[0].timeStamp;
		操作对象 = args[1];
		触屏timer = setTimeout(() => {
			删除.value = '';
			// 当前选中不是勾选状态才能进入删除状态
			if (勾选.value != 操作对象._id) {
				删除.value = 操作对象._id;
				勾选.value = ''; // 并清除勾选
			}
		}, 800);
	} else if (type == 'end') {
		let 触屏持续时间 = args[0].timeStamp - 开始时间;
		if (触屏持续时间 < 800) {
			// 普通点击
			clearTimeout(触屏timer);
			// 删除状态时 取消删除
			let find = false;
			for (let val of 列表.value) {
				if (删除.value == val._id) {
					find = true;
					删除.value = '';
					break;
				}
			}
			if (find) return;
			// 普通状态下 选中目标
			if (勾选.value == args[1]._id) {
				勾选.value = '';
			} else {
				勾选.value = args[1]._id;
			}
		}
	} else if (type == '确认删除') {
		操作对象 = args[0];
		弹窗(`确定删除该图片？`, '确认');
	} else if (type == '弹窗确认') {
		uni.showLoading({
			title: '',
			mask: true,
		});
		let _id = 删除.value;
		删除.value = '';
		await 请求接口('photoUpload2', {
			type: '删除',
			data: {
				_id,
			},
		});
		await 查询数据('刷新');
		uni.hideLoading();
	} else if (type == '弹窗取消') {
		删除.value = '';
	} else if (type == '新增图片') {
		uni.chooseMedia({
			maxDuration: 60,
			count: 1,
			async success({ tempFiles }) {
				uni.showLoading({
					title: '上传中...',
					mask: true,
				});
				let filePath = tempFiles[0].tempFilePath;
				let 后缀 = filePath.split('.').pop();
				let cloudPath = `photos/${列表.value.length + 1}.${后缀}`;
				// callFunction限制了传输文件大小 因此只能用前端上传方式
				let cloudUrl = await wx.cloud
					.uploadFile({
						cloudPath,
						filePath,
					})
					.then(({ fileID }) => fileID)
					.catch(() => false);
				if (!cloudUrl) {
					消息('上传文件失败', '失败');
					uni.hideLoading();
					return;
				}
				await 请求接口('photoUpload2', {
					type: '新增',
					data: {
						cloudPath,
						cloudUrl,
					},
				});
				await 查询数据('刷新');
				uni.hideLoading();
			},
			fail() {},
		});
	} else if (type == '更新图片') {
		uni.chooseMedia({
			maxDuration: 60,
			count: 1,
			async success({ tempFiles }) {
				勾选.value = '';
				uni.showLoading({
					title: '更新中',
					mask: true,
				});
				let item = args[0];
				let filePath = tempFiles[0].tempFilePath;
				let 后缀 = filePath.split('.').pop();
				let cloudPath = `photos/${args[1]}.${后缀}`;
				// 只要是同名文件就会有不能及时更新的问题
				if (item.cloudPath != cloudPath) {
					请求接口('photoUpload2', {
						type: '删除文件',
						data: {
							cloudPath: item.cloudPath,
						},
					});
				}
				let cloudUrl = await wx.cloud
					.uploadFile({
						cloudPath,
						filePath,
					})
					.then(({ fileID }) => fileID)
					.catch(() => false);
				if (!cloudUrl) {
					消息('上传文件失败', '失败');
					uni.hideLoading();
					return;
				}
				await 请求接口('photoUpload2', {
					type: '更新',
					data: {
						_id: item._id,
						cloudPath,
						cloudUrl,
					},
				});
				await 查询数据('刷新');
				uni.hideLoading();
			},
			fail() {
				勾选.value = '';
			},
		});
	} else if (type == '清除标记') {
		删除.value = '';
		勾选.value = '';
	}
}
</script>

<style lang="less" scoped>
.grid {
	padding: 20rpx;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 10rpx;
	grid-auto-rows: 200rpx;
	> .del {
		border: 10rpx solid #ff4500;
	}
	.button {
		padding: 10rpx 40rpx;
		border-radius: 20rpx;
		color: #fff;
		font-size: 32rpx;
	}
	> .check {
		border: 10rpx solid #67c23a;
	}
}
</style>
