/*
 *
 * mads - version 2.00.01
 * Copyright (c) 2015, Ninjoe
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * https://en.wikipedia.org/wiki/MIT_License
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 *
 */
var mads = function(options) {

  var _this = this;

  this.render = options.render;

  /* Body Tag */
  this.bodyTag = document.getElementsByTagName('body')[0];

  /* Head Tag */
  this.headTag = document.getElementsByTagName('head')[0];

  /* json */
  if (typeof json == 'undefined' && typeof rma != 'undefined') {
    this.json = rma.customize.json;
  } else if (typeof json != 'undefined') {
    this.json = json;
  } else {
    this.json = '';
  }

  /* fet */
  if (typeof fet == 'undefined' && typeof rma != 'undefined') {
    this.fet = typeof rma.fet == 'string' ? [rma.fet] : rma.fet;
  } else if (typeof fet != 'undefined') {
    this.fet = fet;
  } else {
    this.fet = [];
  }

  this.fetTracked = false;

  /* load json for assets */
  this.loadJs(this.json, function() {
    _this.data = json_data;

    _this.render.render();
  });

  /* Get Tracker */
  if (typeof custTracker == 'undefined' && typeof rma != 'undefined') {
    this.custTracker = rma.customize.custTracker;
  } else if (typeof custTracker != 'undefined') {
    this.custTracker = custTracker;
  } else {
    this.custTracker = [];
  }

  /* CT */
  if (typeof ct == 'undefined' && typeof rma != 'undefined') {
    this.ct = rma.ct;
  } else if (typeof ct != 'undefined') {
    this.ct = ct;
  } else {
    this.ct = [];
  }

  /* CTE */
  if (typeof cte == 'undefined' && typeof rma != 'undefined') {
    this.cte = rma.cte;
  } else if (typeof cte != 'undefined') {
    this.cte = cte;
  } else {
    this.cte = [];
  }

  /* tags */
  if (typeof tags == 'undefined' && typeof tags != 'undefined') {
    this.tags = this.tagsProcess(rma.tags);
  } else if (typeof tags != 'undefined') {
    this.tags = this.tagsProcess(tags);
  } else {
    this.tags = '';
  }

  /* Unique ID on each initialise */
  this.id = this.uniqId();

  /* Tracked tracker */
  this.tracked = [];
  /* each engagement type should be track for only once and also the first tracker only */
  this.trackedEngagementType = [];
  /* trackers which should not have engagement type */
  this.engagementTypeExlude = [];
  /* first engagement */
  this.firstEngagementTracked = false;

  /* RMA Widget - Content Area */
  this.contentTag = document.getElementById('rma-widget');

  /* URL Path */
  this.path = typeof rma != 'undefined' ? rma.customize.src : '';

  /* Solve {2} issues */
  for (var i = 0; i < this.custTracker.length; i++) {
    if (this.custTracker[i].indexOf('{2}') != -1) {
      this.custTracker[i] = this.custTracker[i].replace('{2}', '{{type}}');
    }
  }
};

/* Generate unique ID */
mads.prototype.uniqId = function() {

  return new Date().getTime();
}

mads.prototype.tagsProcess = function(tags) {

  var tagsStr = '';

  for (var obj in tags) {
    if (tags.hasOwnProperty(obj)) {
      tagsStr += '&' + obj + '=' + tags[obj];
    }
  }

  return tagsStr;
}

/* Link Opner */
mads.prototype.linkOpener = function(url) {

  if (typeof url != "undefined" && url != "") {

    if (typeof this.ct != 'undefined' && this.ct != '') {
      url = this.ct + encodeURIComponent(url);
    }

    if (typeof mraid !== 'undefined') {
      mraid.open(url);
    } else {
      window.open(url);
    }

    if (typeof this.cte != 'undefined' && this.cte != '') {
      this.imageTracker(this.cte);
    }
  }
}

