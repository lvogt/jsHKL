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

function DiffractionPattern()
{

}

DiffractionPattern.prototype.hash = "";
DiffractionPattern.prototype.hashShift = 43;
DiffractionPattern.prototype.hashLength = 25;
DiffractionPattern.prototype.lastError = "";

DiffractionPattern.prototype.debug = false;
DiffractionPattern.prototype.hkl_file = false;

DiffractionPattern.prototype.lattice_spaceGroup = 62;
DiffractionPattern.prototype.lattice_a = 7;
DiffractionPattern.prototype.lattice_b = 8;
DiffractionPattern.prototype.lattice_c = 9;
// beware: direct angles in degrees
DiffractionPattern.prototype.lattice_alpha = 90;
DiffractionPattern.prototype.lattice_beta = 90;
DiffractionPattern.prototype.lattice_gamma = 90;
DiffractionPattern.prototype.lattice_centered = false;
// need only for calculations
DiffractionPattern.prototype.lattice_volume = 0;
DiffractionPattern.prototype.reciprocal_aaa = 0;
DiffractionPattern.prototype.reciprocal_bbb = 0;
DiffractionPattern.prototype.reciprocal_ccc = 0;

DiffractionPattern.prototype.reciprocal_hkl = [];
DiffractionPattern.prototype.reciprocal_a = 0;
DiffractionPattern.prototype.reciprocal_b = 0;
DiffractionPattern.prototype.reciprocal_c = 0;
// beware: reciprocal angles already in radians!!!
DiffractionPattern.prototype.reciprocal_alpha = 0;
DiffractionPattern.prototype.reciprocal_beta = 0;
DiffractionPattern.prototype.reciprocal_gamma = 0;
DiffractionPattern.prototype.reciprocal_hhlAngle = 0;
DiffractionPattern.prototype.reciprocal_hhhAngle = 0;
DiffractionPattern.prototype.reciprocal_hhAxis = 0;
DiffractionPattern.prototype.reciprocal_hhh110Axis = 0;
DiffractionPattern.prototype.reciprocal_hhh011Axis = 0;
DiffractionPattern.prototype.reciprocal_cosa = 0;
DiffractionPattern.prototype.reciprocal_cosb = 0;
DiffractionPattern.prototype.reciprocal_cosc = 0;
DiffractionPattern.prototype.reciprocal_hMax = 0;
DiffractionPattern.prototype.reciprocal_kMax = 0;
DiffractionPattern.prototype.reciprocal_lMax = 0;
DiffractionPattern.prototype.reciprocal_hhMax = 0;
DiffractionPattern.prototype.reciprocal_hhhMax = 0;
DiffractionPattern.prototype.reciprocal_limit = 10;

DiffractionPattern.prototype.experiment_resolutionLimit = 28;
DiffractionPattern.prototype.experiment_wavelength = 0.71073;
DiffractionPattern.prototype.experiment_randomSeed = 1234;
DiffractionPattern.prototype.experiment_scaleFactor = 135;

DiffractionPattern.prototype.display_hk0 = true;
DiffractionPattern.prototype.display_hk1 = false;
DiffractionPattern.prototype.display_h0l = true;
DiffractionPattern.prototype.display_h1l = false;
DiffractionPattern.prototype.display_okl = true;
DiffractionPattern.prototype.display_ikl = false;
DiffractionPattern.prototype.display_hhl = false;
DiffractionPattern.prototype.display_hhh = false;
DiffractionPattern.prototype.display_axes = false;
DiffractionPattern.prototype.display_index = false;

DiffractionPattern.prototype.quiz_allowTriclinic = false;
DiffractionPattern.prototype.quiz_allowMonoclinic = true;
DiffractionPattern.prototype.quiz_allowOrthorhombic = true;
DiffractionPattern.prototype.quiz_allowTetragonal = false;
DiffractionPattern.prototype.quiz_allowTrigonal = false;
DiffractionPattern.prototype.quiz_allowHexagonal = false;
DiffractionPattern.prototype.quiz_allowCubic = false;

DiffractionPattern.prototype.seededRandom = function(max, min)
{
  max = max || 1;
  min = min || 0;

  this.currentSeed = (this.currentSeed * 9301 + 49297) % 233280;
  var rnd = this.currentSeed / 233280;

  return min + rnd * (max - min);
}

DiffractionPattern.prototype.randomCrystal = function(targetWidth)
{
  targetWidth = typeof targetWidth !== 'undefined' ? targetWidth : -1;
  
  // resolutionLimit, wavelength and scaleFactor are not randomized!
  // allowed crystal systems are obivously also not randomized
  
  // random randomSeed :D
  this.experiment_randomSeed = Math.floor(Math.random() * 65534);
  // initialise PRNG
  this.currentSeed = this.experiment_randomSeed;
  
  // random lattice constants with some sensible limits
  this.lattice_a = Math.floor(this.seededRandom(35, 80))/10; 
  this.lattice_b = Math.floor(this.seededRandom(50, 95))/10;
  this.lattice_c = Math.floor(this.seededRandom(65, 110))/10;
  this.lattice_alpha = Math.floor(this.seededRandom(600, 900))/10;
  this.lattice_beta = Math.floor(this.seededRandom(900, 1300))/10;
  this.lattice_gamma = Math.floor(this.seededRandom(800, 1000))/10;
  this.lattice_centered = false;
  
  // random space group
  this.lattice_spaceGroup = this.symmetry_randomSpaceGroup();
  
  // make sure lattice constants match the space group requirements
  this.symmetry_forceLatticeConstants();  
  
  // what layers are needed?
  this.display_okl = true; // always
  this.display_hk0 = false;
  this.display_h0l = false;
  this.display_hhl = false;
  this.display_hhh = false;
  this.display_ikl = false;
  this.display_hk1 = false;
  this.display_h1l = false;
  
  if (this.lattice_spaceGroup <= 74) // for triclinic monoclinic and orthorhombic
  {
    this.display_hk0 = true;
    this.display_h0l = true;
  }
  else if (this.lattice_spaceGroup <= 194) // for tetragonal trigonal and hexagonal
  {
    this.display_hk0 = true;
    this.display_hhl = true;
  }
  else
  {
    this.display_hhl = true;
    this.display_hhh = true;
  }
  
  if (!this.generatePattern(targetWidth))
  {
    this.lastError = "Bad angles - volume calculation failed!";
    return;
  }
  
  // always display first layer if centered
  // also sometimes when primitive :D
  if ((this.lattice_centered) || (Math.floor(this.seededRandom(1, 3)) - 1))
  {
    this.display_hk1 = this.display_hk0;
    this.display_h1l = this.display_h0l;
    this.display_ikl = this.display_okl;
  }  
}

DiffractionPattern.prototype.generatePattern = function(targetWidth)
{  
  targetWidth = typeof targetWidth !== 'undefined' ? targetWidth : -1;
  
  var dmax = this.experiment_wavelength / (2 * Math.sin(this.experiment_resolutionLimit / 180 * Math.PI));

  if (targetWidth !== -1)
    this.experiment_scaleFactor = targetWidth * 0.95 / 2 * dmax;

  this.reciprocal_limit = this.experiment_scaleFactor / dmax;
                                    
  this.symmetry_forceLatticeConstants();

  var aRadian = this.lattice_alpha/180*Math.PI;
  var bRadian = this.lattice_beta/180*Math.PI;
  var cRadian = this.lattice_gamma/180*Math.PI;

  this.lattice_volume = this.lattice_a * this.lattice_b * this.lattice_c 
                      * Math.sqrt(1 - Math.pow(Math.cos(aRadian), 2)
                        - Math.pow(Math.cos(bRadian), 2) - Math.pow(Math.cos(cRadian), 2) 
                        + 2 * Math.cos(aRadian) * Math.cos(bRadian) * Math.cos(cRadian));
  
  if (!isFinite(this.lattice_volume))
  {
    console.log("Bad angles - volume calculation failed!");
    return false;
  }

  this.reciprocal_aaa = this.lattice_b * this.lattice_c * Math.sin(aRadian)/this.lattice_volume;
  this.reciprocal_bbb = this.lattice_a * this.lattice_c * Math.sin(bRadian)/this.lattice_volume;
  this.reciprocal_ccc = this.lattice_a * this.lattice_b * Math.sin(cRadian)/this.lattice_volume;

  this.reciprocal_a = this.experiment_scaleFactor * this.reciprocal_aaa;
  this.reciprocal_b = this.experiment_scaleFactor * this.reciprocal_bbb;
  this.reciprocal_c = this.experiment_scaleFactor * this.reciprocal_ccc;    
  
  this.reciprocal_cosa = (Math.cos(bRadian)*Math.cos(cRadian) - Math.cos(aRadian))
                        / (Math.sin(bRadian)*Math.sin(cRadian));
  this.reciprocal_cosb = (Math.cos(aRadian)*Math.cos(cRadian) - Math.cos(bRadian))
                        / (Math.sin(aRadian)*Math.sin(cRadian));
  this.reciprocal_cosc = (Math.cos(aRadian)*Math.cos(bRadian) - Math.cos(cRadian))
                        / (Math.sin(aRadian)*Math.sin(bRadian));
  
  this.reciprocal_alpha = Math.acos(this.reciprocal_cosa);
  this.reciprocal_beta = Math.acos(this.reciprocal_cosb);
  this.reciprocal_gamma = Math.acos(this.reciprocal_cosc);  
                      
  this.reciprocal_hhlAngle = this.reciprocal_interzonalAngle(1, 1, 0, 0, 0, 1);
  this.reciprocal_hhhAngle = this.reciprocal_interzonalAngle(1, 1, 0, 0, 1, 1);  
  
  this.reciprocal_hhAxis = Math.sqrt(Math.pow(this.reciprocal_a, 2) + Math.pow(this.reciprocal_b, 2) + 2*this.reciprocal_a*this.reciprocal_b*Math.cos(this.reciprocal_gamma));
  this.reciprocal_hhh110Axis = Math.sqrt(Math.pow(this.reciprocal_a, 2) + Math.pow(this.reciprocal_b, 2) + 2*this.reciprocal_a*this.reciprocal_b*Math.cos(this.reciprocal_gamma));
  this.reciprocal_hhh011Axis = Math.sqrt(Math.pow(this.reciprocal_b, 2) + Math.pow(this.reciprocal_c, 2) + 2*this.reciprocal_b*this.reciprocal_c*Math.cos(this.reciprocal_alpha));

  this.reciprocal_hMax = Math.floor(this.reciprocal_limit / this.reciprocal_a) + 1;
  this.reciprocal_kMax = Math.floor(this.reciprocal_limit / this.reciprocal_b) + 1;
  this.reciprocal_lMax = Math.floor(this.reciprocal_limit / this.reciprocal_c) + 1;
  this.reciprocal_hhMax = Math.floor(this.reciprocal_limit / this.reciprocal_hhAxis) + 1;
  this.reciprocal_hhhMax = Math.floor(this.reciprocal_limit / this.reciprocal_hhh011Axis) + 1;

  this.reciprocal_hkl = [];
  this.reciprocal_hkl = Array((2*this.reciprocal_hMax+1)*(2*this.reciprocal_kMax+1)*(2*this.reciprocal_lMax+1));
  
  this.currentSeed = this.experiment_randomSeed;
  
  for (i = 0; i < this.reciprocal_hkl.length; i++)
    this.reciprocal_hkl[i] = Math.trunc(this.seededRandom(2000, 10000));
  
  this.symmetry_systematicExtinction();
  this.symmetry_forceLaue();
  this.symmetry_setEXSymbol(this.lattice_spaceGroup);
  this.symmetry_setSolution();
  
  this.hkl_file = "";

  var list = "";
  var theta;
  
  this.reciprocal_setHKL(0, 0, 0, 0);

  function pad(num, size)
  {
    var s = "";
    if (num.toString().length >= size)
      return num.toString().substr(0, size);
    else
      s = "         " + num;
    return s.substr(s.length-size);
  }

  for (var h = -1*this.reciprocal_hMax; h <= this.reciprocal_hMax; h++)
    for (var k = -1*this.reciprocal_kMax; k <= this.reciprocal_kMax; k++)
      for (var l = -1*this.reciprocal_lMax; l <= this.reciprocal_lMax; l++)
      {
        theta = this.reciprocal_getThetaFromHKL(h, k, l);

        if (theta > this.experiment_resolutionLimit)
          this.reciprocal_setHKL(h, k, l, 0);
        else
          this.reciprocal_setHKL(h, k, l, Math.trunc(this.reciprocal_getHKL(h, k, l)
                                          / Math.exp(theta / (this.experiment_resolutionLimit*1.35))));
    
        if (this.debug)
          list += pad(h, 4) + pad(k, 4) + pad(l, 4) + pad(this.reciprocal_getHKL(h, k, l) , 8) + "    1.30   1\n";  
      }

  if (this.debug)
    this.hkl_file = list;

  return true;
}

