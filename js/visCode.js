/********** v.7.3 **********/

/*  NEW CODE, 1.1.21
  - keep settings the same: optionality to pick a season, set warnings and units
  - on click in the blue area 
      - a drawing of a digging start
      - choices of a plant or garden
      - choices to delete all plants and gardens
  

*/
/* TO DO:
 - new: code for plant being moved in/out of a garden: 
    - the plant needs to "show" that it's being moved in/out of garden
    - the plants should not be hidden onClick of a garden
    - maybe sun shouldn't be hidden either?
 - size/sun options should toggle starting on 1st click, not scnd
 - mobile plants move too fast
 - shouldn't be able to move plant out of the screen
 - gardens need to be smaller on mobile
 - new: maybe add optionality to copy plant/garden
 - new: add season simulation: pick a month -> color what's in bloom
 - research: ontouchstart etc and ondblclick are not allowed for SVG (in html)
*/


/* Important: 
   Ids are created for each plant's and garden's groups and are prefixed 
   with p_ for plants, with g_ for gardens;
*/

var plantingAreas = [];
var xmlns = "http://www.w3.org/2000/svg";
//the ratio of actual size to rectangles shown is: 1 inch = 2 pixels
var sizeAdj = 2;

//////////////////////////////////////////////////////////////////////
//this function is called on window load and loads existing garden design from user's local storage
function myMain(){
  svgPlace = document.getElementById("svgArea");
  // munit = my unit, the font size, if set to 14, munit is ~7.11
  munit = Math.round((Number(window.getComputedStyle(svgPlace, null).getPropertyValue("font-size").replace("px",""))/1.9 + Number.EPSILON) * 100) / 100;  
  if(checkLocalStorage()){
    loadExistingDesign();
  }
}

//////////////////////////////////////////////////////////////////////
//check if local storage functionality is available to the user
function checkLocalStorage() {
  if (typeof(Storage) !== "undefined"){
    try {
      localStorage.getItem("aas_myGardenVs_warnings");
      return true;
    }
    catch(error){
      console.error(error);
	    alert("Your browser does not support web storage or your local file restrictions are not disabled. You garden design data will not be saved.");
      return false;
    }
  } else {
    alert("Your browser does not support web storage or your local file restrictions are not disabled. You garden design data will not be saved.");
    return false;
  }
}

//////////////////////////////////////////////////////////////////////
//check if there are plants added to local storage from the db tab by the user;
//if yes, the function appends their names to the UL drop down; 
function checkStoredData(ULlist) {
  // if the existing row counter is retrieved, it is recorded in the addedRowCounter variable
  let plantCounter = localStorage.getItem("aas_myGardenDb_rPlntsCntr");
  // return if myGardenDb_rPlntsCntr has not been set in local storage and there is no existing data to pull
  if (!plantCounter) {
    return;
  } 
  //the following for loop goes through saved plants added by user;
  for (var i = 0, len = plantCounter.split(",").length; i < len; i++) {
    //once the data is pulled from local storage, append it to the UI list of plant names
    let	addedPlant = JSON.parse(localStorage.getItem("aas_myGardenDb_plnt"+i));
    let liText = document.createElement("li");
    liText.className = "customChoice";
    liText.title = addedPlant[4]+", Sun:"+addedPlant[11]; //plant class is 4th index, sun is 11th;
    liText.innerHTML = addedPlant[1]; //common name is index one, latin name is zero
    ULlist.appendChild(liText);
  }
}

//////////////////////////////////////////////////////////////////////
//this function pulls the data of previously designed gardens and plants and recreates it
function loadExistingDesign() {
  //  capture the number of gardens created
  let gardens = localStorage.aas_myGardenVs_grdns;
  if (gardens){
    gardens = gardens.split(",");
    for (var i = 0, l = gardens.length; i < l; i++){
      //pull gardens counter from local storage
      let garden = localStorage.getItem("aas_myGardenVs_grdn"+gardens[i].toString());
      //recreate gardens based on the counter and stored garden id, x, y, w, h, tx, 
      //ty, nm (name), sn (sun)
      if (garden) {
        garden = garden.split(",");
        addGarden(
          { 
            gId:gardens[i], 
            x:Number(garden[0]),
            y:Number(garden[1]),
            w:Number(garden[2]),
            h:Number(garden[3]),
            tx:Number(garden[4]),
            ty:Number(garden[5]),
            nm:garden[6],
            sn:garden[7]});
      }
    }
  }
  //  capture the number of plants created
  let plants = localStorage.aas_myGardenVs_plnts;
  if (plants){
    plants = plants.split(",");
    for (var i = 0, l = plants.length; i < l; i++){
      let plant = localStorage.getItem("aas_myGardenVs_plnt"+plants[i]);
      if (plant) {
        plant = plant.split(",");
        //recreate each plant by supplying pId (plant id), x, y, w (width), h (height), tx (translate x), 
        //ty, nm (name), gId (group id), lnm (latin name), img (bln image showing), clr (color)
        addPlant({
          pId:plants[i], 
          x:Number(plant[0]),
          y:Number(plant[1]),
          w:Number(plant[2]),
          h:Number(plant[3]),
          tx:Number(plant[4]),
          ty:Number(plant[5]),
          nm:plant[6], 
          gId:plant[7], 
          lnm:plant[8],
          img:plant[9], 
          clr:plant[10]
        });
      }
    }
  }
}

//////////////////////////////////////////////////////////////////////
//settings menu drop down, called by clicking on settings button
function settingsMenu(clkdElt) {

  if (clkdElt.className === "fa fa-fw fa-cog") {
    clkdElt = clkdElt.parentElement;
  }
  else if (clkdElt.className === "customChoice") {
    switch (clkdElt.innerText) {
      case "Warnings\xa0On":    
        localStorage.setItem("aas_myGardenVs_warnings", 1);
        clkdElt.innerText = "Warnings\xa0Off";
        return;
			case "Warnings\xa0Off":
        localStorage.setItem("aas_myGardenVs_warnings", 0);
        clkdElt.innerText = "Warnings\xa0On";
        return;
      case "Units: in":
        localStorage.setItem("aas_myGardenVs_units", 1);
        clkdElt.innerText = "Units: cm";
        toggleCmIn("cm");
        return;
      case "Units: cm":
        localStorage.setItem("aas_myGardenVs_units", 0);
        clkdElt.innerText = "Units: in";
        toggleCmIn("in");
        return;
      default:
        //respond to season changing, todo: future code
        alert("this is yet to come");
        console.log("season change requested");
//         clkdElt = clkdElt.parentElement;
        return;   
                             }	
  }
  
  //if the button already has a dropdown menu it has more than one child (icon), remove the menu
  if (clkdElt.childElementCount > 1) {
    clkdElt.removeChild(clkdElt.children[1]);
  }
  //else, create the settings menu
  else {
    let warningsSetting = localStorage.getItem("aas_myGardenVs_warnings");
    Number(warningsSetting)?warningsSetting="Warnings\xa0Off":warningsSetting="Warnings\xa0On";
    //Units: 0 - inches/feet; 1 - cm/m;
    let unitSetting = localStorage.getItem("aas_myGardenVs_units");
    Number(unitSetting)?unitSetting="cm":unitSetting="in"
    clkdElt.appendChild(addDropMenu(menu = {
                values:["Seasons", warningsSetting, "Units: "+unitSetting],
                //the below are x and y positions of the clicked settings buttom
                xPos: (clkdElt.clientWidth+5).toString()+"px", 
                yPos: (clkdElt.clientHeight-25).toString()+"px",
                }));
  }
}

