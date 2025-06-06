<template>
	<view class="body">
		<userSwiper />
		<userPlace />
		<userSelectTime />
		<userRoomPrice />
	</view>
</template>

<script setup>
import userSwiper from '../userSwiper/userSwiper.vue';
import userPlace from '../userPlace/userPlace.vue';
import userSelectTime from '../userSelectTime/userSelectTime.vue';
import userRoomPrice from '../userRoomPrice/userRoomPrice.vue';
</script>

<style lang="less" scoped>
.body {
	overflow-x: hidden;
	height: 100%;
}
</style>
