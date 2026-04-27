const fs = require('fs');
const dlDir = 'C:/Users/MSUSERSL123/Downloads/';
const outDir = 'C:/Users/MSUSERSL123/wellness-app/assets/';

['emoticon1', 'emoticon2', 'emoticon3'].forEach(function(fname) {
  try {
    var svg = fs.readFileSync(dlDir + fname + '.svg', 'utf8');
    // JPEG embedded
    var idx = svg.indexOf('data:image/jpeg;base64,');
    var mime = 'jpeg';
    if (idx === -1) { idx = svg.indexOf('data:image/png;base64,'); mime = 'png'; }
    if (idx !== -1) {
      var start = idx + ('data:image/' + mime + ';base64,').length;
      var end = svg.indexOf('"', start);
      var b64 = svg.substring(start, end);
      var buf = Buffer.from(b64, 'base64');
      var outFile = outDir + fname + '.' + mime;
      fs.writeFileSync(outFile, buf);
      console.log(fname + '.' + mime + ' saved | size=' + buf.length);
    } else {
      console.log(fname + ': no image data found');
    }
  } catch(e) { console.log(fname + ' ERROR: ' + e.message); }
});
