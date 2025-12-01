group "default" {
  targets = [

    # Services
    "assets",
    "authorisation",
    "error",
    "marketing",
    "navigation",
    "portal",
    "user",

    # Workers
    "sessions-queue",
    "user-queue",
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

target "user" {
  dockerfile = "Dockerfile"
  target = "user"
  tags = ["tw050x.net.service/user:latest"]
}

# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
# Workers                                                   #
# # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

target "sessions-queue" {
  dockerfile = "Dockerfile"
  target = "sessions-queue"
  tags = ["tw050x.net.worker/sessions-queue:latest"]
}

target "user-queue" {
  dockerfile = "Dockerfile"
  target = "user-queue"
  tags = ["tw050x.net.worker/user-queue:latest"]
}
