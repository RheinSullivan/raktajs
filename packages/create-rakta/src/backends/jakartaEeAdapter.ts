import type { ProjectConfig, ProjectFile } from "../types";
import type { BackendAdapter, BackendCapabilities } from "./backendAdapter";
import {
	buildOAuthEnvLines,
	getOAuthProviders,
	hasOAuth,
} from "./oauthSupport";

export const jakartaEeCapabilities: BackendCapabilities = {
	framework: "jakarta-ee",
	language: "Java",
	runtime: "JVM / Jakarta EE Application Server (Payara / WildFly / Liberty)",
	defaultDatabase: "postgresql",
	supportedDatabases: ["postgresql", "mysql", "oracle", "db2"],
	authentication: "Jakarta Security (SecurityContext / CallerPrincipal)",
	middleware: "Jakarta RESTful Web Services Filters (ContainerRequestFilter)",
	validation: "Jakarta Validation (ConstraintValidator)",
	apiType: "Jakarta REST (JAX-RS) / CDI",
	developmentCommand: "mvn package && payara micro target/app.war",
	productionCommand: "java -jar payara-micro.jar --deploy target/app.war",
	databaseDriver: "Jakarta Persistence (JPA)",
	sawitDatabaseSupport: false,
	generationStatus: "IMPLEMENTED",
};

export const jakartaEeAdapter: BackendAdapter = {
	identifier: "jakarta-ee",
	name: "Jakarta EE 10 / J2EE",
	language: "Java",
	runtime: "Java / JVM",
	capabilities: jakartaEeCapabilities,
	generateFiles(projectConfiguration: ProjectConfig): ProjectFile[] {
		const projectName = projectConfiguration.projectName;
		const oauthProviders = getOAuthProviders(projectConfiguration);
		const hasOAuthEnabled = hasOAuth(projectConfiguration);

		const pomXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.rakta</groupId>
    <artifactId>${projectName}-backend</artifactId>
    <version>0.1.0-SNAPSHOT</version>
    <packaging>war</packaging>
    <name>${projectName}-backend</name>
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <dependency>
            <groupId>jakarta.platform</groupId>
            <artifactId>jakarta.jakartaee-api</artifactId>
            <version>10.0.0</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
    <build>
        <finalName>${projectName}-backend</finalName>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-war-plugin</artifactId>
                <version>3.4.0</version>
            </plugin>
        </plugins>
    </build>
</project>
`;

		const restApplicationJavaContent = `package com.rakta.jakarta;

import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;

@ApplicationPath("/")
public class RestApplication extends Application {
}
`;

		const healthResourceJavaContent = `package com.rakta.jakarta.resource;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Map;

@Path("/health")
public class HealthResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response checkHealth() {
        Map<String, String> payload = Map.of(
            "status", "ok",
            "framework", "Jakarta EE 10",
            "historicalStandard", "J2EE -> Java EE -> Jakarta EE"
        );
        return Response.ok(payload).build();
    }
}
`;

		const userResourceJavaContent = `package com.rakta.jakarta.resource;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;

@Path("/api/users")
public class UserResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getUsers() {
        List<Map<String, String>> users = List.of(
            Map.of("id", "usr_1", "name", "Rhein Sullivan"),
            Map.of("id", "usr_2", "name", "Jakarta EE Developer")
        );
        return Response.ok(users).build();
    }
}
`;

		const cmsResourceJavaContent = `package com.rakta.jakarta.resource;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/api/cms/posts")
public class CmsResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response getPosts() {
        List<Map<String, Object>> posts = List.of(
            Map.of("id", "post_1", "title", "Welcome to Rakta.js + Jakarta EE", "published", true)
        );
        return Response.ok(posts).build();
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response createPost(Map<String, Object> body) {
        if (body == null) {
            body = new HashMap<>();
        }
        Object title = body.get("title");
        Map<String, Object> created = Map.of(
            "id", "post_" + Instant.now().toEpochMilli(),
            "title", title == null ? "Untitled" : title,
            "published", true
        );
        return Response.status(Response.Status.CREATED).entity(created).build();
    }
}
`;

		const webXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee https://jakarta.ee/xml/ns/jakartaee/web-app_6_0.xsd"
         version="6.0">
    <display-name>${projectName} Jakarta EE Backend</display-name>
</web-app>
`;

		const oauthResourceJavaContent = hasOAuthEnabled
			? `package com.rakta.jakarta.resource;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Response;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Path("/api/auth/oauth/{provider}")
public class OAuthResource {

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

    @GET
    @Path("/login")
    public Response login(@PathParam("provider") String provider) {
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
        return Response.seeOther(URI.create(authorizeUrl)).build();
    }

    @GET
    @Path("/callback")
    public Response callback(@PathParam("provider") String provider, @QueryParam("code") String code) {
        if (code == null) {
            code = "";
        }
        return Response.seeOther(URI.create("http://localhost:3000/auth/sign-in?oauth=" + provider + "&code=" + URLEncoder.encode(code, StandardCharsets.UTF_8))).build();
    }
}
`
			: "";

		return [
			{ path: "backend/pom.xml", content: pomXmlContent },
			{
				path: "backend/src/main/webapp/WEB-INF/web.xml",
				content: webXmlContent,
			},
			{
				path: "backend/src/main/java/com/rakta/jakarta/RestApplication.java",
				content: restApplicationJavaContent,
			},
			{
				path: "backend/src/main/java/com/rakta/jakarta/resource/HealthResource.java",
				content: healthResourceJavaContent,
			},
			{
				path: "backend/src/main/java/com/rakta/jakarta/resource/UserResource.java",
				content: userResourceJavaContent,
			},
			{
				path: "backend/src/main/java/com/rakta/jakarta/resource/CmsResource.java",
				content: cmsResourceJavaContent,
			},
			...(hasOAuthEnabled
				? [
						{
							path: "backend/src/main/java/com/rakta/jakarta/resource/OAuthResource.java",
							content: oauthResourceJavaContent,
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
				content: `# ${projectName} Backend (Jakarta EE / J2EE)\n\nStandardized Jakarta EE 10 web application.\n\nHistorical Evolution: J2EE -> Java EE -> Jakarta EE\n\n## Commands\n- Build: \`mvn clean package\`\n`,
			},
		];
	},
};
