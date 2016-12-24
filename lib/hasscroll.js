function hasScroll(dom){
    var scrollStatus={
        x:false,
        y:false,
        xheight:0,
        ywidth:0
    }
    var xheight= (dom.offsetHeight-4)-dom.clientHeight ;
    if(xheight>0){
        scrollStatus.x=true;
        scrollStatus.xheight=xheight;
    }
    var ywidth= dom.offsetWidth-4-dom.clientWidth;
        if(ywidth>0){
        scrollStatus.y=true;
        scrollStatus.ywidth=ywidth;
    }
    return scrollStatus;
}