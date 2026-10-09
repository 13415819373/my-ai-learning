# ===== 阶段1：用 Maven 构建出 jar =====
FROM maven:3.9.9-eclipse-temurin-21 AS builder

WORKDIR /build
# 先只拷 pom.xml，预解析依赖（依赖没变时这层走缓存）
# 注意：go-offline 在 Spring Boot 项目里会失败，改用 resolve + 兜底
COPY pom.xml .
RUN mvn dependency:resolve -B -Dmaven.test.skip=true || true

# 再拷源码，打包（跳过测试）
COPY src ./src
RUN mvn clean package -DskipTests -B

# ===== 阶段2：运行时只装 JRE，镜像小 =====
FROM eclipse-temurin:21-jre

WORKDIR /app

# 拷上一步打好的 jar
COPY --from=builder /build/target/*.jar app.jar

# 上传文件目录
RUN mkdir -p /app/upload
ENV UPLOAD_DIR=/app/upload

EXPOSE 6001

ENTRYPOINT ["java", "-jar", "app.jar"]
