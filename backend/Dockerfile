# syntax=docker/dockerfile:1

# ---- Build ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline
COPY src/ src/
RUN ./mvnw -B -q package -DskipTests && cp target/tasty-api-*.jar app.jar

# ---- Run ----
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN groupadd --system tasty && useradd --system --gid tasty --home /app tasty \
    && mkdir -p /app/uploads && chown -R tasty:tasty /app
COPY --from=build --chown=tasty:tasty /workspace/app.jar /app/app.jar
USER tasty
EXPOSE 8080
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
# Readiness: GET /actuator/health/readiness (wire it into your orchestrator's health checks).
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
