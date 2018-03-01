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

function UI()
{
  this.canvasNode = document.getElementById("images");
  this.fullSettingsNode = document.getElementById("lattice-settings");
  this.hashNode = document.getElementById("hash");
  
  // get width of vertical scroll bar for this browser/os
  var outer = document.createElement("div");
  outer.style.visibility = "hidden";
  outer.style.width = "100px";
  document.body.appendChild(outer);
    
  var widthNoScroll = outer.offsetWidth;
  // force scrollbars
  outer.style.overflow = "scroll";
    
  // add innerdiv
  var inner = document.createElement("div");
  inner.style.width = "100%";
  outer.appendChild(inner);        
    
  this.scrollbarWidth = widthNoScroll - inner.offsetWidth;
    
  // remove divs
  outer.parentNode.removeChild(outer);
}

UI.prototype.size = 100;

UI.prototype.removeAllChilds = function(parent)
{
  while (parent.firstChild)
    parent.removeChild(parent.firstChild);
}

UI.prototype.updateSolution = function(parent)
{
  if (!(typeof pattern && typeof pattern.generatePattern === "function"))
    return false;    
  
  this.removeAllChilds(parent);
  
  var p = document.createElement("p");
  
  var str = pattern.solution_text.replace(/(?:\r\n|\r|\n)/g, '<br />');
  
  var solution = document.createTextNode(str);
  p.innerHTML = str;
  parent.appendChild(p);
}

UI.prototype.addCanvas = function(parent, layer, size)
{
  var outerDiv = null;
  
  switch (layer)
  {
    case "hk1": outerDiv = document.getElementById("outerdiv_hk0"); break;
    case "h1l": outerDiv = document.getElementById("outerdiv_h0l"); break;
    case "1kl": outerDiv = document.getElementById("outerdiv_0kl"); break;
    //case "hhh": outerDiv = document.getElementById("outerdiv_hhl"); break;
  }
  
  if (outerDiv === null)
  {
    outerDiv = document.createElement("div");
    outerDiv.setAttribute("id", "outerdiv_" + layer);
    outerDiv.setAttribute("class", "outerContainer");  
  }
  
  var innerDiv = document.createElement("div");
  innerDiv.setAttribute("id", "div_" + layer);
  innerDiv.setAttribute("class", "innerContainer");
  
  var canvas = document.createElement("canvas");
  canvas.setAttribute("width", size);
  canvas.setAttribute("height", size);
  canvas.setAttribute("id", "canvas_" + layer);
  
  canvas.addEventListener('mousemove', function(event)
  {
    if (!(typeof pattern && typeof pattern.draw_layer === "function"))
      return;
    
    if (!pattern.display_index)
      return;
    
    var rect = event.target.getBoundingClientRect();
    var mx = event.clientX - rect.left - event.target.width/2;
		var my = event.clientY - rect.top - event.target.height/2;
    
    var reflection = pattern.draw_posToHKL(layer, mx, my);
    
    if (reflection.found)
    {
      if (!event.target.hasAttribute("marked"))
      {
//        reflection.x = reflection.x + event.target.width/2;
//        reflection.y = reflection.y + event.target.height/2;
        pattern.draw_layer(event.target, layer, reflection);
        event.target.setAttribute("marked", "");
      }
    }
    else
    {
      if (event.target.hasAttribute("marked"))
      {
        event.target.removeAttribute("marked");
        pattern.draw_layer(event.target, layer);
      }
    }

  }, false);  
  
  innerDiv.appendChild(canvas);
  innerDiv.appendChild(document.createElement("br"));
  
  var span;
  var num = "0";
  
  switch (layer)
  {
    case "hk1": num = "1";
    case "hk0":
      innerDiv.appendChild(document.createTextNode("hk"));
      span = document.createElement('span');
      span.innerHTML = num;
      span.setAttribute("class", "normal");
      innerDiv.appendChild(span);
    break;
    
    case "h1l": num = "1";
    case "h0l":
      innerDiv.appendChild(document.createTextNode("h"));
      span = document.createElement('span');
      span.innerHTML = num;
      span.setAttribute("class", "normal");
      innerDiv.appendChild(span);
      innerDiv.appendChild(document.createTextNode("l"));
    break;
    
    case "1kl": num = "1";
    case "0kl":
      span = document.createElement('span');
      span.innerHTML = num;
      span.setAttribute("class", "normal");
      innerDiv.appendChild(span);
      innerDiv.appendChild(document.createTextNode("kl"));
    break;
    
    default: innerDiv.appendChild(document.createTextNode(layer));
  }
  
  outerDiv.appendChild(innerDiv);
  parent.appendChild(outerDiv);
  
  return canvas;
}