//////////////////////////////////////////////////////////////////////
//this function is activated when a user selects a garden or plant from 
//the 'add a garden or a plant' drop down menu; based on what's clicked, 
//the appropriate add garden/plant function is called
function addGardenPlantMenu() {
  let clkdElt = event.target;
  if (clkdElt.innerText === "Garden") {
  //if clicked in SVG area on a garden option of dropdown menu
    hideDropDown();
    addGarden({
      gId:null,
      x:parseFloat(event.target.parentElement.style.left),
      y:parseFloat(event.target.parentElement.style.top), 
      w:120,
      h:60,
      tx:0,
      ty:0,
      nm:"New Garden", 
      sn:null
    });
  } 
  //if clicked on a plant choice of dropdown menu
  else if (clkdElt.innerText === "Plant") {
    let dropDownMenu = addDropMenu(pos = {
      xPos: (event.pageX-5).toString()+"px",
      yPos: (event.pageY-30).toString()+"px"
    });
    dropDownMenu.addEventListener("click", function() {
      addGardenPlantMenu();
    })
    document.body.appendChild(dropDownMenu);
  } 
  //if a Delete All Plants or Delete All Gardens options are clicked
  else if (clkdElt.innerText === "Delete\xa0All\xa0Plants" 
           || clkdElt.innerText === "Delete\xa0All\xa0Gardens") {
    
    //confirm the removal of all plants or gardens
    if (!confirm("Would you like to " + clkdElt.innerText + "?")){
      return;
    }
    //capture plnts or grnds in a variable, based on a choice clicked
    let eltsToDelete = null;
    clkdElt.innerText[11]==="P"?eltsToDelete="plnts":eltsToDelete="grdns";
      
    //if gardens or plants exist and are stored, loop through their counters and delete
    //their entries from localStorage and from the page design
    if (localStorage.getItem("aas_myGardenVs_"+eltsToDelete)) {
      let counter = localStorage.getItem("aas_myGardenVs_"+eltsToDelete).split(",");
      for (let i = 1, l = counter.length; i<=l; i++) {
        //remove each plant/garden from localStorage
        localStorage.removeItem("aas_myGardenVs_"+eltsToDelete.substring(0,4)+i);
        //remove each plant/garden from the designed garden
        let chld = svgPlace.getElementById(eltsToDelete[0]+"_"+i);
        chld.parentElement.removeChild(chld);
      }
      //remove the plant/garden counter
      localStorage.removeItem("aas_myGardenVs_"+eltsToDelete);
      hideDropDown();
    }
  }
  //if clicked on a plant name, create a plant
  else if (clkdElt.classList.contains("customChoice")) { 
    addPlant({
      pId:null, 
      x:parseFloat(event.target.parentElement.style.left),
      y:parseFloat(event.target.parentElement.style.top),
      w:Number(event.target.getAttribute("data-avgw")),
      h:Number(event.target.getAttribute("data-avgh")),
      tx:0, 
      ty:0, 
      nm:event.target.innerText, //plant's common name
      gId:0, //a garden id, where the new plant is planted, 0 at first
      lnm:event.target.getAttribute("data-lnm"), //plant's latin name
      img:(event.target.getAttribute("data-img")), //image file & display and rect display value
      clr:0 //initially, the color value is a darker green which is set within addPlant() when this value is 0
      });
  }
}

//////////////////////////////////////////////////////////////////////
//response to escape and alike, this function hides drop down menus
function tapClickKey(evt) {
  if (evt.keyCode){
    //if return or escape are clicked
    if (evt.keyCode === 13 || evt.keyCode === 27){
      hideDropDown();
    }
//     //if delete/backspace or clear are clicked todo:
//     if (evt.keyCode === 8 || evt.keyCode === 12){
//       dblTouch(evt);
//     }
  }
}

//////////////////////////////////////////////////////////////////////
function hideDropDown() {
  //check if there already is a dropDown menu and remove it
  //there should not be more than one dropDown menu at a time
  //the dropDown class  is applied to settings, 
  //add garden/plant, and add a plant UL menus
  let dropMenus = document.getElementsByClassName("dropDown");
  if (dropMenus[0]) {
    dropMenus[0].remove();
  }
  //check and hide plant info boxes:
  let plantData = ["fauxLi", "plantInfo"];
  for (var p = 0, len=plantData.length; p < len; p++) {
    let plantInfoBoxes = document.getElementsByClassName(plantData[p]);
    if (plantInfoBoxes) {
      for (var i = 0, l = plantInfoBoxes.length; i < l; i++) {
        plantInfoBoxes[0].remove();
      }   
    }
  }
}

//////////////////////////////////////////////////////////////////////
//this function returns a drop down menu UL with the values supplied in menu parameter
function addDropMenu(menu) { 
	hideDropDown();
  let dropMenu = document.createElement("ul");
  dropMenu.className = "dropDown";
  if (menu.values) {
    for (var i = 0, l = menu.values.length; i < l; i++){
      let liText = document.createElement("li");
      liText.className = "customChoice";
      liText.innerHTML = menu.values[i];
      dropMenu.appendChild(liText);
    }  
  } 
  //if no menu supplied, retrieve the data from the external plants.json file, shared with db tab
  else {
    var xhr = null;
    if (window.XMLHttpRequest) {
      //code for modern browsers
      xhr = new XMLHttpRequest();
    } else {
      //code for old IE browsers
      xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {// && xhr.status == 200)
        var myObj = JSON.parse(this.responseText);
        for (x in myObj) {
          let liText = document.createElement("li");
          liText.className = "customChoice";
          //pulling common(2) and latin(1) names, class(3), height(4), width(5), sun(10), image(29)
          liText.title = myObj[x][3]+", likes "+myObj[x][10];
          liText.innerHTML = myObj[x][0];
          liText.setAttribute("data-lnm", x);
          //extract average height and width
          liText.setAttribute("data-avgh",getAvgNum(myObj[x][4]));
          liText.setAttribute("data-avgw",getAvgNum(myObj[x][5]));
          //instead of pulling the plant's image location, only check if the image exists; 
          //all images are in the same location and are named as pictures/CommonName.jpg
          if(myObj[x][29].indexOf("<!") === -1){
            //in localStorage, img/rect indicator is in 9th place and has the following values: 
            //	0-both img&rect are hidden; 
            //	1-rect is hidden, img isn't available;
            //	2-rect is shown, img is hidden; 
            //	3-rect is shown, img is not available;
            //	4-rect is hidden, img is shown;
            //	5-both img&rect are shown;
            liText.setAttribute("data-img", 0);
          } 
          else {
	          liText.setAttribute("data-img",1);
          }
          dropMenu.appendChild(liText);
        }
        checkStoredData(dropMenu);
        //maybe add cancel option
      } else if (this.status == 404) {//was xhr instead of this
      console.log("text file (source) not found");
      }
    }
    xhr.open("get", "plants.json", true);
    xhr.send();
  }
  dropMenu.style.left = menu.xPos;
  dropMenu.style.top = menu.yPos;
  return dropMenu;
}

