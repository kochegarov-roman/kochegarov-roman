import PubSub from 'pubsub-js';

export default class Paginator {
  constructor(){
    this.scrollEvents();
    this.clickEvents();
    this.activeSlide = 1;
    this.canGo = 1;
    this.max = 5;
    this.delay = 1600;
    this.activeTimeout = null;
  }

  deleteWheelEvents(){
    $(window).off('wheel');
  }

  // eslint-disable-next-line class-methods-use-this
  scrollEvents() {
    const self = this;

    $(window).on('wheel', (e) => {
      if(!self.canGo) return;
      const ne = e.originalEvent;
      // console.log(ne);
      const direction = ne.deltaY>0 ? 1: -1;
      const newslide = self.activeSlide + direction;
      if (newslide>self.max || newslide<1) return;
      self.canGo = false;
      PubSub.publish('gotoSlide', {from: self.activeSlide, to: newslide});
      self.activeSlide = newslide;
      setTimeout(() => self.canGo = true, self.delay);

      if (self.activeTimeout) clearInterval(self.activeTimeout);
      self.activeTimeout = setInterval(() => self.nextSlide(), 20000);
    })

    $('.scroll-i').click(
      function (e){
        const nextslide = e.target.getAttribute('data-nextslide');
        console.log('nextslide', nextslide);
        if (nextslide)
          nextslide === 'true' ? self.nextSlide() : self.nextSlide(false);
      }
    )

    $(window).keyup((e)=>{
      console.log(e.keyCode, self.canGo)
      if(!self.canGo) return;
      const arrKeyTo = [38, 39, ];
      const arrKeyBack = [37, 40];
      // if( 40 < e.keyCode < 37) return;

      const direction = arrKeyTo.includes(e.keyCode) ? 1 : arrKeyBack.includes(e.keyCode) ? -1 : null;
      console.log(self.activeSlide, direction, self.canGo)
      if(!direction) return;


      const newslide = self.activeSlide + direction;
      if (newslide>self.max || newslide<1) return;
      self.canGo = false;
      PubSub.publish('gotoSlide', {from: self.activeSlide, to: newslide});
      self.activeSlide = newslide;
      setTimeout(() => self.canGo = true, self.delay);

      if (self.activeTimeout) clearInterval(self.activeTimeout);
      self.activeTimeout = setInterval(() => self.nextSlide(), 20000);

    })
  }


  nextSlide(r=true){

    const self = this;
    if(!self.canGo) return;
    self.canGo = false;
    let newslide;
    if (r) {
      newslide = self.activeSlide < self.max ? self.activeSlide + 1 : 0;
    }else{
      newslide = self.activeSlide > 1 ? self.activeSlide - 1 : 0;
    }

    if (newslide && newslide !== self.activeSlide){
      PubSub.publish('gotoSlide', {from: self.activeSlide, to: newslide});
      self.activeSlide = newslide;
    }
    setTimeout(() => self.canGo = true, self.delay);

  }


  // eslint-disable-next-line class-methods-use-this
  clickEvents() {
    const self = this;

    function goo(e){
      console.log('click', self.canGo);
      e.preventDefault();
      if(!self.canGo) return;
      self.canGo = false;
      const newslide = $(e.currentTarget).data('gotoslide');
      console.log(newslide, self.activeSlide);

      if (newslide !== self.activeSlide){
        PubSub.publish('gotoSlide', {from: self.activeSlide, to: newslide});
        self.activeSlide = newslide;
        setTimeout(() => self.canGo = true, self.delay);

        if (self.activeTimeout) clearInterval(self.activeTimeout);
        self.activeTimeout = setInterval(() => self.nextSlide(), 20000);
      }

    }

    $('.pagination li').on('click', (e) => {
      self.canGo = true;
      goo(e);
    })

    $('.top-menu').on('click', (e) => {
      self.canGo = true;
      goo(e);
    })

  }

}
