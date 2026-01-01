var alerts = document.alerts = function(str) { str.alert(); return false; }
/**
 * 플로터
 */
var floater = {
	frame: null,
	baseY: 0, // y축 기본여백
	cycle: 10, // 재귀호출간격
	pro: 10, // 개체이동속도
	initialize: function(frame, baseY, pro, cycle) {
		this.frame = $(frame); // 개체
		this.frame.style.position = 'absolute';
		if(baseY) this.baseY = baseY;
		if(pro) this.pro = pro;
		if(cycle) this.cycle = cycle;

		this.move();
	},
	move: function () {
		Position.prepare();
		var frameTop = this.frame.style.top ? parseInt(this.frame.style.top,10) : this.frame.offsetTop;
		var docTop = (Position.deltaY>this.baseY) ? Position.deltaY : this.baseY;
		var moveY = Math.ceil(Math.abs(frameTop - docTop) / this.pro);
		this.frame.style.top = (frameTop<docTop) ? frameTop + moveY + 'px' : frameTop - moveY + 'px';

		var self = this;
		setTimeout(function() { self.move() }, this.cycle);
	}
}

// 스팸방지 보안코드 이미지 갱신 - 2010.10.13 added
var confirm_code_reset = function() {
	var keystring = $('keystring');
	if(keystring) {
		keystring.value = '';
		var confirm_image = $('confirm_image').select('img')[0];
		var url = confirm_image.src.split('?');
		confirm_image.src = url[0]+ '?dummy='+ Math.random();
	}
}