DiffractionPattern.prototype.getHash = function()
{
  var layersToDisplay = this.display_hk0 + 2*this.display_h0l + 4*this.display_okl 
            + 8*this.display_hk1 + 16*this.display_h1l + 32*this.display_ikl 
            + 64*this.display_hhl + 128*this.display_hhh;
            
  var moreDisplay = this.display_axes + 2*this.display_index;
            
  var quizSettings = this.quiz_allowTriclinic + 2*this.quiz_allowMonoclinic + 4*this.quiz_allowOrthorhombic
            + 8*this.quiz_allowTetragonal + 16*this.quiz_allowTrigonal + 32*this.quiz_allowHexagonal + 
            64*this.quiz_allowCubic;
  
  var bytes = Array(this.hashLength);
  var tmp;

  // allow 65.535 Angstrom as max value
  tmp = this.lattice_a*1000;
  bytes[0] = tmp % 0x100;
  bytes[1] = Math.trunc(tmp / 0x100);

  tmp = this.lattice_b*1000;
  bytes[2] = tmp % 0x100;
  bytes[3] = Math.trunc(tmp / 0x100);

  tmp = this.lattice_c*1000;
  bytes[4] = tmp % 0x100;
  bytes[5] = Math.trunc(tmp / 0x100);

  // allow "655.35 degrees" as max value  
  tmp = this.lattice_alpha*100;
  bytes[6] = tmp % 0x100;
  bytes[7] = Math.trunc(tmp / 0x100);

  tmp = this.lattice_beta*100;
  bytes[8] = tmp % 0x100;
  bytes[9] = Math.trunc(tmp / 0x100);

  tmp = this.lattice_gamma*100;
  bytes[10] = tmp % 0x100;
  bytes[11] = Math.trunc(tmp / 0x100);

  // single byte (max spaceGroup 230)
  bytes[12] = this.lattice_spaceGroup;

  // allow 16.777216 Angstrom as wavelength
  tmp = this.experiment_wavelength*1000000;
  bytes[13] = tmp % 0x100;
  tmp = Math.trunc(tmp / 0x100);
  bytes[14] = tmp % 0x100;
  bytes[15] = Math.trunc(tmp / 0x100);

  // allow 655.35 degrees as resolution limit
  tmp = this.experiment_resolutionLimit*100;
  bytes[16] = tmp % 0x100;
  bytes[17] = Math.trunc(tmp / 0x100);  
  
  // allow 65536 as max value
  bytes[18] = this.experiment_randomSeed % 0x100;
  bytes[19] = Math.trunc(this.experiment_randomSeed / 0x100);

  bytes[20] = layersToDisplay;
  bytes[21] = moreDisplay;  
  bytes[22] = quizSettings;    
  
  //bytes[23,24] magic word for now  
  bytes[23] = 67;
  bytes[24] = 76;

  //bytes[23] = this.experiment_ScaleFactor % 0x100;
  //bytes[24] = Math.trunc(this.experiment_ScaleFactor / 0x100);
  
  var hash = "";
  var shift = this.hashShift;
  
  for (var i = 0; i < bytes.length; i++)
  {
    tmp = bytes[i] ^ shift;
    if (tmp >= 16)
      hash += '' + tmp.toString(16);
    else
      hash += '0' + tmp.toString(16);
    shift = tmp;
  }

  return hash;
}

DiffractionPattern.prototype.setHash = function(hash)
{
  var values = "";
  var tmp;
  var shift = this.hashShift;
  var pos = 0;

  var bytes = Array((hash.length / 2).toFixed(0));
  
  if (bytes != this.hashLength)
  {
    console.log("hash length invalid!");
    return false;
  }
  
  for (var i = 0; i < hash.length; i = i+2)
  {
    tmp = parseInt(hash.substr(i, 2), 16);
    bytes[pos] = tmp ^ shift;
    pos++;
    shift = tmp;
  }
  
  //check magic word
  if (!((bytes[23] == 67) && (bytes[24] == 76)))
  {
    console.log("invalid hash");
    return false;
  }

  this.lattice_a = (bytes[0] + 0x100 * bytes[1])/1000;
  this.lattice_b = (bytes[2] + 0x100 * bytes[3])/1000;
  this.lattice_c = (bytes[4] + 0x100 * bytes[5])/1000;
  this.lattice_alpha = (bytes[6] + 0x100 * bytes[7])/100;
  this.lattice_beta = (bytes[8] + 0x100 * bytes[9])/100;
  this.lattice_gamma = (bytes[10] + 0x100 * bytes[11])/100;
  this.lattice_spaceGroup = bytes[12];
  this.experiment_wavelength = (bytes[13] + 0x100 * bytes[14] + 0x10000 * bytes[15])/1000000;
  this.experiment_resolutionLimit = (bytes[16] + 0x100 * bytes[17])/100;
  this.experiment_randomSeed = bytes[18] + 0x100 * bytes[19];
  var layersToDisplay = bytes[20];
  var moreDisplay = bytes[21];
  var quizSettings = bytes[22];
  //this.experiment_scaleFactor = bytes[23] + 0x100 * bytes[24];
  
  
  if (layersToDisplay & 1) this.display_hk0 = true; else this.display_hk0 = false;
  if (layersToDisplay & 2) this.display_h0l = true; else this.display_h0l = false;
  if (layersToDisplay & 4) this.display_okl = true; else this.display_okl = false;
  if (layersToDisplay & 8) this.display_hk1 = true; else this.display_hk1 = false;
  if (layersToDisplay & 16) this.display_h1l = true; else this.display_h1l = false;
  if (layersToDisplay & 32) this.display_ikl = true; else this.display_ikl = false;
  if (layersToDisplay & 64) this.display_hhl = true; else this.display_hhl = false;
  if (layersToDisplay & 128) this.display_hhh = true; else this.display_hhh = false;
 
  if (moreDisplay & 1) this.display_axes = true; else this.display_axes = false;
  if (moreDisplay & 2) this.display_index = true; else this.display_index = false;

  if (quizSettings & 1) this.quiz_allowTriclinic = true; else this.quiz_allowTriclinic = false;
  if (quizSettings & 2) this.quiz_allowMonoclinic = true; else this.quiz_allowMonoclinic = false;
  if (quizSettings & 4) this.quiz_allowOrthorhombic = true; else this.quiz_allowOrthorhombic = false;
  if (quizSettings & 8) this.quiz_allowTetragonal = true; else this.quiz_allowTetragonal = false;
  if (quizSettings & 16) this.quiz_allowTrigonal = true; else this.quiz_allowTrigonal = false;
  if (quizSettings & 32) this.quiz_allowHexagonal = true; else this.quiz_allowHexagonal = false;
  if (quizSettings & 64) this.quiz_allowCubic = true; else this.quiz_allowCubic = false;
  
  return true;
}

DiffractionPattern.prototype.draw_radius = function(layer, r1, r2)
{
  switch (layer)
  {
    case "hk0": return Math.trunc(this.reciprocal_getHKL(r1, r2, 0) / 10000 * this.experiment_scaleFactor/20);
    case "hk1": return Math.trunc(this.reciprocal_getHKL(r1, r2, 1) / 10000 * this.experiment_scaleFactor/20);
    case "h0l": return Math.trunc(this.reciprocal_getHKL(r1, 0, r2) / 10000 * this.experiment_scaleFactor/20);
    case "h1l": return Math.trunc(this.reciprocal_getHKL(r1, 1, r2) / 10000 * this.experiment_scaleFactor/20);
    case "0kl": return Math.trunc(this.reciprocal_getHKL(0, r1, r2) / 10000 * this.experiment_scaleFactor/20);
    case "1kl": return Math.trunc(this.reciprocal_getHKL(1, r1, r2) / 10000 * this.experiment_scaleFactor/20);
    case "hhl": return Math.trunc(this.reciprocal_getHKL(r1, r1, r2) / 10000 * this.experiment_scaleFactor/20);
    case "hhh": return Math.trunc(this.reciprocal_getHKL(r1, r1 + r2, r2) / 10000 * this.experiment_scaleFactor/20);
    default: return 0;
  }
}

DiffractionPattern.prototype.draw_ellipsis = function(context, x, y, rx, ry, width, color)
{
  color = typeof color !== 'undefined' ? color : "green";  
  width = typeof width !== 'undefined' ? width : 0.25;
  
  context.save(); // save state
  context.beginPath();
  context.translate(x-rx, y-ry);
  context.scale(rx, ry);
  context.arc(1, 1, 1, 0, 2 * Math.PI, false);
  context.closePath();
  context.lineWidth = width;
  context.strokeStyle = color;
  context.stroke();
  context.restore(); // restore to original state
}

DiffractionPattern.prototype.draw_arrow = function(context, x, y, length, angle, text)
{
  context.save(); // save state  
  context.beginPath();
  context.translate(x, y);
  context.rotate(-1*angle);
  context.moveTo(0, 0);
  context.lineTo(length, 0);
  context.strokeStyle = '#FF6363';
  context.closePath();
  context.stroke();
  context.beginPath()
  context.lineTo(length, -5);
  context.lineTo(length + 5, 0);
  context.lineTo(length,5);
  context.lineTo(length, 0);
  context.closePath();
  context.fillStyle = '#FF6363';
  context.fill();
  //context.translate(length + 7, 5);
  //context.rotate(angle);
  //context.font = "bold italic 14px Tahoma";
  //context.fillText(text,  Math.sin(angle) * -10, Math.sin(angle) * -4);
  context.restore(); // restore to original state  
}

