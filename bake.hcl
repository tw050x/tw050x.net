group "default" {
  targets = [
    "administration",
    "assets",
    "authentication",
    "error",
    "marketing",
    "navigation",
    "user"
  ]
}

target "administration" {
  dockerfile = "container/service/Dockerfile"
  target = "administration"
  tags = ["tw050x.net/administration:latest"]
}

target "assets" {
  dockerfile = "container/assets/Dockerfile"
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
