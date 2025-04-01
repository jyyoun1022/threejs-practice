import * as THREE from 'three'

// 1. 장면 
const scene = new THREE.Scene()

// 2. 객체
// 기본적인 상자 1개를 만들 것이라 Box2.Geometry를 사용
// 도형정보 담당인 geometry와 색상/ 재질 정보 담당인 material을 각각 생성해준 뒤 mesh에 둘을 갖다 바친다.
// 완성된 mesh를 scene에 추가해야한다
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)
// 3. 카메라
// 카메라 비율과 캔버스 사이즈를 통합적으로 변경해주기 위해서 size를 별도 변수로 지정한다.
// Three 모듈에서 사용 가능한 카메라 중 가장 대중적인 PerspectiveCamera를 사용하도록 한다.
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
// 위와 같이 최초 생성된 카메라, 객체 등은 화면 정 중앙에(0,0,0) 모두 생기므로,
//  카메라가 물체 안에 들어가게 되어 화면에 객체는 안보이고 검은 색만 보일 수도 있다. 따라서 카메라의 위치를 옮겨 객체와의 거리를 확보해준다.(본 샘플 코드에서는 z축으로 이동)

camera.position.z = 3
scene.add(camera)


// 4. 렌더러
// 마지막으로 렌더링 모듈인 WebGLRenderer를 사용하기 위해서는 html에 마련해둔 canvas 객체를 가져와야 한다. 여기서는 document.querySelector를 사용하도록 한다.
// 그리고 renderer의 폭과 높이 사이즈는 카메라 코드 작성시에 생성한 sizes 변수값을 가져와 통일시킨다.
const myCanvas = document.querySelector('canvas.myCanvas')
const renderer = new THREE.WebGLRenderer({
    canvas: myCanvas
})
renderer.setSize(sizes.width, sizes.height)
// canvas의 pixel ratio를 2를 넘지 않도록 맞춰주는 것이 구동 효율성 향상과 일관성 있는 해상도 확보를 위해 필요하다.
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.render(scene, camera)


// 캔버스의 크기와 카메라의 종횡비에 영향을 미치는 기본 sizes 변수의 width값과 height 값을 새로운 창 크기에 맞게 변경해주도록
// 또한 sizes변수의 값을 바꾼 것과는 별도로, 이에 영향을 받고 있는 다른 요소인 camera의 종횡비(aspect) 또한 수동으로 업데이트시켜 주어야 한다. 
// 이렇게 카메라 속성이 일부라도 변경될 경우 카메라의 프로젝션을 연산하는 매트릭스 또한 업데이트를 시켜주어야 하는데,
//  이때 camera 객체의 멤버함수 중 updateProjectionMatrix()가 그 역할을 담당한다. 
window.addEventListener('resize', () => {

    // 기본 size 업데이트
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    // camera 종횡비 업데이트
    camera.aspect = sizes.width / sizes.height
    // 카메라의 프로젝션 매트릭스 업데이트
    camera.updateProjectionMatrix()
    // 마지막으로 렌더러의 사이즈만 바꿔주고
    // 그리고 렌더링 함수를 다시 호출해준다.
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.render(scene, camera)
})

window.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) {
        myCanvas.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
})