/* tracker */
mads.prototype.tracker = function(tt, type, name, value) {

  /*
   * name is used to make sure that particular tracker is tracked for only once
   * there might have the same type in different location, so it will need the name to differentiate them
   */
  name = name || type;

  if (tt == 'E' && !this.fetTracked) {
    for (var i = 0; i < this.fet.length; i++) {
      var t = document.createElement('img');
      t.src = this.fet[i];

      t.style.display = 'none';
      this.bodyTag.appendChild(t);
    }
    this.fetTracked = true;
  }

  if (typeof this.custTracker != 'undefined' && this.custTracker != '' && this.tracked.indexOf(name) == -1) {
    for (var i = 0; i < this.custTracker.length; i++) {

      if (i === 1 && name !== '1st_form_submitted') continue;

      var img = document.createElement('img');

      if (typeof value == 'undefined') {
        value = '';
      }

      /* Insert Macro */
      var src = this.custTracker[i].replace('{{rmatype}}', type);
      src = src.replace('{{rmavalue}}', value);

      /* Insert TT's macro */
      if (this.trackedEngagementType.indexOf(tt) != '-1' || this.engagementTypeExlude.indexOf(tt) != '-1') {
        src = src.replace('tt={{rmatt}}', '');
      } else {
        src = src.replace('{{rmatt}}', tt);
        this.trackedEngagementType.push(tt);
      }

      /* Append ty for first tracker only */
      if (!this.firstEngagementTracked && tt == 'E') {
        src = src + '&ty=E';
        this.firstEngagementTracked = true;
      }

      /* */
      img.src = src + this.tags + '&' + this.id;

      img.style.display = 'none';
      this.bodyTag.appendChild(img);

      this.tracked.push(name);
    }
  }
};

mads.prototype.imageTracker = function(url) {
  for (var i = 0; i < url.length; i++) {
    var t = document.createElement('img');
    t.src = url[i];

    t.style.display = 'none';
    this.bodyTag.appendChild(t);
  }
}

/* Load JS File */
mads.prototype.loadJs = function(js, callback) {
  var script = document.createElement('script');
  script.src = js;

  if (typeof callback != 'undefined') {
    script.onload = callback;
  }

  this.headTag.appendChild(script);
}

/* Load CSS File */
mads.prototype.loadCss = function(href) {
  var link = document.createElement('link');
  link.href = href;
  link.setAttribute('type', 'text/css');
  link.setAttribute('rel', 'stylesheet');

  this.headTag.appendChild(link);
}

mads.prototype.extractBit = function(selector, content) {
  var e = {};
  var elems = content.querySelectorAll(selector);
  for (var elem in elems) {
    var id = elems[elem].id
    if (id) {
      Object.defineProperty(elems[elem], 'CSSText', {
        set: function(text) {
          var pattern = /([\w-]*)\s*:\s*([^;]*)/g
          var match, props = {}
          while (match = pattern.exec(text)) {
            props[match[1]] = match[2]
            this.style[match[1]] = match[2]
          }
        }
      })
      Object.defineProperty(elems[elem], 'ClickEvent', {
        set: function(f) {
          this.addEventListener('click', f)
        }
      })
      elems[elem].fadeIn = function(duration) {
        duration = duration || 600
        var self = this
        self.CSSText = 'opacity:0;transition:opacity ' + (duration * 0.001) + 's;display:block;'
        setTimeout(function() {
          self.CSSText = 'opacity:1;'
        }, 1)
      }
      elems[elem].fadeOut = function(duration) {
        duration = duration || 600
        var self = this
        self.CSSText = 'opacity:1;transition:opacity ' + (duration * 0.001) + 's;display:block;'
        setTimeout(function() {
          self.CSSText = 'opacity:0;'
          setTimeout(function() {
            self.CSSText = 'display:none;'
          }, duration)
        }, 1)
      }
      e[id] = elems[elem]
    }
  }

  return e
}

var jir = function() {
  this.app = new mads({
    'render': this
  });

  document.body.style.padding = 0
  document.body.style.margin = 0

  this.app.loadCss( this.app.path + 'css/w3.css')

  this.formData = {
    name: 'n/a',
    no: 'n/a',
    city: 'n/a',
    dob: 'n/a',
    email: 'n/a'
  }

  this.render();
  this.style();
  this.event();
}