//##################################################################################
//## 달력 클래스 정의 - 2012.03.09 fixed
//##################################################################################
var RANKUP_CALENDAR = Class.create({
	handler: null, // 핸들러
	initialize: function() {
		this.toDay = new Date();
		this.selYear = this.toDay.getUTCFullYear();
		this.selMonth = this.toDay.getUTCMonth() + 1;
		this.selDay = this.toDay.getUTCDate();
		this.lastDays = ['', 31,28,31,30,31,30,31,31,30,31,30,31];
		this.calendarBody = 'calendarBody';
		this.selComponent = null;
		this.compYear = null;
		this.compMonth = null;
		this.compDay = null;
		this.drawStatus = false;
		this.minDate = null; // 하한선
		this.maxDate = null; // 상한선
		this.displayRestday = null; // 공휴일표시 - 2010.12.23 added
		this.rest_days = {}; // 공휴일 - 2010.12.23 added
	},
	// 달력 범위 설정
	get_calendar_range: function(mode) {
		var calendar_options = '';
		switch(mode) {
			case 'year':
				this.toDay = new Date();
				var now_year = this.toDay.getUTCFullYear();
				if(this.minDate==null) {
					var min_year = parseInt(now_year)-1;
					this.minDate = String(min_year) +'-01-01';
				}
				else {
					var date_infos = this.minDate.split('-');
					var min_year = date_infos[0];
				}
				if(this.maxDate==null) {
					var max_year = parseInt(now_year)+1;
					this.maxDate = String(max_year) +'-12-31';
				}
				else {
					var date_infos = this.maxDate.split('-');
					var max_year = date_infos[0];
				}
				for(var year=max_year; year>=min_year; year--) calendar_options += '<option value="'+ year +'">'+ year +'년</option>';
				break;
			case 'month':
				for(var month=1; month<=12; month++) {
					calendar_options += '<option value="'+ month +'">'+ month.toPaddedString(2) +'월</option>';
				}
				break;
		}
		return calendar_options;
	},
	// 달력 그리기
	draw_calendar: function(el, base, spot) {
		var obj = $('calendar_div');
		this.selComponent = el;
		this.minDate = el.getAttribute('mindate');
		this.maxDate = el.getAttribute('maxdate');
		this.displayRestday = el.getAttribute('displayRestday'); // 2010.12.23 added
		if(this.maxDate!=null && base==undefined && el.value=='') base = {'value':this.maxDate};

		if(obj!=null) rankup_calendar.remove_calendar();
		this.drawStatus = false;

		var width = Prototype.Browser.IE ? 160 : 148;
		var html = "\
		<div id='calendar_div' style='position:absolute;z-index:200;'>\
			<div style='position:absolute;width:160px;height:179px;left:0px;top:0px'><iframe src='about:blank' style='width:100%;height:100%;' frameborder='0'></iframe></div>\
			<div style='width:"+width+"px;position:relative;border:#cdcdcd 1px solid;top:0;left:0;padding:4px;background-color:#f8f8f8;'>\
				<table cellpadding='0' cellspacing='0' border='0' style='margin-bottom:4px;'>\
				<tr>\
					<td style='padding-right:3px;'><select style='width:64px' onChange=\"rankup_calendar.change_date_II(this)\">"+this.get_calendar_range('year')+"</select></td>\
					<td style='padding-right:3px;'><select style='width:52px' onChange=\"rankup_calendar.change_date_II(this)\">"+this.get_calendar_range('month')+"</select></td>\
					<td align='right'><a onClick='rankup_calendar.remove_calendar()'><img src='../../Libs/_images/btn_close_s.gif' align='absmiddle'></a></td>\
				</tr>\
				</table>\
				<span style='display:none'><button onClick=\"rankup_calendar.change_date('-1 year')\" style=\"background:url('../../images/btn_prev.gif');width:13px;height:16px;border:0;\"></button> <input type='text' size='3' readOnly style='letter-spacing:0px;background-color:#f8f8f8;'> <button onClick=\"rankup_calendar.change_date('1 year')\" style=\"background:url('"+domain+"images/btn_next.gif');width:13px;height:16px;border:0;\"></button>\
				&nbsp;&nbsp;<button onClick=\"rankup_calendar.change_date('-1 month')\" style=\"background:url('../../images/btn_prev.gif');width:13px;height:16px;border:0;\"></button> <input type='text' size='1' readOnly style='background-color:#f8f8f8;'> <button onClick=\"rankup_calendar.change_date('1 month')\" style=\"background:url('"+domain+"images/btn_next.gif');width:13px;height:16px;border:0;\"></button></span>\
				<table cellpadding='0' cellspacing='1' bgcolor='#C9C9C9' border='0' style='margin-top:3px;' width='100%'>\
				<tr bgcolor='#f4f8fb' align='center'>\
					<td><font color='red'>일</font></td>\
					<td>월</td>\
					<td>화</td>\
					<td>수</td>\
					<td>목</td>\
					<td>금</td>\
					<td><font color='#3366cc'>토</font></td>\
				</tr>\
				<tbody bgcolor='white' align='center' id='"+this.calendarBody+"'>\
				</tbody>\
				</table>\
			</div>\
		</div>";
		new Insertion.Before(this.selComponent, html);
		if(!el.value.blank()) this.change_date(el.value);
		else [null,undefined].include(base) ? this.change_date(el.value) : this.change_date(base.value);
		$('calendar_div').style.marginTop = this.selComponent.offsetHeight + 'px';
	},
	change_date_II: function(el) {
		var info_selects = $('calendar_div').getElementsByTagName('select');
		this.change_date(info_selects[0].value+'-'+info_selects[1].value+'-'+this.selDay);
	},
	change_date: function(date) { // date { 1 year | -1 year | -1 month | 1 month }
		if(date=='') {
			this.toDay = new Date();
			this.selYear = this.toDay.getUTCFullYear();
			this.selMonth = this.toDay.getUTCMonth() + 1;
			this.selDay = this.toDay.getUTCDate();
			this.compYear = this.compMonth = this.compDay = '';
		}
		else {
			switch(date) {
				case '-1 year': this.selYear -= 1; break;
				case '1 year': this.selYear += 1; break;
				case '-1 month':
					if(this.selMonth!=1) this.selMonth -= 1;
					else { // 0 : 1월
						this.selYear -= 1;
						this.selMonth = 12;
					}
					break;
				case '1 month':
					if(this.selMonth!=12) this.selMonth += 1;
					else { // 11 : 12월
						this.selYear += 1;
						this.selMonth = 1;
					}
					break;
				default: // 날짜값을 받은 경우 : 2008-09-12
					var date_infos = date.split('-');
					with(Math) {
						this.compYear = floor(date_infos[0]);
						this.compMonth = floor(date_infos[1]);
						this.compDay = floor(date_infos[2]);
					}
					if(this.drawStatus===true && this.compYear==this.selYear && this.compMonth==this.selMonth && this.compDay==this.selDay) return true;
					this.selYear = this.compYear;
					this.selMonth = this.compMonth;
					this.selDay = this.compDay;
			}
		}
		var calendar_body = $(this.calendarBody);
		this.toDay = new Date(this.selYear, this.selMonth-1, this.selDay);
		this.lastDays[2] = (this.selYear%4)==0 && ((this.selYear%100)!=0 || (this.selYear%400)==0) ? 29 : 28;
		var info_inputs = $('calendar_div').getElementsByTagName('input');
		var info_selects = $('calendar_div').getElementsByTagName('select');
		info_inputs[0].value = info_selects[0].value = this.selYear;
		info_inputs[1].value = info_selects[1].value = this.selMonth;

		calendar_body.update(); // 초기화

		// 2010.12.23 added
		var today = new Date();
		var ndate = [today.getUTCFullYear(), today.getUTCMonth()+1, today.getUTCDate()].join('-');
		var cdate = [this.selYear, this.selMonth].join('-');

		// 공휴일 로드
		if(this.displayRestday!=null) {
			var self = this;
			if(this.rest_days[cdate]!=null) {
				if(this.rest_days[cdate]) setTimeout(function() { self.apply_rest_day(self.rest_days[cdate]) }, 0);
			}
			else {
				var url = domain +'Libs/_js/calculate_date.ajax.php?mode=check_days&year='+ this.selYear +'&month='+ this.selMonth;
				new Ajax.Request(url, { method: 'get',
					onSuccess: function(transport) {
						self.rest_days[cdate] = transport.responseXML.getElementsByTagName('resultData')[0].firstChild.nodeValue.split(',');
						self.apply_rest_day(self.rest_days[cdate]);
					}
				});
			}
		}
		var first_day_cell = 0;
		var first_cell = ((this.toDay.getDay()+7)-(this.selDay-1)%7)%7;

		for(var row=0, day=1; row<6; row++) {
			var new_row = calendar_body.insertRow(calendar_body.rows.length);
			for(var cell=0; cell<7; cell++) {
				if(cell == first_cell) first_day_cell += 1;
				var new_cell = new_row.insertCell(cell);
				new_cell.id = 'day_'+ day;
				switch(cell) {
					case 0: new_cell.style.color = '#ff0000'; break;
					case 6: new_cell.style.color = '#3366cc'; break;
				}
				if(first_day_cell>=1 && day<=this.lastDays[this.selMonth]) {
					new_cell.innerHTML = day;
					new_cell.style.cursor = 'pointer';
					if(ndate==cdate+'-'+day) {
						new_cell.style.backgroundColor = '#FFFF00';
					}
					if(day++==this.compDay && this.compMonth==this.selMonth && this.compYear==this.selYear) {
						new_cell.className = 'selectCell';
						new_cell.setAttribute('selected', 'true');
						this.selCell = new_cell;
					}
					else new_cell.className = 'normalCell';

					Event.observe(new_cell, 'mouseover', this.toggle_className);
					Event.observe(new_cell, 'mouseout', this.toggle_className);
					Event.observe(new_cell, 'click', this.apply_date.bind(this));
				}
				else {
					new_cell.innerHTML = '';
					new_cell.style.backgroundColor = '#F5F5F5';
				}
				new_cell.height = '20px';
				new_row.appendChild(new_cell);
			}
		}
		this.drawStatus = (calendar_body.rows.length==6);
	},
	// 날짜 변경 - 단축키 - 2012.03.20 fixed
	set_date: function(mode, dest, base) {
		if(base==undefined || base=='') {
			var toDay = new Date();
			var baseYear = toDay.getUTCFullYear();
			var baseMonth = toDay.getUTCMonth() + 1;
			var baseDay = toDay.getUTCDate()
			var base_date = baseYear+'-'+baseMonth+'-'+baseDay;
		}
		else {
			var base_date = base.value;
		}
		switch(mode) {
			case 'today':
				var xdate = new Date();
				break;
			case 'yesterday':
				var xdate = new Date();
				xdate.setDate(xdate.getDate()-1);
				break;
			default:
				var dates = base_date.split('-');
				var xdate = new Date(dates[0], dates[1]-1, dates[2]);
				var period = mode.split(' ');
				switch(period[1]) {
					case 'day':
						xdate.setDate(xdate.getDate() + parseInt(period[0]));
						break;
					case 'month':
						xdate.setMonth(xdate.getMonth() + parseInt(period[0]));
						break;
				}
		}
		var dest_date = new Template('#{year}-#{month}-#{day}').evaluate({
			year: xdate.getUTCFullYear(),
			month: (xdate.getUTCMonth() + 1).toPaddedString(2),
			day: xdate.getUTCDate().toPaddedString(2)
		});
		if(['today','yesterday'].include(mode)) dest.value = base.value = dest_date;
		else dest.value = dest_date;
		if(this.selComponent===dest) this.change_date(dest.value);
	},
	// 분류 설정시 아이템 오버/아웃시에 사용
	toggle_className: function(event) {
		this.className = (event.type!='mouseover') ? this.getAttribute('selected')!=null ? 'selectCell' : 'normalCell' : this.getAttribute('selected')!=null ? 'shoverCell' : 'hoverCell';
	},
	// 달력박스 감추기
	hidden_calendar: function() {
		var frame = $('calendar_div');
		if(frame!=null) frame.hide();
	},
	// 달력개체 제거
	remove_calendar: function() {
		var frame = $('calendar_div');
		if(frame!=null) frame.remove();
	},
	// 선택한 날짜값 반환
	apply_date: function(event) {
		var el = Event.element(event);
		var year = this.selYear;
		var month = Math.floor(this.selMonth);
		var day = Math.floor(el.innerHTML);
		var selDate = year+'-'+month.toPaddedString(2)+'-'+day.toPaddedString(2);
		if(selDate<this.minDate || selDate>this.maxDate) {
			return alerts('날짜는 '+ this.minDate +' 부터 '+ this.maxDate +' 까지 입력가능합니다.');
		}
		else {
			this.selComponent.value = selDate;
			this.hidden_calendar();
		}
	},
	// 공휴일 반영
	apply_rest_day: function(rest_days) {
		$A(rest_days).each(function(rest) {
			var obj = $('day_'+ rest);
			obj.style.color = '#ff0000';
		});
	}
});
var rankup_calendar = new RANKUP_CALENDAR;

