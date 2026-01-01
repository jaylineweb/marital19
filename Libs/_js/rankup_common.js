var RUCommon = function() {
	var scripts = new Array();
	var uid = 0;
	var pno = [];
	var uno = {};

	var getBrowser = function() {
		var agt=navigator.userAgent.toLowerCase();
		if (agt.indexOf("opera") != -1) return 'Opera';
		if (agt.indexOf("starofficfe") != -1) return 'Star Office';
		if (agt.indexOf("webtv") != -1) return 'WebTV';
		if (agt.indexOf("beonex") != -1) return 'Beonex';
		if (agt.indexOf("chimera") != -1) return 'Chimera';
		if (agt.indexOf("netpositive") != -1) return 'NetPositive';
		if (agt.indexOf("phoenix") != -1) return 'Phoenix';
		if (agt.indexOf("chrome") != -1) return 'Chrome';
		if (agt.indexOf("firefox") != -1) return 'Firefox';
		if (agt.indexOf("safari") != -1) return 'Safari';
		if (agt.indexOf("skipstone") != -1) return 'SkipStone';
		if (agt.indexOf("msie") != -1) return 'IE';
		if (agt.indexOf("netscape") != -1) return 'Netscape';
		if (agt.indexOf("mozilla/5.0") != -1) return 'Mozilla';
		if (agt.indexOf('\/') != -1) {
			if (agt.substr(0,agt.indexOf('\/')) != 'mozilla') {
				return navigator.userAgent.substr(0,agt.indexOf('\/'));
			}
			else return 'Netscape';
		}
		else if (agt.indexOf(' ') != -1) return navigator.userAgent.substr(0,agt.indexOf(' '));
		else return navigator.userAgent;
	},
	// 일(day) 콤보박스 option 드로잉
	drawDay = function(y, m, d) {
		y = $J(y).val(), m = parseInt($J(m).val(), 10), d = $J(d)[0], d.options.length = 1;
		if(!y || !m) return;
		var days = ['', 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 평달
		if((y%4)==0 && ((y%100)!=0 || (y%400)==0)) days[2] = 29; // 윤달
		for(var day=1; day<=days[m]; day++) {
			d.options[d.options.length] = new Option(day+'일', (day<10) ? '0' + String(day) : day); // day draw
		}
	},
	showMask = function(el) {
		var position = el.position();
		var mask = $J('<div />').addClass('message-loading-overlay').offset(position);
		$J(el).append(mask);
	},
	hideMask = function(el) {
		$J(el).find('div.message-loading-overlay').remove();
	},
	getChecked = function(el_name) {
		var checked = $J('input:checkbox[name="'+el_name+'"]:checked');
		return checked;
	},
	getUid = function() {
		return ++uid;
	},
	checkExt = function(type, path){
		if(type == 'image') {
			var regex = new RegExp('\.(gif|png|jpg|jpeg)$', "i");
			if(regex.test(path)) {
				return true;
			}
			else {
				return false;
			}
		}
	},
	toggleCheck = function(e, el_name) {
		if($J(e).prop('checked')) {
			checkAll(el_name);
		}
		else {
			uncheckAll(el_name);
		}
	},
	checkAll = function(el_name) {
		$J('input:checkbox[name="'+el_name+'"]').not(':disabled').prop('checked',true);
	},
	uncheckAll = function(el_name) {
		$J('input:checkbox[name="'+el_name+'"]').not(':disabled').prop('checked',false);
	},
	numberFormat = function( number, decimals, dec_point, thousands_sep ) {
		var n = number, c = isNaN(decimals = Math.abs(decimals)) ? 0 : decimals;
		var d = dec_point == undefined ? "." : dec_point;
		var t = thousands_sep == undefined ? "," : thousands_sep, s = n < 0 ? "-" : "";
		var i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;

		return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
	},
	padString = function(string, length, pad) {
		return new Array(length - string.length + 1).join(pad) + string;
	},
	striptags = function(html) {
		var str = html.replace(/<(\/)?(html|head|title|body|h1|h2|h3|h4|h5|h6|p|br|hr|pre|em|strong|code|b|i|a|ul|li|ol|dl|dd|table|tr|th|td)([^>]*)>/gi, "");
		str = str.replace(/<(\/)?(iframe|frameset|form|input|select|option|textarea|blackquote|address|object)([^>]*)>/gi, "");
		str = str.replace(/\s/g,'');
		str = str.replace(/&nbsp;/g, '');

		return str;
	},

	summaryShow = function(el, key) {
		var popover = $J('div#popover_'+key);
		if(popover.length>0 && popover.is(':visible')) {
			return 'hide';
		}

		$J('div.popover').hide();
		if(key in uno) {
			return 'show';
		}
		else {
			return 'load';
		}
	},
	summaryHide = function(el, no) {
		var popover = $J('div#popover_'+no);
		$J(el).popover('destroy');
	},
	summaryMember = function(el, key){
		var is_show = summaryShow(el, key);
		if(is_show=='load') {
			$J.get('/account/summary/'+key,function(d) {
				$J(el).popover({content: d, container: 'body', html:true, trigger:'focus', title:'회원간략정보',template:'<div class="popover" data-popover-group="summary_product" id="popover_'+key+'"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}).popover('show');
				uno[key] = {content:d, el:el};
			});
		}
		else if(is_show=='show'){
			var content = uno[key].content;
			$J(el).popover({content: content, container: 'body', html:true, trigger:'focus', title:'회원간략정보',template:'<div class="popover" data-popover-group="summary_product" id="popover_'+key+'"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}).popover('show');
		}
	},
	summaryProduct = function(el, key){
		var is_show = summaryShow(el, key);
		if(is_show) {
			$J('div.popover').not('#popover_'+key).hide();
			$J.get('/product/summary/'+key,function(d) {
				$J(el).popover({content: d, container: 'body', html:true, trigger:'manual', title:'상품간략정보',template:'<div class="popover" data-popover-group="summary_product" id="popover_'+key+'"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}).popover('show');
				pno.push(key);
			});
		}
	},
	parseQuery = function() {
		var query_string = {};
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i=0;i<vars.length;i++) {
			var pair = vars[i].split("=");
			if (typeof query_string[pair[0]] === "undefined") {
				query_string[pair[0]] = pair[1];

			}
			else if (typeof query_string[pair[0]] === "string") {
				var arr = [ query_string[pair[0]], pair[1] ];
				query_string[pair[0]] = arr;
			}
			else {
			query_string[pair[0]].push(pair[1]);
			}
		}
		return query_string;
	},
	term = function(term, el_start, el_end) {
		var date = new Date();
		$J('#'+el_end).val(date.toISOString().substring(0,10));

		switch (term) {
			case '7d':
				date.setDate(date.getDate()-7);
			break;
			case '30d':
				date.setDate(date.getDate()-30);
			break;
			default:
			break;
		}

		$J('#'+el_start).val(date.toISOString().substring(0,10));
	},
	countBytes = function(el) {
		var str = $J(el).val(), max = $J(el).data('max'), dp = $J(el).data('display');
		var dp_len = 0, valid_len = 0, sum_bytes = 0;
		for(var i = 0; i<str.length; i++) {
			var b = 0, c = escape(str.charAt(i));
			if(c.length==1) b++;
			else if(c.indexOf('%u')!==-1) b += 2;
			else if(c.indexOf('%')!==-1) b += c.length/3;
			sum_bytes += b;
			if(sum_bytes <= max) {
				valid_len++;
				dp_len += b;
			}
		}
		if(max && sum_bytes > max) {
			$J(el).val(str.substr(0, valid_len));
			alert(max +'바이트 까지 입력할 수 있습니다.');
		}
		
		if(dp) {
			$J('#'+dp).text(dp_len);
		}
		return dp_len;
	
	},
	insertAt = function(eid, text) {
		var txtarea = document.getElementById(eid);
		var scrollPos = txtarea.scrollTop;
		var strPos = 0;
		var browser = ((txtarea.selectionStart || txtarea.selectionStart == '0') ? "ff" : (document.selection ? "ie" : false ) );
		if (browser == "ie") { 
			txtarea.focus();
			var range = document.selection.createRange();
			range.moveStart ('character', -txtarea.value.length);
			strPos = range.text.length;
		}
		else if (browser == "ff") strPos = txtarea.selectionStart;

		var front = (txtarea.value).substring(0,strPos);  
		var back = (txtarea.value).substring(strPos,txtarea.value.length); 
		txtarea.value=front+text+back;
		strPos = strPos + text.length;
		if (browser == "ie") { 
			txtarea.focus();
			var range = document.selection.createRange();
			range.moveStart ('character', -txtarea.value.length);
			range.moveStart ('character', strPos);
			range.moveEnd ('character', 0);
			range.select();
		}
		else if (browser == "ff") {
			txtarea.selectionStart = strPos;
			txtarea.selectionEnd = strPos;
			txtarea.focus();
		}
		txtarea.scrollTop = scrollPos;
	};
	return {
		getBrowser : getBrowser,
		drawDay: drawDay,
		mask:showMask,
		unmask:hideMask,
		getChecked:getChecked,
		getUid:getUid,
		insertAt:insertAt,
		checkExt:checkExt,
		toggleCheck:toggleCheck,
		numberFormat:numberFormat,
		padString:padString,
		striptags:striptags,
		summaryProduct:summaryProduct,
		summaryMember:summaryMember,
		summaryHide:summaryHide,
		parseQuery:parseQuery,
		term:term,
		uncheckAll:uncheckAll,
		countBytes:countBytes
	};
}();