//////////////////////////////////////////////////////////////////////
//extract avg height and width, inches to pixels ratio 1:1
function getAvgNum(origVal) {
  //RegEx note: 
  //map performs an action on each element of an array, 
  //reduce performs an action on all elements
  let inchVal = origVal.match(/\d+(''|")/g);
  let footVal = origVal.match(/\d+'(?!')/g);//to get feet: digit followed by quote that's not followed by anouther quote
  let finalExtracted = [0];
  if (inchVal && footVal){finalExtracted = inchVal.map(x=>parseFloat(x)).concat(footVal.map(x=>parseFloat(x)*12));} 
  else if (inchVal) {finalExtracted = inchVal.map(x=>parseFloat(x));}
  else if (footVal) {finalExtracted = footVal.map(x=>parseFloat(x)*12);}
  finalExtracted = finalExtracted.reduce((a,b)=>(a+b))/finalExtracted.length.toString();
// 	finalExtracted === 0?finalExtracted=1:finalExtracted; //todo: how to deal with plants without width and height?
	return finalExtracted;
}

//this function converts the supplied size value. if two arguments are supplied, the
//returned result is one part (all cm or in); if one argument (all cm or in), return 
//two part size (m and cm or ft and in)
//the incoming size is always in inches
function formatSizeDisplay(x1, x2) {
  
  //x = units (metric 1 or not 0), x1 = higher group (m or feet), x2 = lower group (cm or in)
  let x = Number(localStorage.aas_myGardenVs_units);
  let ind1 = "", ind2 = "", denom = 1;
  //if metric, 
  //  the incoming size that's in inches needs to be converted to cm
  //  the denominator used for formatting is 100, otherwise 12
  //  the displayed format will show m & cm, otherwise ' and "
  if (x){
    x1 *= 2.54;
    denom = 100;
    ind1="m";
    ind2 = "cm";
  } 
  else {
    denom = 12;
    ind1="'";
    ind2 = '"';
  }
  
  //if a second argument is supplied, convert to small units and return one number
  if (x2){
    return parseInt(x1*denom+x2,10);
  }
  //if there are bigger units and a remainder, display bigger and smaller units
  else if ((parseInt(x1/denom,10)) && (parseInt(x1%denom,10))) {
    return parseInt(x1/denom,10)+ind1 + parseInt(x1%denom,10)+ind2;
  }
  //if a bigger unit is 0 and smaller is available (i.e. there is a remainder)
  else if (!(parseInt(x1/denom,10)) && (parseInt(x1%denom,10))) {
    return parseInt(x1%denom,10)+ind2;
  }
  //if there are bigger units and no smaller units
  else if ((parseInt(x1/denom,10)) && !(parseInt(x1%denom,10))) {
    return parseInt(x1/denom,10)+ind1;
  }
  //otherwise display 0 and smaller unit indicator
  else {
    return 0+ind2;
  }
//     let result = null;
//     x1%12?result=parseInt(x1/denom,10)+ind1+parseInt(x1%denom,10)+ind2:result=parseInt(x1/denom,10)+ind1;
//     return result;
}

//////////////////////////////////////////////////////////////////////
//this function pulls specific plant info using Latin Name stored in desc of a plant
function toggleCmIn(units) {
  let vals = ['grdns', 'plnts'];
  for (let x = 0, l = vals.length; x < l; x++) {
    if (localStorage.getItem("aas_myGardenVs_"+vals[x])) {
      let counter = localStorage.getItem("aas_myGardenVs_"+vals[x]).split(",");
      for (let i = 1, l = counter.length; i<=l; i++) {
        //for each plant or garden, update the size indicators to display in units chosen
        //the units in local storage and settings menu are updated before this is called
        let rect = svgPlace.getElementById(vals[x][0]+"_"+i).getElementsByTagName("rect")[0];
        if (rect) {
          let sizers = svgPlace.getElementById(vals[x][0]+"_"+i).getElementsByClassName("sizeInd");
          sizers[0].textContent = formatSizeDisplay(Number(rect.getAttributeNS(null, "height"))/2);
          sizers[1].textContent = formatSizeDisplay(Number(rect.getAttributeNS(null, "width"))/2);
        }
      }
    }
  }
}


//////////////////////////////////////////////////////////////////////
//this function pulls specific plant info using Latin Name stored in desc of a plant
function getPlantInfo(clkdElt, displayVal){  
  //get the plant's additional data
  var xhr = null; 
  if (window.XMLHttpRequest) {
    // code for modern browsers
    xhr = new XMLHttpRequest();
  } else {
    // code for old IE browsers
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
  }
  
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {// && xhr.status == 200){
      //in myObj, the data is accessed using Latin Name as the key, stored in the desc field of each plant
      let myObj = JSON.parse(this.responseText);
        //Add COLOR CHOICES
        //if the plant has flowering colors options, capture them in an array, 
        //which is stored in the "desc" field of the plant's color, 
        //while the displayed color value is the normal color name
        var plantColors = myObj[clkdElt.getAttributeNS(null, "desc")][6];
        
        //if no colors are available place one default value green in the array
        if (plantColors === "") {
          plantColors = ["green"]; //used to have plantColors.unshift("green");
        } 
        else if(plantColors.split(",").length > 0) {
          plantColors = plantColors.split(", ");
          if (!plantColors.includes("green"))
          {        
            plantColors.unshift("green");
          }
        }
        //note, text code for a down arrow txt:"\uf0d7"

        //custom colors, the var is assigned a function
        var convertColors = colorCoder;
        let offset = 2;
        for (var i=0, l=plantColors.length; i<l; i++){
        //convert colors to camel case, for when composed of more than one word
        //the text shows normal color name, with spaces, while desc holds camelCased color name
        clkdElt.parentElement.appendChild(makeText(
          {x:Number(clkdElt.nextElementSibling.getAttributeNS(null, "x"))+munit,
           y:Number(clkdElt.getAttributeNS(null, "y"))+munit*offset,
           cls:"fauxLi",
           clr:convertColors(plantColors[i]),
           txt:plantColors[i],
           desc:convertColors(plantColors[i])   
          }));
          offset += 2;
        }

        offset = 2;
        //Add OTHER INFO fields
        //The "desc" field of the clkdElt (plant name) holds latin name
        //This "latin name" is used as a key to pull all other information fields
        var plantInfoFields = {7:"Leafyness: ", 8:"Bloom Time: ", 10:"Sun: ",
                               11:"Roots: ", 12:"Garden Q-ty: ", 16:"Companion: ", 
                               17:"Ally: ", 18:"Enemy: ", 19:"Soil: "};
        for (var f in plantInfoFields){
          if (myObj[clkdElt.getAttributeNS(null, "desc")][f] === "") {
            continue;
          }
          clkdElt.parentElement.appendChild(makeText(
            elt={x:Number(clkdElt.nextElementSibling.getAttributeNS(null, "x"))+munit*7,
                 y:Number(clkdElt.getAttributeNS(null, "y"))+munit*offset,
                 cls:"plantInfo",
                 clr:"rgb(0, 17, 227)",
                 txt:plantInfoFields[f]+myObj[clkdElt.getAttributeNS(null, "desc")][f]
                }));
          offset += 2;
        }
    } else if (this.status == 404) {//was xhr. instead of this.
    console.log("text file (source) not found");
    }
  }
  xhr.open("get", "plants.json", true);
  xhr.send();
}

//////////////////////////////////////////////////////////////////////
//this function converts color codes to strings and holds custom color specs 
function colorCoder (string) {
  let colorCodes = {
    "green":"rgb(0,100,0)",
    "darkgreen":"rgba(0,100,0,0.75)",
    "coral":"rgb(255, 102, 102)",
    "creamy white":"rgb(255, 253, 230)",
    "dark purple":"rgb(103, 0, 103)",
    "deep green":"rgb(0, 102, 0)",
    "emerald green":"rgb(38, 115, 38)",
    "greenish-white":"rgb(217, 242, 217)",
    "lilac":"rgb(230, 204, 255)",
    "peach":"rgb(253, 217, 181)",
    "pinkish-lavender":"rgb(242, 211, 227)",
    "purple red":"rgb(192, 0, 64)",
    "purplish-pink":"rgb(192, 96, 166)",
    "yellowish-green":"rgb(198, 210, 98)"};
	//if an rgb code is sent, return it's normal, displayable name
  if (string.slice(0,3) === "rgb") {
    for(var key in colorCodes) {
      if(colorCodes[key] === string) {
          return key;
      }
    }
  } 
  //if a color name that needs to be converted is sent, return rgb
  else if (string in (colorCodes)) {
    return colorCodes[string];
  }
  //otherwise return a color name without spaces in camel case
  else {
    return string.replace(/\s+(.)/g, function (match, group) { 
      return group.toUpperCase()  
    })
  }
}

//////////////////////////////////////////////////////////////////////
//toggle the display of the size, width and height indicators, 
//and resizing triangle for plants 
function sizersDisplay(eltGrp, displayVal) {
  let sizers = [];
  sizers.push(eltGrp.getElementsByClassName("resize")[0]);
  sizers.push(eltGrp.getElementsByClassName("sizeInd")[0]);
  sizers.push(eltGrp.getElementsByClassName("sizeInd")[1]);
  for (var i = 0, l=sizers.length; i < l; i++) {
    sizers[i].style.display = displayVal;
  }
}