UI.prototype.displayPattern = function(random)
{
  random = typeof random !== 'undefined' ? random : false;
  
  if (!(typeof pattern && typeof pattern.generatePattern === "function"))
    return false;  
  
  this.updatePatternSettings();  
  
  var cWidth = document.body.clientWidth;
  //substract scrollbar width if there is currently none
  if (window.innerHeight > document.body.clientHeight)
    cWidth = cWidth - this.scrollbarWidth;
 
 //var iHeight = window.innerHeight - document.getElementById("top").getBoundingClientRect().height;
    
  if (cWidth < 250)
    this.size = 250;
  else if (cWidth < 500)
    this.size = Math.trunc(cWidth/1.02);
  else if (cWidth < 750)
    this.size = Math.trunc(cWidth/2.03);
  else
   this.size = Math.trunc(cWidth/3.04);

  if (random)
    pattern.randomCrystal(this.size)
  else
    pattern.generatePattern(this.size);
  
  this.removeAllChilds(this.canvasNode);

  if (pattern.display_hk0)
    pattern.draw_layer(this.addCanvas(this.canvasNode, "hk0", this.size), "hk0");
  
  if (pattern.display_hk1)
    pattern.draw_layer(this.addCanvas(this.canvasNode, "hk1", this.size), "hk1");
  
  if (pattern.display_h0l)
    pattern.draw_layer(this.addCanvas(this.canvasNode, "h0l", this.size), "h0l");
    
  if (pattern.display_h1l)
    pattern.draw_layer(this.addCanvas(this.canvasNode, "h1l", this.size), "h1l");
  
  if (pattern.display_okl)
    pattern.draw_layer(this.addCanvas(this.canvasNode, "0kl", this.size), "0kl");
  
  if (pattern.display_ikl)
    pattern.draw_layer(this.addCanvas(this.canvasNode, "1kl", this.size), "1kl");
  
  if (pattern.display_hhl)
    pattern.draw_layer(this.addCanvas(this.canvasNode, "hhl", this.size), "hhl");
  
  if (pattern.display_hhh)
    pattern.draw_layer(this.addCanvas(this.canvasNode, "hhh", this.size), "hhh");

  this.updateForm(pattern);
  
  this.hashNode.innerHTML = document.location.protocol + "//" + document.location.hostname + document.location.pathname + "?" + pattern.getHash();  
}

UI.prototype.checkInputInt = function(element, min, max)
{
  var number = parseInt(element.value);
  var okay = true;
  
  if (!isNaN(number) && isFinite(number))
  {
    if ((number >= min) && (number <= max))
      return {okay : okay, number : number};
  }
  
  number = 0;
  okay = false;
  
  console.log("Validation error: element %s -- value %s", element.id, element.value);  
  
  return {okay : okay, number : number};
}

UI.prototype.checkInputFloat = function(element, min, max, precision)
{
  var number = parseFloat(element.value);
  var okay = true;
    
  if (!isNaN(number) && isFinite(number))
  {
    if ((number >= min) && (number <= max))
      return {okay : okay, number : (Math.trunc(number*Math.pow(10, precision))/Math.pow(10, precision))};
  }
  
  number = 0;
  okay = false;
  
  console.log("Validation error: element %s -- value %s", element.id, element.value);
  
  return {okay : okay, number : number};
}

