import PubSub from "pubsub-js";
// import {TimelineMax} from 'gsap';
import {TimelineMax, TweenMax} from 'gsap'

const $ctaCircle = $(`.cta-circle-inner`);
TweenMax.to($ctaCircle, 1, {rotation:360, repeat:1})


const $elementsArrows = $(`.cta-scroll-arrow-part`);
const scrollArrowsAnim = new TimelineMax();
scrollArrowsAnim.staggerFromTo($elementsArrows, 3, {opacity:1}, {opacity:0.2}, {each: 1, repeat:-1})


PubSub.subscribe('gotoSlide', function(msg, data){

    const $currentSlide = $(`[data-slide=${data.from}]`);
    const $newSlide = $(`[data-slide=${data.to}]`);
    const elements = $currentSlide.find('[data-stagger]');
    const newElements = $newSlide.find('[data-stagger]');

    const $currentNumberSlide = $currentSlide.find('.circle-progress');
    const $newNumberSlide = $newSlide.find('.circle-progress');

    new TimelineMax()
        .set($currentSlide,{zIndex:20})
        .set($newSlide,{zIndex:30});

    const t1 = new TimelineMax();

    t1
        .staggerFromTo(elements,0.3,{y:0,opacity:1},{y:-20,opacity:0},0.1)
        .to($currentSlide,1, {y:'-100%', rotation:'90', opacity: 0})
        .fromTo($newSlide,1,{y:'100%'},{y:'0%', opacity: 1, rotation:'0'},0.1)
        .staggerFromTo(newElements,0.1,{y:20,opacity:0},{y:0,opacity:1},0.1,'-=0.4')
        .fromTo($currentNumberSlide, 1, {'stroke-dashoffset': 0},{'stroke-dashoffset':201}, 1.1)
        .fromTo($newNumberSlide, 20, {'stroke-dashoffset': 201},{'stroke-dashoffset':0}, 0.1);

    // $(`[data-slide=${data.from}]`).css({opacity: 0});
    // $(`[data-slide=${data.to}]`).css({opacity: 1}); stroke-dashoffset: 201
})