//////////////////////////////////////////////////////////////////////
//this function creates and saves to Local Storage an SVG group
//that contains brown rectangle representing dirt of a planting
//area and functionality to move, resize & delete the group, rename the
//planting area/garden, and set its sun availability.
function addGarden(elt){
  //Check that the local storage is available; if not, check if user wants to proceed without saving
  if (!checkLocalStorage()){
	  if (!confirm("Your design will not be saved because Local Storage is not enabled on this device. Would you like to proceed?")){
	    return;
    }
  }

  //to indicate that a NEW planting area is created as opposed to an existing   
  //one being loaded from local storage, the supplied id for it is set to null
  if (!elt.gId) {
    //setting SUN value for a new garden to a sun icon
    elt.sn = "\uf185";
    //when creating a NEW garden area, as opposed to loading an existing one, create and record 
    //the new garden id: 1 for the first one or the stored garden counter grdnCntr plus one.
    if (!localStorage.aas_myGardenVs_grdns) {
      elt.gId = 1;
      localStorage.setItem("aas_myGardenVs_grdns","1");
    } else {
      let IDs = localStorage.aas_myGardenVs_grdns.split(",");
      elt.gId = Number(IDs[IDs.length-1])+1;
      //add the new garded id to local storage, i.e. update garden counter
      localStorage.aas_myGardenVs_grdns += "," + elt.gId.toString();
    }
    //record the new garden area data in local storage and update the total garden count
    localStorage.setItem("aas_myGardenVs_grdn"+elt.gId, elt.x+ "," + elt.y + "," + 
                         elt.w + "," + elt.h + "," + elt.tx + "," + elt.ty +
                         "," + elt.nm + ",Full");
  }
  
  //class is always garden for a garden, so setting it here
  elt.cls = "garden";
  
  //the group, grp, below keeps all elements of one plant area
  //together so that they move together in the SVG area
  var grp = document.createElementNS(xmlns, "g");
  grp.setAttributeNS(null, "transform", "translate("+elt.tx+", "+elt.ty+")");
  grp.setAttributeNS(null, "id", "g_"+elt.gId); 
  grp.setAttributeNS(null, "class", elt.cls);
  svgPlace.appendChild(grp);

  //the planting area rectangle is in transparent brown (dirt)
  grp.appendChild(makeRect(elt));
  
  //the following creates sun drop down button using supplied text value, stored in
  //sun varianble for an existing garden and sun icon "\uf185" for a new garden
  
  //first, create the Sun Drop Down button with the name and arrow 
  let sunDropDown = makeText({
    x:elt.x+munit*0.5, 
    y:elt.y+munit*1.5, 
    cls:"fauxUl", 
    clr:"rgba(239, 232, 53, 0.75)", 
    txt:elt.sn});
  grp.appendChild(sunDropDown);
  sunChoice(sunDropDown);
	if (elt.sn != "\uf185"){
    sunDropDown.setAttributeNS(null, "display", "none");
  }
  
  //the following creates "Garden Name" editable text element using supplied value for existing and "New Garden" for new
  let gardenName = makeText({
    x:(elt.x+munit*8), 
    y:(elt.y+munit*1.5), 
    clr:"rgba(250, 250, 250, 0.5)", 
    cls:"editable", 
    txt:elt.nm});
  gardenName.setAttributeNS(null, "onfocusout", "changeGardenName(this)");
  grp.appendChild(gardenName);
  
  //the following two SVG texts display the Width and Height of the planting area
  //the width and height are extracted from rect, because they're multiplied by 2
  //width
    grp.appendChild(makeText({
    x:elt.x + Number(grp.children[0].getAttributeNS(null, "width")),
    y:elt.y + Number(grp.children[0].getAttributeNS(null, "height"))-munit,
    cls:"sizeInd", 
    clr:"rgba(101, 105, 70, 0.75)",
    txt:formatSizeDisplay(elt.h)
  }));
  //height
  grp.appendChild(makeText({
    x:elt.x+Number(grp.children[0].getAttributeNS(null, "width"))-munit*5,
    y:elt.y+Number(grp.children[0].getAttributeNS(null, "height"))+munit*1.3, 
    cls:"sizeInd", 
    clr:"rgba(101, 105, 70, 0.75)",
    txt:formatSizeDisplay(elt.w)
  }));
  
  //create the "resizing" triangle displayed in the bottom right corner of the garden rectangle
  let triangle = document.createElementNS(xmlns, "polygon");
  triangle.setAttributeNS(null, "points", createTriPts(
    elt.x+Number(grp.children[0].getAttributeNS(null, "width")), 
    elt.y+Number(grp.children[0].getAttributeNS(null, "height")), 
    "br"));
  triangle.setAttributeNS(null, "class", "resize");
  triangle.setAttributeNS(null, "fill", "rgba(65, 68, 65, 0.75)");
  grp.appendChild(triangle);
}

//////////////////////////////////////////////////////////////////////
//this function creates and returns points for a trianlge as "a,b a,c b,c"
//string, based on the supplied corner and its x & y coordinates
function createTriPts(x, y, crnr) {
  switch (crnr) {
    case "tr":
      return (x-munit*2) + "," + y //X & Y positions of the right side of the rectangle
      + " " + x + "," + y //X & Y positions of the right bottom corner of the rectangle
      + " " + x + "," + (y+munit*2); //X & Y positions of the bottom of the rectangle
    case "br":
      return x + "," + (y-munit*2) //X & Y positions of the right side of the rectangle
      + " " + x + "," + y //X & Y positions of the right bottom corner of the rectangle
      + " " + (x-munit*2) + "," + y; //X & Y positions of the bottom of the rectangle
              }
}

//////////////////////////////////////////////////////////////////////
//this function provides decision making for when a garden is clicked
function gardenFork(clkdElt) {
	//when garden's sun drop down icon is clicked, toggle sun options
  //if the sun drop down choices are already displayed, hide them
  if (clkdElt.classList.contains("fauxUl")){
    if(clkdElt.parentElement.getElementsByClassName("fauxLi").length > 0) {
      hideDropDown();
      return;
    }
   //else, add and display text values of the Sun Drop Down choices
    else {
      hideDropDown();
      toggleSunDropDown(clkdElt.parentElement);
    }  }
	//if clicked on any of the dropped sun choices, implement the choice and hide sun choices
  else if (clkdElt.classList.contains("fauxLi")){
    sunChoice(clkdElt);
    toggleSunDropDown(clkdElt.parentElement);
  }
  //display editing buttons (sun choices, garden name, trash icon) when a garden is clicked
  else if (clkdElt.classList.contains("garden")){
    hideDropDown();
    
    //if garden size is not showing, display it and drop sun icon, not the sun drop down choices
    if (clkdElt.parentElement.getElementsByClassName("resize")[0].style.display === "block") {
      for (var i = 1, l = clkdElt.parentElement.childElementCount; i < l; i++){
        if (i===2){continue;}
        clkdElt.parentElement.children[i].style.display = "none";      
      }
    } else {
      for (var i = 1, l = clkdElt.parentElement.childElementCount; i < l; i++){
        if (i===2){continue;}
        clkdElt.parentElement.children[i].style.display = "block";
      }
    }

  }
}

