
import {gsap} from 'gsap';
import Sketch from "./ScrollSketch";
import 'jquery'

let sketch = new ScrollSketch({
    dom: document.getElementById("container")
});

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
        let scale = 1 + 0.1 * o.dist;
        sketch.meshes[i].position.y = i * 1.2 - position * 1.2;
        sketch.meshes[i].scale.set(scale, scale, scale);
        console.log('distanceFromCenter', sketch.meshes[i].material.uniforms?.distanceFromCenter);
        if (sketch.meshes[i].material.uniforms)
            sketch.meshes[i].material.uniforms.distanceFromCenter.value = o.dist;
    })

    rounded = Math.round(position);
    let diff = (rounded - position);

    if (attractMode) {
        position += -(position - attractTo) * 0.02;
        console.log('position', attractMode, position, attractTo);
    } else {
        position += Math.sign(diff) * Math.pow(Math.abs(diff), 0.7) * 0.015;
        wrap.style.transform = `translate(0, ${-position * 100 + 50}px)`;
        console.log('position', attractMode, position, attractTo);
    }
    block.style.transform = `translate(0, ${position * 100 + 50}px)`;

    window.requestAnimationFrame(raf)

}

if (document.body.offsetWidth > 500){
    raf();
} else {
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
        $(document.body).css('background', setColor(event.item.index));
    })
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


// ---------------------------------------------------------------------




