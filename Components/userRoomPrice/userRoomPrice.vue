<template>
	<view class="body">
		<view class="room" v-for="item in 房间" :key="item.name">
			<CusImage class="img noShrink" :src="item.封面" />

			<view class="flexGrow">
				<view class="title">{{ item.name }}</view>
				<view class="tips" style="color: #4864bb">{{ item.tip1 }}</view>
				<view class="tips" style="color: #ff6333">{{ item.tip2 }}</view>

				<view class="price">
					<view class="colLayout" style="align-items: flex-end; justify-content: flex-end">
						<view class="rowLayout" style="align-items: flex-end">
							<view v-show="item.优惠价 < item.原价" class="color1">{{ item.原价 }}</view>
							<view class="color2">{{ item.优惠价 }}</view>
						</view>

						<view v-show="item.优惠价 < item.原价" class="color3">共省{{ 节省费用[item.name] }}元</view>
					</view>

					<view class="cusButton colLayout" @click="跳转页面()">
						<view>VR</view>
						<view>选房</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import CusImage from '../cusImage/cusImage.vue';

// 属性
const store = useStore();

const 房间 = ref([
	{
		name: '标准间',
		封面: 'cloud://cloud1-0gzy726e39ba4d96.636c-cloud1-0gzy726e39ba4d96-1320186052/房间封面.jpg',
		原价: computed(() => store.state.计价规则.标准间),
		tip1: '最多可入住2只',
		tip2: '离店当天18点前接走不计入第二天费用',
		优惠价: computed(() => Math.round((store.getters.折扣总价.标准间优惠 / store.getters.总天数) * 10) / 10)
	},
	{
		name: '豪华间',
		封面: 'cloud://cloud1-0gzy726e39ba4d96.636c-cloud1-0gzy726e39ba4d96-1320186052/房间封面.jpg',
		原价: computed(() => store.state.计价规则.豪华间),
		tip1: '最多可入住4只',
		tip2: '离店当天18点前接走不计入第二天费用',
		优惠价: computed(() => Math.round((store.getters.折扣总价.豪华间优惠 / store.getters.总天数) * 10) / 10)
	}
]);
const 节省费用 = computed(() => {
	let 标准间原价 = 房间.value[0].原价 * store.getters.总天数;
	let 豪华间原价 = 房间.value[1].原价 * store.getters.总天数;
	let { 标准间优惠, 豪华间优惠 } = store.getters.折扣总价;
	if (标准间原价 >= 标准间优惠) {
		return {
			标准间: Math.round((标准间原价 - 标准间优惠) * 10) / 10,
			豪华间: Math.round((豪华间原价 - 豪华间优惠) * 10) / 10
		};
	} else {
		return {
			标准间: 0,
			豪华间: 0
		};
	}
});

// 方法
function 跳转页面() {
	uni.navigateTo({
		url: '/pages/UserVR/UserVR',
		success(res) {
			res.eventChannel.emit('前一页', '首页');
		}
	});
}
</script>

<style lang="less" scoped>
@import '/Static/公共样式.css';
.body {
	background: #fff;
	border-radius: 20rpx;
	margin: 0 20rpx 20rpx 20rpx;
	padding: 20rpx;
	overflow: hidden;
	> .room {
		display: flex;
		& + .room {
			border-top: 1px solid #f5f5f5;
			margin-top: 20rpx;
			padding-top: 20rpx;
		}
		> .img {
			width: 260rpx;
			height: 400rpx;
			margin-right: 40rpx;
		}
		> .flexGrow {
			position: relative;
			> .title {
				font-weight: bold;
				font-size: 40rpx;
				margin-right: auto;
				align-self: flex-end;
				position: relative;
				bottom: 12rpx;
			}
			> .tips {
				font-size: 26rpx;
				& + .tips {
					margin-top: 10rpx;
				}
			}
			> .price {
				position: absolute;
				right: 0;
				bottom: 0;
				display: flex;
				.color1 {
					font-size: 30rpx;
					color: #999999;
					position: relative;
					bottom: 8rpx;
					text-decoration: line-through;
					&::before {
						content: '￥';
						display: inline-block;
						font-size: 20rpx;
					}
				}
				.color2 {
					font-size: 50rpx;
					color: #e6603b;
					&::before {
						content: '￥';
						display: inline-block;
						font-size: 40rpx;
					}
				}
				.color3 {
					font-size: 40rpx;
					color: #e6603b;
				}
				.cusButton {
					background: linear-gradient(145deg, #007aff, #0056b3);
					width: 110rpx;
					height: 110rpx;
					border-radius: 20rpx;
					color: #fff;
					justify-content: center;
					align-items: center;
					margin-left: 20rpx;
					font-size: 30rpx;
					align-self: flex-end;
					box-shadow: 6rpx 6rpx 12rpx rgba(0, 0, 0, 0.3), inset -2rpx -2rpx 4rpx rgba(255, 255, 255, 0.3);
				}
			}
		}
	}
}
</style>