//////////////////////////////////////////////////////////////////////
//this function adds a plant to the garden, it's called by a click on li or onload
function addPlant(elt) {
  //if the id of elt (pId) is 0 then this is a new plant, as opposed to 
  //one loaded from localStorage; this new plant's pId needs to be set 
  //to either a 1 for a very first plant (when there is nothing in  
  //localStorage.aas_myGardenVs_plnts) or the highest number in 
  //localStorage.aas_myGardenVs_plnts plus one
  if (!elt.pId || elt.pId===0){ 
    if(!localStorage.aas_myGardenVs_plnts){
      elt.pId = 1;
      //record new plant id in the local storage plnts counter
      localStorage.setItem("aas_myGardenVs_plnts","1");
    } else {
      //pull all IDs into an array
      let IDs = localStorage.aas_myGardenVs_plnts.split(",");
      //take the last (highest) ID and add one to it
      elt.pId = Number(IDs[IDs.length-1])+1;
      //record new plant id in the local storage plnts counter
      localStorage.aas_myGardenVs_plnts += ","+elt.pId.toString();
    }
    //record the new plant data in the local storage; 
    //until the color is changed, it's recorded as 0 to avoid storing what's not needed
    localStorage.setItem("aas_myGardenVs_plnt"+elt.pId, elt.x+","+elt.y+","+elt.w+","+elt.h+","
                         +elt.tx+","+elt.ty+","+elt.nm+","+elt.gId+","+elt.lnm+","+elt.img+","+"0");
  }
	if (!elt.clr || elt.clr === "0"){
    elt.clr = "rgba(0,100,0,0.75)";
  }
  
  //the group below, grp, is for keeping all elements of one plant together
  let grp = document.createElementNS(xmlns, "g");
  grp.setAttributeNS(null, "transform", "translate("+elt.tx+", "+elt.ty+")");

  //if the garden id is 0, the plant is free-standing, not a part of a garden
  //note: when data is added to localStorage, null or 0 value is converted to string
  if (!elt.gId || elt.gId === "0") {
    svgPlace.appendChild(grp);
  }
  //otherwise, if garden id is not 0, put the plant in its garden - TODO: needs work
  else {
    let inGarden = svgPlace.getElementById("g_"+elt.gId);
    inGarden?inGarden.appendChild(grp):svgPlace.appendChild(grp);
  }
    
  //the id attribute of the plant SVG element is prefixed with a "p_" to 
  //differentiate from garden id, where it's prefixed with a "g_"
  grp.setAttributeNS(null, "id", "p_"+elt.pId);
  grp.setAttributeNS(null, "class", "plant");
  
  let plantName = makeText({
    x:elt.x, 
    y:elt.y, 
    cls:"plant", 
    clr:colorCoder(elt.clr),
    txt:elt.nm, 
    desc:elt.lnm});
  plantName.setAttributeNS(null, "style", "font-size:17");
  grp.appendChild(plantName);
  
  let plantCog = makeText({
    x:elt.x + Math.round((plantName.getComputedTextLength() + Number.EPSILON)*100)/100, 
    y:elt.y, 
    cls:"plantDown", 
    clr:"rgba(0,100,0,0.75)",
    txt:"\xa0\uf013", 
    desc:elt.lnm});
  grp.appendChild(plantCog);
      
  plantCog = makeText({
    x:elt.x - Math.round((plantCog.getComputedTextLength() + Number.EPSILON)*100)/100, 
    y:elt.y, 
    cls:"plantUp", 
    clr:"rgba(0,100,0,0.75)",
    txt:"\uf013\xa0", 
    desc:elt.lnm})
  grp.appendChild(plantCog);
  
  let halfPt = elt.x
    + Math.round((plantName.getComputedTextLength()/2 + Number.EPSILON)*100)/100;
  //if plant's img value is 2, 3, 5 - display the rectangle shape
  if ([2,3,5].includes(Number(elt.img))) {
    makePlantShape(plantCog, {h:elt.h, w:elt.w, hpt:halfPt});
  } 
	//if plant's img value is 4 or 5 - display the image shape
  if ([4,5].includes(Number(elt.img))) {
		//add image
    grp.appendChild(makePic({
      x:halfPt,
      y:elt.y - munit*2,
      nm:elt.nm
    }));
  }
   
}

//////////////////////////////////////////////////////////////////////
//this function supports clicking on any part of a plant
function plantFork(clkdElt) {
  //when a plant is clicked, toggle its data, pic, colors are added/displayed, 
  let eltPlntNm = clkdElt.parentElement.getElementsByClassName("plant")[0];
  
  //if the cogs before or after the plant's name are clicked, call getPlantInfo()
  //when plantUp (left cog) is clicked
  if (clkdElt.classList.contains("plantUp")) {
    let sd = localStorage.getItem(
      "aas_myGardenVs_plnt"+clkdElt.parentElement.id.substring(2,clkdElt.parentElement.id.length)).split(",");
    
    //if image or size rect are already showing, remove them and hide all menus
    if ([2,3,4,5].includes(Number(sd[9]))){
      for (let i = 0, l = clkdElt.parentElement.getElementsByClassName("pUp").length; i < l; i++){
        clkdElt.parentElement.removeChild(clkdElt.parentElement.getElementsByClassName("pUp")[0]);
      }
      //if img is avail, update to both are hidden, img avail(0), else update to all hidden, img is not avail(1)
      [0,2,4,5].includes(Number(sd[9]))?updateStoredData(clkdElt.parentElement.id, 9, 0):updateStoredData(clkdElt.parentElement.id, 9, 1);
    } 
    
    //else, show image and size rect, update local storage to 3
    else {
      let halfPt = Number(eltPlntNm.getAttributeNS(null, "x"))
      + Math.round((eltPlntNm.getComputedTextLength()/2 + Number.EPSILON)*100)/100;
      
      makePlantShape(clkdElt, {h:sd[3],w:sd[2],hpt:halfPt});
      
      //call add picture if it's available and update local storage to all show(5)
      if (Number(sd[9]) === 0) {
      clkdElt.parentElement.appendChild(makePic({
        x:halfPt,
        y:Number(sd[1]) - munit*2,
        nm:sd[6]
      }));
        updateStoredData(clkdElt.parentElement.id, 9, 5);
      }
      //otherwise, update local storage to just rect is shown(3)
      else if (Number(sd[9]) === 1) {
        updateStoredData(clkdElt.parentElement.id, 9, 3);
      }
    }
  }
  //when plantDown (right cog) is clicked
  else if (clkdElt.classList.contains("plantDown")) {
    //if plant info is already showing (there is at least one fauxLi (color green) present, remove the info
    if (clkdElt.parentElement.getElementsByClassName("fauxLi")[0]) {
      hideDropDown();
    } 
    //else, show plant info
    else {
      hideDropDown();
      getPlantInfo(clkdElt, 0);
    }
  }
  //if one of the color choices is clicked, color the plant name that color
  else if (clkdElt.classList.contains("fauxLi")){
      clkdElt.parentElement.getElementsByClassName("plant")[0].style.fill = clkdElt.getAttribute("desc").trim();
      //update local storage
    if (clkdElt.getAttribute("desc").trim()==="rgb(0,100,0)") {
      updateStoredData(clkdElt.parentElement.id, 10, 0);
    } else {
      updateStoredData(clkdElt.parentElement.id, 10, clkdElt.textContent);
    }
  }
}

//////////////////////////////////////////////////////////////////////
function makePlantShape(elt, specs) {
  //add a RECT, representing the height and width dimentions of the plant
  let plantShape = makeRect({  
    x:specs.hpt, //horizontally, center over plant's name
    y:Number(elt.getAttributeNS(null, "y")) - munit*2, //vertically, slightly (munit*2) above the plant name 
    h:specs.h,
    w:specs.w,
    desc:elt.getAttributeNS(null, "desc"), //todo: NEED this one?
    cls:"plantShape pUp"});
  elt.parentElement.appendChild(plantShape);
  //the RESIZING tools are based on the plant's rectangle, whose y coordinate depends on its height
  //the following two SVG texts display the Width and Height legends of the plant
  //height
  elt.parentElement.appendChild(makeText({
    x:Number(plantShape.getAttributeNS(null, "x"))
    + Number(plantShape.getAttributeNS(null, "width")),
    y:Number(plantShape.getAttributeNS(null, "y")) + munit*2,
    cls:"sizeInd pUp",
    clr:"green", 
    txt:formatSizeDisplay(specs.h)
  }));
  //width
  elt.parentElement.appendChild(makeText({
    x:Number(plantShape.getAttributeNS(null, "x"))
    + Number(plantShape.getAttributeNS(null, "width")) - munit*3,
    y:Number(plantShape.getAttributeNS(null, "y")),
    cls:"sizeInd pUp",
    clr:"green",
    txt:formatSizeDisplay(specs.w)
  }));
  //add the "resizing" triangle
  let triangle = document.createElementNS(xmlns, "polygon");
  triangle.setAttributeNS(null, "points", 
    createTriPts( 
    Number(plantShape.getAttributeNS(null, "x")) 
    + Number(plantShape.getAttributeNS(null, "width")),
    Number(plantShape.getAttributeNS(null, "y")),
    "tr")
  );
  triangle.setAttributeNS(null, "fill", "rgba(0, 128, 0, 0.5)");
  triangle.setAttributeNS(null, "class", "resize pUp");
  elt.parentElement.appendChild(triangle);
} 

//////////////////////////////////////////////////////////////////////
//this function creates an SVG rectangle, using x, y, width, height and class name supplied
//the height and width are multiplied by two for a better visual: 1 plant inch = 2 pixels
function makeRect(specs) {
  if (!specs.w){
    console.log("no width exists for "+specs.desc+", "+specs.nm);
    if (!specs.h){
      console.log("no height exists for "+specs.desc+", "+specs.nm);
    }
  }
  //for plants, the height is subtracted, as the rectangle sits above the supplied y;
  //half of the width is subtracted, to center the rectangle relative to supplied x;
  if (specs.cls.includes("plantShape")) {
    specs.x = specs.x - specs.w*sizeAdj/2;
    specs.y = specs.y - specs.h*sizeAdj;
  }
  let rect = document.createElementNS(xmlns, "rect");
  rect.setAttributeNS(null, "x", specs.x);  //arguments: namespace=null, varName="x", varValue=x
  rect.setAttributeNS(null, "y", specs.y);
  rect.setAttributeNS(null, "width", specs.w*sizeAdj); //plant size is doubled for display improvement
  rect.setAttributeNS(null, "height", specs.h*sizeAdj); 
  rect.setAttributeNS(null, "class", specs.cls);
  rect.setAttributeNS(null, "desc", specs.desc);//todo: when is this needed?
  return rect;
}

