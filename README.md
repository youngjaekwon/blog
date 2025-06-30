My Personal Blog - DRF + React Router
=====================================

나만의 개인 블로그 프로젝트입니다.
백엔드는 Django REST Framework(DRF), 프론트엔드는 React Router v7을 사용합니다.
마크다운 기반의 게시글, 익명 댓글 시스템, 보안 기능을 포함한 미니 CMS 형태의 블로그입니다.

이 프로젝트는 `client/`(React Router v7)와 `server/`(Django DRF)로 구분된 풀스택 애플리케이션입니다.

----------------------------

🛠️ Tech Stack
-------------

Backend
- Python 3.12+
- Django
- Django REST Framework
- SQLite (개발용)
- drf-spectacular (API 문서화)
- UV (패키지 관리)

Frontend
- React Router v7 (with SSR)
- React 19
- TailwindCSS v4
- TypeScript
- PNPM
- Axios

----------------------------

✨ 주요 기능
------------

**게시글 관리**
- 공개/비공개 게시글
- 슬러그 기반 URL
- 태그 시스템
- 조회수 추적 (익명 IP 해싱)

**댓글 시스템**
- 익명 댓글 작성
- 비밀번호 보호 댓글 수정/삭제

**보안 및 개발**
- 비밀번호 해시 처리
- API 문서화 (Swagger UI)
- 테스트 코드 포함

----------------------------


🙋 About Me

개인 프로젝트로 진행하는 블로그입니다.
모든 기능은 실제 운영을 고려해 보안과 구조를 신경 쓰며 개발하고 있습니다.

----------------------------
