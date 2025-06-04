<template>
	<view class="body">
		<userSwiper />
		<userPlace />
	</view>
</template>

<script setup>
import userSwiper from '../userSwiper/userSwiper.vue';
import userPlace from '../userPlace/userPlace.vue';
</script>

<style lang="less" scoped>
.body {
	overflow-x: hidden;
	height: 100%;
}
</style>