/**
 * Common initialized
 *@Author: kurokisi
 *@AuthDate: 2010.11.23
 */
var proc = {
	url: '.',
	proc: '/proc.ajax.php',
	method: 'post',
	parameters: function(params, form) {
		if(typeof(params)=='string' && params.blank()) params = {};
		this.params = (form==undefined) ? $H(params) : $H(params).merge(Form.serialize(form, true));
	},
	process: function(proc, debug, url) {
		var self = this;
		if(url==undefined) url = this.url;
		if(debug==true) alert('[url] '+ url + this.proc +'\n[parameters] '+ this.params.toQueryString());
		new Ajax.Request(url + this.proc, {
			method: this.method,
			parameters: this.params,
			onSuccess: function(trans) {
				if(debug==true) alert('[responseText] : '+ trans.responseText);
				if(typeof(proc)=='function') proc(trans);
				else if(!trans.responseText.blank()) self.proc.response(trans);
			},
			onFailure: function(trans) {
				alert('[failure-responseText] '+ trans.responseText);
			}
		});
	},
	response: function(trans) {
		if(trans.responseText.blank()) return;
		trans.responseText.match(/<script/i) ? trans.responseText.evalScripts() : alert(trans.responseText);
	},
	isXML: function(trans) { // 2011.12.20 added
		try { return (trans.responseXML.firstChild.nodeType < Node.DOCUMENT_NODE) }
		catch(e) { return false }
	}
}
// 선택
var checker = {
	initialize: function(spot, selector, top, bottom) {
		this.selector = selector;
		this.objects = {
			spot: $(spot),
			top: $(top==undefined ? 'checker_top' : top),
			bottom: $(bottom==undefined ? 'checker_bottom' : bottom),
			status: {'false': 'btn_select_all', 'true': 'btn_select_cancel'}
		}
	},
	all: function(all) { // 선택반전
		with(this.objects) {
			if(all==undefined) all = top.checked = !top.checked;
			if(bottom!=null) bottom.innerHTML = bottom.innerHTML.replace(eval('/'+status[!all]+'/'), status[all]);
		}
		$A($(this.objects.spot.parentNode).select(this.selector)).each(function(item) { if(item.disabled==false) item.checked = all });
	},
	get: function(extend) { // 선택 값 반환
		var items = [], objects = [];
		$A($(this.objects.spot.parentNode).select(this.selector)).each(function(item) {
			if(item.checked==true) {
				objects.push(item);
				items.push(item.value);
			}
		});
		return (extend==true) ? {items: items.join('__'), objects: objects} : items.uniq().join('__');
	}
}
// 레이어 위치
var position = {
	center: function(frame) { // frame: string
		this.set(frame, 'c', 'c');
	},
	set: function(frame, x, y) {
		frame = $(frame);
		Position.prepare();
		var dms = frame.getDimensions();
		var top = 0, left = 0, marginTop = 0, marginLeft = 0;
		switch(x) {
			case 'l': left = 0; marginLeft = Position.deltaX; break;
			case 'c': left = '50%'; marginLeft = Position.deltaX -(dms.width/2); break;
			case 'r': left = '100%'; marginLeft = Position.deltaX - dms.width; break;
		}
		switch(y) {
			case 't': top = 0; marginTop = Position.deltaY; break;
			case 'c': top = '50%'; marginTop = Position.deltaY - (dms.height/2); break;
			case 'b': top = '100%'; marginTop = Position.deltaY - dms.height; break;
		}
		frame.setStyle({ top: top, left: left, marginTop: marginTop +'px', marginLeft: marginLeft +'px' });
	}
}
// 블라인드
var blind = {
	frame: null,
	draw: function(opacity, zIndex) { // 그리기
		with(document) {
			this.frame = createElement('div');
			this.frame.id = "blind_layer"; //2018-01-05 모바일 메뉴 lyj 
			body.appendChild(this.frame);
			opacity = (opacity!=undefined) ? opacity : 50;
			$(this.frame).setStyle({
				position: 'absolute',
				backgroundColor: 'black',
				width: parseInt(body.scrollWidth),
				height: parseInt(body.clientHeight), //parseInt(body.scrollHeight),
				filter: 'alpha(opacity='+ opacity +')',
				opacity: (opacity/100),
				zIndex: (zIndex!=undefined) ? zIndex : 1,
				left: 0,
				top: 0
			});
			try {
				this.resizing();
				Event.observe(window, 'resize', this.resizing.bind(this));
			}
			catch(e) {
				//FF 3.6.13 error
				//alert(e.message);
			}
		}
	},
	resizing: function() { // 윈도우 크기 변경시 처리
		with(document) {
			var x1 = parseInt(body.offsetWidth);
			var x2 = parseInt(body.scrollWidth);
			var gap = (x1>x2) ? x1 - x2 : 0;
			var width = body.clientWidth;
			var height = body.clientHeight;
			$(this.frame).setStyle({ width: parseInt(body.offsetWidth) - gap +'px', height: parseInt(body.scrollHeight) +'px' });
		}
	},
	remove: function() { // 블라인드 제거
		Event.stopObserving(window, 'resize', this.resizing.bind(this));
		if(this.frame) this.frame.remove();
	}
}
// 폼 전송 - 2011.08.19 added
var $form = {
	hashes: {}, // optional
	handler: null, // function - optional
	debug: false, // boolean - debugging mode
	blind: false, // blind
	url: '.',
	waiting: '<div id="sending_box"><p>처리중</p><div>잠시만 기다려 주십시오</div></div>',
	submit: function(el, frame, confirmMsg) {
		if(typeof wysiwyg_Class == 'function') Wysiwyg.submit_start();
		if(!validate(Form.getElements(frame))) return false;
		if(confirmMsg!=undefined && !confirm(confirmMsg)) return false;
		if(el.nodeName.match(/form/i)) this.waiting = '';
		if(this.waiting) {
			var wrap = $(el).up(), content = wrap.innerHTML;
			wrap.update(this.waiting);
		}
		if(this.blind==true) blind.draw();
		var self = this;
		proc.parameters(this.hashes, frame);
		proc.process(function(trans) {
			if(typeof self.handler == 'function') self.handler(trans);
			if(self.blind==true) blind.remove();
			if(self.waiting) wrap.update(content);
		}, this.debug, this.url);
	}
}
/**
 * Escaper
 *@authDate: 2012.02.08
 *@usage: Escape.add('class.close()');
 *@usage: Escape.remove('class.close()'); // manual option!
 */