jir.prototype.render = function() {

  var cities = ["Bandung","Jakarta","Samarinda","Pekanbaru","Balikpapan","Padang","Patam","Malang","Medan","Pangaturan","Tebingtinggi","Sungailiat","Palembang","Bengkalis","Jambi City","Depok","Bogor","Sangereng","Bekasi","Karawang","Sukabumi","Tasikmalaya","Subang","Ciamis","Cirebon","Garut","Kuningan","Majalengka","Sumedang","Sukoharjo","Semarang","Pekalongan","Kudus","Klaten","Jepara","Demak","Salatiga","Tegal","Yogyakarta","Sleman","Cilacap","Magelang","Wonosobo","Surakarta","Bantul","Temanggung","Kebumen","Purwokerto","Purbalingga","Kulon","Surabaya","Bangkalan","Pasuruan","Mojokerto","Sidoarjo","Surabayan","Batu","Blitar","Lumajang","Tulungagung","Magetan","Kediri","Trenggalek","Madiun","Ngawi","Nganjuk","Bojonegoro","Banyuwangi","Jember","Situbondo","Probolinggo","Gresik","Lamongan","Pamekasan","Pontianak","Singkawang","Banjarmasin","Buntok","Bontang","Palangkaraya","Tarakan","Denpasar","Badung","Ubud","Mataram","Selong","Manado","Tondano","Bitung","Bima","Sungguminasa","Adiantorop","Makassar","Sekupang","Kota","Bangkinang","Binjai","Banda Aceh","Lhokseumawe","Serdang","Balige","Lampeong","Baturaja","Bandar","Cimahi","Indramayu","Banyumas","Jombang","Mojoagung","Kepanjen","Ponorogo","Pacitan","Palu","Sengkang","Gorontalo","Gianyar","Jayapura","Soasio","Wonosari","Bengkulu","Guntung","Langsa","Kerinci","Porsea","Bali","Cianjur","Tirtagangga","Purworejo","Pandeglang","Tigaraksa","Cilegon","Cilegon","Sanur","Darussalam","Kupang","Bandar Lampung","Pati","Panasuan","Darmaga","Dumai","Timur","Riau","Bukit Tinggi","Parman","Cihampelas","Tangsel","Duren","Angkasa","Jimbaran","Menara","Pamulang","Bantan","Baratjaya","Utara","Veteran","Tengah","Tenggara","Selatan","Simpang","Gunungsitoli","Pemalang","Tenggarong","Tanjung Balai","Serang","Cikarang","Cibitung","Bondowoso","Singaraja","Poso","Ambon City","Negeribesar","Cempaka","Lestari","Kandangan","Ciputat","Kartasura","Jagakarsa","Pondok","Solo","Polerejo","Muntilan","Boyolali","Nusantara","Cipinanglatihan","Kalimantan","Serang","Serpong","Cikini","Purwodadi Grobogan","Kendal","Tanjungpinang","Lubuk Pakam","Nusa","Kelapa Dua","Gandul","Gedung","Tanjung","Kuta","Kalideres","Mega","Area","Wilayah","Soho","Menteng","Tuban","Cilincing","Sunggal","Sijunjung","Kerobokan","Negara","Amlapura","Baubau","Karanganyar","Sampang","Depok Jaya","Parakan","Lawang","Pare","Airmadidi","Tembagapura","Banjarbaru","Palangka","Cimanggis","Kebayoran Baru","Lapan","Pusat","Sigli","Kabanjahe","Pematangsiantar","Payakumbuh","Kebayoran Lama Selatan","Tigarasa","Purwakarta","Cibubur","Wonogiri","Sragen","Ungaran","Batang","Ambarawa","Palaihari","Tanjung","Sampit","Bulukumba","Bangli","Soe","Nusa Dua","Stabat","Maros","Tipar Timur","Holis","Banjarnegara","Banjar","Kopeng","Duri","Bantaeng","Blora","Tomohon","Citeureup","Pekan","Mamuju","Badung","Abadi","Anggrek","Sejahtera","Cakrawala","Indo","Sentul","Utama","Mail","Udayana","Cengkareng","Kemang","Tabanan"];

  var content = this.app.contentTag;
  var path = this.app.path;
  content.innerHTML = '<div id="container">' +
    '<div id="first" class="w3-content" style="max-width:320px;">'+
      '<img id="f1" src="' + path + 'img/bg-1.png" class="mys w3-animate-right" style="width:100%">' +
      '<img id="f2" src="' + path + 'img/bg-1-2.png" class="mys w3-animate-right" style="width:100%">' +
    '</div>'+
    '<div id="second"><form id="form">'+
    '<input type="text" name="name" id="name" placeholder="Nama" required/>'+
    '<input type="number" name="no" id="no" placeholder="No. Handphone" required/><br/>'+
    '<input type="text" list="cities" name="city" id="city" placeholder="Domisili" required/><br/>'+
    '<datalist id="cities"></datalist>'+
    '<button id="submit" type="submit"><img id="submitimg" src="' + path + 'img/form1-bttn.png"></button>'+
    '</form></div>'+
    '<div id="third"><form id="form2">'+
    '<input type="text" name="dob" id="dob" placeholder="Tanggal Lahir (DD/MM/YYYY)">'+
    '<input type="email" name="email" id="email" placeholder="Email">'+
    '<button id="submit2" type="submit"><img id="submitimg2" src="'+path+'img/submit.png"></button>'+
    '</form></div>'+
    '<img id="fourth" src="'+path+'img/bg-3.png">'+
    '</div>';

  for (var i = 0, len = cities.length; i < len; i++) {
    var option = document.createElement('option')
    option.innerText = cities[i]
    var citiesOption = content.querySelector('#cities')
    citiesOption.appendChild(option)
  }

  this.bit = this.app.extractBit('div, img, button, form, input, datalist', content);
}

