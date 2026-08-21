import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";

export const djangoCapabilities: BackendCapabilities = {
	framework: "django",
	language: "Python",
	runtime: "Python 3.10+",
	defaultDatabase: "sqlite",
	supportedDatabases: ["sqlite", "postgresql", "mysql"],
	authentication:
		"Django Authentication System / djangorestframework-simplejwt",
	middleware: "Django Middleware Classes",
	validation: "Django Forms / DRF Serializers",
	apiType: "REST / MVT",
	developmentCommand: "python manage.py runserver 4000",
	productionCommand: "gunicorn core.wsgi:application",
	databaseDriver: "Django ORM",
	sawitDatabaseSupport: false,
	generationStatus: "IMPLEMENTED",
};

export const djangoAdapter: BackendAdapter = {
	identifier: "django",
	name: "Django",
	language: "Python",
	runtime: "Python",
	capabilities: djangoCapabilities,
	generateFiles(projectConfiguration: ProjectConfig): ProjectFile[] {
		const projectName = projectConfiguration.projectName;

		const requirementsContent = `Django>=5.0.0
django-cors-headers>=4.3.0
djangorestframework>=3.14.0
python-dotenv>=1.0.0
`;

		const managePyContent = `#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
`;

		const settingsContent = `import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-rakta-secret-key-change-in-production'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'api',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'
CORS_ALLOW_ALL_ORIGINS = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
`;

		const urlsContent = `from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]
`;

		const apiUrlsContent = `from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check),
    path('users/', views.get_users),
    path('auth/login/', views.login_user),
]
`;

		const apiViewsContent = `from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

def health_check(request):
    return JsonResponse({"status": "ok", "framework": "Django", "language": "Python"})

def get_users(request):
    return JsonResponse([
        {"id": "usr_1", "name": "Rhein Sullivan"},
        {"id": "usr_2", "name": "Django Developer"}
    ], safe=False)

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        data = json.loads(request.body or '{}')
        return JsonResponse({
            "status": "success",
            "user": {"id": "usr_1", "email": data.get("email", "admin@example.com")},
            "token": "django_auth_mock_token"
        })
    return JsonResponse({"error": "Method not allowed"}, status=405)
`;

		const wsgiContent = `import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
application = get_wsgi_application()
`;

		return [
			{ path: "backend/requirements.txt", content: requirementsContent },
			{ path: "backend/manage.py", content: managePyContent },
			{ path: "backend/core/__init__.py", content: "" },
			{ path: "backend/core/settings.py", content: settingsContent },
			{ path: "backend/core/urls.py", content: urlsContent },
			{ path: "backend/core/wsgi.py", content: wsgiContent },
			{ path: "backend/api/__init__.py", content: "" },
			{ path: "backend/api/urls.py", content: apiUrlsContent },
			{ path: "backend/api/views.py", content: apiViewsContent },
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Django)\n\nFull-featured Python web framework.\n\n## Commands\n- Install: \`pip install -r requirements.txt\`\n- Migrate: \`python manage.py migrate\`\n- Dev: \`python manage.py runserver 4000\`\n`,
			},
		];
	},
};
