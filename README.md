My Personal Blog - DRF + Next.js
================================

나만의 개인 블로그 프로젝트입니다.
백엔드는 Django REST Framework(DRF), 프론트엔드는 Next.js를 사용합니다.
마크다운 기반의 게시글, 익명 댓글 시스템, 보안 기능을 포함한 미니 CMS 형태의 블로그입니다.

----------------------------

🛠️ Tech Stack
-------------

Backend
- Python 3.10+
- Django 4.x
- Django REST Framework
- MongoDB (게시글 본문 저장용)
- Markdown Renderer (markdown, mistune 등)

Frontend
- Next.js 14+
- React
- TailwindCSS
- Axios

----------------------------

✨ 주요 기능
------------

📌 게시글

- ✅ 게시글 작성: 오직 블로그 주인만 작성 가능 (마스터 암호 필요)
- ✅ 게시글 수정/삭제: 마스터 암호를 통해 본인만 가능
- ✅ 조회수: 게시글 클릭 시 자동 증가 (중복 방지 로직 포함 예정)
- ✅ 마크다운 렌더링: Markdown 형식으로 작성된 내용을 HTML로 변환
- ✅ MongoDB 저장: 게시글 본문은 MongoDB에 저장
- ✅ 작성일/수정일: 게시글 작성 및 최종 수정 시간 기록
- ✅ 공개/비공개 설정: 글 별로 공개 여부 설정 가능
- ⭕ 카테고리/태그: 글 분류 및 필터링 용도로 사용 가능
- ⭕ 임시저장: 작성 중 브라우저 종료 대비 클라이언트 측 저장 기능

💬 댓글

- ✅ 익명 댓글: 누구나 댓글 작성 가능 (닉네임 없이도 가능)
- ✅ 비밀번호 설정: 각 댓글마다 비밀번호 설정, 수정/삭제 시 사용
- ✅ 댓글 수정/삭제: 비밀번호 입력으로 본인만 수정/삭제 가능
- ✅ 마스터 관리: 마스터 비밀번호를 통해 전체 댓글 관리 가능
- ⭕ 대댓글: 특정 댓글에 대한 답글 기능 (선택적 기능)
- ⭕ 댓글 정렬: 최신순/오래된순 등 정렬 옵션 지원 예정
- ⭕ 댓글 방어: IP 또는 브라우저 정보 기반 악성 유저 식별 대응 고려

🔐 보안 및 관리 기능

- ✅ 마스터 암호 인증: 글/댓글 작성 및 관리 시 필요
- ⭕ 관리자 대시보드: 최소한의 관리용 웹 UI (댓글/게시글 삭제 등)
- ⭕ 비밀번호 해시 처리: 댓글 비밀번호 등 서버에서 안전하게 저장
- ⭕ API Rate Limiting: 과도한 요청 차단 고려 (DRF throttling)

🧪 개발 편의 기능

- ⭕ OpenAPI Docs: Swagger 기반 API 문서 자동 생성 (drf-yasg or drf-spectacular)
- ⭕ 테스트 코드: 핵심 로직에 대한 테스트 코드 작성 (pytest 등)
- ⭕ 로깅: 삭제/조회 등 주요 이벤트 기록

----------------------------

🧱 프로젝트 구조 (예정)

backend/
├── blog/                # Django 앱
├── core/                # 설정 및 라우팅
├── posts/               # 게시글 관련 로직
├── comments/            # 댓글 관련 로직
└── manage.py

frontend/
├── pages/               # Next.js 페이지
├── components/          # UI 컴포넌트
├── services/            # API 통신
└── styles/

----------------------------

🚀 설치 및 실행

Backend

$ cd backend
$ python -m venv venv
$ source venv/bin/activate
$ pip install -r requirements.txt

# 환경 변수 설정 (.env)
# DJANGO_SECRET_KEY=your_key
# MASTER_PASSWORD=your_master_password

$ python manage.py migrate
$ python manage.py runserver

Frontend

$ cd frontend
$ npm install
$ npm run dev

----------------------------

🙋 About Me

개인 프로젝트로 진행하는 블로그입니다.
모든 기능은 실제 운영을 고려해 보안과 구조를 신경 쓰며 개발하고 있습니다.

----------------------------
