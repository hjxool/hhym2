<template>
	<view class="body">
		<view class="title">好好养猫纯猫寄养酒店</view>

		<view class="address rowLayout">
			<text class="flexGrow textEllipsis" style="font-size: 32rpx">武侯区南华路</text>

			<view class="rowLayout noShrink">
				<view class="colLayout icon" @click="地图()">
					<van-icon name="location-o" color="gray" size="26" />
					<text style="font-size: 24rpx; margin-top: 10rpx">地图</text>
				</view>

				<view class="colLayout icon" @click="电话()">
					<van-icon name="phone-o" color="gray" size="26" />
					<text style="font-size: 24rpx; margin-top: 10rpx">电话</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
// 方法
function 地图() {
	uni.openLocation({
		latitude: 30.54716, // 纬度
		longitude: 104.03735, // 经度
		name: '成都市', // 地点名称
		address: '好好养猫纯猫寄养酒店', // 地址的详细说明
		scale: 20 // 缩放比例
	}).catch((err) => {
		console.log('打开地图失败', err);
	});
}
function 电话() {
	uni.makePhoneCall({
		phoneNumber: '18190694903',
		complete() {}
	});
}
</script>

<style lang="less" scoped>
@import '/Static/公共样式.css';
.body {
	background: #fff;
	border-radius: 20rpx;
	margin: 20rpx;
	> .title {
		font-weight: bold;
		padding: 20rpx;
		font-size: 40rpx;
	}
	> .address {
		padding: 20rpx;
		justify-content: space-between;
		border-top: 1px solid #f5f5f5;
		.icon {
			height: 100%;
			align-items: center;
			& + .icon {
				margin-left: 40rpx;
			}
		}
	}
}
</style>
