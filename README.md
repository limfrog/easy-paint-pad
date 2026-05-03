# 🎨 Easy Paint Pad

웹 브라우저에서 바로 사용할 수 있는 그림판 앱입니다.  
설치 없이 HTML 파일 하나로 동작하며, GitHub Pages로 배포되어 있습니다.

## 🌐 바로 사용하기

**👉 [Easy Paint Pad 열기](https://YOUR-USERNAME.github.io/easy-paint-pad/)**

> `YOUR-USERNAME` 부분을 본인의 GitHub 사용자명으로 바꿔주세요.

---

## ✨ 주요 기능

| 기능 | 설명 |
|---|---|
| ✏️ 그리기 도구 | 연필, 브러시, 지우개 |
| ⬡ 도형 | 선, 사각형, 타원, 화살표 |
| 🔤 텍스트 | 다양한 폰트, 크기, 스타일 |
| 🖱️ 객체 선택 | 클릭으로 이동·리사이즈·삭제 |
| ⬜ 영역 선택 | 픽셀 단위 복사·잘라내기·붙여넣기·이동 |
| 🎨 색상 | 12색 팔레트 + 4개 커스텀 슬롯 + 투명도 |
| 🖼️ 이미지 열기 | 파일 버튼 또는 드래그앤드롭 |
| 💾 저장 | PNG / JPEG / WebP |
| 🖨️ 인쇄 | 여백 없이 캔버스 크기 그대로 |
| ↩️ 실행취소 | 최대 60단계 Undo / Redo |

---

## ⌨️ 단축키

### 도구
| 단축키 | 기능 |
|---|---|
| `R` | 영역 선택 |
| `V` | 객체 선택/이동 |
| `P` | 연필 |
| `B` | 브러시 |
| `E` | 지우개 |
| `F` | 채우기 |
| `K` | 스포이드 |
| `T` | 텍스트 |

### 편집
| 단축키 (Win) | 단축키 (Mac) | 기능 |
|---|---|---|
| `Ctrl+Z` | `⌘+Z` | 실행 취소 |
| `Ctrl+Y` | `⌘+Shift+Z` | 다시 실행 |
| `Ctrl+C` | `⌘+C` | 복사 |
| `Ctrl+X` | `⌘+X` | 잘라내기 |
| `Ctrl+V` | `⌘+V` | 붙여넣기 |
| `Ctrl+D` | `⌘+D` | 복제 |
| `Ctrl+A` | `⌘+A` | 전체 선택 |
| `Delete` | `Delete` | 삭제 |

### 파일
| 단축키 (Win) | 단축키 (Mac) | 기능 |
|---|---|---|
| `Ctrl+N` | `⌘+N` | 새 파일 |
| `Ctrl+O` | `⌘+O` | 열기 |
| `Ctrl+S` | `⌘+S` | 저장 |
| `Ctrl+Shift+S` | `⌘+Shift+S` | 다른 이름으로 저장 |
| `Ctrl+P` | `⌘+P` | 인쇄 |

---

## 🚀 GitHub Pages 배포 방법

1. 이 저장소를 **Fork** 하거나 직접 새 저장소 생성
2. `index.html` 파일 업로드
3. 저장소 **Settings → Pages** 이동
4. **Source**: `Deploy from a branch`
5. **Branch**: `main` / `(root)` 선택 후 **Save**
6. 잠시 후 `https://YOUR-USERNAME.github.io/easy-paint-pad/` 에서 접속 가능

---

## 📁 파일 구조

```
easy-paint-pad/
├── index.html      # 앱 전체 (HTML + CSS + JS 단일 파일)
├── shortcuts.txt   # 단축키 전체 목록
└── README.md       # 이 파일
```

---

## 🛠️ 기술 스택

- **순수 HTML / CSS / JavaScript** — 외부 라이브러리 없음
- **Canvas 2D API** — 렌더링 및 히트 테스트
- **SVG Overlay** — 선택 핸들 표시
- **단일 파일** — `index.html` 하나로 모든 기능 동작

---

## 📄 라이선스

MIT License — 자유롭게 사용, 수정, 배포 가능합니다.
