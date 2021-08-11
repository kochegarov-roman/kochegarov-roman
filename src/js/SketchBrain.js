import * as THREE from "three";

const OrbitControls = require("three-orbit-controls")(THREE);
require("./lib/gltfloader");
import "./lib/draco";

import brain from "../models/brain.glb";
import fragment from "../shader/fragmentParticles.glsl";
import vertex from "../shader/vertexParticles.glsl";

import vertexImages from '../shader/vertexScroll.glsl' ;
import fragmentImages from '../shader/fragmentScroll.glsl';

import vertexWhiteNoise from '../shader/vertexWhiteNoise.glsl' ;
import fragmentWhiteNoise from '../shader/fragmentWhiteNoise.glsl'

export default class SketchBrain {
    constructor(selectorId) {
        console.log('brain', window.innerWidth, window.innerHeight, window.width , window.height);

        let width = 375;   // window.innerWidth
        let height = 667;  //window.innerHeight

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.camera = new THREE.PerspectiveCamera(70, width / height, 0.001, 1000);

        this.camera.updateProjectionMatrix();
        this.camera.aspect = window.innerWidth / window.innerHeight;

        this.renderer = new THREE.WebGLRenderer();
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.physicallyCorrectLights = true;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        if(selectorId){
            document.getElementById(selectorId).appendChild(this.renderer.domElement);
        } else{
            document.body.appendChild(this.renderer.domElement);
        }

        this.time = 0;

        this.raycaster = new THREE.Raycaster();


        this.camera.position.set(0, 0.1, 1.5);

        this.geometry = new THREE.PlaneGeometry(2, 2, 1, 1);
        this.plane = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({color: 0x00ff55, visible: false}));
        this.scene.add(this.plane);

        this.mouseV = new THREE.Vector2();
        this.pointsMesh = null;

        // this.dracoLoader = new DRACOLoader();
        // this.dracoLoader.setDecoderPath('./three.js/examples/js/libs/draco/');
        // this.dracoLoader.setDecoderConfig({type: 'js'});
        // this.loaderR = new GLTFLoader().setPath('models/');
        // this.loaderR.setDRACOLoader(this.dracoLoader);

        this.loaderR = new THREE.GLTFLoader().setPath('');
        THREE.DRACOLoader.setDecoderPath("js/lib/draco/");
        this.loaderR.setDRACOLoader(new THREE.DRACOLoader());

        let that = this;
        this.loaderR.load(brain,
            function (gltf) {
                let geo = new THREE.BufferGeometry();
                let pos = gltf.scene.children[0].geometry.attributes.position.array;
                geo.addAttribute('position', new THREE.BufferAttribute(pos, 3));
                let bBox = geo.computeBoundingBox();
                that.pointsMesh = new THREE.Points(geo, that.material);
                that.scene.add(that.pointsMesh);
            },
            function (xhr) {
                const total = xhr.total || 36331524;
                console.log((xhr.loaded / total * 100) + '% loaded');

                $('#loading-progress').text((xhr.loaded / total * 100).toFixed(1) + '% loaded');
                if((xhr.loaded / total * 100) === 100){
                    $('#start-loading').addClass('hide-progress');
                    $('#start-loading').css('height', '0');
                }
            },
            // called when loading has errors
            function (error) {
                console.log('An error happened');
            }
        );

        this.setupResize();

        this.addObjects();
        // this.addCosmosPoints();
        this.resize();
        this.mouse();

        this.materials = [];
        this.meshes = [];
        this.groups = [];

