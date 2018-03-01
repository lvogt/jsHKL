/*
 *   Copyright 2016, 2017 Christian Landvogt
 *
 *   This file is part of jsHKL.
 *
 *   jsHKL is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   Foobar is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 */

setupUI = function()
{
  var modalSettings = document.getElementById('modalSettings');
  var modalSolution = document.getElementById('modalSolution');
  var modalSG = document.getElementById('modalSG');

  // assign onClick events to buttons
  document.getElementById("btnSettings").onclick = function() {
    modalSettings.style.display = "block";
  }
  
  document.getElementById("btnSolution").onclick = function() {
    modalSolution.style.display = "block";
    u.updateSolution(document.getElementById("solution-body"));
  }
  
  document.getElementById("sglabel").onclick = function() {
    modalSG.style.paddingTop = "0px";
    modalSG.style.display = "block";
  }
  
  document.getElementById("btnRandomize").onclick = function() {
    u.displayPattern(true);
  }
  
  document.getElementById("full_settings").onclick = function(event) {
    u.toggleFullSettings(event.target.checked);
  }

  document.getElementById("btnCloseSettings").onclick = function() {
    document.getElementById("full_settings").checked = false;
    u.toggleFullSettings(false);
  }
  
  document.getElementById("hash").onclick = function(event) {
    if (document.selection)
    {
      var range = document.body.createTextRange();
      range.moveToElementText(event.target);
      range.select();
    }
    else if (window.getSelection)
    {
      var range = document.createRange();
      range.selectNode(event.target);
      window.getSelection().addRange(range);
    }
  }
  
  // assign onClick events to X to close modal windows
  var spans = document.getElementsByClassName("close");  
  for (var i = 0; i < spans.length; i++)
    spans[i].onclick = function() {
      this.parentElement.parentElement.parentElement.style.display = "none"; 
      if (this.parentElement.parentElement.parentElement.id == "modalSettings")
        u.displayPattern();
    }
    
  // assign onClick for allowed spacegroup spans
  spans = document.getElementsByClassName("checkbox-CS");
  for (var i = 0; i < spans.length; i++)
    spans[i].onclick = function(event) {
      if (event.target.id.substr(0, 4) !== "span")
        return;
      var cbTarget = document.getElementById("allow" + event.target.id.substr(4));
      cbTarget.checked = !cbTarget.checked;
    }

  // assign onClick events to the modal background to close
  var modals = document.getElementsByClassName("modal"); 
  for (var i = 0; i < modals.length; i++)
    modals[i].onclick = function(event) {
      if (event.target.className == "modal")
        event.target.style.display = "none";
      if (event.target.id == "modalSettings")
        u.displayPattern();
    }

  // IE might not know how to trunc...
  if (typeof Math.trunc === "undefined")
  {
    Math.trunc = function(number)
    {
      return number > 0
           ? Math.floor(number)
           : Math.ceil(number);
    }
  }

  pattern = new DiffractionPattern();
  pattern.symmetry_tables = getTables();
  pattern.generatePattern();

  u = new UI();
  
  var hash = location.search;
  if (hash !== "")
  {
    pattern.setHash(hash.substring(1));
    u.updateForm(pattern);
  }
  
  u.displayPattern();
  
  //fill SG list
  var listbody = document.getElementById("sgs-body");
  var spanOuter;
  var spanInner;
  var sgName;
  var systemDiv;
  
  for (var i = 1; i <= 230; i++)
  {
    switch (i)
    {
      case   1: systemDiv = document.createElement("div"); systemDiv.setAttribute("class", "sgsystem"); systemDiv.innerHTML = "triclinic"; listbody.appendChild(systemDiv); break;
      case   3: systemDiv = document.createElement("div"); systemDiv.setAttribute("class", "sgsystem"); systemDiv.innerHTML = "monoclinic"; listbody.appendChild(systemDiv); break;
      case  16: systemDiv = document.createElement("div"); systemDiv.setAttribute("class", "sgsystem"); systemDiv.innerHTML = "orthorhombic"; listbody.appendChild(systemDiv); break;
      case  75: systemDiv = document.createElement("div"); systemDiv.setAttribute("class", "sgsystem"); systemDiv.innerHTML = "tetragonal"; listbody.appendChild(systemDiv); break;
      case 143: systemDiv = document.createElement("div"); systemDiv.setAttribute("class", "sgsystem"); systemDiv.innerHTML = "trigonal"; listbody.appendChild(systemDiv); break;
      case 168: systemDiv = document.createElement("div"); systemDiv.setAttribute("class", "sgsystem"); systemDiv.innerHTML = "hexagonal"; listbody.appendChild(systemDiv); break;
      case 195: systemDiv = document.createElement("div"); systemDiv.setAttribute("class", "sgsystem"); systemDiv.innerHTML = "cubic"; listbody.appendChild(systemDiv); break;
      default: break;
    }
    
    spanOuter = document.createElement("span");
    spanOuter.setAttribute("class", "sglist");
    spanInner = document.createElement("span");
    spanInner.setAttribute("class", "sgnum");
    spanInner.innerHTML = "" + i + ".";
    spanOuter.appendChild(spanInner);
    sgName = pattern.symmetry_getSGName(i);
    sgName = sgName.replace(/(\d)(\d)/g, "$1<sub>$2</sub>");
    sgName = sgName.replace(/-(\d+)/g, "<span  style=\"text-decoration:overline\">$1</span>");
    sgName = sgName.replace(/([>0-9a-zA-Z])\s/g, "$1");
    sgName = sgName.replace(/(\d+)/g, "<span style=\"font-style:normal\">$1</span>");
    spanOuter.innerHTML = spanOuter.innerHTML + " " + sgName;
    listbody.appendChild(spanOuter);
  }
  
  var sgDataList = document.getElementById("sgDataList");
  var opt;
  for (var i = 1; i <= 230; i++)
  {
    opt = document.createElement("option");
    opt.setAttribute("value", i);
    opt.innerHTML = pattern.symmetry_getSGName(i);
    sgDatalist.appendChild(opt);
  }
  
  var sgspans = document.getElementsByClassName("sglist");
  for (var i = 0; i < sgspans.length; i++)
    sgspans[i].onclick = function() {
      this.parentElement.parentElement.parentElement.style.display = "none"; 
      document.getElementById("spacegroup").value = parseInt(this.childNodes[0].innerHTML);
      u.displayPattern();
    }


  window.onresize = function(event) {
    u.displayPattern();
  };
  
  //disable a-z input
  window.onkeydown = function(event) {
    var key = event.keyCode ? event.keyCode : event.which;
    //if ((key >= 65) && (key <= 90))
    //  return false;
    if ((key == 70) || (key == 77) || (key == 83))
      return false;
  }
  
  window.onkeyup = function(event) {
    var key = event.keyCode ? event.keyCode : event.which;
    
    var randomize = false;
    
    if (u.fullSettingsNode.style.display == "none")
      randomize = true;

    if (key == 13)  //return
      u.displayPattern(randomize);
    
    if (key == 83)  //S
    {
      modalSolution.style.display = "block";
      u.updateSolution(document.getElementById("solution-body"));
    }
    
    if (key == 77)  //M
      modalSettings.style.display = "block";
    
    if (key == 70)  //F
    {
      document.getElementById("full_settings").checked = !document.getElementById("full_settings").checked;
      u.toggleFullSettings();
    }

    if (key == 27)  //ESC
    {
      var modals = document.getElementsByClassName("modal");
      for (var i = 0; i < modals.length; i++)
        if (modals[i].style.display == "block")
          modals[i].style.display = "none";
    }
  }
}

window.onload = setupUI;
