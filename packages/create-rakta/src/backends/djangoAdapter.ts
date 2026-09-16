import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";
import {
	buildOAuthEnvLines,
	getOAuthProviders,
	hasOAuth,
} from "./oauthSupport";

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
		const oauthProviders = getOAuthProviders(projectConfiguration);
		const hasOAuthEnabled = hasOAuth(projectConfiguration);

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

		const oauthApiUrlsPart = hasOAuthEnabled
			? `    path('auth/oauth/<str:provider>/login/', views.oauth_login),
    path('auth/oauth/<str:provider>/callback/', views.oauth_callback),
`
			: "";

		const apiUrlsContent = `from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check),
    path('users/', views.get_users),
    path('auth/login/', views.login_user),
    path('cms/posts/', views.cms_posts),
${oauthApiUrlsPart}]`;

		const oauthApiViewsPart = hasOAuthEnabled
			? `
from urllib.parse import urlencode, quote
from django.shortcuts import redirect
import os

OAUTH_ENDPOINTS = {
    "google": "https://accounts.google.com/o/oauth2/v2/auth",
    "github": "https://github.com/login/oauth/authorize",
    "apple": "https://appleid.apple.com/auth/authorize",
    "microsoft": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    "discord": "https://discord.com/oauth2/authorize",
    "gitlab": "https://gitlab.com/oauth/authorize",
    "facebook": "https://www.facebook.com/v19.0/dialog/oauth",
}

OAUTH_SCOPES = {
    "google": "openid profile email",
    "github": "read:user user:email",
    "apple": "name email",
    "microsoft": "user.read openid profile email",
    "discord": "identify email",
    "gitlab": "read_user",
    "facebook": "email public_profile",
}

def oauth_login(request, provider):
    upper_provider = provider.upper()
    client_id = os.environ.get(f"{upper_provider}_CLIENT_ID", "")
    redirect_uri = os.environ.get(
        f"{upper_provider}_REDIRECT_URI",
        f"{os.environ.get('OAUTH_REDIRECT_BASE_URL', 'http://localhost:4000')}/api/auth/oauth/{provider}/callback",
    )
    authorize_endpoint = OAUTH_ENDPOINTS.get(provider, "")
    scope = OAUTH_SCOPES.get(provider, "openid profile email")
    query = urlencode({
        "client_id": client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": scope,
    })
    return redirect(f"{authorize_endpoint}?{query}")

def oauth_callback(request, provider):
    code = request.GET.get("code", "")
    # Exchange the code for tokens in a real implementation, then
    # redirect back to the frontend sign-in page.
    return redirect(f"http://localhost:3000/auth/sign-in?oauth={provider}&code={quote(code)}")
`
			: "";

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

@csrf_exempt
def cms_posts(request):
    if request.method == 'POST':
        from datetime import datetime
        data = json.loads(request.body or '{}')
        return JsonResponse({
            "id": f"post_{int(datetime.now().timestamp() * 1000)}",
            "title": data.get("title", "Untitled"),
            "published": True
        }, status=201)
    return JsonResponse([
        {"id": "post_1", "title": "Welcome to Rakta.js + Django", "published": True}
    ], safe=False)
${oauthApiViewsPart}`;

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
			...(hasOAuthEnabled
				? [
						{
							path: "backend/.env.example",
							content: buildOAuthEnvLines(
								oauthProviders,
								"http://localhost:4000",
							),
						},
					]
				: []),
			{
				path: "backend/README.md",
				content: `# ${projectName} Backend (Django)\n\nFull-featured Python web framework.\n\n## Commands\n- Install: \`pip install -r requirements.txt\`\n- Migrate: \`python manage.py migrate\`\n- Dev: \`python manage.py runserver 4000\`\n`,
			},
		];
	},
};