jir.prototype.style = function() {
  var content = this.app.contentTag;
  var path = this.app.path;
  var bit = this.bit;

  var HW = 'width:320px;height:480px;'
  var AOpacity = 'opacity:1;transition:opacity 0.6s;'
  var ABS = 'position:absolute;left:0;top:0;'
  this.ErrField = 'border: 1px solid red;'
  this.ClearField = 'border: 1px solid #0089c3';

  bit.container.CSSText = HW + ''
  bit.first.CSSText = [HW, ABS].join('')
  bit.second.CSSText = [HW, ABS].join('') + 'background:url(' + path + 'img/bg-2.png);display:none;'
  bit.third.CSSText = [HW, ABS].join('') + 'background:url(' + path + 'img/form2-bg.png);display:none;'
  bit.fourth.CSSText = [HW, ABS].join('') + 'display:none;'
  bit.form.CSSText = ABS + 'text-align:center;top:130px;'
  bit.form2.CSSText = ABS + 'text-align:center;top:140px;'
  bit.name.CSSText = 'padding:10px;width: 260px;border: 1px solid #0089c3;'
  bit.no.CSSText = bit.city.CSSText = bit.dob.CSSText = bit.email.CSSText =
    'padding:10px;width: 260px;border: 1px solid #0089c3;margin-top:-1px;'
  //  = 'padding:10px;width: 260px;border: 1px solid #0089c3;margin-top:-1px;'
  //  = 'padding:10px;width: 260px;border: 1px solid #0089c3;margin-top:-1px;'
  bit.submit.CSSText = bit.submit2.CSSText = 'border:none;padding:0;margin:0;outline:none;background:transparent;margin-top:10px;'
}