//////////////////////////////////////////////////////////////////////
//this function creates an SVG text, using x, y, class name, text and event (optional) supplied
function makeText(elt) {
  let txtElem = document.createElementNS(xmlns, "text");
  if (elt.desc){
    txtElem.setAttributeNS(null, "desc", elt.desc);
  }
  txtElem.setAttributeNS(null, "fill", elt.clr);
  txtElem.setAttributeNS(null, "x", elt.x);
  txtElem.setAttributeNS(null, "y", elt.y);
  txtElem.setAttributeNS(null, "class", elt.cls);
  let txtVal = document.createTextNode(elt.txt);
  txtElem.appendChild(txtVal);
  return txtElem;
}

//////////////////////////////////////////////////////////////////////
//this function adds a picture
function makePic(specs) {
  let imgElem = document.createElementNS(xmlns, "image");
  imgElem.setAttributeNS(null, "class", "plantPic pUp");
  imgElem.setAttributeNS(null, "width", 70); //universal plant image width
  imgElem.setAttributeNS(null, "height", 70); //universal plant image height
  imgElem.setAttributeNS(null, "x", Number(specs.x)-35);
  imgElem.setAttributeNS(null, "y", Number(specs.y)-70);
  imgElem.setAttributeNS(null, "href", "pictures/"+specs.nm.replace(/( |\(|\))/g,"")+".jpg"); //img address
  //opacity is set so that if the plant's size is smaller than the picture it can still 
  //be seen a little through the image; can be made conditional, todo: play with it  
  imgElem.setAttributeNS(null, "opacity", 0.80); 
  return imgElem;
}

//////////////////////////////////////////////////////////////////////
//this function provides functionality for sun dropdown & colors the planting area accordingly
function sunChoice(elt) {
  //update the drop down button text with the value chosen from the drop down menu + dropdown arrow
  elt.parentElement.getElementsByClassName("fauxUl")[0].textContent = elt.textContent + " \uf0d7";
  //update the color intensity of the rectangle based on the sunniness value chosen
  let colors = [77,51,25];
  let multiplier, colorString = "rgba(";
  let cleanChoice = elt.textContent.split(" ")[0];
  switch (cleanChoice){
    case "Full":
      multiplier = 3.00;
      break;
    case "Part":
      multiplier = 2.00;
      break;
    case "Shade":
      multiplier = 1.00;
      break;
    default:
      multiplier = 3.00;
  }
  for (var i = 0; i < 3; i++){
    colorString += (colors[i]*multiplier).toString() + ", ";
  }
  colorString += "0.25)";  //setting transparency aplha
  //update the color of the rect planting area/garden
  elt.parentElement.children[0].setAttributeNS(null, "fill", colorString);
  updateStoredData(elt.parentElement.id, 7, cleanChoice);
}

//////////////////////////////////////////////////////////////////////
function changeGardenName(elt){
//     document.body.style.cursor = "auto";
    elt.style.fontSize="0.9em";
    updateStoredData(elt.parentElement.id, 6, elt.textContent);
}