DiffractionPattern.prototype.draw_calcXY = function(layer, r1, r2)
{
  var x = 0;
  var y = 0;
  var dx = 0;
  var dy = 0;
  
  switch (layer)
  {
    case "hk1": case "hk0":
      x = this.reciprocal_a * r1 + this.reciprocal_b * r2 * Math.cos(this.reciprocal_gamma);
      y = this.reciprocal_b * r2 * Math.sin(this.reciprocal_gamma);
    break;
    
    case "h1l": case "h0l":
      x = this.reciprocal_a * r1 + this.reciprocal_c * r2 * Math.cos(this.reciprocal_beta);
      y = this.reciprocal_c * r2 * Math.sin(this.reciprocal_beta);
    break;
    
    case "1kl": case "0kl":
      x = this.reciprocal_b * r1 + this.reciprocal_c * r2 * Math.cos(this.reciprocal_alpha);
      y = this.reciprocal_c * r2 * Math.sin(this.reciprocal_alpha);
    break;
    
    case "hhl":
      x = this.reciprocal_hhAxis * r1 + this.reciprocal_c * r2 * Math.cos(this.reciprocal_hhlAngle);
      y = this.reciprocal_c * r2 * Math.sin(this.reciprocal_hhlAngle);
    break;

    case "hhh":
      x = this.reciprocal_hhh110Axis * r1 + this.reciprocal_hhh011Axis * r2 * Math.cos(this.reciprocal_hhhAngle);
      y = this.reciprocal_hhh011Axis * r2 * Math.sin(this.reciprocal_hhhAngle);
    break;
  }
  
  switch (layer)
  {
    case "1kl":
      var dx = this.reciprocal_a * Math.cos(this.reciprocal_gamma);
      var dy = this.reciprocal_a * Math.cos(this.reciprocal_beta);      
    break;

    case "h1l":
      var dx = this.reciprocal_b * Math.cos(this.reciprocal_gamma);
      var dy = this.reciprocal_b * Math.cos(this.reciprocal_alpha);      
    break;
    
    case "hk1":
      var dx = this.reciprocal_c * Math.cos(this.reciprocal_beta);
      var dy = this.reciprocal_c * Math.cos(this.reciprocal_alpha);      
    break;
  }
  
  return {x : (dx+x), y : (dy+y)};
}

DiffractionPattern.prototype.draw_layer = function(canvas, layer, reflection)
{
  reflection = typeof reflection !== 'undefined' ? reflection : false;
  
  var context = canvas.getContext("2d");
  var angle;
  var thirdIndex = 0;
  var pos;
  var r1Max, r2Max;  
  var labelX, labelY;
  
  switch (layer)
  {
    case "hk1": case "hk0": angle = this.reciprocal_gamma; break;
    case "h1l": case "h0l": angle = this.reciprocal_beta; break;
    case "1kl": case "0kl": angle = this.reciprocal_alpha; break;
    case "hhl": angle = this.reciprocal_hhlAngle; break;
    case "hhh": angle = this.reciprocal_hhhAngle; break;
    default: break;
  }
  
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // set limiting indices according to layer
  switch (layer)
  {
    case "hk1": thirdIndex = 1;
    case "hk0":
      r1Max = this.reciprocal_hMax;
      r2Max = this.reciprocal_kMax;
      labelX = "h";
      labelY = "k";
    break;
    
    case "h1l": thirdIndex = 1;
    case "h0l":
      r1Max = this.reciprocal_hMax;
      r2Max = this.reciprocal_lMax;
      labelX = "h";
      labelY = "l";
    break;
    
    case "1kl": thirdIndex = 1;
    case "0kl":
      r1Max = this.reciprocal_kMax;
      r2Max = this.reciprocal_lMax;
      labelX = "k";
      labelY = "l";
    break;
    
    case "hhl":
      r1Max = this.reciprocal_hhMax;
      r2Max = this.reciprocal_lMax;
      labelX = "[110]";
      labelY = "l";
    break;
    
    case "hhh":
      r1Max = this.reciprocal_hhMax;
      r2Max = this.reciprocal_hhhMax;
      labelX = "[110]";
      labelY = "[011]";
    break;
    
    default: console.log("Drawing of layer %s not implemented", layer);
  }
  
  // draw reciprocal axis
  if (this.display_axes)
  {
    pos = this.draw_calcXY(layer, 0, 0);
    this.draw_arrow(context, canvas.width/2 + pos.x, canvas.height/2 - pos.y, this.reciprocal_limit - 10 - pos.x, 0, labelX);
    this.draw_arrow(context, canvas.width/2 + pos.x, canvas.height/2 - pos.y, this.reciprocal_limit - 10 - pos.y, angle, labelY);
  }  

  //draw resolution limit
  this.draw_ellipsis(context, canvas.width/2, canvas.height/2, this.reciprocal_limit, this.reciprocal_limit, 0.01, "gray");

  context.beginPath();
  
  for (var r1 = -1*r1Max; r1 <= r1Max; r1++)
    for (var r2 = -1*r2Max; r2 <= r2Max; r2++)
    {
      pos = this.draw_calcXY(layer, r1, r2);
      context.moveTo(canvas.width/2 + pos.x, canvas.height/2 - pos.y);
      context.arc(canvas.width/2 + pos.x, canvas.height/2 - pos.y, this.draw_radius(layer, r1, r2), 0, Math.PI*2, true);
    }      
  
  context.closePath();
  context.fill();
    
  switch(layer) // mark 000
  {
    case "hk0": case "h0l": case "0kl": case "hhl": case "hhh":
      context.beginPath();
      context.moveTo(canvas.width/2 + 4, canvas.height/2);
      context.arc(canvas.width/2, canvas.height/2, 3, 0, Math.PI*2, true);
      context.closePath();
      context.save();
      context.strokeStyle = 'red';
      context.stroke();
      context.restore(); 
     break;
     default: break;
  }
  
  if (this.display_index && reflection)
  {
    var theta = this.reciprocal_getThetaFromHKL(reflection.h, reflection.k, reflection.l);
    //var txt = "" + reflection.h  + " " + reflection.k + " " + reflection.l + " (" + Math.trunc(theta*100)/100 + " deg.)";
    var txt = "" + reflection.h  + " " + reflection.k + " " + reflection.l;
    var r = this.experiment_scaleFactor/18;

    var textx;
    var texty;

    var fontSize = 14;
    
    context.save();    
    context.font = "bold " + fontSize + "px Tahoma";

    var textSize = context.measureText(txt);

    if (reflection.x >= 0)
      textx = reflection.x - textSize.width - 10;
    else
      textx = reflection.x + 10;

    if (reflection.y < 0)
      texty = reflection.y + fontSize + 10;
    else
      texty = reflection.y - 10;

    context.textBaseline = "top";
    context.fillStyle = "white";    
    context.fillRect(canvas.width/2 + textx - 2, canvas.height/2 - texty - 2, textSize.width + 4, fontSize + 4);
    context.strokeStyle = "green";
    context.strokeRect(canvas.width/2 + textx - 2, canvas.height/2 - texty - 2, textSize.width + 4, fontSize + 4);
    context.fillStyle = "black";
    context.fillText(txt, canvas.width/2 + textx, canvas.height/2 - texty);
    context.restore();
    
    this.draw_ellipsis(context, canvas.width/2 + reflection.x, canvas.height/2 - reflection.y, r, r);
  }
}

DiffractionPattern.prototype.draw_posToHKL = function(layer, x, y)
{
  var h, k, l;
  var found = false;
  var thirdIndex = 0;
  var r1, r2;
  var pos;
  
  var precision = Math.round(this.experiment_scaleFactor/28);
  
  var center = this.draw_calcXY(layer, 0, 0);
  
  y = y * -1;
  
  switch (layer)
  {
    case "hk1": thirdIndex = 1; x = x - center.x; y = y - center.y;
    case "hk0":
     k = y / (this.reciprocal_b * Math.sin(this.reciprocal_gamma));
     h = (x - this.reciprocal_b * k * Math.cos(this.reciprocal_gamma)) / this.reciprocal_a;
     l = thirdIndex;
     
     if ((Math.abs(k - Math.round(k)) < (precision / this.reciprocal_b)) &&
         (Math.abs(h - Math.round(h)) < (precision / this.reciprocal_a)))
     {
       found = true;
       h = Math.round(h);
       k = Math.round(k);
       
       pos = this.draw_calcXY(layer, h, k);
     }
     
    break;

    case "h1l": thirdIndex = 1; x = x - center.x; y = y - center.y;
    case "h0l":
     l = y / (this.reciprocal_c * Math.sin(this.reciprocal_beta));
     h = (x - this.reciprocal_c * l * Math.cos(this.reciprocal_beta)) / this.reciprocal_a;
     k = thirdIndex;
     
     if ((Math.abs(l - Math.round(l)) < (precision / this.reciprocal_c)) &&
         (Math.abs(h - Math.round(h)) < (precision / this.reciprocal_a)))
     {
       found = true;
       h = Math.round(h);
       l = Math.round(l);
       
       pos = this.draw_calcXY(layer, h, l);
     }
     
    break;

    case "1kl": thirdIndex = 1; x = x - center.x; y = y - center.y;
    case "0kl":
     l = y / (this.reciprocal_c * Math.sin(this.reciprocal_alpha));
     k = (x - this.reciprocal_c * l * Math.cos(this.reciprocal_alpha)) / this.reciprocal_b;
     h = thirdIndex;
     
     if ((Math.abs(k - Math.round(k)) < (precision / this.reciprocal_b)) &&
         (Math.abs(l - Math.round(l)) < (precision / this.reciprocal_c)))
     {
       found = true;
       k = Math.round(k);
       l = Math.round(l);
       
       pos = this.draw_calcXY(layer, k, l);
     }
     
    break;  

    case "hhl":
     l = y / (this.reciprocal_c * Math.sin(this.reciprocal_hhlAngle));
     r1 = (x - this.reciprocal_c * l * Math.cos(this.reciprocal_hhlAngle)) / this.reciprocal_hhAxis;
     
     if ((Math.abs(r1 - Math.round(r1)) < (precision / this.reciprocal_hhAxis)) &&
         (Math.abs(l - Math.round(l)) < (precision / this.reciprocal_c)))
     {
       found = true;
       h = Math.round(r1);
       k = h;
       l = Math.round(l);
       
       pos = this.draw_calcXY(layer, h, l);
     }
     
    break;

    case "hhh":
     r2 = y / (this.reciprocal_hhh011Axis * Math.sin(this.reciprocal_hhhAngle));
     r1 = (x - this.reciprocal_hhh011Axis * r2 * Math.cos(this.reciprocal_hhhAngle)) / this.reciprocal_hhh110Axis;
     
     if ((Math.abs(r1 - Math.round(r1)) < (precision / this.reciprocal_hhh110Axis)) &&
         (Math.abs(r2 - Math.round(r2)) < (precision / this.reciprocal_hhh011Axis)))
     {
       found = true;
       h = Math.round(r1);
       l = Math.round(r2);
       k = h + l;
       
       pos = this.draw_calcXY(layer, h, l);
     }
     
    break;
    
    default: console.log("Calculating of hkl index forlayer %s not implemented", layer);
  }

  if (found)
  {
    var theta = this.reciprocal_getThetaFromHKL(h, k, l);
    if (theta > this.experiment_resolutionLimit)
      found = false;
    else
    {
      var x = pos.x;
      var y = pos.y;  
    }
  }
  
  return {found : found, h : h, k : k, l : l, x : x, y : y};
}

DiffractionPattern.prototype.reciprocal_setHKL = function(h, k, l, intensity)
{
  if ((Math.abs(h) > this.reciprocal_hMax)
    || (Math.abs(k) > this.reciprocal_kMax)
    || (Math.abs(l) > this.reciprocal_lMax))
  {
    //console.log("setHKL: index exceeds range: h: %d k: %d l: %d", h, k, l);
    return;
  }
  
  var i = (h+this.reciprocal_hMax)*(2*this.reciprocal_kMax+1)*(2*this.reciprocal_lMax+1)
          + (k+this.reciprocal_kMax)*(2*this.reciprocal_lMax+1) + l+this.reciprocal_lMax;
          
  this.reciprocal_hkl[i] = intensity;
}

