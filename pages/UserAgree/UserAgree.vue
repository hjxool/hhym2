<template>
	<view class="page">
		<view class="head">用户服务协议</view>
		<view class="bold text">一、关于寄养</view>
		<view class="text">
			1、领回：甲方保证寄养行为是对宠物的关爱行为，而非借机遗弃宠物行为。为防止弃养行为发生，
			<text class="bold">寄养前请预付总费用的70%</text>
			。寄养到期时，甲方应及时取回其宠物，如甲方能到场应有电话委托，由受托人凭本协议或其他有效方式取回宠物
		</view>
		<view class="text">2、续寄:若甲方需延长寄养期限的，应在寄养期限内向乙方提出申请，经甲乙双方协商一致同意后，可延长寄养期限。</view>
		<view class="text">3、过期:超过约定的时间甲方按天数向乙方补交费用。超出双方约定寄养期，</view>
		<view class="bold text">乙方将宽限七日</view>
		<view class="text">
			，乙方将通过电话、短信、微信任一方式通知甲方领回宠物，通知发出即日起七日后，甲方仍未前来领回宠物或与乙方沟通的，则视为甲方自愿放弃宠物所有权，乙方有权自行处理(包括无偿送养，被其他第三人领养方式，且无需承担任何责任，甲方无权干涉，因此给乙方造成损失的，甲方还应赔偿)。
		</view>
		<view class="bold text">2、关于宠物出现死亡、丢失等意外情况的赔付约定</view>
		<view class="text">
			1、宠物进入乙方寄养场所后，因乙方工作失误导致宠物死亡、丢失的，乙方应以宠物市场价格为基础给予相应赔付，但赔偿金额不超过人民币5000元。对于死因不明的，由甲乙双方认可的宠物医疗机构出具验尸报告确定责任方，相应费用由甲方先行垫付，最终由责任方承担。2、甲方应如实告知乙方其宠物的健康情况并如实填写有效联系方式，否则因此产生的责任由甲方自行承担
		</view>
		<view class="bold text">3、免责条款</view>
		<view class="text">
			1、寄养期限内，乙方应精心照料甲方宠物，但由于不可控因素(包括甲方末按时免疫、宠物抗体不足宠物应激不适)发生感染烈性传染病(猫瘟、传腹等)，乙方不负责赔偿。
		</view>
		<view class="text">
			2、由于发生不可抗力情形(包括战争、政府行为、地震，山洪、泥石流、疫情、其他自然灾害或重大刑事案件发生等》，造成宠物死亡、受伤、残疾、丢失等，乙方不负责赔偿。
		</view>
		<view class="text">3、寄养期间，宠物由于年老体衰或其它突发病导致死亡，乙方不负责赔偿</view>
		<view class="text">
			4、寄养期限内，当宠物发生疾病需要治疗时，乙方应及时通知甲方并告知实情，经甲方书面(包括微信短信等形式)同意乙方可代送至第三方宠物医疗机构治疗，所产生的费用由甲方承担。若甲方拒绝治疗的，则产生的相应责任由甲方自行承担。
		</view>
	</view>
</template>

<script setup></script>

<style lang="less" scoped>
@import '/Static/公共样式.css';

.page {
	overflow-x: hidden;
	padding: 0 28rpx 90rpx 20rpx;
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	> .head {
		font-size: 32rpx;
		align-self: center;
		margin: 40rpx 0;
	}
	.text {
		font-size: 28rpx;
		&::before {
			content: '';
			display: inline-block;
			width: 48rpx;
		}
	}
	.bold {
		font-weight: bold;
	}
}
</style>
