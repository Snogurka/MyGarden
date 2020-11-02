/********** v.7.1 **********/
/* Changes:
  -- photos on mobile: tap to increase/decrease
*/
 
//response to clicking on the "More" button located on the home page
//the function shows archived photos, one at a time
function showArchive(btn) {
  let pars = document.getElementsByClassName("archive");
  for (let i = 0, l = pars.length; i < l; i++) {
    if (btn.innerText === "Hide Archives") {
      pars[i].style.display = "none";
      if(i === l-1){btn.innerText = "More"};
    }
    else if (pars[i].style.display != "block") {
      pars[i].style.display = "block";
      if(i === l-1){btn.innerText = "Hide Archives"};
      break;
    }
  }
}


//this function is the responce on a click on the container class div
function containerClick(tgt) {
  
  //this funtion is for mobile devices with screen less than 768px only
  //for others, the photos are smaller and are increased on hover
  if (window.screen.width > 768) {
//     return;
  }
  //the transf variable transforms the supplied element elt
  let transf = function (elt, scaleVal, transVal) {
    //if the picture is on the left, the translate value is negated
    if (elt.className === "lefty") {
      elt.style.transform = "scale("+ scaleVal +") translate(" + -1*transVal + "%)";
    } 
    //for diagonal picture, reapply the rotation to keep it
    else if (elt.className === "diag") {
      elt.style.transform = "scale("+ scaleVal +") translate("+ transVal + "%) rotate(-35deg)";
    }
    //all other pictures that are on the right, scale and translate
    else {
      elt.style.transform = "scale("+ scaleVal +") translate("+ transVal + "%)";
    }
    //adjust the z-index so that the clicked photo stays on top
    transVal?elt.style.zIndex=10:elt.style.zIndex=2;
  }
  
  //when an image is clicked, if it's less than 80% of the screent's width, 
  //increase it by calling transf() function
  if (tgt.tagName.toUpperCase()==="IMG" && 
      tgt.getBoundingClientRect().width/window.screen.width < 0.8) {
    //the scale adjuster is calculated so that the photo takes 90% of the screen width
    //the translate value is about 11.5 times larger than the scale value
    let scaleAdj = window.screen.width*0.9/tgt.getBoundingClientRect().width;
    transf(tgt, scaleAdj, -scaleAdj*11.5);
  } 
  else {
    let images = document.getElementsByTagName("img");
    for (let i = 0, len = images.length; i < len; i++){
      transf(images[i], 1, 0);
    }
  }
}

var times = 0;
window.onscroll = function() {
  if (times < 1000 && times%25 === 0) {
  spring();
  }
  times++;
}

//creates and appends flower divs to the left and right margins of the page
function spring() {
  //create a div that will represent a dogwood flower
  let flower = document.createElement("div");
  flower.className = "flower";

  //set random top and left flower position, within the left and right "margins"
  
  //limit the top offset to the the range betwen upper 25th and third of the screen, so that the flowers are on the upper branches
  let randH = Math.floor(
    Math.random() * (window.screen.height/3-window.screen.height/24)) + 
      Math.floor(window.screen.height/24);
  //every random time divisible by 5, place the flower on the lower branches
  randH % 5 === 0 ? randH += window.screen.height / 1.5 : randH;
  
  //the random width is limited to the margin width, set in home.css file to: 
  //50 for screen over 768px and 30 for under
  let randW = Math.floor(
    Math.random() * 
  //could also get the margins as below (need ...[0].currentStyle, marginLeft for windows)
    parseInt(window.getComputedStyle(document.getElementsByClassName("container")[0]).marginLeft)/2
//     (window.screen.width - document.getElementsByClassName("container")[0].getBoundingClientRect().width)/4
  );
  flower.style.top = randH + "px";
  flower.style.left = randW + "px";

  //append the flower randomly to the left or right sides, onto the "margins"
  if (Math.floor(Math.random()*Math.floor(2))%2===0) {
    document.getElementsByClassName("leftSide")[0].appendChild(flower);    
  }
  else {
    document.getElementsByClassName("rightSide")[0].appendChild(flower);
  }
}
