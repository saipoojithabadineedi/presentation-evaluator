# Multi-stage build for Spring Boot with Java 21 from Repository Root
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml from backend/ or root
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/evaluator-backend-1.0.0.jar app.jar
EXPOSE 8080
ENV PORT=8080

ENTRYPOINT ["sh", "-c", "if [ -n \"$SPRING_DATASOURCE_URL\" ]; then export SPRING_DATASOURCE_URL=$(echo \"$SPRING_DATASOURCE_URL\" | sed -E 's|^jdbc:postgres://|jdbc:postgresql://|; s|^postgres://|jdbc:postgresql://|; s|^postgresql://|jdbc:postgresql://|'); fi; java -jar app.jar"]