UI.prototype.updatePatternSettings = function()
{
  if (!(typeof pattern && typeof pattern.generatePattern === "function"))
    return false;
  
  pattern.quiz_allowTriclinic = document.getElementById("allow_triclinic").checked;
  pattern.quiz_allowMonoclinic = document.getElementById("allow_monoclinic").checked;
  pattern.quiz_allowOrthorhombic = document.getElementById("allow_orthorhombic").checked;
  pattern.quiz_allowTrigonal = document.getElementById("allow_trigonal").checked;
  pattern.quiz_allowHexagonal = document.getElementById("allow_trigonal").checked;
  pattern.quiz_allowTetragonal = document.getElementById("allow_tetragonal").checked;
  pattern.quiz_allowCubic = document.getElementById("allow_cubic").checked;

  var ret = this.checkInputFloat(document.getElementById("wavelength"), 0.00001, 10, 5);
  if (ret.okay)
    pattern.experiment_wavelength = ret.number;
  
  ret = this.checkInputFloat(document.getElementById("resolutionlimit"), 1, 90, 1);
  if (ret.okay)
    pattern.experiment_resolutionLimit = ret.number;

  pattern.display_axes = document.getElementById("draw_axes").checked;
  pattern.display_index = document.getElementById("draw_index").checked;
  
  ret = this.checkInputFloat(document.getElementById("lattice_a"), 0.001, 64, 3);
  if (ret.okay)
    pattern.lattice_a = ret.number;

  ret = this.checkInputFloat(document.getElementById("lattice_b"), 0.001, 64, 3);
  if (ret.okay)
    pattern.lattice_b = ret.number;

  ret = this.checkInputFloat(document.getElementById("lattice_c"), 0.001, 64, 3);
  if (ret.okay)
    pattern.lattice_c = ret.number;  
  
  ret = this.checkInputFloat(document.getElementById("lattice_alpha"), 0.01, 360, 2);
  if (ret.okay)
    pattern.lattice_alpha = ret.number;
  
  ret = this.checkInputFloat(document.getElementById("lattice_beta"), 0.01, 360, 2);
  if (ret.okay)
    pattern.lattice_beta = ret.number;
  
  ret = this.checkInputFloat(document.getElementById("lattice_gamma"), 0.01, 360, 2);
  if (ret.okay)
    pattern.lattice_gamma = ret.number;
  
  ret = this.checkInputInt(document.getElementById("spacegroup"), 1, 230);
  if (ret.okay)
    pattern.lattice_spaceGroup = ret.number;
  
  ret = this.checkInputInt(document.getElementById("seed"), 1, 65535);
  if (ret.okay)
    pattern.experiment_randomSeed = ret.number;
  
  pattern.display_hk0 = document.getElementById("display_hk0").checked;
  pattern.display_h0l = document.getElementById("display_h0l").checked;
  pattern.display_okl = document.getElementById("display_0kl").checked;
  pattern.display_hhl = document.getElementById("display_hhl").checked;

  pattern.display_hk1 = document.getElementById("display_hk1").checked;
  pattern.display_h1l = document.getElementById("display_h1l").checked;
  pattern.display_ikl = document.getElementById("display_1kl").checked;
  pattern.display_hhh = document.getElementById("display_hhh").checked;
  
  this.updateForm(pattern);
}

UI.prototype.toggleFullSettings = function(show)
{
  show = typeof show !== 'undefined' ? show : (this.fullSettingsNode.style.display == "none");
  
  if (show)
    this.fullSettingsNode.style.display = "block";
  else
    this.fullSettingsNode.style.display = "none";
}


UI.prototype.updateForm = function(pattern)
{
  document.getElementById("allow_triclinic").checked = pattern.quiz_allowTriclinic;
  document.getElementById("allow_monoclinic").checked = pattern.quiz_allowMonoclinic;
  document.getElementById("allow_orthorhombic").checked = pattern.quiz_allowOrthorhombic;
  document.getElementById("allow_trigonal").checked = (pattern.quiz_allowTrigonal || pattern.quiz_allowHexagonal)
  document.getElementById("allow_tetragonal").checked = pattern.quiz_allowTetragonal;
  document.getElementById("allow_cubic").checked = pattern.quiz_allowCubic;

  document.getElementById("wavelength").value = pattern.experiment_wavelength;
  document.getElementById("resolutionlimit").value = pattern.experiment_resolutionLimit;
  document.getElementById("draw_axes").checked = pattern.display_axes;
  document.getElementById("draw_index").checked = pattern.display_index;
  
  document.getElementById("lattice_a").value = pattern.lattice_a;
  document.getElementById("lattice_b").value = pattern.lattice_b;
  document.getElementById("lattice_c").value = pattern.lattice_c;
  document.getElementById("lattice_alpha").value = pattern.lattice_alpha;
  document.getElementById("lattice_beta").value = pattern.lattice_beta;
  document.getElementById("lattice_gamma").value = pattern.lattice_gamma;
  
  document.getElementById("spacegroup").value = pattern.lattice_spaceGroup;
  document.getElementById("seed").value = pattern.experiment_randomSeed;
  
  document.getElementById("display_hk0").checked = pattern.display_hk0;
  document.getElementById("display_h0l").checked = pattern.display_h0l;
  document.getElementById("display_0kl").checked = pattern.display_okl;
  document.getElementById("display_hhl").checked = pattern.display_hhl;
  document.getElementById("display_hk1").checked = pattern.display_hk1;
  document.getElementById("display_h1l").checked = pattern.display_h1l;
  document.getElementById("display_1kl").checked = pattern.display_ikl;
  document.getElementById("display_hhh").checked = pattern.display_hhh;
  
  this.toggleFullSettings(document.getElementById("full_settings").checked);
}

UI.prototype.validateInput = function()
{
  
}

UI.prototype.displaySolution = function(pattern)
{
  
}


UI.prototype.displayError = function(pattern)
{
  
}