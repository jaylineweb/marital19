var RANKUPBanner = function(id, type) {
	this.id = id;
	this.type = type;
}

RANKUPBanner.prototype = {
	init:function(option) {
		// require.config는 한 번만 설정하면 되므로, 이미 설정되어 있으면 건너뛰기
		// index.html에서 이미 설정되어 있을 수 있으므로 중복 설정 방지
		if (typeof require !== 'undefined' && require.config) {
			try {
				// 이미 설정되어 있는지 확인
				var context = require.s && require.s.contexts && require.s.contexts._;
				var hasJssorPath = context && context.config && context.config.paths && 
					(context.config.paths['jssor/jssor.core'] || context.config.paths.jssor);
				
				if (!hasJssorPath) {
					// 절대 경로 시도
					require.config({
						baseUrl: '/Libs/js',
						paths: {
							'jssor/jssor.core': '/Libs/js/jssor/jssor.core',
							'jssor/jssor.slider.min': '/Libs/js/jssor/jssor.slider.min',
							'jssor/jssor.utils': '/Libs/js/jssor/jssor.utils'
						}
					});
				}
			} catch(e) {
				// 설정 실패 시 무시 (이미 index.html에서 설정되었을 수 있음)
				console.warn('RequireJS 추가 설정 실패 (이미 설정되었을 수 있음):', e);
			}
		}

		this.option = option;
		switch (this.type) {
			case 'slide':
				this.init_slide();
			break;
			case 'fade':
				this.init_fade();
			break;
			case 'carousel':
				this.init_carousel();
			break;
		}
	},
	init_slide: function(){
		var me = this;
		var opt = this.option;

		require(['jssor/jssor.core','jssor/jssor.slider.min','jssor/jssor.utils'], function() {
			var option = {
				$FillMode: 1, 
				$AutoPlay: true,
				$PauseOnHover:opt.hover,
				$AutoPlayInterval:opt.interval,
				$SlideDuration:opt.duration,
				$PlayOrientation:opt.orientation_play,
				$DragOrientation:opt.orientation_drag
			};
			//좌우화살표 사용
			if(opt.arrow) {
				var arrow_option = {
					$ArrowNavigatorOptions: {
						$Class: $JssorArrowNavigator$,
						$ChanceToShow: 1,
						$AutoCenter: 2,
						$Steps: 1
					}	
				};
				option = $J.extend({}, option, arrow_option);
			}

			//불릿 사용
			if(opt.bullet) {
				$J('.banner-bullet').css('display','');
				var bullet_option = {
					$BulletNavigatorOptions: {
						$Class: $JssorBulletNavigator$,
						$ChanceToShow: 2,
						$AutoCenter: opt.bullet_position,
						$Steps: 1,
						$Lanes: 1,
						$SpacingX: -5,
						$SpacingY: -5,
						$Orientation: 1
					}
				};
				option = $J.extend({}, option, bullet_option);
			}
			var slide = new $JssorSlider$(me.id, option);
			$J('#'+me.id).find('div.preview').css('display','none');
			$J('#'+me.id).find('div.slides').css('display','');
		}, function(err) {
			console.error('JSSOR 라이브러리 로드 실패:', err);
			// 에러 발생 시에도 슬라이드 표시
			$J('#'+me.id).find('div.preview').css('display','none');
			$J('#'+me.id).find('div.slides').css('display','');
		});
	},
	init_fade: function() {
		var me = this;
		var opt = this.option;

		var _SlideshowTransitions = [
			{ $Duration: opt.duration, $Opacity: 2 }
		];

		require(['jssor/jssor.core','jssor/jssor.slider.min','jssor/jssor.utils'], function() {
			var option = {
				$AutoPlay: true,
				$AutoPlaySteps: 1,
				$AutoPlayInterval: opt.interval,
				$PauseOnHover:opt.hover,
				$ArrowKeyNavigation: false,
				$SlideDuration: 500,
				$MinDragOffsetToSlide: 20,
				$SlideSpacing: 0,
				$DisplayPieces: 1,
				$ParkingPosition: 0,
				$PlayOrientation: 1,
				$DragOrientation: 0,  
				$SlideshowOptions: {
					$Class: $JssorSlideshowRunner$,
					$Transitions: _SlideshowTransitions,
					$TransitionsOrder: 1,
					$ShowLink: true
				}
			};
			
			var slide = new $JssorSlider$(me.id, option);
			
		}, function(err) {
			console.error('JSSOR 라이브러리 로드 실패:', err);
		});
	},
	init_carousel: function() {
		var me = this;
		var opt = this.option;

		require(['jssor/jssor.core','jssor/jssor.slider.min','jssor/jssor.utils'], function() {
			var option = {
				$AutoPlay: true,
				$AutoPlaySteps:opt.play_step,
				$PauseOnHover:opt.hover,
				$AutoPlayInterval:opt.interval,
				$SlideDuration:opt.duration,
				$PlayOrientation:opt.orientation_play,
				$DragOrientation:opt.orientation_drag,
				$SlideWidth:opt.slide_width,
				$SlideSpacing:opt.slide_spacing,
				$DisplayPieces:opt.display_pieces,

				$MinDragOffsetToSlide: 20,
				$ParkingPosition: 0,
				$UISearchMode: 1
			};

			//좌우화살표 사용
			if(opt.arrow) {
				var arrow_option = {
					$ArrowNavigatorOptions: {
						$Class: $JssorArrowNavigator$,
						$ChanceToShow: 1,
						$AutoCenter: 2,
						$Steps: 1
					}	
				};
				option = $J.extend({}, option, arrow_option);
			}

			//불릿 사용
			if(opt.bullet) {
				$J('.banner-bullet').css('display','');
				var bullet_option = {
					$BulletNavigatorOptions: {
						$Class: $JssorBulletNavigator$,
						$ChanceToShow: 2,
						$AutoCenter: opt.bullet_position,
						$Steps: 1,
						$Lanes: 1,
						$SpacingX: -5,
						$SpacingY: -5,
						$Orientation: 1
					}
				};
				option = $J.extend({}, option, bullet_option);
			}

			var slide = new $JssorSlider$(me.id, option);
			$J('#'+me.id).find('div.loading').css('display','none');
			$J('#'+me.id).find('div.slides').fadeIn();
    	}, function(err) {
			console.error('JSSOR 라이브러리 로드 실패:', err);
			// 에러 발생 시에도 로딩 화면 숨기고 슬라이드 표시
			$J('#'+me.id).find('div.loading').css('display','none');
			$J('#'+me.id).find('div.slides').fadeIn();
		});
	}
}