        if (document.body.offsetWidth > 500){
            this.handleImages();
        }
        this.render();


    }


    handleImages() {
        let that = this;
        let images = [...document.querySelectorAll('#container-scroll img')];

        images.forEach((im, i) => {
            let mat = this.materialImage.clone();
            this.materials.push(mat);
            let group = new THREE.Group();
            mat.uniforms.texture1.value = new THREE.Texture(im);
            mat.uniforms.texture1.value.needsUpdate = true;

            let geo = new THREE.PlaneBufferGeometry(1.5, 1, 130, 130);
            let mesh = new THREE.Mesh(geo, mat);
            group.add(mesh);
            this.groups.push(group);
            this.scene.add(group);
            this.meshes.push(mesh);
            mesh.position.y = i * 1.8;

            group.rotation.y = -0.5;
            group.rotation.x = -0.3;
            group.rotation.z = -0.1;

            group.position.y = -14;
        })
    }

    setupResize() {
        window.addEventListener("resize", this.resize.bind(this));
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.renderer.setSize(this.width, this.height);
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix();

        this.imageAspect = 800 / 1280;
        let a1;
        let a2;
        if (this.height / this.width > this.imageAspect) {
            a1 = (this.width / this.height) * this.imageAspect;
            a2 = 1;
        } else {
            a1 = 1;
            a2 = (this.width / this.height) * this.imageAspect;
        }

        this.materialImage.uniforms.resolution.value.x = this.width;
        this.materialImage.uniforms.resolution.value.y = this.height;
        this.materialImage.uniforms.resolution.value.z = a1;
        this.materialImage.uniforms.resolution.value.w = a2;

        this.camera.updateProjectionMatrix();
    }

    addObjects() {
        this.material = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: {type: "f", value: 0},
                mousePos: {type: "v3", value: new THREE.Vector3(0, 0, 0)},
                pixels: {
                    type: "v2",
                    value: new THREE.Vector2(window.innerWidth, window.innerHeight)
                },
                uvRate1: {
                    value: new THREE.Vector2(1, 1)
                }
            },
            // wireframe: true,
            vertexShader: vertex,
            fragmentShader: fragment
        });

        let that = this;
        this.materialImage = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: {type: "f", value: 0},
                distanceFromCenter: {type: "f", value: 0.3},
                texture1: {type: "t", value: null},
                resolution: {type: "v4", value: new THREE.Vector4()},
                uvRate1: {
                    value: new THREE.Vector2(1, 1)
                }
            },
            // transparent: true,

            vertexShader: vertexImages,
            fragmentShader: fragmentImages
        });


        this.materialWhiteNoise = new THREE.ShaderMaterial({
            extensions: {
                derivatives: "#extension GL_OES_standard_derivatives : enable"
            },
            side: THREE.DoubleSide,
            uniforms: {
                time: {type: "f", value: 0},
                mousePos: {type: "v3", value: new THREE.Vector3(0, 0, 0)},
                pixels: {
                    type: "v2",
                    value: new THREE.Vector2(window.innerWidth, window.innerHeight)
                },
                uvRate1: {
                    value: new THREE.Vector2(1, 1)
                }
            },
            // wireframe: true,
            vertexShader: vertex,
            fragmentShader: fragment
        });
    }


    addCosmosPoints(){
        this.scene.fog = new THREE.Fog( 0x050505, 2000, 3500 );
        const particles = 100000;
        const geometry_par = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        const color = new THREE.Color();
        const n = 100, n2 = n / 2; // particles spread in the cube
        for ( let i = 0; i < particles; i ++ ) {

            // positions
            const x = Math.random() * n - n2;
            const y = Math.random() * n - n2;
            const z = -5;
            positions.push( x, y, z );
            // colors
            const vx = ( x / n ) + 0.5;
            const vy = ( y / n ) + 0.5;
            const vz = ( z / n ) + 0.5;
            color.setRGB( vx, vy, vz );
            colors.push( color.r, color.g, color.b );
        }
        geometry_par.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
        geometry_par.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );
        geometry_par.computeBoundingSphere();
        const material_par = new THREE.PointsMaterial( { size: 0.001, vertexColors: true } );

        this.pointsCosmos = new THREE.Points( geometry_par, material_par );
        this.scene.add( this.pointsCosmos );
    }

    mouse() {
        let that = this;
        function onMouseMove(event) {
            // calculate mouse position in normalized device coordinates
            // (-1 to +1) for both components
            that.mouseV.x = (event.clientX / window.innerWidth) * 2 - 1;
            that.mouseV.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }
        window.addEventListener('mousemove', onMouseMove, false);
    }

    render() {
        // const timer = Date.now() * 0.0003;
        // camera.position.x = Math.sin( timer ) * 0.5 + 1;
        // camera.position.z = Math.cos( timer ) * 0.5 + 1;
        // camera.lookAt( 0, 0.1, 0 );

        this.time += 0.05;
        this.material.uniforms.time.value = this.time;

        // this.pointsCosmos.rotation.x = this.time * 0.025;
        // this.pointsCosmos.rotation.y = this.time * 0.05;

        if(this.materials){
            this.materials.forEach(m=>{
                m.uniforms.time.value = this.time;
            })
        }

        if(this.pointsMesh){
            this.pointsMesh.rotation.y += 0.005;
        }

        this.raycaster.setFromCamera(this.mouseV, this.camera);

        // calculate objects intersecting the picking ray [plane]
        const intersects = this.raycaster.intersectObjects([this.plane]);
        if (intersects.length > 0) {
            this.material.uniforms.mousePos.value = intersects[0].point;
        }
        // intersects[ i ].object.material.color.set( 0xff0000 );

        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }


}







