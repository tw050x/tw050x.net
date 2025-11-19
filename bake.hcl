group "default" {
  targets = [
    "assets-service",
    "authorisation-service",
    "error-service",
    "marketing-service",
    "navigation-service",
    "portal-service",
    "user-service",
    "user-service-queue",
  ]
}

target "assets-service" {
  dockerfile = "Dockerfile"
  target = "assets-service"
  tags = ["tw050x.net.service/assets-service:latest"]
}

target "authorisation-service" {
  dockerfile = "Dockerfile"
  target = "authorisation-service"
  tags = ["tw050x.net.service/authorisation-service:latest"]
}

target "error-service" {
  dockerfile = "Dockerfile"
  target = "error-service"
  tags = ["tw050x.net.service/error-service:latest"]
}

target "marketing-service" {
  dockerfile = "Dockerfile"
  target = "marketing-service"
  tags = ["tw050x.net.service/marketing-service:latest"]
}

target "navigation-service" {
  dockerfile = "Dockerfile"
  target = "navigation-service"
  tags = ["tw050x.net.service/navigation-service:latest"]
}

target "portal-service" {
  dockerfile = "Dockerfile"
  target = "portal-service"
  tags = ["tw050x.net.service/portal-service:latest"]
}

target "user-service" {
  dockerfile = "Dockerfile"
  target = "user-service"
  tags = ["tw050x.net.service/user-service:latest"]
}

target "user-service-queue" {
  dockerfile = "Dockerfile"
  target = "user-service-queue"
  tags = ["tw050x.net.worker/user-service-queue:latest"]
}
