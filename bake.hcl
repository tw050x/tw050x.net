group "default" {
  targets = [
    "administration-service",
    "assets-service",
    "authentication-service",
    "error-service",
    "marketing-service",
    "navigation-service",
    "user-service"
  ]
}

target "administration-service" {
  dockerfile = "container/service/Dockerfile"
  target = "administration-service"
  tags = ["tw050x.net/administration-service:latest"]
}

target "assets-service" {
  dockerfile = "container/service/Dockerfile"
  target = "assets-service"
  tags = ["tw050x.net/assets-service:latest"]
}

target "authentication-service" {
  dockerfile = "container/service/Dockerfile"
  target = "authentication-service"
  tags = ["tw050x.net/authentication-service:latest"]
}

target "error-service" {
  dockerfile = "container/service/Dockerfile"
  target = "error-service"
  tags = ["tw050x.net/error-service:latest"]
}

target "marketing-service" {
  dockerfile = "container/service/Dockerfile"
  target = "marketing-service"
  tags = ["tw050x.net/marketing-service:latest"]
}

target "navigation-service" {
  dockerfile = "container/service/Dockerfile"
  target = "navigation-service"
  tags = ["tw050x.net/navigation-service:latest"]
}

target "user-service" {
  dockerfile = "container/service/Dockerfile"
  target = "user-service"
  tags = ["tw050x.net/user-service:latest"]
}
