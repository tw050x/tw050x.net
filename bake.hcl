group "default" {
  targets = [
    "service-assets",
    "service-authentication",
    "service-error",
    "service-marketing",
    "service-navigation",
    "service-portal",
    "service-user"
  ]
}

target "service-portal" {
  dockerfile = "container/service/Dockerfile"
  target = "service-portal"
  tags = ["tw050x.net/portal:latest"]
}

target "service-assets" {
  dockerfile = "container/service/Dockerfile"
  target = "service-assets"
  tags = ["tw050x.net/assets:latest"]
}

target "service-authentication" {
  dockerfile = "container/service/Dockerfile"
  target = "service-authentication"
  tags = ["tw050x.net/authentication:latest"]
}

target "service-error" {
  dockerfile = "container/service/Dockerfile"
  target = "service-error"
  tags = ["tw050x.net/error:latest"]
}

target "service-marketing" {
  dockerfile = "container/service/Dockerfile"
  target = "service-marketing"
  tags = ["tw050x.net/marketing:latest"]
}

target "service-navigation" {
  dockerfile = "container/service/Dockerfile"
  target = "service-navigation"
  tags = ["tw050x.net/navigation:latest"]
}

target "service-user" {
  dockerfile = "container/service/Dockerfile"
  target = "service-user"
  tags = ["tw050x.net/user:latest"]
}
