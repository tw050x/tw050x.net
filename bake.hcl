group "default" {
  targets = [
    "service-assets",
    "service-authentication",
    "service-error",
    "service-marketing",
    "service-navigation",
    "service-portal",
    "service-user",
    "worker-user-service-queue",
  ]
}

target "service-assets" {
  dockerfile = "container/Dockerfile"
  target = "service-assets"
  tags = ["tw050x.net.service/assets:latest"]
}

target "service-authentication" {
  dockerfile = "container/Dockerfile"
  target = "service-authentication"
  tags = ["tw050x.net.service/authentication:latest"]
}

target "service-error" {
  dockerfile = "container/Dockerfile"
  target = "service-error"
  tags = ["tw050x.net.service/error:latest"]
}

target "service-marketing" {
  dockerfile = "container/Dockerfile"
  target = "service-marketing"
  tags = ["tw050x.net.service/marketing:latest"]
}

target "service-navigation" {
  dockerfile = "container/Dockerfile"
  target = "service-navigation"
  tags = ["tw050x.net.service/navigation:latest"]
}

target "service-portal" {
  dockerfile = "container/Dockerfile"
  target = "service-portal"
  tags = ["tw050x.net.service/portal:latest"]
}

target "service-user" {
  dockerfile = "container/Dockerfile"
  target = "service-user"
  tags = ["tw050x.net.service/user:latest"]
}

target "worker-user-service-queue" {
  dockerfile = "container/Dockerfile"
  target = "worker-user-service-queue"
  tags = ["tw050x.net.worker/user-service-queue:latest"]
}