DiffractionPattern.prototype.reciprocal_getHKL = function(h, k, l)
{
  if ((Math.abs(h) > this.reciprocal_hMax) 
    || (Math.abs(k) > this.reciprocal_kMax) 
    || (Math.abs(l) > this.reciprocal_lMax))
  {
    //console.log("getHKL: index exceeds range: h: %d k: %d l: %d", h, k, l);
    return 0;
  }
  
  var i = (h+this.reciprocal_hMax)*(2*this.reciprocal_kMax+1)*(2*this.reciprocal_lMax+1)
          + (k+this.reciprocal_kMax)*(2*this.reciprocal_lMax+1) + l+this.reciprocal_lMax;
          
  return this.reciprocal_hkl[i];
}

DiffractionPattern.prototype.reciprocal_getThetaFromHKL = function(h, k, l)
{ 
  var sinTheta = this.experiment_wavelength/2 * Math.sqrt(Math.pow(h*this.reciprocal_aaa, 2) 
                + Math.pow(k*this.reciprocal_bbb, 2) + Math.pow(l*this.reciprocal_ccc, 2) 
                + 2*k*l*this.reciprocal_bbb * this.reciprocal_ccc * this.reciprocal_cosa 
                + 2*l*h*this.reciprocal_ccc * this.reciprocal_aaa * this.reciprocal_cosb 
                + 2*h*k*this.reciprocal_aaa * this.reciprocal_bbb * this.reciprocal_cosc);
                
  if (sinTheta > 1.0)
  {
    //console.log("sinTheta %f; h %d k %d l %d", sinTheta, h, k, l);    
    sinTheta = 1.0;
  }
  
  return Math.asin(sinTheta)/Math.PI*180;
}

DiffractionPattern.prototype.reciprocal_interzonalAngle = function(u1, v1, w1, u2, v2, w2)
{
  var cosPhi = (this.reciprocal_a*this.reciprocal_a*u1*u2 + this.reciprocal_b*this.reciprocal_b*v1*v2
                  + this.reciprocal_c*this.reciprocal_c*w1*w2
                  + this.reciprocal_a*this.reciprocal_b*(u1*v2+u2*v1)*Math.cos(this.reciprocal_gamma)
                  + this.reciprocal_a*this.reciprocal_c*(u1*w2+u2*w1)*Math.cos(this.reciprocal_beta)
                  + this.reciprocal_b*this.reciprocal_c*(v1*w2+v2*w1)*Math.cos(this.reciprocal_alpha)) /
                (Math.sqrt(this.reciprocal_a*this.reciprocal_a*u1*u1 + this.reciprocal_b*this.reciprocal_b*v1*v1
                  + this.reciprocal_c*this.reciprocal_c*w1*w1 
                  + 2*this.reciprocal_a*this.reciprocal_b*u1*v1*Math.cos(this.reciprocal_gamma)
                  + 2*this.reciprocal_a*this.reciprocal_c*u1*w1*Math.cos(this.reciprocal_beta)
                  + 2*this.reciprocal_b*this.reciprocal_c*v1*w1*Math.cos(this.reciprocal_alpha))
                * Math.sqrt(this.reciprocal_a*this.reciprocal_a*u2*u2 + this.reciprocal_b*this.reciprocal_b*v2*v2
                  + this.reciprocal_c*this.reciprocal_c*w2*w2 
                  + 2*this.reciprocal_a*this.reciprocal_b*u2*v2*Math.cos(this.reciprocal_gamma)
                  + 2*this.reciprocal_a*this.reciprocal_c*u2*w2*Math.cos(this.reciprocal_beta)
                  + 2*this.reciprocal_b*this.reciprocal_c*v2*w2*Math.cos(this.reciprocal_alpha)));
              
  if (cosPhi > 1.0)
    cosPhi = 1.0;
  
  //return Math.acos(cosPhi)/Math.PI*180;
  return Math.acos(cosPhi);
}

DiffractionPattern.prototype.symmetry_randomSpaceGroup = function()
{
  var maxCount = this.quiz_allowTriclinic * 2 + this.quiz_allowMonoclinic * 13 + 
                this.quiz_allowOrthorhombic * 59 + this.quiz_allowTetragonal * 68 + 
                this.quiz_allowTrigonal * 25 + this.quiz_allowHexagonal * 27 + 
                this.quiz_allowCubic * 36;

  if (maxCount == 0)
  {
    return Math.floor(this.seededRandom(1, 231));
  }

  var r = Math.floor(this.seededRandom(0, maxCount+1));
  var i = 1;

  for (i = 1; i <= 2; i++)
  {
    if (this.quiz_allowTriclinic) r = r-1;
    if (r <= 0) break;
  }

  if (r > 0)
    for (i = i; i <= 15; i++)
    {
      if  (this.quiz_allowMonoclinic) r = r-1;
      if (r <= 0) break;
    }      

  if (r > 0)
    for (i = i; i <= 74; i++)
    {
      if (this.quiz_allowOrthorhombic) r = r-1;
      if (r <= 0) break;
    }      

  if (r > 0)
    for (i = i; i <= 142; i++)
    {
      if (this.quiz_allowTetragonal) r = r-1;
      if (r <= 0) break;
    }      

  if (r > 0)
    for (i = i; i <= 167; i++)
    {
      if (this.quiz_allowTrigonal) r = r-1;
      if (r <= 0) break;
    }      

  if (r > 0)
    for (i = i; i <= 194; i++)
    {
      if (this.quiz_allowHexagonal) r = r-1;
      if (r <= 0) break;
    }      

  if (r > 0)
    for (i = i; i <= 230; i++)
    {
      if (this.quiz_allowCubic) r = r-1;
      if (r <= 0) break;
    }      

  if (r > 0)
  {
    console.log("random space group failed: r = %d; i = %d", r, i);
    return 230;
  }

  return i;
}

DiffractionPattern.prototype.symmetry_forceLatticeConstants = function()
{
  // force lattice constants to match space group
  
  if (this.lattice_spaceGroup <= 2)
    return;

  if (this.lattice_spaceGroup <= 15) // monoclinic
  {
    this.lattice_alpha = 90;
    this.lattice_gamma = 90;
    return;
  }
  
  if (this.lattice_spaceGroup <= 74) // orthorhombic
  {
    this.lattice_alpha = 90;
    this.lattice_beta = 90;
    this.lattice_gamma = 90;
    return;
  }
  
  if (this.lattice_spaceGroup <= 142) // tetragonal
  {
    this.lattice_b = this.lattice_a;
    this.lattice_alpha = 90;
    this.lattice_beta = 90;
    this.lattice_gamma = 90;
    return;
  }
  
  if (this.lattice_spaceGroup <= 194) // tri/hexagonal
  {
    this.lattice_b = this.lattice_a;
    this.lattice_alpha = 90;
    this.lattice_beta = 90;
    this.lattice_gamma = 120;
    return;
  }
  
  if (this.lattice_spaceGroup <= 230) // cubic
  {
    this.lattice_b = this.lattice_a;
    this.lattice_c = this.lattice_a;
    this.lattice_alpha = 90;
    this.lattice_beta = 90;
    this.lattice_gamma = 90;
    return;
  }
  
  console.log("invalid space group number %d", this.lattice_spaceGroup);
}

