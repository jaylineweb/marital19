# page_jquery.html 사용 가이드

## 사용 방법

### 방법 1: 파일명을 page.html로 변경 (권장)

현재 `index.html`에서 `/m/page.html?pid=17` 링크를 사용하고 있으므로:

```bash
# page_jquery.html을 page.html로 복사하거나 이름 변경
```

또는 `page_jquery.html`의 내용을 `page.html`에 복사하면 됩니다.

### 방법 2: 기존 링크를 page_jquery.html로 변경

`index.html`의 모든 링크를 다음과 같이 변경:
- `/m/page.html?pid=17` → `/m/page_jquery.html?pid=17`
- `/m/page.html?pid=44` → `/m/page_jquery.html?pid=44`
- 등등...

## 현재 page_jquery.html의 한계

현재 `page_jquery.html`은:
- ✅ pid 파라미터 읽기 기능 있음
- ✅ jQuery로 콘텐츠 표시 기능 있음
- ❌ 실제 사이트의 헤더/푸터 구조 없음
- ❌ 메뉴 네비게이션 없음
- ❌ 사이트 디자인/스타일 미적용

## 실제 사용을 위한 개선 필요사항

1. **헤더/푸터 추가**: `index.html`의 헤더/푸터 구조를 포함해야 함
2. **스타일 적용**: 기존 CSS 파일들이 모두 로드되어야 함
3. **콘텐츠 영역**: `main_con` 영역 내에 콘텐츠가 표시되어야 함

## 권장 작업 순서

1. `index.html`의 헤더/푸터 구조 확인
2. `page_jquery.html`에 헤더/푸터 추가
3. 콘텐츠 영역을 `main_con` 내부에 배치
4. 필요한 CSS/JS 파일 모두 포함
5. 파일명을 `page.html`로 변경

## 사용 예시

```
/m/page.html?pid=17  → 브랜드소개 페이지 표시
/m/page.html?pid=44  → 가맹절차 페이지 표시
/m/page.html?pid=45  → 가맹비용 페이지 표시
```

## 콘텐츠 추가 방법

`pagesData` 객체에 새로운 항목 추가:

```javascript
var pagesData = {
    "17": { "title": "브랜드소개", "content": "..." },
    "44": { "title": "가맹절차", "content": "..." },
    "99": { "title": "새 페이지", "content": "<p>새 콘텐츠</p>" }  // 추가
};
```

