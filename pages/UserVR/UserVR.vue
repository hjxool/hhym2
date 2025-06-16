<template>
	<view class="page" @touchstart="控制('touchstart', $event)" @touchmove="控制('touchmove', $event)" @touchend="控制('touchend', $event)">
		<canvas id="threeScene" type="webgl"></canvas>
		<!-- 热点 -->
		<view class="hotspot textEllipsis" v-for="item in 房间[当前区域].hotspots" :style="热点显示(item)">
			<view v-if="item.type == '区域'" class="area" @click="切换区域(item)">{{ item.label }}</view>
			<view v-if="item.type == '房间'" class="room" @click="选择房间(item)">{{ item.label }}</view>
		</view>
		<!-- 小地图 -->
		<view class="minimap">
			<!-- 必须用px -->
			<view class="indicator center" :style="{ transform: `translate(${小地图定位.x}px, ${小地图定位.y}px)` }">
				<view class="rotate center" :style="{ transform: `rotate(${小地图定位.deg}deg)` }">
					<view class="direction"></view>
					<view class="dot"></view>
				</view>
			</view>
		</view>
		<!-- 模糊过渡效果 -->
		<view v-show="模糊过渡" class="transition"></view>
		<!-- 加载遮罩 -->
		<view v-show="loading" class="loading"></view>
	</view>

	<Notify @confirm="选择房间('确认')" @cancel="选择房间('取消')" />
</template>

<script setup>
import { createScopedThreejs } from 'threejs-miniprogram';
import Controller from '/Api/threeJS控制器.js';
import { onBeforeUnmount, ref } from 'vue';
import { 弹窗 } from '/Api/提示.js';
import Notify from '/Components/notify/notify.vue';

// 属性
let THREE;
let canvas节点;
let renderId;
let textureLoader;
const VR = {
	场景: null,
	摄像头: null,
	渲染器: null,
	控制器: null,
	几何体: null
};
// 小程序没有document 而是调用API创建query选择器 来获取容器节点
const query = uni.createSelectorQuery();
query.select('#threeScene').node().exec(初始化);
const 当前区域 = ref('大厅');
const 房间 = ref({
	大厅: {},
	娱乐室: {}
});
const 小地图定位 = ref({
	x: '',
	y: '',
	deg: ''
});
const loading = ref(true);
const 模糊过渡 = ref(false);

let 所选房间;

onBeforeUnmount(() => {
	// 页面关闭时卸载渲染任务 否则会一直执行
	canvas节点.cancelAnimationFrame(renderId);
	// 避免多个控制器
	// VR.控制器 && VR.控制器.dispose();
});