DiffractionPattern.prototype.symmetry_forceLaue = function()
{
  if ((this.lattice_spaceGroup < 1) || (this.lattice_spaceGroup > 230))
  {
    console.log("invalid space group number: %d", this.lattice_spaceGroup);
    return;
  }
  
  if (this.lattice_spaceGroup <= 2) //triclinic -1
  {
    for (var h = 0; h <= this.reciprocal_hMax; h++)
      for (var k = -1*this.reciprocal_kMax; k <= this.reciprocal_kMax; k++)
        for (var l = -1*this.reciprocal_lMax; l <= this.reciprocal_lMax; l++)
        {
          if (((h == 0) && (k < 0)) || ((h == 0) && (k == 0) && (l < 0)))
            continue;

          this.reciprocal_setHKL(-1*h, -1*k, -1*l, this.reciprocal_getHKL(h, k, l));
        }

    return;
  }
  
  var i;  
  
  if (this.lattice_spaceGroup <= 15) //monoclinic 2/m
  {
    for (var h = -1*this.reciprocal_hMax; h <= this.reciprocal_hMax; h++)
      for (var k = 0; k <= this.reciprocal_kMax; k++)
        for (var l = 0; l <= this.reciprocal_lMax; l++)
        {
          if ((h < 0) && (l == 0))
            continue;
      
          i = this.reciprocal_getHKL(h, k, l);
          this.reciprocal_setHKL(-1*h, k, -1*l, i);
          this.reciprocal_setHKL(-1*h, -1*k, -1*l, i);
          this.reciprocal_setHKL(h, -1*k, l, i);
        }

    return;
  }
  
  if (this.lattice_spaceGroup <= 74) // orthorhobic mmm
  {
    for (var h = 0; h <= this.reciprocal_hMax; h++)
      for (var k = 0; k <= this.reciprocal_kMax; k++)
        for (var l = 0; l <= this.reciprocal_lMax; l++)
        {         
          i = this.reciprocal_getHKL(h, k, l);
          this.reciprocal_setHKL(h, -1*k, -1*l, i);
          this.reciprocal_setHKL(-1*h, k, -1*l, i);
          this.reciprocal_setHKL(-1*h, -1*k, l, i);
          this.reciprocal_setHKL(-1*h, -1*k, -1*l, i);
          this.reciprocal_setHKL(-1*h, k, l, i);
          this.reciprocal_setHKL(h, -1*k, l, i);
          this.reciprocal_setHKL(h, k, -1*l, i);
        }

    return;
  }

  if (this.lattice_spaceGroup <= 88) // tetragonal 4/m
  {
    for (var h = 0; h <= this.reciprocal_hMax; h++)
      for (var k = 0; k <= this.reciprocal_kMax; k++)
        for (var l = 0; l <= this.reciprocal_lMax; l++)
        {        
          if ((h == 0) && (k > 0))
            continue;
      
          i = this.reciprocal_getHKL(h, k, l);
          this.reciprocal_setHKL(-1*h, -1*k, -1*l, i);
          this.reciprocal_setHKL(h, k, -1*l, i);
          this.reciprocal_setHKL(-1*h, -1*k, l, i);
          this.reciprocal_setHKL(-1*k, h, l, i);
          this.reciprocal_setHKL(k, -1*h, -1*l, i);
          this.reciprocal_setHKL(k, -1*h, l, i);
          this.reciprocal_setHKL(-1*k, h, -1*l, i);
        }
    
    return;
  }
  
  if (this.lattice_spaceGroup <= 142) // tetragonal 4/mmm
  {
    for (var l = 0; l <= this.reciprocal_lMax; l++)
      for (var k = 0; k <= this.reciprocal_kMax; k++)
        for (var h = 0; h <= k; h++)
        {
          i = this.reciprocal_getHKL(h, k, l);
          this.reciprocal_setHKL(-1*h, -1*k, -1*l, i);
          this.reciprocal_setHKL(h, k, -1*l, i);
          this.reciprocal_setHKL(-1*h, -1*k, l, i);
          this.reciprocal_setHKL(-1*k, h, l, i);
          this.reciprocal_setHKL(k, -1*h, -1*l, i);
          this.reciprocal_setHKL(k, -1*h, l, i);
          this.reciprocal_setHKL(-1*k, h, -1*l, i);
          this.reciprocal_setHKL(k, h, l, i);
          this.reciprocal_setHKL(-1*h, k, l, i);
          this.reciprocal_setHKL(-1*k, -1*h, l, i);
          this.reciprocal_setHKL(h, -1*k, l, i);
          this.reciprocal_setHKL(-1*k, -1*h, -1*l, i);
          this.reciprocal_setHKL(h, -1*k, -1*l, i);
          this.reciprocal_setHKL(k, h, -1*l, i);
          this.reciprocal_setHKL(-1*h, k, -1*l, i);
        }

    return;
  }
  
  if (this.lattice_spaceGroup <= 148) // trigonal -3
  {
    for (var h = 0; h <= this.reciprocal_hMax; h++)
      for (var k = 0; k <= this.reciprocal_kMax; k++)
        for (var l = -1*this.reciprocal_lMax; l <= this.reciprocal_lMax; l++)
        {
          if (((k == 0) && (l < 0)) || ((h == 0) && (l <= 0)))
            continue;
      
          i = this.reciprocal_getHKL(h, k, l);
          this.reciprocal_setHKL(k, -1*h-k, l, i);
          this.reciprocal_setHKL(-1*h-k, h, l, i);
      
          this.reciprocal_setHKL(-1*h, -1*k, -1*l, i);
          this.reciprocal_setHKL(-1*k, h+k, -1*l, i);
          this.reciprocal_setHKL(h+k, -1*h, -1*l, i);
        }

    return;
  }  
  
  if (this.lattice_spaceGroup <= 167)
  {
    // trigonal -31m
    if ((this.lattice_spaceGroup == 149) || (this.lattice_spaceGroup == 151) || (this.lattice_spaceGroup == 153) ||
        (this.lattice_spaceGroup == 157) || (this.lattice_spaceGroup == 159) || (this.lattice_spaceGroup == 162) || (this.lattice_spaceGroup == 163))
    {
      for (var l = -1*this.reciprocal_lMax; l <= this.reciprocal_lMax; l++)
        for (var k = 0; k <= this.reciprocal_kMax; k++)
          for (var h = 0; h <= k; h++)
          {
            if ((h == 0) && (l < 0))
              continue;

            i = this.reciprocal_getHKL(h, k, l);
            this.reciprocal_setHKL(k, -1*h-k, l, i);
            this.reciprocal_setHKL(-1*h-k, h, l, i);
        
            this.reciprocal_setHKL(-1*h, -1*k, -1*l, i);
            this.reciprocal_setHKL(-1*k, h+k, -1*l, i);
            this.reciprocal_setHKL(h+k, -1*h, -1*l, i);          

            this.reciprocal_setHKL(k, h, l, i);
            this.reciprocal_setHKL(-1*h-k, k, l, i);
            this.reciprocal_setHKL(h, -1*h-k, l, i);
        
            this.reciprocal_setHKL(-1*k, -1*h, -1*l, i);
            this.reciprocal_setHKL(h+k, -1*k, -1*l, i);
            this.reciprocal_setHKL(-1*h, h+k, -1*l, i);          
          }

      return;
    }
    
    // trigonal -3m1
    for (var h = 0; h <= this.reciprocal_hMax; h++)
      for (var k = 0; k <= this.reciprocal_kMax; k++)
        for (var l = 0; l <= this.reciprocal_lMax; l++)
        {
          if ((l == 0) && (h < k))
            continue;
      
          i = this.reciprocal_getHKL(h, k, l);
          this.reciprocal_setHKL(k, -1*h-k, l, i);
          this.reciprocal_setHKL(-1*h-k, h, l, i);

          this.reciprocal_setHKL(-1*h, -1*k, -1*l, i);
          this.reciprocal_setHKL(-1*k, h+k, -1*l, i);
          this.reciprocal_setHKL(h+k, -1*h, -1*l, i);          

          this.reciprocal_setHKL(-1*k, -1*h, l, i);
          this.reciprocal_setHKL(h+k, -1*k, l, i);
          this.reciprocal_setHKL(-1*h, h+k, l, i);

          this.reciprocal_setHKL(k, h, -1*l, i);
          this.reciprocal_setHKL(-1*h-k, k, -1*l, i);
          this.reciprocal_setHKL(h, -1*h-k, -1*l, i);          
        }

    return;
  }
  
  if (this.lattice_spaceGroup <= 176) //hexagonal 6/m
  {
    for (var h = 0; h <= this.reciprocal_hMax; h++)
      for (var k = 0; k <= this.reciprocal_kMax; k++)
        for (var l = 0; l <= this.reciprocal_lMax; l++)
        {
          if ((h == 0) && (h < k))
            continue;
      
          i = this.reciprocal_getHKL(h, k, l);
          this.reciprocal_setHKL(k, -1*h-k, l, i);
          this.reciprocal_setHKL(-1*h-k, h, l, i);

          this.reciprocal_setHKL(-1*h, -1*k, -1*l, i);
          this.reciprocal_setHKL(-1*k, h+k, -1*l, i);
          this.reciprocal_setHKL(h+k, -1*h, -1*l, i);

          this.reciprocal_setHKL(h, k, -1*l, i);
          this.reciprocal_setHKL(k, -1*h-k, -1*l, i);
          this.reciprocal_setHKL(-1*h-k, h, -1*l, i);

          this.reciprocal_setHKL(-1*h, -1*k, l, i);
          this.reciprocal_setHKL(-1*k, h+k, l, i);
          this.reciprocal_setHKL(h+k, -1*h, l, i);  
        }

    return;
  }
  
  if (this.lattice_spaceGroup <= 194) // hexagonal 6/mmm
  {
    for (var l = 0; l <= this.reciprocal_lMax; l++)
      for (var k = 0; k <= this.reciprocal_kMax; k++)
        for (var h = 0; h <= k; h++)
        {
          i = this.reciprocal_getHKL(h, k, l);
          this.reciprocal_setHKL(k, -1*h-k, l, i);
          this.reciprocal_setHKL(-1*h-k, h, l, i);

          this.reciprocal_setHKL(-1*h, -1*k, -1*l, i);
          this.reciprocal_setHKL(-1*k, h+k, -1*l, i);
          this.reciprocal_setHKL(h+k, -1*h, -1*l, i);

          this.reciprocal_setHKL(h, k, -1*l, i);
          this.reciprocal_setHKL(k, -1*h-k, -1*l, i);
          this.reciprocal_setHKL(-1*h-k, h, -1*l, i);

          this.reciprocal_setHKL(-1*h, -1*k, l, i);
          this.reciprocal_setHKL(-1*k, h+k, l, i);
          this.reciprocal_setHKL(h+k, -1*h, l, i);  

          this.reciprocal_setHKL(k, h, l, i);
          this.reciprocal_setHKL(-1*h-k, k, l, i);
          this.reciprocal_setHKL(h, -1*h-k, l, i);

          this.reciprocal_setHKL(-1*k, -1*h, -1*l, i);
          this.reciprocal_setHKL(h+k, -1*k, -1*l, i);
          this.reciprocal_setHKL(-1*h, h+k, -1*l, i);

          this.reciprocal_setHKL(k, h, -1*l, i);
          this.reciprocal_setHKL(-1*h-k, k, -1*l, i);
          this.reciprocal_setHKL(h, -1*h-k, -1*l, i);

          this.reciprocal_setHKL(-1*k, -1*h, l, i);
          this.reciprocal_setHKL(h+k, -1*k, l, i);
          this.reciprocal_setHKL(-1*h, h+k, l, i);           
        }

    return;
  }
  
  if (this.lattice_spaceGroup <= 206) // cubic m-3
  {
    for (var k = 0; k <= this.reciprocal_kMax; k++)
      for (var l = 0; l <= this.reciprocal_lMax; l++)
        for (var h = 0; (h <= k) && (h <= l); h++)
        {
          if ((h == l) && (h < k))
            continue;
      
          i = this.reciprocal_getHKL(h, k, l);
          this.reciprocal_setHKL(-1*h, k, l, i);
          this.reciprocal_setHKL(h, -1*k, l, i);
          this.reciprocal_setHKL(h, k, -1*l, i);

          this.reciprocal_setHKL(-1*h, -1*k, -1*l, i);
          this.reciprocal_setHKL(h, -1*k, -1*l, i);
          this.reciprocal_setHKL(-1*h, k, -1*l, i);
          this.reciprocal_setHKL(-1*h, -1*k, l, i);

          this.reciprocal_setHKL(k, l, h, i);
          this.reciprocal_setHKL(-1*k, l, h, i);
          this.reciprocal_setHKL(k, -1*l, h, i);
          this.reciprocal_setHKL(k, l, -1*h, i);

          this.reciprocal_setHKL(-1*k, -1*l, -1*h, i);
          this.reciprocal_setHKL(k, -1*l, -1*h, i);
          this.reciprocal_setHKL(-1*k, l, -1*h, i);
          this.reciprocal_setHKL(-1*k, -1*l, h, i);

          this.reciprocal_setHKL(l, h, k, i);
          this.reciprocal_setHKL(-1*l, h, k, i);
          this.reciprocal_setHKL(l, -1*h, k, i);
          this.reciprocal_setHKL(l, h, -1*k, i);

          this.reciprocal_setHKL(-1*l, -1*h, -1*k, i);
          this.reciprocal_setHKL(l, -1*h, -1*k, i);
          this.reciprocal_setHKL(-1*l, h, -1*k, i);
          this.reciprocal_setHKL(-1*l, -1*h, k, i);
        }

    return;
  }
  
  // cubic m-3m
  for (var l = 0; l <= this.reciprocal_lMax; l++)
    for (var k = 0; k <= l; k++)
      for (var h = 0; h <= k; h++)
      {
        i = this.reciprocal_getHKL(h, k, l);
        this.reciprocal_setHKL(-1*h, k, l, i);
        this.reciprocal_setHKL(h, -1*k, l, i);
        this.reciprocal_setHKL(h, k, -1*l, i);

        this.reciprocal_setHKL(-1*h, -1*k, -1*l, i);
        this.reciprocal_setHKL(h, -1*k, -1*l, i);
        this.reciprocal_setHKL(-1*h, k, -1*l, i);
        this.reciprocal_setHKL(-1*h, -1*k, l, i);

        this.reciprocal_setHKL(k, l, h, i);
        this.reciprocal_setHKL(-1*k, l, h, i);
        this.reciprocal_setHKL(k, -1*l, h, i);
        this.reciprocal_setHKL(k, l, -1*h, i);

        this.reciprocal_setHKL(-1*k, -1*l, -1*h, i);
        this.reciprocal_setHKL(k, -1*l, -1*h, i);
        this.reciprocal_setHKL(-1*k, l, -1*h, i);
        this.reciprocal_setHKL(-1*k, -1*l, h, i);

        this.reciprocal_setHKL(l, h, k, i);
        this.reciprocal_setHKL(-1*l, h, k, i);
        this.reciprocal_setHKL(l, -1*h, k, i);
        this.reciprocal_setHKL(l, h, -1*k, i);

        this.reciprocal_setHKL(-1*l, -1*h, -1*k, i);
        this.reciprocal_setHKL(l, -1*h, -1*k, i);
        this.reciprocal_setHKL(-1*l, h, -1*k, i);
        this.reciprocal_setHKL(-1*l, -1*h, k, i);

        this.reciprocal_setHKL(k, h, l, i);
        this.reciprocal_setHKL(-1*k, h, l, i);
        this.reciprocal_setHKL(k, -1*h, l, i);
        this.reciprocal_setHKL(k, h, -1*l, i);

        this.reciprocal_setHKL(-1*k, -1*h, -1*l, i);
        this.reciprocal_setHKL(k, -1*h, -1*l, i);
        this.reciprocal_setHKL(-1*k, h, -1*l, i);
        this.reciprocal_setHKL(-1*k, -1*h, l, i);

        this.reciprocal_setHKL(l, k, h, i);
        this.reciprocal_setHKL(-1*l, k, h, i);
        this.reciprocal_setHKL(l, -1*k, h, i);
        this.reciprocal_setHKL(l, k, -1*h, i);

        this.reciprocal_setHKL(-1*l, -1*k, -1*h, i);
        this.reciprocal_setHKL(l, -1*k, -1*h, i);
        this.reciprocal_setHKL(-1*l, k, -1*h, i);
        this.reciprocal_setHKL(-1*l, -1*k, h, i);

        this.reciprocal_setHKL(h, l, k, i);
        this.reciprocal_setHKL(-1*h, l, k, i);
        this.reciprocal_setHKL(h, -1*l, k, i);
        this.reciprocal_setHKL(h, l, -1*k, i);

        this.reciprocal_setHKL(-1*h, -1*l, -1*k, i);
        this.reciprocal_setHKL(h, -1*l, -1*k, i);
        this.reciprocal_setHKL(-1*h, l, -1*k, i);
        this.reciprocal_setHKL(-1*h, -1*l, k, i);        
      }  
}