//////////////////////////////////////////////////////////////////////
//this function updates the localStorage plant or garden data based on
//the id supplied in chgId with the value val at index position ind
function updateStoredData(chgId, ind, val){
  // data is stored in localStorage in the following order (indeces)
  // 0 = x
  // 1 = y
  // 2 = w, width
  // 3 = h, height
  // 4 = tx, translate by x
  // 5 = ty, translate by y
  // 6 = nm, name
  // 7 = sun for a garden, garden group id for a plant
  // 8 = lnm, latin name
  // 9 = display value of image and plant shape:
        //	0-both img&rect are hidden; 
        //	1-rect is hidden, img isn't available;
        //	2-rect is shown, img is hidden; 
        //	3-rect is shown, img is not available;
        //	4-rect is hidden, img is shown;
        //	5-both img&rect are shown;
  //10 = color selected for the plant
  var currData, idPrefix;
  if (chgId.toString()[0]==="p"){
    idPrefix = "plnt";
  } else {
    idPrefix = "grdn";
  }
  chgId = chgId.substring(2,chgId.length); //substring extracts between start and end; 
  //here, get the numeric part of the id, which starts at index 2
  currData = localStorage.getItem("aas_myGardenVs_"+idPrefix+chgId).split(",");
  currData[ind] = val;
  localStorage.setItem("aas_myGardenVs_"+idPrefix+chgId, currData);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
var clickedElement = false;
var coord = null; //coordinate of touch/click adjusted by CTM
var offset = null; //coord adjusted by transform/translate
var transform = null; //item 0 of clickedElement's transform baseVal
var resize = false;   
var moving = false;
var clickX = null, clickY = null; //stores cursor location upon first click

//////////////////////////////////////////////////////////////////////////////////////
//getMousePosition() returns the coordinates in SVG space, defined by the viewBox 
//attribute, using the Current Transformation Matrix to convert clickX and clickY
function getMousePosition(evt) {
  let CTM = document.getElementById("svgArea").getScreenCTM();
    //for mobile, if multiple touches take the first one only
    if (evt.touches) { evt = evt.touches[0]; }
  return {
    x: (evt.clientX - CTM.e) / CTM.a,
    y: (evt.clientY - CTM.f) / CTM.d
  };
}

//////////////////////////////////////////////////////////////////////////////////////
//mouse click or finger touch down
function touchDown(evt) {
  
  //on mouse click or touch down, if there is no drag, display 
  //garden tools or plant features
  
  //for the editable garden name
//   if (!evt.target.classList.contains("editable")) {
//     evt.stopPropagation();
//     evt.preventDefault();
//   }
  
  //the some() method executes the callback function once for each element in the array
  //until it finds the one where call back returns a true value; 
  if (["garden","plant","plantShape","resize","plantPic"].some(
  className => evt.target.classList.contains(className))) {
    
    //determine if it's a move or resize
    evt.target.classList.contains("resize")?resize = true:resize = false;
    
    //group support, the clicked rectangle is always a part of a group
    clickedElement = evt.target.parentElement;
    
    //mobile
    if (evt.touches) { evt = evt.touches[0]; }
    
    //set original click X & Y for resizing
    if (resize){
      clickX = evt.clientX;
      clickY = evt.clientY;
    }
    
    //adjust clicked point by SVG's viewbox
    offset = getMousePosition(evt);

    //get all of clickedElement's transforms
    let transforms = clickedElement.transform.baseVal;

    //ensure the first transform is a translate transform; if the first transform
    //is not a translation or the element does not have a transform, then add one
    if (transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE || transforms.length === 0) {
      let translate = document.getElementById("svgArea").createSVGTransform();
      translate.setTranslate(0, 0);
      clickedElement.transform.baseVal.insertItemBefore(translate, 0);
    }
    //get initial translation amount (item 0 is translate, as ensured above)
    transform = transforms.getItem(0);
    offset.x -= transform.matrix.e;
    offset.y -= transform.matrix.f; 
  }
  
  //detecting a plant being moved into the garden
//   clickedElement.parentElement.id[0]==="g"?inGarden=clickedElement.parentElement.id:inGarden=0;

}

function dragging(evt) {
  if (clickedElement) {
    evt.preventDefault();
    coord = getMousePosition(evt);

    //RESIZING
//     if (evt.target.classList.contains("resize")) {
    if (resize) {
      //mobile
      if (evt.touches) { evt = evt.touches[0]; }

      //clicked element is set to the group, which is the parent of the rectangle
      let rect = clickedElement.getElementsByTagName("rect")[0];

      //adjustments to width and height: the X and Y of the point of click/touch 
      //minus starting X and Y point of click
      let adjW = evt.clientX - clickX;
      let adjH = evt.clientY - clickY;

      //the new width and height are stored in newW & newGH (garden height) & newPH (plant height) 
      let newW = Number(rect.getAttributeNS(null, "width"))+adjW;
      let newGH = Number(rect.getAttributeNS(null, "height"))+adjH;
      let newPH = Number(rect.getAttributeNS(null, "height"))-adjH;

      //if width or height can't be negative, stop resizing at 0;
      if (newW<0 || newGH<0 || newPH<0) {
        resize = false;
        return; 
      }

      //the following resizePos is for updating the position of the resizing triangle
      let resizePos = null;
      let vOffset = Number(rect.getAttributeNS(null, "y"));

      //update the width and height of the rectangle, which is the size setter for the group
      rect.setAttributeNS(null, "width", newW);

      if (clickedElement.classList.contains("garden")) {
	      rect.setAttributeNS(null, "height", newGH);
        resizePos = "br";
        vOffset += Number(rect.getAttributeNS(null, "height"));
      } else if (clickedElement.classList.contains("plant")) {
        rect.setAttributeNS(null, "x", Number(rect.getAttributeNS(null, "x"))-adjW/2);
        rect.setAttributeNS(null, "height", newPH);
        rect.setAttributeNS(null, "y", Number(rect.getAttributeNS(null, "y"))+adjH);
        resizePos = "tr";
        adjW /=2;
      }

      //update the positions of size indicators
      let elts = clickedElement.getElementsByClassName("sizeInd");
      for (let i = 0; i < 2; i++){
        elts[i].setAttributeNS(
          null, 
          "x", 
          Number(elts[i].getAttributeNS(null, "x"))+adjW);
        elts[i].setAttributeNS(
          null,
          "y", 
          Number(elts[i].getAttributeNS(null, "y"))+adjH);
      }
      //update the text of the width and height indicators
      elts[0].innerHTML = formatSizeDisplay(Number(rect.getAttributeNS(null, "height"))/2);
      elts[1].innerHTML = formatSizeDisplay(Number(rect.getAttributeNS(null, "width"))/2);

      //update the position of the resizing triangle
      clickedElement.getElementsByClassName("resize")[0].setAttributeNS(
        null, 
        "points",
        createTriPts(Number(rect.getAttributeNS(null, "x"))+newW, vOffset, resizePos));

      //the sizing clickX and clickY need to be continuously updated 
      //so that the size change is not cumulative
      clickX = evt.clientX;
      clickY = evt.clientY;
    }

    //MOVING
    else {
      moving = true;
      transform.setTranslate(coord.x - offset.x, coord.y - offset.y);
    }
  }
}

function touchUp(evt) {

  //record new plant or garden position in local storage when it's been moved
  if (clickedElement && moving) {
    updateStoredData(clickedElement.id, 4, coord.x - offset.x);
    updateStoredData(clickedElement.id, 5, coord.y - offset.y);
    
    //check if the plant intersects a garden, first making sure there are gardens to intersect
    if (clickedElement.id[0] === "p") {
      let grdns = localStorage.aas_myGardenVs_grdns;
      if(grdns) {
        grdns = grdns.split(",");
//         console.log("plant at [" + 
//                     (Number(clickedElement.children[0].getAttributeNS(null, "x")) + 
//                     Number(clickedElement.getAttribute("transform").replace(/translate\(|\)/g,"").split(",")[0])) +
//                     ", " + 
//                     (Number(clickedElement.children[0].getAttributeNS(null, "y")) + 
//                     Number(clickedElement.getAttribute("transform").replace(/translate\(|\)/g,"").split(",")[1])) + 
//                     "]"
//                    );
//         check if a plant is moved into a garden
        checkForIntersect(grdns);
      } 
    }
  }

  //record new plant or garden size in local storage when it's been resized
  if (clickedElement && resize) {
    updateStoredData(
      clickedElement.id, 
       2, 
       Number(clickedElement.getElementsByTagName("rect")[0].getAttributeNS(null, "width"))/sizeAdj);
    updateStoredData(
      clickedElement.id, 
      3, 
      Number(clickedElement.getElementsByTagName("rect")[0].getAttributeNS(null, "height"))/sizeAdj);
  }

  //the following calls forks with different functionality for when a plant or garden has been tapped
  if (!moving) {
    if (evt.target.classList.contains("plant")
        || evt.target.parentElement.classList.contains("plant")
       ){
      plantFork(evt.target);
    } 
    else if (evt.target.className.baseVal === "garden" || 
              evt.target.parentElement.className.baseVal === "garden"){
      gardenFork(evt.target);
    }
  }

  moving = false;
  resize = false;
  clickedElement = null;
}

//////////////////////////////////////////////////////////////////////
//this checks if a cog and plant name's edge are inside a garden area
function checkForIntersect(grdns){
  
  let currInGarden = clickedElement.parentElement.id[0]==="g"?clickedElement.parentElement.id:false;
  //get the left and right plant cogs
//   let pL = clickedElement.getElementsByClassName("plantUp")[0];
//   let pR = clickedElement.getElementsByClassName("plantDown")[0];
  
  //in plant object, store clicked plant's unadjusted by transform left x-pos
  //(lx) & right x-pos (rx), x transform (tx), y-pos (y), and y transform (ty)
   let plnt = {
     lx:Number(clickedElement.children[0].getAttributeNS(null, "x")),
     rx:Number(clickedElement.children[0].getAttributeNS(null, "x")) + 
     clickedElement.children[0].getComputedTextLength(),
     tx:Number(clickedElement.getAttributeNS(null, "transform").replace(/(translate\(|\))/g,"").split(",")[0]), 
     y:Number(clickedElement.children[0].getAttributeNS(null, "y")), 
     ty:Number(clickedElement.getAttributeNS(null, "transform").replace(/(translate\(|\))/g,"").split(",")[1])
   };
  
  let setGrdn = function (gId) {
    //converting everything received from localStorage to Number and 
    //ignoring the last two unneeded values, garden name and sun value
    let g = localStorage.getItem("aas_myGardenVs_grdn"+gId).split(",").map(x=>Number(x));
    if (g) {
      return {id:gId,x:g[0],y:g[1],w:g[2]*2,h:g[3]*2,tx:g[4],ty:g[5]};
    }
    else {
      console.log("setGrdn is called for a nonexistang garden, id: "+gId);
    }
  }
 
  //loop through the garden array and check if the plant intersects each one 
  for (let i = 0, l = grdns.length; i < l; i++) {
    let grdn = setGrdn(grdns[i]);
    
    //if the plant's left x and right x are within the garden's x+w
    //and the y is within garden y+h, then plant is within a garden
    if ((plnt.y+plnt.ty > grdn.y+grdn.ty && plnt.y+plnt.ty < grdn.y+grdn.ty+grdn.h)
        && (plnt.lx+plnt.tx > grdn.x+grdn.tx && plnt.rx+plnt.tx < grdn.x+grdn.tx+grdn.w)) {
      
      //check if the plant is being moved within a garden,
      //its parent's id would remain the same, thus exit
      if (currInGarden === clickedElement.parentElement.id) {
        //...update clicked plant's tx & ty in local storage
        updateStoredData(clickedElement.id, 4, (plnt.tx-grdn.tx));
        updateStoredData(clickedElement.id, 5, (plnt.ty-grdn.ty));
        //...adjust the plant's transform property to include garden's transform
        clickedElement.setAttributeNS(null, "transform", 
                                      "translate("+ (plnt.tx-grdn.tx) +", "+ (plnt.ty-grdn.ty) +")");
        return;
      }

      //when a plant is moved into a garden ... 
      //...add that garden's id to the plant's gId in localStorage
      updateStoredData(clickedElement.id, 7, grdn.id);
      //...update clicked plant's tx & ty in local storage
      updateStoredData(clickedElement.id, 4, (plnt.tx-grdn.tx));
      updateStoredData(clickedElement.id, 5, (plnt.ty-grdn.ty));
      
      //need to add fill="url(#pattern)"
      
      //...adjust the plant's transform property to include garden's transform
      clickedElement.setAttributeNS(null, "transform", 
                                    "translate("+ (plnt.tx-grdn.tx) +", "+ (plnt.ty-grdn.ty) +")");
      //...add the the plant to the garden group in the page
      svgPlace.getElementById("g_"+grdns[i]).appendChild(clickedElement);
      return;
    }
  }
  //if the plant is not in any garden, check if it was in a garden before, if so
  //remove add it back to the svgPlace, thus removing from whatever garden it was
  if (currInGarden) {
    let grdn = setGrdn(currInGarden.substring(2,currInGarden.length));
    
    updateStoredData(clickedElement.id, 7, 0);
    updateStoredData(clickedElement.id, 4, (plnt.tx+grdn.tx));
    updateStoredData(clickedElement.id, 5, (plnt.ty+grdn.ty));
    
    clickedElement.setAttributeNS(null, "transform", 
                                  "translate("+ (plnt.tx+grdn.tx) +", "+ (plnt.ty+grdn.ty) +")");
    
    svgPlace.appendChild(clickedElement);
    
    currInGarden = false;
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////
//this function toggles sun drop down choices
function toggleSunDropDown(grpOfClkdElt) {
  let ddChoices = grpOfClkdElt.getElementsByClassName("fauxLi");
  if (ddChoices.length>0) {
    for (let i = 0, l = ddChoices.length; i<l; i++){
      grpOfClkdElt.removeChild(ddChoices[0]);
    }
  } else {
    grpOfClkdElt.appendChild(makeText(elt={
      x:(Number(grpOfClkdElt.getElementsByClassName("fauxUl")[0].getAttribute("x"))+munit*2), 
      y:(Number(grpOfClkdElt.getElementsByClassName("fauxUl")[0].getAttribute("y"))+munit*2), 
      cls:"fauxLi", 
      clr:"rgba(238, 242, 138, 0.75)",
      txt:"Full"}));
    grpOfClkdElt.appendChild(makeText(elt={
      x:(Number(grpOfClkdElt.getElementsByClassName("fauxUl")[0].getAttribute("x"))+munit*2), 
      y:(Number(grpOfClkdElt.getElementsByClassName("fauxUl")[0].getAttribute("y"))+munit*4), 
      cls:"fauxLi", 
      clr:"rgba(225, 232, 51, 0.75)",
      txt:"Part"}));
    grpOfClkdElt.appendChild(makeText(elt={
      x:(Number(grpOfClkdElt.getElementsByClassName("fauxUl")[0].getAttribute("x"))+munit*1.7), 
      y:(Number(grpOfClkdElt.getElementsByClassName("fauxUl")[0].getAttribute("y"))+munit*6), 
      cls:"fauxLi", 
      clr:"rgba(180, 187, 21, 0.75)",
      txt:"Shade"}));    
  }
}

//////////////////////////////////////////////////////////////////////
//this function is triggered by double click, which is set in html SVG element
function dblTouch(evt) {
  
  hideDropDown();
  
  //if an editable name field is double-clicked on the garden, leave this module immediately, cuz it's just a name change
  if (evt.target.classList.contains("editable")) {
    return;
  }
  
  //if double clicked in SVG area display the add garden/plant menu
  if (evt.target.id === "svgArea") {
    let dropDownMenu = addDropMenu(menu = {
      values:["Garden", "Plant", "Delete\xa0All\xa0Gardens", "Delete\xa0All\xa0Plants"],
      xPos: (evt.pageX-5).toString()+"px",
      yPos: (evt.pageY-40).toString()+"px",
    });
    dropDownMenu.addEventListener("click", function() {
      addGardenPlantMenu();
    });
    document.body.appendChild(dropDownMenu);
    return;
  }
  
  //sd = stored data variable, used in removal of plant's photo and shape
  //pg = parenting group variable, used in the removal of a plant or garden
  let pg = "";
  let sd = null;
  
  if (evt.target.parentElement.id[0]==="p") {
	  sd = localStorage.getItem(
  	  "aas_myGardenVs_plnt"+evt.target.parentElement.id.substring(2,evt.target.parentElement.id.length)).split(",");
  }
  
  //if a picture is double-clicked, delete just the picture
  if (evt.target.classList.contains("plantPic")) {
    if(sd[9] === "4"){//	4-rect is hidden, img is shown;
      updateStoredData(evt.target.parentElement.id, 9, "0");//	0-both img&rect are hidden; 
    }
    else if (sd[9] === "5"){//	5-both img&rect are shown;
      updateStoredData(evt.target.parentElement.id, 9, "2");//	2-rect is shown, img is hidden; 
    }
    //remove the plant picture
    evt.target.parentElement.removeChild(evt.target);
    return;
  }
  
  //if a plant shape component is double-clicked, delete the shape and its components
  else if (["plantShape","resize","sizeInd"].some(x => evt.target.classList.contains(x))) {
  //The some() method tests if at least one element in the array passes the test implemented by the provided 
  //function. It returns a Boolean value.  Calling this method on an empty array returns false for any condition!
    
    if (sd[9] === "2") {//	2-rect is shown, img is hidden; 
      updateStoredData(evt.target.parentElement.id, 9, "0");//	0-both img&rect are hidden; 
    } 
    else if (sd[9] === "3"){//	3-rect is shown, img is not available;
      updateStoredData(evt.target.parentElement.id, 9, "1");//	1-rect is hidden, img isn't available;
    }
    else if (sd[9] === "5"){//	5-both img&rect are shown;
      updateStoredData(evt.target.parentElement.id, 9, "4");//	4-rect is hidden, img is shown;
    }
		//remove the plant shape components
    for (let i = 0; i < 3; i++) {
      evt.target.parentElement.removeChild(evt.target.nextSibling);
    }
    evt.target.parentElement.removeChild(evt.target);
    return;
  }
  
  //if warnings are on, confirm that the plant needs to be removed
  else if (evt.target.parentElement.id[0]==="p"){
    pg = "plnt";
    if (!Number(localStorage.getItem("aas_myGardenVs_warnings"))){
      if (!confirm("Would you like to remove " + evt.target.getAttributeNS(null, "desc") + "?")){
        return; 
      }    
    }
  }
  //if warnings are on, confirm that the garden needs to be removed
  else if (evt.target.parentElement.id[0]==="g"){
    pg = "grdn";
    if (!Number(localStorage.getItem("aas_myGardenVs_warnings"))){
      if (!confirm("Would you like to remove " + 
                   evt.target.parentElement.getElementsByClassName("editable")[0].innerHTML + 
                   " and all its plants?")){
        return; 
      }
      //if deleted is a garden and it has plants, remove the plants from local storage
      for (let i = 0, l=evt.target.parentElement.childElementCount; i < l; i++) {
        if (evt.target.parentElement.children[i].id) {
          if (evt.target.parentElement.children[i].id[0]="p"){
            removeFromLocalStorage("plnt", 
                evt.target.parentElement.children[i].id.substring(2,evt.target.parentElement.children[i].id.length));
          }
        }
      }
    }
  }
  
  //the following deletes the double clicked element from html and local storage & 
  //updates local storage counter; 
  //first, extract the numeric part of the element's id
  let pId = evt.target.parentElement.id.substring(2,evt.target.parentElement.id.length);
  evt.target.parentElement.parentElement.removeChild(evt.target.parentElement);
  removeFromLocalStorage(pg, pId);
}

//////////////////////////////////////////////////////////////////////
//this function deletes a garden or plant from local storage using  
//supplied pGrp (plnt or grdn) and id (pId)
function removeFromLocalStorage(pGrp, pId) {
  localStorage.removeItem("aas_myGardenVs_"+pGrp+pId);
  //update the plant counter array
  let cntr = localStorage.getItem("aas_myGardenVs_"+pGrp+"s");
  if(cntr){
    cntr = cntr.split(",");
    if(cntr.length > 1){
      if (cntr.indexOf(pId) > -1){
        cntr.splice(cntr.indexOf(pId), 1);
      }
      localStorage.setItem("aas_myGardenVs_"+pGrp+"s", cntr);
    } else {
      localStorage.removeItem("aas_myGardenVs_"+pGrp+"s");
    }
  }
}

//////////////////////////////////////////////////////////////////////
// When the user scrolls more than 1000px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};
function scrollFunction() {
  var upButton = document.getElementById("btnUp");
  if (document.body.scrollTop > 1000 || document.documentElement.scrollTop > 1000) {
    upButton.style.display = "block";
  } else {
    upButton.style.display = "none";
  }
}

//////////////////////////////////////////////////////////////////////
// When the user clicks on the button, scroll to the top of the document
function goUp() {
  document.body.scrollTop = 0; // For Safari
  document.body.scrollLeft = 0;
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  document.documentElement.scrollLeft = 0;
}