// 方法
function 初始化(res) {
	uni.showLoading({
		title: '加载中...'
	});
	// 获取元素节点 但是不同于浏览器环境 所以不能直接用
	canvas节点 = res[0].node;
	// threejs常规版本需要 appendchild addEventListener 而这些小程序框架中都没有
	// 因此使用 createScopedThreejs 与canvas容器进行关联 得到THREE对象
	THREE = createScopedThreejs(canvas节点);
	textureLoader = new THREE.TextureLoader();

	VR.场景 = new THREE.Scene();
	VR.摄像头 = new THREE.PerspectiveCamera(75, canvas节点.width / canvas节点.height, 0.1, 1000);
	// 将相机放在球体中心
	VR.摄像头.position.set(0, 0, 0.1);
	// 配置项 antialias抗锯齿
	VR.渲染器 = new THREE.WebGLRenderer({ antialias: true });
	// 设置 WebGL 渲染器的像素比 使其在高分辨率时 自动调整分辨率
	VR.渲染器.setPixelRatio(uni.getSystemInfoSync().pixelRatio);
	// 设置渲染范围
	// 注意！小程序版 没有 innerWidth 等属性
	VR.渲染器.setSize(canvas节点.width, canvas节点.height);
	// 伽马校正 使图像看起来更加真实和自然
	VR.渲染器.gammaOutput = true;
	// 伽马校正因子 调整输出图像的亮度和对比度
	VR.渲染器.gammaFactor = 2.2;
	// 注意！小程序版本控制器是个函数
	// 必须先传入THREE对象 再结构返回值得到控制器对象
	const { OrbitControls } = Controller(THREE);
	VR.控制器 = new OrbitControls(VR.摄像头, VR.渲染器.domElement);
	// VR.控制器.enableDamping = true; // 添加惯性
	// VR.控制器.dampingFactor = 0.05; // 阻尼系数（越小越平滑）
	VR.控制器.enableRotate = true; // 允许旋转
	VR.控制器.rotateSpeed = 6; // 调整旋转速度
	// 限制垂直视角范围
	VR.控制器.minPolarAngle = Math.PI / 6; // 30度
	VR.控制器.maxPolarAngle = (Math.PI * 5) / 6; // 150度
	VR.控制器.addEventListener('change', () => {
		// 获取相机朝向向量
		const direction = new THREE.Vector3();
		VR.摄像头.getWorldDirection(direction);
		// 计算角度（0-360度
		// 注意！Three.js 使用的是 右手坐标系 因此需要反转x或z轴
		let angle = -Math.atan2(direction.x, direction.z) * (180 / Math.PI);
		// angle = Math.floor((angle + 360) % 360);
		小地图定位.value.deg = angle - 房间.value[当前区域.value].初始朝向;
	});
	const arrowPos = new THREE.Vector3(0, 0, 0); // 原点位置
	const arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), arrowPos, 10, 0xff0000, 2, 1); // X轴（红色）
	const arrowY = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), arrowPos, 20, 0x00ff00, 2, 1); // Y轴（绿色）
	const arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), arrowPos, 10, 0x0000ff, 2, 1); // Z轴（蓝色）

	VR.场景.add(arrowX);
	VR.场景.add(arrowY);
	VR.场景.add(arrowZ);

	添加房间信息();
	场景内添加几何体();

	渲染();
}
function 添加房间信息() {
	房间.value = {
		大厅: {
			img: 'https://636c-cloud1-0gzy726e39ba4d96-1320186052.tcb.qcloud.la/%E5%A4%A7%E5%8E%85.jpg?sign=4698aec1129c91668d43e40d4e3c316f&t=1749536714',
			hotspots: [
				{ label: '标准间1', position: new THREE.Vector3(-2, 0.5, 1.5), opacity: 0, screenPosition: { x: 0, y: 0 }, type: '房间' },
				{ label: '娱乐室', position: new THREE.Vector3(1.8, 0.3, -1.2), opacity: 0, screenPosition: { x: 0, y: 0 }, type: '区域' },
				{ label: '标准间2', position: new THREE.Vector3(0, 0, -1), opacity: 0, screenPosition: { x: 0, y: 0 }, type: '房间' }
			],
			mapPosition: { x: 37, y: 70, deg: 0 },
			初始朝向: 180 // 相机朝向与小地图扇形偏差角度
		},
		娱乐室: {
			img: 'https://636c-cloud1-0gzy726e39ba4d96-1320186052.tcb.qcloud.la/%E5%A8%B1%E4%B9%90%E5%AE%A4%E9%97%A8%E5%89%8D.jpg?sign=b71436ef8861009b57ddeca3ec1e7952&t=1749537540',
			hotspots: [{ label: '大厅', position: new THREE.Vector3(2, 0.4, 0.5), opacity: 0, screenPosition: { x: 0, y: 0 }, type: '区域' }],
			mapPosition: { x: 37, y: 20, deg: 240 },
			初始朝向: 180
		}
	};
}
function 场景内添加几何体() {
	const geometry = new THREE.SphereGeometry(50, 60, 40);
	// 反转几何体使贴图在内部
	geometry.scale(-1, 1, 1);
	textureLoader.load(房间.value[当前区域.value].img, (newTexture) => {
		const material = new THREE.MeshBasicMaterial({ map: newTexture });
		VR.几何体 = new THREE.Mesh(geometry, material);
		VR.场景.add(VR.几何体);
		setTimeout(() => {
			loading.value = false;
			uni.hideLoading();
		}, 200);
	});
	let { x, y, deg } = 房间.value[当前区域.value].mapPosition;
	小地图定位.value.x = x;
	小地图定位.value.y = y;
	小地图定位.value.deg = deg;
}
function 渲染() {
	renderId = canvas节点.requestAnimationFrame(渲染);
	// 如果开启了enableDamping(阻尼惯性)则必须在添加这句
	VR.控制器.update();
	更新热点数据();
	VR.渲染器.render(VR.场景, VR.摄像头);
}
function 控制(type, e) {
	canvas节点.dispatchTouchEvent({ type, ...e });
}
function 热点显示(spot) {
	return {
		left: `${spot.screenPosition.x}%`,
		top: `${spot.screenPosition.y}%`,
		opacity: spot.opacity
	};
}
function 更新热点数据() {
	for (let spot of 房间.value[当前区域.value].hotspots) {
		// 计算热点在屏幕上的位置
		const vector = spot.position.clone().project(VR.摄像头);
		const x = Math.round((vector.x * 0.5 + 0.5) * 1000) / 10;
		// 乘以-0.5是为了翻转结果值 因为vector的值为-1到1 而y的值是反的 即-11表示屏幕顶部
		const y = Math.round((vector.y * -0.5 + 0.5) * 1000) / 10;
		// 计算热点与相机方向的夹角
		const cameraDirection = new THREE.Vector3();
		VR.摄像头.getWorldDirection(cameraDirection);
		const hotspotDirection = spot.position.clone().normalize();
		const angle = cameraDirection.angleTo(hotspotDirection); // 弧度 所以要跟Math.PI的值进行比较
		// 根据夹角计算透明度 (0-10度完全可见，10-30度渐变消失)
		let opacity = 1;
		if (angle > Math.PI / 18) {
			opacity = Math.max(0, 1 - (angle - Math.PI / 18) / (Math.PI / 6));
		}
		// 更新热点状态
		spot.screenPosition = { x, y };
		spot.opacity = Math.floor(opacity * 100) / 100;
	}
}
function 切换区域(spot) {
	模糊过渡.value = true;
	uni.showLoading({
		title: '加载中...'
	});

	当前区域.value = spot.label;
	// 重置新区域数据
	for (let spot of 房间.value[当前区域.value].hotspots) {
		spot.opacity = 0;
	}
	// 切换贴图
	textureLoader.load(
		房间.value[当前区域.value].img,
		// 加载图片回调
		(newTexture) => {
			let { x, y, deg } = 房间.value[当前区域.value].mapPosition;
			小地图定位.value.x = x;
			小地图定位.value.y = y;
			// 小地图定位.value.deg = deg;
			VR.摄像头.lookAt(new THREE.Vector3(-0.45152634489803495, -0.23661774744895336, -0.8603115723127315));
			newTexture.encoding = THREE.sRGBEncoding; // 确保色彩正确
			VR.几何体.material.map = newTexture;
			setTimeout(() => {
				模糊过渡.value = false;
				uni.hideLoading();
			}, 200);
		}
	);
}
function 选择房间(args) {
	if (typeof args == 'string' && args == '确认') {
		console.log('跳转', 所选房间);
	} else {
		所选房间 = args.label;
		弹窗(`确认选择 ${args.label} ？`, '确认');
	}
}
</script>

