<template>
	<view class="page">
		<canvas id="threeScene" @touchstart="控制('touchstart', $event)" @touchmove="控制('touchmove', $event)" @touchend="控制('touchend', $event)" type="webgl"></canvas>
		<!-- 热点 -->
		<view class="hotspot" v-for="item in 房间[当前区域].hotspots" @click="切换区域(item)" :style="热点显示(item)">{{ item.label }}</view>
		<!-- 小地图 -->
		<view class="minimap">
			<view class="indicator" :style="{ transform: `translate(${小地图定位.x}px, ${小地图定位.y}px) rotate(${小地图定位.deg}deg)` }">
				<view class="dot"></view>
				<view class="direction"></view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { createScopedThreejs } from 'threejs-miniprogram';
import Controller from '/Api/threeJS控制器.js';
import { onBeforeUnmount, ref } from 'vue';
import TWEEN from '@tweenjs/tween.js';

// 属性
let THREE;
let canvas节点;
let renderId;
let textureLoader;
let 过渡动画;
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

onBeforeUnmount(() => {
	// 页面关闭时卸载渲染任务 否则会一直执行
	canvas节点.cancelAnimationFrame(renderId);
	// 避免多个控制器
	VR.控制器 && VR.控制器.dispose();
});

// 方法
function 初始化(res) {
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
	VR.控制器.enableDamping = true; // 添加惯性
	VR.控制器.rotateSpeed = 6; // 调整旋转速度
	VR.控制器.zoomSpeed = 0.8;
	// 限制缩放范围
	VR.控制器.minDistance = 0.5;
	VR.控制器.maxDistance = 3;
	// 限制垂直视角范围
	VR.控制器.minPolarAngle = Math.PI / 6; // 30度
	VR.控制器.maxPolarAngle = (Math.PI * 5) / 6; // 150度
	VR.控制器.enablePan = false; // 禁用平移

	添加房间信息();
	场景内添加几何体();

	渲染();
}
function 场景内添加几何体() {
	const geometry = new THREE.SphereGeometry(50, 60, 40);
	// 反转几何体使贴图在内部
	geometry.scale(-1, 1, 1);
	const texture = textureLoader.load(房间.value[当前区域.value].img, (newTexture) => {
		const material = new THREE.MeshBasicMaterial({ map: texture });
		VR.几何体 = new THREE.Mesh(geometry, material);
		VR.场景.add(VR.几何体);
	});
}
function 渲染() {
	renderId = canvas节点.requestAnimationFrame(渲染);
	// 如果开启了enableDamping(阻尼惯性)则必须在添加这句
	VR.控制器 && VR.控制器.update();
	更新热点数据();
	VR.渲染器.render(VR.场景, VR.摄像头);
}
function 控制(type, e) {
	canvas节点.dispatchTouchEvent({ type, ...e });
}
function 添加房间信息() {
	房间.value = {
		大厅: {
			img: 'https://636c-cloud1-0gzy726e39ba4d96-1320186052.tcb.qcloud.la/%E5%A4%A7%E5%8E%85.jpg?sign=4698aec1129c91668d43e40d4e3c316f&t=1749536714',
			hotspots: [
				{ label: '测试1', position: new THREE.Vector3(-2, 0.5, 1.5), opacity: 0, screenPosition: { x: 0, y: 0 } },
				{ label: '娱乐室', position: new THREE.Vector3(1.8, 0.3, -1.2), opacity: 0, screenPosition: { x: 0, y: 0 } }
			],
			mapPosition: { x: 120, y: 80 }
		},
		娱乐室: {
			img: 'https://636c-cloud1-0gzy726e39ba4d96-1320186052.tcb.qcloud.la/%E5%A8%B1%E4%B9%90%E5%AE%A4%E9%97%A8%E5%89%8D.jpg?sign=b71436ef8861009b57ddeca3ec1e7952&t=1749537540',
			hotspots: [{ label: '大厅', position: new THREE.Vector3(2, 0.4, 0.5), opacity: 0, screenPosition: { x: 0, y: 0 } }],
			mapPosition: { x: 60, y: 50 }
		}
	};
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
		// 根据夹角计算透明度 (0-90度完全可见，90-120度渐变消失)
		let opacity = 1;
		if (angle > Math.PI / 2) {
			opacity = Math.max(0, 1 - (angle - Math.PI / 2) / (Math.PI / 6));
		}
		// 更新热点状态
		spot.screenPosition = { x, y };
		spot.opacity = opacity;
	}
}
function 切换区域(spot) {
	// 判断所点击的标签是否存在对应区域
	const target = 房间.value[spot.label];
	if (!target) return;
	模糊效果();

	// 切换全景图 淡入淡出
	new TWEEN.Tween(VR.几何体.material)
		.to({ opacity: 0 }, 500) // 500ms 淡出
		.onStart(() => {
			VR.几何体.material.transparent = true; // 必须设置 transparent 否则透明度无效
		})
		.onUpdate(() => {
			VR.几何体.material.needsUpdate = true; // 强制更新材质
		})
		.onComplete(() => {
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
					// 切换完贴图后移除模糊 展示淡入效果
					if (过渡动画) {
						VR.场景.remove(过渡动画);
						过渡动画 = null;
					}
					newTexture.encoding = THREE.sRGBEncoding; // 确保色彩正确
					VR.几何体.material.map = newTexture;
					VR.几何体.material.opacity = 0; // 初始透明度为0（准备淡入）
					new TWEEN.Tween(VR.几何体.material)
						.to({ opacity: 1 }, 500) // 500ms 淡入
						.onUpdate(() => {
							VR.几何体.material.needsUpdate = true;
						})
						.start();
					// 使用TWEEN更新小地图坐标点s
					小地图定位.value.deg = Math.random() * 360; // 测试
					let { x, y } = 小地图定位.value;
					new TWEEN.Tween({ x, y }).to(target.mapPosition, 1000).easing(TWEEN.Easing.Quadratic.Out).start();
				}
			);
		})
		.start();
}
function 模糊效果() {
	// 创建模糊过渡效果
	const geometry = new THREE.PlaneGeometry(100, 100);
	const material = new THREE.MeshBasicMaterial({
		color: 0xffffff,
		opacity: 0,
		transparent: true
	});
	过渡动画 = new THREE.Mesh(geometry, material);
	VR.场景.add(过渡动画);
	// 创建动画
	new TWEEN.Tween({ opacity: 0 })
		.to({ opacity: 1 }, 250)
		.onUpdate((obj) => {
			material.opacity = obj.opacity;
		})
		.start();
}
</script>

<style lang="less" scoped>
@import '/Static/公共样式.css';
#threeScene {
	width: 100%;
	height: 100%;
}
.hotspot {
	position: absolute;
	transform: translate(-50%, -50%);
	transition: opacity 0.3s ease;
	z-index: 10;
	padding: 10rpx 20rpx;
	font-size: 24rpx;
	background: rgba(0, 0, 0, 0.8);
	color: #fff;
}
.minimap {
	position: absolute;
	top: 20rpx;
	right: 20rpx;
	width: 150rpx;
	height: 150rpx;
	background: rgba(255, 255, 255, 0.8);
	border-radius: 8rpx;
	overflow: hidden;
	z-index: 20;
	box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.2);
	> .indicator {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: center;
		transition: all 1s ease;
		> .dot {
			width: 8rpx;
			height: 8rpx;
			background: white;
			border: 2rpx solid #007aff;
			border-radius: 50%;
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
		}
		.direction {
			position: absolute;
			top: 50%;
			left: 50%;
			width: 0;
			height: 0;
			border-left: 5rpx solid transparent;
			border-right: 5rpx solid transparent;
			border-bottom: 15rpx solid #007aff;
			transform: translate(-50%, -70%);
		}
	}
}
</style>