var $esc = {
	stacks: [],
	listening: false,
	add: function(handler) {
		if(!this.stacks.length) {
			Event.observe(document, 'keyup', this.listener);
			this.listening = true;
		}
		if(!this.stacks.include(handler)) this.stacks.push(handler);
	},
	remove: function(handler) {
		this.stacks = this.stacks.without(handler);
		this.kill();
	},
	listener: function(event) {
		if(event.keyCode!=Event.KEY_ESC) return;
		if($esc.stacks.length) { eval($esc.stacks.pop()), $esc.kill() }
	},
	kill: function() {
		if(!this.stacks.length && this.listening) {
			Event.stopObserving(document, 'keyup', this.listener);
			this.listening = false;
		}
	}
}

// 월의 마지막 날 반영
var draw_day = function(y, m, d) {
	y = $(y).value, m = parseInt($(m).value, 10), d = $(d), d.options.length = 1;
	if(!y || !m) return;

	var days = $w('_ 31 28 31 30 31 30 31 31 30 31 30 31');
	if((y%4)==0 && ((y%100)!=0 || (y%400)==0)) days[2] = 29; // 윤달
	$R(1, days[m]).each(function(day) { d.options[d.options.length] = new Option(day+'일', day.toPaddedString(2)) }); // draw
}

var init = {}
