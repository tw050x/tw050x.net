group "default" {
  targets = [
    "portal",
    "assets",
    "authentication",
    "error",
    "marketing",
    "navigation",
    "user"
  ]
}

target "portal" {
  dockerfile = "container/service/Dockerfile"
  target = "portal"
  tags = ["tw050x.net/portal:latest"]
}

target "assets" {
  dockerfile = "container/service/Dockerfile"
  target = "assets"
  tags = ["tw050x.net/assets:latest"]
}

target "authentication" {
  dockerfile = "container/service/Dockerfile"
  target = "authentication"
  tags = ["tw050x.net/authentication:latest"]
}

target "error" {
  dockerfile = "container/service/Dockerfile"
  target = "error"
  tags = ["tw050x.net/error:latest"]
}

target "marketing" {
  dockerfile = "container/service/Dockerfile"
  target = "marketing"
  tags = ["tw050x.net/marketing:latest"]
}

target "navigation" {
  dockerfile = "container/service/Dockerfile"
  target = "navigation"
  tags = ["tw050x.net/navigation:latest"]
}

target "user" {
  dockerfile = "container/service/Dockerfile"
  target = "user"
  tags = ["tw050x.net/user:latest"]
}
