var binds = {};

module.exports.bind = function (element, cb, ms) {
  if(!binds[element]) binds[element] = {};
  var height = element.offsetHeight;
  var width = element.offsetWidth;
  if(!ms) ms = 250;
  
  binds[element][cb] = setInterval(function () {
    if((width === element.offsetWidth) && (height === element.offsetHeight)) return;
    height = element.offsetHeight;
    width = element.offsetWidth;
    cb(element);
  }, ms);
};

module.exports.unbind = function (element, cb) {
  if(!binds[element][cb]) return;
  clearInterval(binds[element][cb]);
};