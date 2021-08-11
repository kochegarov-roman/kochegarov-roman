import PubSub from 'pubsub-js';
import {TimelineMax, Expo} from 'gsap'

PubSub.subscribe( 'gotoSlide', function(msg, data) {
    $('.pagination li').removeClass('is-active');
    $(`[data-gotoslide="${data.to}"]`).addClass('is-active');
});

const t1 = new TimelineMax({paused: true});

t1.to(".one", 0.4, {
    y: 6,
    rotation: 45,
    ease: Expo.easeInOut
});

t1.to(".two", 0.4, {
    y: -6,
    rotation: -45,
    ease: Expo.easeInOut,
    delay: -0.3
});

t1.to(".menu", 0.5, {
    top: "0%",
    height: '100vh',
    padding: '100px',
    width: "max-content",
    ease: Expo.easeInOut,
    delay: -0.5
});

// t1.staggerFrom(".menu ul span", 0.5, {x: 200, opacity: 0, ease:Expo.easeOut}, 0.3);

t1.reverse();
$(document).on("click", ".toggle-btn", function() {
    t1.reversed(!t1.reversed());
});

// $(document).on("click", "a", function() {
//   t1.reversed(!t1.reversed());
// });

