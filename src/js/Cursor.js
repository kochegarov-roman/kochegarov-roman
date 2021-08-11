import {gsap} from 'gsap';
import Animator from './Animator';

import  './Navi';

let cx;
let cy;
let mouseX;
let mouseY;
let posX;
let posY;
let clientX;
let clientY;
let dx;
let dy;
let tiltx;
let tilty;
let request;
let radius;
let degree;


if (document.body.offsetWidth > 500) {
    document.addEventListener('DOMContentLoaded', () => {
        const body = document.querySelector('body');
        // body.css({cursor: 'none'});

        cx = window.innerHeight / 2;
        cy = window.innerWidth / 2;

        mouseX = 0;
        mouseY = 0;
        posX = 0;
        posY = 0;

        const cursor = document.getElementById('cursor');
        const follower = document.getElementById('aura');
        const links = document.getElementsByClassName('link');

        function mouseCoords(e) {
            mouseX = e.pageX
            mouseY = e.pageY
        }

        body.addEventListener('mousemove', e => {
            function updateMe() {
                dx = clientX - cx - 400
                dy = clientY - cy + 600
                tiltx = dy / cy
                tilty = dx / cx
                // eslint-disable-next-line no-restricted-properties
                radius = Math.sqrt(Math.pow(tiltx, 2) + Math.pow(tilty, 2))
                degree = radius * 12
                gsap.to('.about', 1, {transform: `rotate3d( ${tiltx}, ${tilty}, 0, ${degree}deg )`})
            }

            clientX = e.pageX
            clientY = e.pageY
            request = requestAnimationFrame(updateMe)

            mouseCoords(e)
            // cursor.classList.remove('hidden')
            // follower.classList.remove('hidden')
        })


        gsap.to({}, .01, {
            repeat: -1,
            onRepeat: () => {
                posX += (mouseX - posX) / 5
                posY += (mouseY - posY) / 5

                gsap.set(cursor, {
                    css: {
                        left: mouseX,
                        top: mouseY
                    }
                })

                gsap.set(follower, {
                    css: {
                        left: posX - 24,
                        top: posY - 24
                    }
                })
            }
        })


        for (let i = 0; i < links.length; i++) {

            links[i].addEventListener('mouseover', () => {
                cursor.classList.add('active')
                follower.classList.add('active')
            })

            links[i].addEventListener('mouseout', () => {
                cursor.classList.remove('active')
                follower.classList.remove('active')
            })

        }


        // body.addEventListener('mouseout', () => {
        //   cursor.classList.add('hidden')
        //   follower.classList.add('hidden')
        // })


    })

}