<style lang="less" scoped>
@import '/Static/公共样式.css';
.page {
	overflow: hidden;
	touch-action: none; /* 禁用浏览器默认触摸行为 */
	-webkit-user-drag: none; /* 禁止拖拽（部分iOS有效） */
	user-select: none; /* 防止长按选中 */
}
#threeScene {
	width: 100%;
	height: 100%;
	position: relative;
	z-index: 0;
	overflow: hidden;
	touch-action: none; /* 禁用浏览器默认触摸行为 */
	-webkit-user-drag: none; /* 禁止拖拽（部分iOS有效） */
	user-select: none; /* 防止长按选中 */
}
.hotspot {
	position: absolute;
	transform: translate(-50%, -50%);
	transition: opacity 0.3s ease;
	z-index: 10;
	> .area {
		padding: 10rpx 20rpx;
		font-size: 24rpx;
		background: rgba(0, 0, 0, 0.5);
		color: #fff;
		overflow: hidden;
		border-radius: 20rpx;
	}
	> .room {
		padding: 10rpx 20rpx;
		background: linear-gradient(to right, #ff9966, #ff6600); /* 调整为更深的暖色 */
		border-radius: 10rpx;
		font-size: 24rpx;
		font-weight: bold;
		color: #ffffff; /* 仍然是白色字体，但增加阴影 */
		text-shadow: 4rpx 4rpx 8rpx rgba(0, 0, 0, 0.6); /* 增加文字阴影，提高可读性 */
		box-shadow: 4rpx 4rpx 10rpx rgba(255, 153, 102, 0.5);
	}
}
.minimap {
	position: absolute;
	top: 20rpx;
	right: 20rpx;
	width: 150rpx;
	height: 150rpx;
	background: rgba(0, 0, 0, 0.5);
	border-radius: 8rpx;
	overflow: hidden;
	z-index: 20;
	box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.2);
	> .indicator {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 10;
		width: 0;
		height: 0;
		transform-origin: center;
		transition: all 1s ease;
		.dot {
			width: 6px;
			height: 6px;
			border-radius: 50%;
			background-color: #eee;
			position: absolute;
		}
		.direction {
			position: absolute;
			z-index: -1;
			// transform: rotateZ(180deg); // 视角默认就是180度 与图形方向相反
			width: 30px;
			height: 30px;
			background: radial-gradient(circle, rgba(59, 142, 244, 1) 0%, rgba(59, 142, 244, 0) 100%);
			clip-path: path('M15,15 L7.5,2.5 A15,15 0 0,1 22.5,2.5 Z');
		}
		.rotate {
			position: absolute;
			top: 0;
			left: 0;
			z-index: 10;
			width: 0;
			height: 0;
		}
	}
}
.loading {
	position: fixed;
	left: 0%;
	top: 0%;
	width: 100%;
	height: 100%;
	z-index: 990;
	background: #fff;
}
.transition {
	position: fixed;
	left: 0%;
	top: 0%;
	width: 100%;
	height: 100%;
	z-index: 990;
	background-color: rgba(255, 255, 255, 0.3);
	backdrop-filter: blur(10px); /* 磨砂效果关键属性 */
	-webkit-backdrop-filter: blur(10px); /* Safari 支持 */
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
