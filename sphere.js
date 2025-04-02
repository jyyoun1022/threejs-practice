import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 컨트롤러
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// 조명
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

// 박스 만들기
const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshStandardMaterial({
  color: 0x8844ff, transparent: true, opacity: 0.5,
  //  side : THREE.DoubleSide 
});
const box = new THREE.Mesh(geometry, material);
scene.add(box);

// wireframe 표시
const edges = new THREE.EdgesGeometry(geometry);
const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x8844ff, opacity: 1 }));
box.add(line);

const handles = [];

const handleMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const handleGeo = new THREE.SphereGeometry(0.2, 5, 10);

// 각 축 양방향 → 6개
const directions = [
  new THREE.Vector3(1, 0, 0),   // right (x+)
  new THREE.Vector3(-1, 0, 0),  // left  (x-)
  new THREE.Vector3(0, 1, 0),   // top   (y+)
  new THREE.Vector3(0, -1, 0),  // bottom(y-)
  new THREE.Vector3(0, 0, 1),   // front (z+)
  new THREE.Vector3(0, 0, -1),  // back  (z-)
];

directions.forEach(dir => {
  const handle = new THREE.Mesh(handleGeo, handleMaterial.clone());
  handle.userData.direction = dir.clone();
  scene.add(handle);
  handles.push(handle);
});

function updateHandles() {
  const size = new THREE.Vector3();
  // 박스의 가로, 세로 , 깊이 크기를 구해준다.
  // size 변수 자체가 결과값을 직접 '받는 역할'을 한다.
  new THREE.Box3().setFromObject(box).getSize(size);
  // box position 은 Mesh의 중심점 위치를 의미함
  const center = box.position.clone();

  handles.forEach((handle, i) => {
    const dir = directions[i];
    const offset = dir.clone().multiply(size).multiplyScalar(0.5);
    handle.position.copy(center.clone().add(offset));
  });
}

updateHandles();

const raycaster = new THREE.Raycaster();
// 광선을 쏘아서 마우스가 가리키는 방향에 어떤 오브젝트가 있는지 감지하는 도구
const mouse = new THREE.Vector2();
// 마우스는 2D 화면 좌표 (x,y) 3D 공간에서 실제로 뭘 클릭했는지 알려면 Raycasting 필요
let selectedHandle = null;
let dragStart = null;

const faceVertexIndices = {
  right:  [0,3,6,9,27,33,39,45,51,57,60,66],
  left:   [12,15,18,21,24,30,48,54,42,36,63,69],
  top:    [25,28,31,34,1,4,13,16,49,52,61,64],
  bottom: [37,40,43,46,7,10,19,22,55,58,70,67],
  front:  [50,53,56,59,32,35,2,8,17,23,38,41],
  back:   [62,65,68,71,5,11,14,20,26,29,44,47],
};

function resizeBox(amount, direction) {
  const posAttr = geometry.attributes.position;
  const arr = posAttr.array;

  let indices;
  let axis;

  if (direction.x !== 0) {
    indices = direction.x > 0 ? faceVertexIndices.right : faceVertexIndices.left;
    axis = 0;
  } else if (direction.y !== 0) {
    indices = direction.y > 0 ? faceVertexIndices.top : faceVertexIndices.bottom;
    axis = 1;
  } else if (direction.z !== 0) {
    indices = direction.z > 0 ? faceVertexIndices.front : faceVertexIndices.back;
    axis = 2;
  }

  indices.forEach(index => {
    arr[index] += amount;
  });

  posAttr.needsUpdate = true;

  box.position.add(direction.clone().multiplyScalar(amount / 2));
  geometry.computeBoundingBox();
  box.updateMatrixWorld(true);
}


window.addEventListener('mousedown', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(handles);

  if (intersects.length > 0) {
    selectedHandle = intersects[0].object;
    dragStart = intersects[0].point ? intersects[0].point.clone() : selectedHandle.position.clone();
    controls.enabled = false;
  }
});

window.addEventListener('mousemove', (event) => {
  if (!selectedHandle) return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const dir = selectedHandle.userData.direction.clone();
  const plane = new THREE.Plane(dir, -dragStart.dot(dir));
  const intersection = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, intersection);

  const delta = intersection.clone().sub(dragStart);
  const moveAmount = delta.dot(dir);

  resizeBox(moveAmount, dir);
  updateHandles();

  dragStart.copy(intersection); // 매 프레임 시작 지점 갱신
});

window.addEventListener('mouseup', () => {
  selectedHandle = null;
  controls.enabled = true;
});



function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