jir.prototype.event = function() {
  var self = this;
  var content = this.app.contentTag;
  var bit = this.bit;


  var receiveMessage = function(e) {
      if (typeof e.data.auth !== 'undefined' && e.data.auth.type === 'closeExpandable') {

        if (self.formData.name !== 'n/a' && self.formData.no !== 'n/a' && self.formData.city !== 'n/a') {
          self.app.loadJs('//www.mobileads.com/api/save_lf?contactEmail=dickale@imx.co.id,karima@imx.co.id&'+
            'gotDatas=1&element=[{%22fieldname%22:%22text_1%22,%22value%22:%22'+self.formData.name+'%22},{%22fieldname%22:%22text_2%22,%22value%22:%22'+self.formData.no+'%22},'+
            '{%22fieldname%22:%22text_3%22,%22value%22:%22'+self.formData.city+'%22},{%22fieldname%22:%22text_4%22,%22value%22:%22'+self.formData.dob+'%22},{%22fieldname%22:%22text_5%22,%22value%22:%22'+self.formData.email+'%22}]'+
            '&user-id=2901&studio-id=269&tab-id=1&trackid=2132&referredURL=Sample%20Ad%20Unit&callback=leadGenCallback')
        }

          self.app.tracker('E', 'close_submit');
      }
  }
  window.addEventListener("message", receiveMessage, false);

  var myIndex = 0;
  carousel();

  function carousel() {
      var i;
      var x = document.getElementsByClassName("mys");
      for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
      }
      myIndex++;
      if (myIndex > x.length) {myIndex = 1}
      x[myIndex-1].style.display = "block";
      setTimeout(carousel, 10000);
  }

  bit.first.ClickEvent = function() {
    bit.first.fadeOut();
    bit.second.fadeIn();

    self.app.tracker('E', 'first_page');
  }

  bit.form.addEventListener('submit', function(e) {
    e.stopPropagation();
    e.preventDefault();

    var name = bit.name.value;
    var no = bit.no.value;
    var city = bit.city.value;

    self.formData.name = name
    self.formData.no = no
    self.formData.city = city

    bit.second.fadeOut();
    bit.third.fadeIn();

    self.app.tracker('E', '1st_form_submitted')

    return false;
  })

  bit.form2.addEventListener('submit', function(e) {
    e.stopPropagation();
    e.preventDefault();

    var dob = bit.dob.value;
    var email = bit.email.value;

    // bit.dob.CSSText = self.ClearField;

    // var patt = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/g

    // if (patt.test(dob)) {
    // bit.dob.CSSText = self.ClearField;
    self.formData.dob = dob || 'n/a'
    self.formData.email = email || 'n/a'
    self.app.loadJs('//www.mobileads.com/api/save_lf?contactEmail=dickale@imx.co.id,karima@imx.co.id&'+
      'gotDatas=1&element=[{%22fieldname%22:%22text_1%22,%22value%22:%22'+self.formData.name+'%22},{%22fieldname%22:%22text_2%22,%22value%22:%22'+self.formData.no+'%22},'+
      '{%22fieldname%22:%22text_3%22,%22value%22:%22'+self.formData.city+'%22},{%22fieldname%22:%22text_4%22,%22value%22:%22'+self.formData.dob+'%22},{%22fieldname%22:%22text_5%22,%22value%22:%22'+self.formData.email+'%22}]'+
      '&user-id=2901&studio-id=269&tab-id=1&trackid=2132&referredURL=Sample%20Ad%20Unit&callback=leadGenCallback')


    bit.submit2.CSSText = 'display:none';

    self.app.tracker('E', '2nd_form_submitted')
    // } else {
      // bit.dob.CSSText = self.ErrField;
    // }

    return false;
  })

  bit.fourth.ClickEvent = function() {
    self.app.tracker('E', 'landing_page');
    self.app.linkOpener('//solusi.jiwasraya.co.id/asuransijssinergy/');
  }
}

jir.prototype.submitted = function() {
    var self = this;
    var bit = this.bit;

    bit.third.fadeOut();
    bit.fourth.fadeIn();

    this.app.tracker('E', 'submit');

    window.setTimeout(function() {
      self.app.tracker('E', 'landing_page');
      self.app.linkOpener('//solusi.jiwasraya.co.id/asuransijssinergy/');
    }, 1000)
}



var j = new jir()

function leadGenCallback(obj) {
  j.submitted();
}