DiffractionPattern.prototype.symmetry_systematicExtinction = function()
{
  this.lattice_centered = false;
  
  switch (this.lattice_spaceGroup)
  {
  case 1: return;
  case 2: return;
  case 3: return;
  case 4: this.symmetry_serialEx("0k0", 2); return;
  case 5: this.symmetry_integralEx("C"); return;
  case 6: return;
  case 7: this.symmetry_zonalEx("h0l", "c"); return;
  case 8: this.symmetry_integralEx("C"); return;
  case 9: this.symmetry_integralEx("C"); this.symmetry_zonalEx("h0l", "c"); return;
  case 10: return;
  case 11: this.symmetry_serialEx("0k0", 2); return;
  case 12: this.symmetry_integralEx("C"); return;
  case 13: this.symmetry_zonalEx("h0l", "c"); return;
  case 14: this.symmetry_zonalEx("h0l", "c"); this.symmetry_serialEx("0k0", 2); return;
  case 15: this.symmetry_integralEx("C"); this.symmetry_zonalEx("h0l", "c"); return;
  case 16: return;
  case 17: this.symmetry_serialEx("00l", 2); return;
  case 18: this.symmetry_serialEx("h00", 2); this.symmetry_serialEx("0k0", 2); return;
  case 19: this.symmetry_serialEx("h00", 2); this.symmetry_serialEx("0k0", 2); this.symmetry_serialEx("00l", 2); return;
  case 20: this.symmetry_integralEx("C"); this.symmetry_serialEx("00l", 2); return;
  case 21: this.symmetry_integralEx("C"); return;
  case 22: this.symmetry_integralEx("F"); return;
  case 23: this.symmetry_integralEx("I"); return;
  case 24: this.symmetry_integralEx("I"); this.symmetry_serialEx("h00", 2); this.symmetry_serialEx("0k0", 2); this.symmetry_serialEx("00l", 2); return;
  case 25: return;
  case 26: this.symmetry_zonalEx("h0l", "c"); this.symmetry_serialEx("00l", 2); return;
  case 27: this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c"); return;
  case 28: this.symmetry_zonalEx("h0l", "a"); return;
  case 29: this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "a"); this.symmetry_serialEx("00l", 2); return;
  case 30: this.symmetry_zonalEx("0kl", "n"); this.symmetry_zonalEx("h0l", "c"); return;
  case 31: this.symmetry_zonalEx("h0l", "n"); return;
  case 32: this.symmetry_zonalEx("0kl", "b"); this.symmetry_zonalEx("h0l", "a"); return;
  case 33: this.symmetry_zonalEx("0kl", "n"); this.symmetry_zonalEx("h0l", "a"); return;
  case 34: this.symmetry_zonalEx("0kl", "n"); this.symmetry_zonalEx("h0l", "n"); return;
  case 35: this.symmetry_integralEx("C"); return;
  case 36: this.symmetry_integralEx("C"); this.symmetry_zonalEx("h0l", "c"); return;
  case 37: this.symmetry_integralEx("C"); this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c"); return;
  case 38: this.symmetry_integralEx("A"); return;
  case 39: this.symmetry_integralEx("A"); this.symmetry_zonalEx("0kl", "b"); return;
  case 40: this.symmetry_integralEx("A"); this.symmetry_zonalEx("h0l", "a"); return;
  case 41: this.symmetry_integralEx("A"); this.symmetry_zonalEx("0kl", "b"); this.symmetry_zonalEx("h0l", "a"); return;
  case 42: this.symmetry_integralEx("F"); return;
  case 43: this.symmetry_integralEx("F"); this.symmetry_zonalEx("0kl", "d"); this.symmetry_zonalEx("h0l", "d"); return;
  case 44: this.symmetry_integralEx("I"); return;
  case 45: this.symmetry_integralEx("I"); this.symmetry_zonalEx("0kl", "b"); this.symmetry_zonalEx("h0l", "a"); return;
  case 46: this.symmetry_integralEx("I"); this.symmetry_zonalEx("h0l", "a"); return;
  case 47: return;
  case 48: this.symmetry_zonalEx("0kl", "n"); this.symmetry_zonalEx("h0l", "n"); this.symmetry_zonalEx("hk0", "n"); return;
  case 49: this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c"); return;
  case 50: this.symmetry_zonalEx("0kl", "b"); this.symmetry_zonalEx("h0l", "a"); this.symmetry_zonalEx("hk0", "n"); return;
  case 51: this.symmetry_zonalEx("hk0", "a"); return;
  case 52: this.symmetry_zonalEx("0kl", "n"); this.symmetry_zonalEx("h0l", "n"); this.symmetry_zonalEx("hk0", "a"); return;
  case 53: this.symmetry_zonalEx("h0l", "n"); this.symmetry_zonalEx("hk0", "a"); return;
  case 54: this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("hk0", "a"); return;
  case 55: this.symmetry_zonalEx("0kl", "b"); this.symmetry_zonalEx("h0l", "a"); return;
  case 56: this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("hk0", "n"); return;
  case 57: this.symmetry_zonalEx("0kl", "b"); this.symmetry_zonalEx("h0l", "c"); return;
  case 58: this.symmetry_zonalEx("0kl", "n"); this.symmetry_zonalEx("h0l", "n"); return;
  case 59: this.symmetry_zonalEx("hk0", "n"); return;
  case 60: this.symmetry_zonalEx("0kl", "b"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("hk0", "n"); return;
  case 61: this.symmetry_zonalEx("0kl", "b"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("hk0", "a"); return;
  case 62: this.symmetry_zonalEx("0kl", "n"); this.symmetry_zonalEx("hk0", "a"); return;
  case 63: this.symmetry_integralEx("C"); this.symmetry_zonalEx("h0l", "c"); return;
  case 64: this.symmetry_integralEx("C"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("hk0", "a"); return;    
  case 65: this.symmetry_integralEx("C"); return;    
  case 66: this.symmetry_integralEx("C"); this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c"); return;
  case 67: this.symmetry_integralEx("C"); this.symmetry_zonalEx("hk0", "a"); return;
  case 68: this.symmetry_integralEx("C"); this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("hk0", "a"); return;
  case 69: this.symmetry_integralEx("F"); return;    
  case 70: this.symmetry_integralEx("F"); this.symmetry_zonalEx("0kl", "d"); this.symmetry_zonalEx("h0l", "d"); this.symmetry_zonalEx("hk0", "d"); return;
  case 71: this.symmetry_integralEx("I"); return;    
  case 72: this.symmetry_integralEx("I"); this.symmetry_zonalEx("0kl", "b"); this.symmetry_zonalEx("h0l", "a"); return;    
  case 73: this.symmetry_integralEx("I"); this.symmetry_zonalEx("0kl", "b"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("hk0", "a"); return;    
  case 74: this.symmetry_integralEx("I"); this.symmetry_zonalEx("hk0", "a"); return;    
  case 75: return;
  case 76: this.symmetry_serialEx("00l", 4); return;
  case 77: this.symmetry_serialEx("00l", 2); return;
  case 78: this.symmetry_serialEx("00l", 4); return;
  case 79: this.symmetry_integralEx("I"); return;
  case 80: this.symmetry_integralEx("I"); this.symmetry_serialEx("00l", 4); return;
  case 81: return;
  case 82: this.symmetry_integralEx("I"); return;
  case 83: return;
  case 84: this.symmetry_serialEx("00l", 2); return;
  case 85: this.symmetry_zonalEx("hk0", "n"); return;
  case 86: this.symmetry_zonalEx("hk0", "n"); this.symmetry_serialEx("00l", 2); return;
  case 87: this.symmetry_integralEx("I"); return;
  case 88: this.symmetry_integralEx("I"); this.symmetry_zonalEx("hk0", "a"); this.symmetry_serialEx("00l", 4); return;
  case 89: return;
  case 90: this.symmetry_serialEx("h00", 2); this.symmetry_serialEx("0k0", 2); return;
  case 91: this.symmetry_serialEx("00l", 4); return;
  case 92: this.symmetry_serialEx("h00", 2); this.symmetry_serialEx("0k0", 2); this.symmetry_serialEx("00l", 4); return;
  case 93: this.symmetry_serialEx("00l", 2); return;
  case 94: this.symmetry_serialEx("h00", 2); this.symmetry_serialEx("0k0", 2); this.symmetry_serialEx("00l", 2); return;
  case 95: this.symmetry_serialEx("00l", 4); return;
  case 96: this.symmetry_serialEx("h00", 2); this.symmetry_serialEx("0k0", 2); this.symmetry_serialEx("00l", 4); return;
  case 97: this.symmetry_integralEx("I"); return;
  case 98: this.symmetry_integralEx("I"); this.symmetry_serialEx("00l", 4); return;
  case 99: return;
  case 100: this.symmetry_zonalEx("0kl", "b"); this.symmetry_zonalEx("h0l", "a"); return;
  case 101: this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_serialEx("00l", 2); return;
  case 102: this.symmetry_zonalEx("0kl", "n"); this.symmetry_zonalEx("h0l", "n"); this.symmetry_serialEx("00l", 2); return;
  case 103: this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("hhl", "c"); return;
  case 104: this.symmetry_zonalEx("0kl", "n"); this.symmetry_zonalEx("h0l", "n"); this.symmetry_zonalEx("hhl", "c"); return;
  case 105: this.symmetry_zonalEx("hhl", "c"); this.symmetry_serialEx("00l", 2); return;
  case 106: this.symmetry_zonalEx("0kl", "b"); this.symmetry_zonalEx("h0l", "a"); this.symmetry_zonalEx("hhl", "c"); this.symmetry_serialEx("00l", 2); return;
  case 107: this.symmetry_integralEx("I"); return;
  case 108: this.symmetry_integralEx("I"); this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c"); return;
  case 109: this.symmetry_integralEx("I"); this.symmetry_zonalEx("hhl", "d"); this.symmetry_serialEx("00l", 4); return;
  case 110: this.symmetry_integralEx("I"); this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("hhl", "d"); this.symmetry_serialEx("00l", 4); return;
  case 111: return;
  case 112: this.symmetry_zonalEx("hhl", "c"); return;
  case 113: this.symmetry_serialEx("h00", 2); this.symmetry_serialEx("0k0", 2); return;
  case 114: this.symmetry_zonalEx("hhl", "c"); this.symmetry_serialEx("h00", 2); this.symmetry_serialEx("0k0", 2); return;
  case 115: return;
  case 116: this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c"); return;
  case 117: this.symmetry_zonalEx("0kl", "b"); this.symmetry_zonalEx("h0l", "a"); return;
  case 118: this.symmetry_zonalEx("0kl", "n"); this.symmetry_zonalEx("h0l", "n"); return;
  case 119: this.symmetry_integralEx("I"); return;
  case 120: this.symmetry_integralEx("I"); this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c");  return;
  case 121: this.symmetry_integralEx("I"); return;
  case 122: this.symmetry_integralEx("I"); this.symmetry_zonalEx("hhl", "d"); return;
  case 123: return;
  case 124: this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("hhl", "c"); return;
  case 125: this.symmetry_zonalEx("hk0", "n"); this.symmetry_zonalEx("0kl", "b"); this.symmetry_zonalEx("h0l", "a"); return;
  case 126: this.symmetry_zonalEx("hk0", "n"); this.symmetry_zonalEx("0kl", "n"); this.symmetry_zonalEx("h0l", "n"); this.symmetry_zonalEx("hhl", "c"); return;
  case 127: this.symmetry_zonalEx("0kl", "b"); this.symmetry_zonalEx("h0l", "a"); return;
  case 128: this.symmetry_zonalEx("0kl", "n"); this.symmetry_zonalEx("h0l", "n"); this.symmetry_zonalEx("hhl", "c"); return;
  case 129: this.symmetry_zonalEx("hk0", "n"); return;
  case 130: this.symmetry_zonalEx("hk0", "n"); this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("hhl", "c"); return;
  case 131: this.symmetry_zonalEx("hhl", "c"); this.symmetry_serialEx("00l", 2); return;
  case 132: this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_serialEx("00l", 2); return;
  case 133: this.symmetry_zonalEx("hk0", "n"); this.symmetry_zonalEx("0kl", "b"); this.symmetry_zonalEx("h0l", "a"); this.symmetry_zonalEx("hhl", "c"); this.symmetry_serialEx("00l", 2); return;
  case 134: this.symmetry_zonalEx("hk0", "n"); this.symmetry_zonalEx("0kl", "n"); this.symmetry_zonalEx("h0l", "n"); this.symmetry_serialEx("00l", 2); return;
  case 135: this.symmetry_zonalEx("0kl", "b"); this.symmetry_zonalEx("h0l", "a"); this.symmetry_zonalEx("hhl", "c"); this.symmetry_serialEx("00l", 2); return;
  case 136: this.symmetry_zonalEx("0kl", "n"); this.symmetry_zonalEx("h0l", "n"); this.symmetry_serialEx("00l", 2); return;
  case 137: this.symmetry_zonalEx("hk0", "n"); this.symmetry_zonalEx("hhl", "c"); this.symmetry_serialEx("00l", 2); return;
  case 138: this.symmetry_zonalEx("hk0", "n"); this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_serialEx("00l", 2); return;
  case 139: this.symmetry_integralEx("I"); return;
  case 140: this.symmetry_integralEx("I"); this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c"); return;
  case 141: this.symmetry_integralEx("I"); this.symmetry_zonalEx("hk0", "a"); this.symmetry_zonalEx("hhl", "d"); this.symmetry_serialEx("00l", 4); return;
  case 142: this.symmetry_integralEx("I"); this.symmetry_zonalEx("hk0", "a"); this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("hhl", "d"); this.symmetry_serialEx("00l", 4); return;
  case 143: return;
  case 144: this.symmetry_serialEx("00l", 3); return;
  case 145: this.symmetry_serialEx("00l", 3); return;
  case 146: this.symmetry_integralEx("R"); return;
  case 147: return;
  case 148: this.symmetry_integralEx("R"); return;
  case 149: return;
  case 150: return;
  case 151: this.symmetry_serialEx("00l", 3); return;
  case 152: this.symmetry_serialEx("00l", 3); return;
  case 153: this.symmetry_serialEx("00l", 3); return;
  case 154: this.symmetry_serialEx("00l", 3); return;
  case 155: this.symmetry_integralEx("R"); return;
  case 156: return;
  case 157: return;
  case 158: this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("0kl", "c"); return;
  case 159: this.symmetry_zonalEx("hhl", "c"); return;
  case 160: this.symmetry_integralEx("R"); return;
  case 161: this.symmetry_integralEx("R"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("0kl", "c"); return;
  case 162: return;
  case 163: this.symmetry_zonalEx("hhl", "c"); return;
  case 164: return;
  case 165: this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("0kl", "c"); return;
  case 166: this.symmetry_integralEx("R"); return;
  case 167: this.symmetry_integralEx("R"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("0kl", "c"); return;
  case 168: return;
  case 169: this.symmetry_serialEx("00l", 6); return;
  case 170: this.symmetry_serialEx("00l", 6); return;
  case 171: this.symmetry_serialEx("00l", 3); return;
  case 172: this.symmetry_serialEx("00l", 3); return;
  case 173: this.symmetry_serialEx("00l", 2); return;
  case 174: return;
  case 175: return;
  case 176: this.symmetry_serialEx("00l", 2); return;
  case 177: return;
  case 178: this.symmetry_serialEx("00l", 6); return;
  case 179: this.symmetry_serialEx("00l", 6); return;
  case 180: this.symmetry_serialEx("00l", 3); return;
  case 181: this.symmetry_serialEx("00l", 3); return;
  case 182: this.symmetry_serialEx("00l", 2); return;
  case 183: return;
  case 184: this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("hhl", "c"); return;
  case 185: this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("0kl", "c"); return;
  case 186: this.symmetry_zonalEx("hhl", "c"); return;
  case 187: return;
  case 188: this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("0kl", "c"); return;
  case 189: return;
  case 190: this.symmetry_zonalEx("hhl", "c"); return;
  case 191: return;
  case 192: this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("0kl", "c"); this.symmetry_zonalEx("hhl", "c"); return;
  case 193: this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("0kl", "c"); return;
  case 194: this.symmetry_zonalEx("hhl", "c"); return;
  case 195: return;
  case 196: this.symmetry_integralEx("F"); return;
  case 197: this.symmetry_integralEx("I"); return;
  case 198: this.symmetry_serialEx("h00", 2); this.symmetry_serialEx("0k0", 2); this.symmetry_serialEx("00l", 2); return;
  case 199: this.symmetry_integralEx("I"); this.symmetry_serialEx("h00", 2); this.symmetry_serialEx("0k0", 2); this.symmetry_serialEx("00l", 2); return;
  case 200: return;
  case 201: this.symmetry_zonalEx("hk0", "n"); this.symmetry_zonalEx("h0l", "n"); this.symmetry_zonalEx("0kl", "n"); return;
  case 202: this.symmetry_integralEx("F"); return;
  case 203: this.symmetry_integralEx("F"); this.symmetry_zonalEx("hk0", "d"); this.symmetry_zonalEx("h0l", "d"); this.symmetry_zonalEx("0kl", "d"); return;
  case 204: this.symmetry_integralEx("I"); return;
  case 205: this.symmetry_zonalEx("hk0", "a"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("0kl", "b"); return;
  case 206: this.symmetry_integralEx("I"); this.symmetry_zonalEx("hk0", "a"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("0kl", "b"); return;
  case 207: return;
  case 208: this.symmetry_serialEx("h00", 2); this.symmetry_serialEx("0k0", 2); this.symmetry_serialEx("00l", 2); return;
  case 209: this.symmetry_integralEx("F"); return;
  case 210: this.symmetry_integralEx("F"); this.symmetry_serialEx("h00", 4); this.symmetry_serialEx("0k0", 4); this.symmetry_serialEx("00l", 4); return;
  case 211: this.symmetry_integralEx("I"); return;
  case 212: this.symmetry_serialEx("h00", 4); this.symmetry_serialEx("0k0", 4); this.symmetry_serialEx("00l", 4); return;
  case 213: this.symmetry_serialEx("h00", 4); this.symmetry_serialEx("0k0", 4); this.symmetry_serialEx("00l", 4); return;
  case 214: this.symmetry_integralEx("I"); this.symmetry_serialEx("h00", 4); this.symmetry_serialEx("0k0", 4); this.symmetry_serialEx("00l", 4); return;
  case 215: return;
  case 216: this.symmetry_integralEx("F"); return;
  case 217: this.symmetry_integralEx("I"); return;
  case 218: this.symmetry_zonalEx("hhl", "c");  this.symmetry_zonalEx("hkh", "b");  this.symmetry_zonalEx("hkk", "a"); return;
  case 219: this.symmetry_integralEx("F"); this.symmetry_zonalEx("hhl", "c"); this.symmetry_zonalEx("hkh", "b"); this.symmetry_zonalEx("hkk", "a"); return;
  case 220: this.symmetry_integralEx("I"); this.symmetry_zonalEx("hhl", "d"); this.symmetry_zonalEx("hkh", "d"); this.symmetry_zonalEx("hkk", "d"); return;
  case 221: return;
  case 222: this.symmetry_zonalEx("hk0", "n"); this.symmetry_zonalEx("h0l", "n"); this.symmetry_zonalEx("0kl", "n"); this.symmetry_zonalEx("hhl", "c"); this.symmetry_zonalEx("hkh", "b");  this.symmetry_zonalEx("hkk", "a"); return;
  case 223: this.symmetry_zonalEx("hhl", "c");  this.symmetry_zonalEx("hkh", "b");  this.symmetry_zonalEx("hkk", "a"); return;
  case 224: this.symmetry_zonalEx("hk0", "n"); this.symmetry_zonalEx("h0l", "n"); this.symmetry_zonalEx("0kl", "n"); return;
  case 225: this.symmetry_integralEx("F"); return;
  case 226: this.symmetry_integralEx("F"); this.symmetry_zonalEx("hhl", "c"); this.symmetry_zonalEx("hkh", "b"); this.symmetry_zonalEx("hkk", "a"); return;
  case 227: this.symmetry_integralEx("F"); this.symmetry_zonalEx("hk0", "d"); this.symmetry_zonalEx("h0l", "d"); this.symmetry_zonalEx("0kl", "d"); return;
  case 228: this.symmetry_integralEx("F"); this.symmetry_zonalEx("hk0", "d"); this.symmetry_zonalEx("h0l", "d"); this.symmetry_zonalEx("0kl", "d"); this.symmetry_zonalEx("hhl", "c"); this.symmetry_zonalEx("hkh", "b"); this.symmetry_zonalEx("hkk", "a"); return;
  case 229: this.symmetry_integralEx("I"); return;
  case 230: this.symmetry_integralEx("I"); this.symmetry_zonalEx("hk0", "a"); this.symmetry_zonalEx("h0l", "a"); this.symmetry_zonalEx("0kl", "b"); this.symmetry_zonalEx("hk0", "b"); this.symmetry_zonalEx("h0l", "c"); this.symmetry_zonalEx("0kl", "c");  this.symmetry_zonalEx("hhl", "d"); this.symmetry_zonalEx("hkh", "d"); this.symmetry_zonalEx("hkk", "d"); return;
  default: console.log("space group %d not implemented!", this.lattice_spaceGroup);
    
    //todo: cubic with glideplane along <110> 
    //only d glideplane problematic?
    //work around by calling forceLaue after systematicExtinction
    //seems to work for now...
  }
}

DiffractionPattern.prototype.symmetry_integralEx = function(centering)
{
  this.lattice_centered = true;
  
  switch (centering)
  {
  case "A": 
    for (var h = -1*this.reciprocal_hMax; h <= this.reciprocal_hMax; h++)
      for (var k = -1*this.reciprocal_kMax; k <= this.reciprocal_kMax; k++)
        for (var l = -1*this.reciprocal_lMax; l <= this.reciprocal_lMax; l++)
        {
          if ((k + l) % 2)
            this.reciprocal_setHKL(h, k, l, 0);
        }
    break;
    
  case "B": 
    for (var h = -1*this.reciprocal_hMax; h <= this.reciprocal_hMax; h++)
      for (var k = -1*this.reciprocal_kMax; k <= this.reciprocal_kMax; k++)
        for (var l = -1*this.reciprocal_lMax; l <= this.reciprocal_lMax; l++)
        {
          if ((h + l) % 2)
            this.reciprocal_setHKL(h, k, l, 0);
        }
    break;
    
  case "C": 
    for (var h = -1*this.reciprocal_hMax; h <= this.reciprocal_hMax; h++)
      for (var k = -1*this.reciprocal_kMax; k <= this.reciprocal_kMax; k++)
        for (var l = -1*this.reciprocal_lMax; l <= this.reciprocal_lMax; l++)
        {
          if ((h + k) % 2)
            this.reciprocal_setHKL(h, k, l, 0);
        }
    break;
    
  case "I": 
    for (var h = -1*this.reciprocal_hMax; h <= this.reciprocal_hMax; h++)
      for (var k = -1*this.reciprocal_kMax; k <= this.reciprocal_kMax; k++)
        for (var l = -1*this.reciprocal_lMax; l <= this.reciprocal_lMax; l++)
        {
          if ((h + k + l) % 2)
            this.reciprocal_setHKL(h, k, l, 0);
        }
    break;
    
  case "F": 
    for (var h = -1*this.reciprocal_hMax; h <= this.reciprocal_hMax; h++)
      for (var k = -1*this.reciprocal_kMax; k <= this.reciprocal_kMax; k++)
        for (var l = -1*this.reciprocal_lMax; l <= this.reciprocal_lMax; l++)
        {
          if (((h + k) % 2) || ((k + l) % 2) || ((h + l) % 2))
            this.reciprocal_setHKL(h, k, l, 0);
        }
    break;
    
  case "R": 
    for (var h = -1*this.reciprocal_hMax; h <= this.reciprocal_hMax; h++)
      for (var k = -1*this.reciprocal_kMax; k <= this.reciprocal_kMax; k++)
        for (var l = -1*this.reciprocal_lMax; l <= this.reciprocal_lMax; l++)
        {
          if ((-1*h + k + l) % 3)
            this.reciprocal_setHKL(h, k, l, 0);
        }
    break;
    
  default: console.log("invalid integral extinction!");
  }
  
}

DiffractionPattern.prototype.symmetry_zonalEx = function(layer, glideplane)
{
  switch (layer)
  {
  case "0kl":
    for (var k = -1*this.reciprocal_kMax; k <= this.reciprocal_kMax; k++)
      for (var l = -1*this.reciprocal_lMax; l <= this.reciprocal_lMax; l++)
      {
        switch (glideplane)
        {
        case "b":
          if (k % 2)
          this.reciprocal_setHKL(0, k, l, 0);
          break;
        case "c":
          if (l % 2)
          this.reciprocal_setHKL(0, k, l, 0);
          break;
        case "n":
          if ((k + l) % 2)
          this.reciprocal_setHKL(0, k, l, 0);
          break;
        case "d":
          if ((k + l) % 4)
          this.reciprocal_setHKL(0, k, l, 0);
          break;
          
        default: console.log("invalid zonal extinction!");
        }
      }
    break;
    
  case "h0l":
    for (var h = -1*this.reciprocal_hMax; h <= this.reciprocal_hMax; h++)
      for (var l = -1*this.reciprocal_lMax; l <= this.reciprocal_lMax; l++)
      {
        switch (glideplane)
        {
        case "a":
          if (h % 2)
          this.reciprocal_setHKL(h, 0, l, 0);
          break;
        case "c":
          if (l % 2)
          this.reciprocal_setHKL(h, 0, l, 0);
          break;
        case "n":
          if ((h + l) % 2)
          this.reciprocal_setHKL(h, 0, l, 0);
          break;
        case "d":
          if ((h + l) % 4)
          this.reciprocal_setHKL(h, 0, l, 0);
          break;
          
        default: console.log("invalid zonal extinction!");
        }
      }
    break;    
    
  case "hk0":
    for (var h = -1*this.reciprocal_hMax; h <= this.reciprocal_hMax; h++)
      for (var k = -1*this.reciprocal_kMax; k <= this.reciprocal_kMax; k++)
      {
        switch (glideplane)
        {
        case "a":
          if (h % 2)
          this.reciprocal_setHKL(h, k, 0, 0);
          break;
        case "b":
          if (k % 2)
          this.reciprocal_setHKL(h, k, 0, 0);
          break;
        case "n":
          if ((h + k) % 2)
          this.reciprocal_setHKL(h, k, 0, 0);
          break;
        case "d":
          if ((h + k) % 4)
          this.reciprocal_setHKL(h, k, 0, 0);
          break;
          
        default: console.log("invalid zonal extinction!");
        }
      }
    break;  
    
  case "hhl":
    for (var h = -1*this.reciprocal_hMax; h <= this.reciprocal_hMax; h++)
      for (var l = -1*this.reciprocal_lMax; l <= this.reciprocal_lMax; l++)
      {
        switch (glideplane)
        {
        case "c":
          if (l % 2)
          this.reciprocal_setHKL(h, h, l, 0);
          break;
        case "b":
          if (h % 2)
          this.reciprocal_setHKL(h, h, l, 0);
          break;
        case "n":
          if ((h + l) % 2)
          this.reciprocal_setHKL(h, h, l, 0);
          break;
        case "d":
          if ((2*h + l) % 4)
          this.reciprocal_setHKL(h, h, l, 0);
          break;
          
        default: console.log("invalid zonal extinction!");
        }
      }
    break; 
    
  case "hkh":
    for (var h = -1*this.reciprocal_hMax; h <= this.reciprocal_hMax; h++)
      for (var k = -1*this.reciprocal_kMax; k <= this.reciprocal_kMax; k++)
      {
        switch (glideplane)
        {
        case "b":
          if (k % 2)
          this.reciprocal_setHKL(h, k, h, 0);
          break;
        case "a":
          if (h % 2)
          this.reciprocal_setHKL(h, k, h, 0);
          break;
        case "n":
          if ((h + k) % 2)
          this.reciprocal_setHKL(h, k, h, 0);
          break;
        case "d":
          if ((2*h + k) % 4)
          this.reciprocal_setHKL(h, k, h, 0);
          break;
          
        default: console.log("invalid zonal extinction!");
        }
      }
    break;  
    
  case "hkk":
    for (var h = -1*this.reciprocal_hMax; h <= this.reciprocal_hMax; h++)
      for (var k = -1*this.reciprocal_kMax; k <= this.reciprocal_kMax; k++)
      {
        switch (glideplane)
        {
        case "a":
          if (h % 2)
          this.reciprocal_setHKL(h, k, k, 0);
          break;
        case "c":
          if (k % 2)
          this.reciprocal_setHKL(h, k, k, 0);
          break;
        case "n":
          if ((h + k) % 2)
          this.reciprocal_setHKL(h, k, k, 0);
          break;
        case "d":
          if ((h + 2*k) % 4)
          this.reciprocal_setHKL(h, k, k, 0);
          break;
          
        default: console.log("invalid zonal extinction!");
        }
      }
    break;
    
  default: console.log("invalid layer!");
  }
}

DiffractionPattern.prototype.symmetry_serialEx = function(axis, n)
{  
  switch (axis)
  {
  case "h00":
    for (var h = -1*this.reciprocal_hMax; h <= this.reciprocal_hMax; h++)
      if (h % n)
        this.reciprocal_setHKL(h, 0, 0, 0);
    break;
    
  case "0k0":
    for (var k = -1*this.reciprocal_kMax; k <= this.reciprocal_kMax; k++)
      if (k % n)
        this.reciprocal_setHKL(0, k, 0, 0);
    break;
    
  case "00l":
    for (var l = -1*this.reciprocal_lMax; l <= this.reciprocal_lMax; l++)
      if (l % n)
        this.reciprocal_setHKL(0, 0, l, 0);
    break;
    
  case "hh0":
    for (var h = -1*this.reciprocal_hMax; h <= this.reciprocal_hMax; h++)
      if (h % n)
        this.reciprocal_setHKL(h, h, 0, 0);
    break;
    
  default: console.log("invalid serial extinction!");
  }
}

DiffractionPattern.prototype.symmetry_getSGName = function(num)
{
  if ((num >= 1) && (num <= 230))
    return this.symmetry_tables.spacegroups[num-1].name;
  else
    return "Unkown space group number!";
}

DiffractionPattern.prototype.symmetry_setEXSymbol = function(num)
{
  if ((num < 1) || (num > 230))
  {
    console.log("invalid space group number! %d", num);
    this.solution_extinctionSymbol = {};
    return "";
  }
  
  this.solution_laue = this.symmetry_tables.spacegroups[num-1].laueClass;
  var found = false;
  
  for (var j = 0; j < this.symmetry_tables.extinctionSymbols[this.solution_laue].length; j++)
  {
    for (var k = 0; k < this.symmetry_tables.extinctionSymbols[this.solution_laue][j].spaceGroups.length; k++)
    {
      if (this.symmetry_tables.extinctionSymbols[this.solution_laue][j].spaceGroups[k] == num)
      {
        this.solution_extinctionSymbol = this.symmetry_tables.extinctionSymbols[this.solution_laue][j];
        found = true;
        break;
      }
    }
    
    if (found)
      break;
  }
  
  if (!found)
  {
    console.log("SG %d: no matching extinction symbol found!", num);
    this.solution_extinctionSymbol = {};
    return "";
  }
 
  return this.solution_extinctionSymbol.symbol;
}

DiffractionPattern.prototype.symmetry_setSolution = function()
{
  this.solution_text = "Laue class: " + this.solution_laue + "\n";
  for (var i = 0; i < this.solution_extinctionSymbol.reflectionConditions.length; i++)
    this.solution_text = this.solution_text + this.solution_extinctionSymbol.reflectionConditions[i].type + ": " + this.solution_extinctionSymbol.reflectionConditions[i].condition + "\n";

  this.solution_text = this.solution_text + "Extinction symbol: " + this.solution_extinctionSymbol.symbol + "\n\n";
  
  var sgCount = this.solution_extinctionSymbol.spaceGroups.length;
  if (typeof this.solution_extinctionSymbol.nonStandard !== "undefined")
    sgCount = sgCount + this.solution_extinctionSymbol.nonStandard.length;
  
  if (sgCount > 1)
  {
    this.solution_text = this.solution_text + sgCount + " space groups possible:";
    for (var i = 0; i < this.solution_extinctionSymbol.spaceGroups.length; i++)
    {
      if (this.solution_extinctionSymbol.spaceGroups[i] == this.lattice_spaceGroup)
        this.solution_text = this.solution_text + "\n" + this.symmetry_getSGName(this.solution_extinctionSymbol.spaceGroups[i]) + " (No. " + this.solution_extinctionSymbol.spaceGroups[i] + ") <-- used";
      else
        this.solution_text = this.solution_text + "\n" + this.symmetry_getSGName(this.solution_extinctionSymbol.spaceGroups[i]) + " (No. " + this.solution_extinctionSymbol.spaceGroups[i] + ")";
    }
    
    if (typeof this.solution_extinctionSymbol.nonStandard !== "undefined")
    {
      for (var i = 0; i < this.solution_extinctionSymbol.nonStandard.length; i++)
        this.solution_text = this.solution_text + "\n" + this.solution_extinctionSymbol.nonStandard[i] + " (NS)";
    }
  }
  else
  {
    this.solution_text = this.solution_text + "only one space group possible:\n" + this.symmetry_getSGName(this.solution_extinctionSymbol.spaceGroups[0]) + " (No. " + this.solution_extinctionSymbol.spaceGroups[0] + ")";
  }
}
