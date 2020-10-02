/********** v7 **********/

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
