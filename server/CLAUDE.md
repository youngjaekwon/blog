# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Package Management
```bash
# Install dependencies (uses uv)
uv sync

# Add new dependencies
uv add <package>
uv add --dev <package>  # for dev dependencies
```

### Django Commands
**IMPORTANT**: Always use `uv run` prefix for Python commands to ensure proper environment

```bash
# Run development server
uv run python manage.py runserver

# Database operations
uv run python manage.py makemigrations
uv run python manage.py migrate

# Create superuser
uv run python manage.py createsuperuser

# Django shell
uv run python manage.py shell_plus  # enhanced shell via django-extensions
```

### Testing
```bash
# Run all tests
uv run pytest

# Run specific test file
uv run pytest posts/tests/test_views.py

# Run with coverage
uv run pytest --cov

# Test settings: Uses config.settings.test with .env.test file
```

### Code Quality
```bash
# Format code
uv run ruff format .

# Check linting
uv run ruff check .

# Fix auto-fixable issues
uv run ruff check . --fix
```

### Git Commit Guidelines
**커밋 메시지 작성 규칙**:
- **제목**: 영어로 작성 (conventional commits 형식 권장)
- **본문**: 한국어로 작성하여 변경사항을 자세히 설명

**예시**:
```
feat: create user account

- 유저 계정 생성 기능 추가
- 유저 계정 생성 기능 테스트 추가
- 이메일 중복 검증 로직 구현
```

**Conventional Commits 타입**:
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드/설정 변경

## Architecture Overview

### Project Structure
- **Django REST API** with separate settings per environment (dev/test/prod)
- **Settings**: `config/settings/` with base.py, dev.py, test.py, prod.py
- **Environment files**: Uses django-environ with .env.dev, .env.test, etc.
- **Apps**: `core` (shared utilities), `posts` (blog functionality)

### Key Apps

#### Core App (`core/`)
- `SoftDeleteModel`: Base model with soft delete using `is_active` flag
- `BaseModel`: Adds `created_at`/`updated_at` timestamps
- `utils/ip.py`: IP hashing utilities for anonymous view tracking

#### Posts App (`posts/`)
- **Models**: Post, PostTag, Comment with slug-based URLs and view tracking
- **API**: REST endpoints with nested routing for comments
- **Features**: Public/private posts, password-protected comments, search/filtering
- **Test factories**: Uses factory-boy for test data generation

### Database Design
- All models inherit soft delete functionality
- View tracking uses hashed IPs for privacy
- Strategic indexes for performance

### API Documentation
- **Swagger UI**: `/api/docs/`
- **ReDoc**: `/api/redoc/`
- **OpenAPI Schema**: `/api/schema/`
- Korean language API documentation configured

### Key URLs
- `/api/posts/` - Blog posts API
- `/api/posts/{id}/comments/` - Nested comments API
- `/api/posts/slug/{slug}/` - Slug-based post lookup with view tracking
- `/admin/` - Django admin

### Testing Setup
- **pytest** with Django integration
- **Test factories** in `posts/factories.py`
- **Fixtures** in `posts/tests/conftest.py`
- Tests located in each app's `tests/` directory

### Important Notes
- Uses Asia/Seoul timezone
- Page size: 10 items for pagination
- Environment-based configuration via django-environ
- No authentication currently configured (JWT dependencies present but not active)
- Modern Python 3.12+ features used throughout