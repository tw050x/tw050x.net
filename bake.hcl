group "default" {
  targets = [

    # Services
    "assets",
    "authorisation",
    "error",
    "marketing",
    "navigation",
    "portal",
    "users",

    # Workers
    "sessions-queue",
    "sessions-scheduler",
    "users-queue",
  ]
}

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Services                                                  #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

target "assets" {
  dockerfile = "Dockerfile"
  target = "assets"
  tags = ["tw050x.net.service/assets:latest"]
}

target "authorisation" {
  dockerfile = "Dockerfile"
  target = "authorisation"
  tags = ["tw050x.net.service/authorisation:latest"]
}

target "error" {
  dockerfile = "Dockerfile"
  target = "error"
  tags = ["tw050x.net.service/error:latest"]
}

target "marketing" {
  dockerfile = "Dockerfile"
  target = "marketing"
  tags = ["tw050x.net.service/marketing:latest"]
}

target "navigation" {
  dockerfile = "Dockerfile"
  target = "navigation"
  tags = ["tw050x.net.service/navigation:latest"]
}

target "portal" {
  dockerfile = "Dockerfile"
  target = "portal"
  tags = ["tw050x.net.service/portal:latest"]
}

target "users" {
  dockerfile = "Dockerfile"
  target = "users"
  tags = ["tw050x.net.service/users:latest"]
}

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Workers                                                   #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

target "sessions-queue" {
  dockerfile = "Dockerfile"
  target = "sessions-queue"
  tags = ["tw050x.net.worker/sessions-queue:latest"]
}

target "sessions-scheduler" {
  dockerfile = "Dockerfile"
  target = "sessions-scheduler"
  tags = ["tw050x.net.worker/sessions-scheduler:latest"]
}

target "users-queue" {
  dockerfile = "Dockerfile"
  target = "users-queue"
  tags = ["tw050x.net.worker/users-queue:latest"]
}
