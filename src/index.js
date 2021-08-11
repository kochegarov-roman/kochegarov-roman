import './style/app.scss';
import './owl/owl.carousel.min.js';

import './style/common.sass';
import SketchBrain from "./js/SketchBrain";
import ScrollSketch from "./js/ScrollSketch";
import './js/Cursor';
import {gsap} from 'gsap';
import PubSub from "pubsub-js";

import Paginator from './js/Paginator';
import * as THREE from "three";
const p = new Paginator();

// let nextSlideInterval = setInterval(() => p.nextSlide(), 25000);

class TestClass {
    constructor() {
        let msg = "Using ES2015+ syntax";
        console.log(msg);
    }
}
let test = new TestClass();

console.log('API Key from Define Plugin:', API_KEY);
let sketch = new SketchBrain('container-brain');


// const p = new Paginator();

function setColor(index){
    switch (index){
        case 0: return '#6984ef54'
        case 1: return '#ff188354'
        case 2: return '#16882f54'
        case 3: return '#b7a29254'
        case 4: return '#1ec88e54'
        default: return '#85a7e554'
    }
}

// ----------------------------------------------------------------------------

let menuProject = document.querySelector('#menu-projects')
let menuAbout = document.querySelector('#menu-about')
menuProject.addEventListener('click', () => {
    // gsap.to(document.getElementById('container-brain'), {
    //     duration: 0.5,
    //     x: '-100vw',
    //     opacity: 0,
    // })
    // sketch.camera.position.set(0, 0.1, 1.5);
    // sketch.camera.lookAt(0.0, 0.0, 1.5);
})

if (document.body.offsetWidth < 500){

    $('.skills').addClass('owl-carousel');
    $('.skills').addClass('owl-theme');

    var owlSkills = $(".owl-carousel");
    owlSkills.owlCarousel({
        items: 1,
        loop:true,
        margin:2,
        stagePadding: 10,
    });
} else{
    $('.skills-row').attr('data-stagger', 'true')
}


PubSub.subscribe('gotoSlide', function(msg, data) {


    if(data.to === 3 ){
        p.deleteWheelEvents();
        if (p.activeTimeout) clearInterval(p.activeTimeout);

        $('.pagination').fadeOut();
        $('#container-scroll').fadeIn();
        gsap.to(rotsPos, {
            duration: 2.3,
            y: 0,
        })

        gsap.to([sketch.pointsMesh.position],
            {
                duration: 3,
                x: -1.0,
                y: 0.5,
                z: -0.5
            })

        if (document.body.offsetWidth < 500){
            setTimeout(()=>{
                $('.mobile').addClass('owl-carousel');
                $('.mobile').addClass('owl-theme');

                var owl = $(".owl-carousel");
                owl.owlCarousel({
                    items: 1,
                    loop:true,
                    margin:5,
                    stagePadding: 30,
                });

                owl.on('changed.owl.carousel', function(event) {
                    // sketch.scene.background = new THREE.Color(setColor(event.item.index));
                    // $('#wrap').css('background', setColor(event.item.index));
                    $('.owl-dots').css('background', setColor(event.item.index));
                })


                // $('.skills').addClass('owl-carousel');
                // $('.skills').addClass('owl-theme');

                // var owlSkills = $(".owl-carousel");
                // owlSkills.owlCarousel({
                //     items: 1,
                //     loop:true,
                //     margin:5,
                //     stagePadding: 30,
                // });
            }, 1000);
        }
    }

    if(data.from === 3){
        p.scrollEvents();
        $('#container-scroll').fadeOut();
        $('.pagination').fadeIn();

        gsap.to(rotsPos, {
            duration: 2.3,
            y: -14,
        })

        gsap.to([sketch.pointsMesh.position],
            {
                duration: 3,
                x: 0,
                y: 0,
                z: 0
            })
    }
    console.log('$currentSlide', msg, data);
})

let rotsPos = sketch.groups.map(e => e.position);
menuAbout.addEventListener('click', () => {
    // gsap.to(rotsPos, {
    //     duration: 2.3,
    //     y: 0,
    // })
    //
    // gsap.to([sketch.pointsMesh.position],
    //     {
    //         duration: 3,
    //         x: -1.0,
    //         y: 0.5,
    //         z: -0.5
    //     })
})


// let sketch = new ScrollSketch({
//     dom: document.getElementById("container-scroll")
// });

let attractMode = false;
let attractTo = 0;
let speed = 0;
let position = 0;
let rounded = 0;
let block = document.getElementById('block');
let wrap = document.getElementById('wrap');
let elems = [...document.querySelectorAll('.n')];

window.addEventListener('wheel', (e) => {
    speed += e.deltaY * 0.0003;
})

let objs = Array(5).fill({dist: 0})


function raf() {
    position += speed;
    speed *= 0.9;
    objs.forEach((o, i) => {
        o.dist = Math.min(Math.abs(position - i), 1)
        o.dist = 1 - o.dist ** 2;
        elems[i].style.transform = `scale(${1 + 0.4 * o.dist})`;
        elems[i].style.opacity = `${o.dist}`;
        let scale = 1 + 0.1 * o.dist;
        sketch.meshes[i].position.y = i * 1.2 - position * 1.2;
        sketch.meshes[i].scale.set(scale, scale, scale);
        // console.log('distanceFromCenter', sketch.meshes[i].material.uniforms.distanceFromCenter);
        if (sketch.meshes[i].material.uniforms)
            sketch.meshes[i].material.uniforms.distanceFromCenter.value = o.dist;
    })

    rounded = Math.round(position);
    let diff = (rounded - position);

    if (attractMode) {
        position += -(position - attractTo) * 0.02;
        wrap.style.transform = `translate(0, ${-position * 100 + 50}px)`;
        // console.log('position', attractMode, position, attractTo);
    } else {
        position += Math.sign(diff) * Math.pow(Math.abs(diff), 0.7) * 0.015;
        wrap.style.transform = `translate(0, ${-position * 100 + 50}px)`;
        // console.log('position', attractMode, position, attractTo);
    }
    block.style.transform = `translate(0, ${position * 100 + 50}px)`;

    window.requestAnimationFrame(raf)
}


if (document.body.offsetWidth > 500){
    raf();
}

let navs = [...document.querySelectorAll('li')]
let nav = document.querySelector('.nav')

let rots = sketch.groups.map(e => e.rotation);

nav.addEventListener('mouseenter', () => {
    attractMode = true;
    gsap.to(rots, {
        duration: 0.3,
        x: -0.5,
        y: 0,
        z: 0
    })
})

nav.addEventListener('mouseleave', () => {
    attractMode = false;
    gsap.to(rots, {
        duration: 0.3,
        x: -0.3,
        y: -0.5,
        z: -0.1
    })
})

navs.forEach(el => {
    el.addEventListener('mouseover', (e) => {
        attractTo = Number(e.target.getAttribute('data-nav'))
    })
})
