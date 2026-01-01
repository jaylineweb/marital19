# CSS 경로 문제 가이드

## 문제 상황

현재 코드에서 절대 경로를 사용하고 있습니다:

```html
<!-- 절대 경로 (문제) -->
<link href="http://marital19.com/m/styles/common.css?v=033857" rel="stylesheet" type="text/css">
<link href="http://marital19.com/m/include/m_menu.css?v=1767206337" rel="stylesheet" type="text/css" />
```

## 문제점

1. **정적 사이트에서 동작 안 함**: GitHub Pages 등 정적 호스팅에서는 `http://marital19.com` 도메인으로 요청이 가게 되어 로드 실패
2. **로컬 테스트 불가**: 로컬에서 열 때도 외부 서버로 요청
3. **도메인 변경 시 문제**: 도메인이 바뀌면 모든 경로 수정 필요

## 해결 방법

### 방법 1: 상대 경로로 변경 (권장)

```html
<!-- 상대 경로 -->
<link href="./styles/common.css?v=033857" rel="stylesheet" type="text/css">
<link href="./include/m_menu.css?v=1767206337" rel="stylesheet" type="text/css" />
```

### 방법 2: 루트 경로로 변경 (권장)

```html
<!-- 루트 경로 (슬래시로 시작) -->
<link href="/m/styles/common.css?v=033857" rel="stylesheet" type="text/css">
<link href="/m/include/m_menu.css?v=1767206337" rel="stylesheet" type="text/css" />
```

### 방법 3: 쿼리 파라미터 제거 (선택사항)

```html
<!-- ?v=1 제거 가능 (캐시 버스팅이 필요 없으면) -->
<link href="/m/styles/common.css" rel="stylesheet" type="text/css">
<link href="/m/include/m_menu.css" rel="stylesheet" type="text/css" />
```

## ?v=1 쿼리 파라미터에 대해

**`?v=1` 같은 쿼리 파라미터는 문제가 아닙니다:**

- ✅ **정상 동작**: 서버는 쿼리 파라미터를 무시하고 CSS 파일을 서빙합니다
- ✅ **캐시 버스팅**: 브라우저 캐시를 무효화하기 위한 표준 기법입니다
- ✅ **정적 사이트에서도 동작**: GitHub Pages 등에서도 문제없이 동작합니다

**예시:**
```
/css_menu.css?v=1     → /css_menu.css 파일을 로드 (정상)
/css_menu.css?v=2     → /css_menu.css 파일을 로드 (정상, 하지만 새로운 캐시)
/css_menu.css?test=1  → /css_menu.css 파일을 로드 (정상)
```

## 실제 문제

**절대 경로(`http://marital19.com/...`)가 문제입니다:**

```html
<!-- 문제 있는 코드 -->
<link href="http://marital19.com/m/styles/common.css?v=033857" rel="stylesheet" type="text/css">

<!-- 수정된 코드 -->
<link href="/m/styles/common.css?v=033857" rel="stylesheet" type="text/css">
```

## 결론

- ❌ `?v=1` 파라미터: 문제 없음 (정상 동작)
- ✅ `http://marital19.com/...` 절대 경로: 문제 있음 (정적 사이트에서 동작 안 함)
- ✅ 해결: 절대 경로를 상대 경로(`./`) 또는 루트 경로(`/`)로 변경

## 수정 권장 사항

정적 사이트에서 사용하려면 모든 절대 경로를 루트 경로로 변경:

```html
<!-- Before -->
<link href="http://marital19.com/m/styles/common.css?v=033857" rel="stylesheet" type="text/css">

<!-- After -->
<link href="/m/styles/common.css?v=033857" rel="stylesheet" type="text/css">
```

