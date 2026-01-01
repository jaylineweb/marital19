// 팝업클래스
var RANKUP_POPUP = function() {
	this.version = "1.1 r090120", // 팝업개발버전
	this.mode = "divpop"; // 팝업모드{ divpop | winpop }
	this.items = new Object;
	this.popups = []; // 팝업데이터
	this.template = ''; // 템플릿
	this.cookies = ''; // 쿠키정보
	this.baseTop = 0;
	this.baseLeft = 0;
	this.selTop = 0;
	this.selLeft = 0;
	this.tmpHeight = 0;
	this.move_on_off = 0; // 이동 활성 비활성화
	this.move_div_obj = null;// 이동할 DIV
	this.move_div_obj_before = null; // 이전에 이전한 아이디값
	this.move_x_margin = 0; // X 값
	this.move_y_margin = 0;// Y 값
}
// 팝업 가져오기
RANKUP_POPUP.prototype.getPopup = function() {
	var classObj = this;
	new Ajax.Request("/rankup_module/rankup_popup/multiProcess.html?mode=popup_list&device=mobile", {
		method: 'get',
		onSuccess: function(transport) {
			var resultData = transport.responseXML.getElementsByTagName('resultData')[0];
			classObj.items = resultData.getElementsByTagName('item');
			classObj.formalize();
		}
	});
}
// 팝업 등록
RANKUP_POPUP.prototype.formalize = function() {
	for(var i=0; i<this.items.length; i++) {
		var item = this.items[i];
		var pNo = item.getAttribute("no");
		if(this.cookies.indexOf("popup_id"+pNo+"=checked")!=-1) continue;
		var pop = {
			no: item.getAttribute("no"),
			title: item.getElementsByTagName("title")[0].firstChild.nodeValue,
			top: item.getElementsByTagName("top")[0].firstChild.nodeValue,
			left: item.getElementsByTagName("left")[0].firstChild.nodeValue,
			width: item.getElementsByTagName("width")[0].firstChild.nodeValue,
			height: item.getElementsByTagName("height")[0].firstChild.nodeValue,
			content: item.getElementsByTagName("content")[0].firstChild.nodeValue
		};
		this.view(pop);
	}
}
// 팝업 노출
RANKUP_POPUP.prototype.view = function(pop) {
	if(!document.all) this.mode = "divpop"; // 파폭에서는 divpop 으로 고정
	switch(this.mode) {
		case "divpop":
			// 템플릿 복사
			var content = this.template.innerHTML.replace(/{:no:}/g, pop.no).replace(/{:popup_id:}/g, "divpop_id"+pop.no).replace(/{:popup_title:}/g, pop.title);
			new Insertion.After(this.template, "<div id='divpop_id"+pop.no+"'>"+content+"</div>");
			var divpop = $('divpop_id'+pop.no);
			divpop.setStyle({
				position: 'absolute',
				top: this.selTop+'px',
				left: this.selLeft+'px',
				zIndex: 200
			});
			// 팝업 컨텐츠 입력
			try {
				var pop_obj = $("popup_content"+pop.no);
				var iframe = divpop.getElementsByTagName("iframe")[0];
				var doc = iframe.contentWindow.document;
				doc.open();
				doc.write(pop.content);
				pop_obj.innerHTML = iframe.contentWindow.document.body.innerHTML;
				doc.body.innerHTML = ''; // 2010.01.29 fixed
				doc.close();
				if(pop.width>0) pop_obj.style.width = pop.width+'px';
				if(pop.height>0) pop_obj.style.height = pop.height+'px';
				this.calc_popup(divpop);
			}
			catch(e) {
				//alert(e.message);
			}
			break;

		case "winpop":
			// 미구현
			break;
	}
}
// 팝업 계산
RANKUP_POPUP.prototype.calc_popup = function(divpop) {
	var content_x = divpop.getElementsByTagName("table")[0];
	var iframe_x = divpop.getElementsByTagName("iframe")[0];
	if(content_x.offsetWidth==0) {
		var classObj = this;
		return setTimeout(function() { classObj.calc_popup(divpop) }, 0);
	}
	//divpop.setStyle({ top: this.selTop, left: this.selLeft }); // 2009.03.31 fixed
	divpop.setStyle({ top: '0px', left: '0px' }); // 2009.03.31 fixed

	/*
	// 가로 사이즈를 오버할 경우, 세로사이즈가 큰값으로 갱신
	this.selLeft += content_x.offsetWidth-1;
	if(this.selLeft>document.body.offsetWidth) {
		divpop.style.top = this.selTop + this.tmpHeight-1;
		divpop.style.left = this.baseLeft;
		this.selLeft = this.baseLeft + content_x.offsetWidth-1;
		this.selTop += this.tmpHeight-1;
		this.tmpHeight = content_x.offsetHeight; // 갱신
	}
	if(content_x.offsetHeight>this.tmpHeight) this.tmpHeight = content_x.offsetHeight;
	if(browser.kind=='IE' && browser.version<7) {
		iframe_x.style.width = content_x.offsetWidth;
		iframe_x.style.height = content_x.offsetHeight;
	}
	*/
	content_x.style.visibility = 'visible';
}
// 이동값 초기화
RANKUP_POPUP.prototype.div_move_check = function(onoff, ev, obj) {
	this.move_div_obj = obj ? $(obj) : this.move_div_obj;
	if(this.move_div_obj == null) return false;
	if(this.move_div_obj_before == null) {
		this.move_div_obj_before = this.move_div_obj;
		this.move_div_obj.setStyle({zIndex: this.move_div_obj.getStyle('z-index') + 1});
	}
	else if(this.move_div_obj_before.id !== this.move_div_obj.id) {
		var before_zindex = this.move_div_obj_before.getStyle('z-index');
		var after_zindex = this.move_div_obj.style.zIndex;
		this.move_div_obj.setStyle({zIndex: before_zindex + 1});
		this.move_div_obj_before = this.move_div_obj;
	}
	if(onoff == 0) document.onselectstart = function() { return true };
	else {
		document.onselectstart = function() { return false };
		this.move_x_margin = Event.pointerX(ev?ev:event) - this.move_div_obj.offsetLeft;
		this.move_y_margin =  Event.pointerY(ev?ev:event) - this.move_div_obj.offsetTop;
	}
	this.move_on_off = onoff;
}
// 창이동
RANKUP_POPUP.prototype.div_move = function(ev) {
	if(this.move_on_off == 1) {
		var x_result = Event.pointerX(ev?ev:event) - this.move_x_margin;
		var y_result = Event.pointerY(ev?ev:event) - this.move_y_margin;
		if(x_result > 0){this.move_div_obj.style.left = x_result;}
		if(y_result > 0){this.move_div_obj.style.top =  y_result;}
	}
}
// 쿠키굽기
RANKUP_POPUP.prototype.setCookie = function(no, expiredays) {
	var todayDate = new Date();
	todayDate.setDate(todayDate.getDate()+expiredays);
	document.cookie = "popup_id"+no+"=checked; path=/; expires="+todayDate.toGMTString()+";";
}
// 팝업창닫기
RANKUP_POPUP.prototype.closeWin = function(no, check) {
	if(this.mode=="divpop") {
		var divPop = $("divpop_id"+no);
		if(divPop.getElementsByTagName("input")[0].checked) this.setCookie(no,1);
		divPop.update(''); // 2010.02.10 added
		divPop.remove(); // 2010.01.29 fixed
	}
	else if(check) this.setCookie(no,1);
}
// 팝업 설정
RANKUP_POPUP.prototype.initialize = function(template) {
	this.template = $(template); // 템플릿
	this.cookies = document.cookie; // 쿠키로드
	this.getPopup();
	//DIV 팝업이동
	var This = this;
	document.onmouseup= function(event) { This.div_move_check(0, event) }
	document.onmousemove = this.div_move.bind(this);
}
var rankup_popup = new RANKUP_POPUP;