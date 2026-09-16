import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";
import {
	buildOAuthEnvLines,
	getOAuthProviders,
	hasOAuth,
} from "./oauthSupport";

export const springBootCapabilities: BackendCapabilities = {
	framework: "spring-boot",
	language: "Java",
	runtime: "JVM (Java 17 / Java 21)",
	defaultDatabase: "postgresql",
	supportedDatabases: ["postgresql", "mysql", "h2", "oracle"],
	authentication: "Spring Security / JWT",
	middleware: "Spring Web Filters / Interceptors",
	validation: "Jakarta Validation (Hibernate Validator)",
	apiType: "REST",
	developmentCommand: "./mvnw spring-boot:run",
	productionCommand: "java -jar target/app.jar",
	databaseDriver: "Spring Data JPA / Hibernate",
	sawitDatabaseSupport: false,
	generationStatus: "IMPLEMENTED",
};

export const springBootAdapter: BackendAdapter = {
	identifier: "spring-boot",
	name: "Spring Boot 3.x",
	language: "Java",
	runtime: "Java / JVM",
	capabilities: springBootCapabilities,
	generateFiles(projectConfiguration: ProjectConfig): ProjectFile[] {
		const projectName = projectConfiguration.projectName;
		const oauthProviders = getOAuthProviders(projectConfiguration);
		const hasOAuthEnabled = hasOAuth(projectConfiguration);

		const pomXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.2</version>
        <relativePath/>
    </parent>
    <groupId>com.rakta</groupId>
    <artifactId>${projectName}-backend</artifactId>
    <version>0.1.0-SNAPSHOT</version>
    <name>${projectName}-backend</name>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
`;

		const applicationJavaContent = `package com.rakta.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
`;

		const healthControllerJavaContent = `package com.rakta.app.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthController {
    @GetMapping
    public Map<String, String> healthCheck() {
        return Map.of(
            "status", "ok",
            "framework", "Spring Boot 3",
            "language", "Java"
        );
    }
}
`;

		const userControllerJavaContent = `package com.rakta.app.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @GetMapping
    public List<Map<String, String>> getUsers() {
        return List.of(
            Map.of("id", "usr_1", "name", "Rhein Sullivan"),
            Map.of("id", "usr_2", "name", "Spring Boot Developer")
        );
    }
}
`;

		const cmsControllerJavaContent = `package com.rakta.app.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Map;
import java.time.Instant;
import java.util.HashMap;

@RestController
@RequestMapping("/api/cms/posts")
public class CmsController {
    @GetMapping
    public List<Map<String, Object>> getPosts() {
        return List.of(
            Map.of("id", "post_1", "title", "Welcome to Rakta.js + Spring Boot 3", "published", true)
        );
    }

    @PostMapping
    public Map<String, Object> createPost(@RequestBody(required = false) Map<String, Object> body) {
        if (body == null) {
            body = new HashMap<>();
        }
        Object title = body.get("title");
        return Map.of(
            "id", "post_" + Instant.now().toEpochMilli(),
            "title", title == null ? "Untitled" : title,
            "published", true
        );
    }
}
`;

		const oauthControllerJavaContent = hasOAuthEnabled
			? `package com.rakta.app.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/oauth/{provider}")
public class OAuthController {

    private static final Map<String, String> ENDPOINTS = Map.of(
        "google", "https://accounts.google.com/o/oauth2/v2/auth",
        "github", "https://github.com/login/oauth/authorize",
        "apple", "https://appleid.apple.com/auth/authorize",
        "microsoft", "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        "discord", "https://discord.com/oauth2/authorize",
        "gitlab", "https://gitlab.com/oauth/authorize",
        "facebook", "https://www.facebook.com/v19.0/dialog/oauth"
    );

    private static final Map<String, String> SCOPES = Map.of(
        "google", "openid profile email",
        "github", "read:user user:email",
        "apple", "name email",
        "microsoft", "user.read openid profile email",
        "discord", "identify email",
        "gitlab", "read_user",
        "facebook", "email public_profile"
    );

    @GetMapping("/login")
    public void login(@PathVariable String provider, HttpServletResponse response) throws IOException {
        String upperProvider = provider.toUpperCase();
        String clientId = System.getenv(upperProvider + "_CLIENT_ID");
        if (clientId == null) {
            clientId = "";
        }
        String redirectUri = System.getenv(upperProvider + "_REDIRECT_URI");
        if (redirectUri == null || redirectUri.isEmpty()) {
            String base = System.getenv("OAUTH_REDIRECT_BASE_URL");
            redirectUri = (base == null || base.isEmpty() ? "http://localhost:4000" : base)
                + "/api/auth/oauth/" + provider + "/callback";
        }
        String authorizeEndpoint = ENDPOINTS.getOrDefault(provider, ENDPOINTS.get("google"));
        String scope = SCOPES.getOrDefault(provider, "openid profile email");
        String authorizeUrl = authorizeEndpoint
            + "?client_id=" + URLEncoder.encode(clientId, StandardCharsets.UTF_8)
            + "&redirect_uri=" + URLEncoder.encode(redirectUri, StandardCharsets.UTF_8)
            + "&response_type=code"
            + "&scope=" + URLEncoder.encode(scope, StandardCharsets.UTF_8);
        response.sendRedirect(authorizeUrl);
    }

    @GetMapping("/callback")
    public void callback(@PathVariable String provider, @RequestParam(value = "code", defaultValue = "") String code, HttpServletResponse response) throws IOException {
        response.sendRedirect("http://localhost:3000/auth/sign-in?oauth=" + provider + "&code=" + URLEncoder.encode(code, StandardCharsets.UTF_8));
    }
}
`
			: "";

		const applicationPropertiesContent = `server.port=4000
spring.application.name=${projectName}-backend
`;

		return [
			{ path: "backend/pom.xml", content: pomXmlContent },
			{
				path: "backend/src/main/resources/application.properties",
				content: applicationPropertiesContent,
			},
			{
				path: "backend/src/main/java/com/rakta/app/Application.java",
				content: applicationJavaContent,
			},
			{
				path: "backend/src/main/java/com/rakta/app/controller/HealthController.java",
				content: healthControllerJavaContent,
			},
			{
				path: "backend/src/main/java/com/rakta/app/controller/UserController.java",
				content: userControllerJavaContent,
			},
			{
				path: "backend/src/main/java/com/rakta/app/controller/CmsController.java",
				content: cmsControllerJavaContent,
			},
			...(hasOAuthEnabled
				? [
						{
							path: "backend/src/main/java/com/rakta/app/controller/OAuthController.java",
							content: oauthControllerJavaContent,
						},
					]
				: []),
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
				content: `# ${projectName} Backend (Spring Boot 3)\n\nEnterprise Spring Boot Java backend.\n\n## Commands\n- Dev: \`./mvnw spring-boot:run\`\n- Build: \`./mvnw clean package\`\n`,
			},
		];
	},
};
