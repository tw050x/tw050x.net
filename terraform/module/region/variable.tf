
variable "aws_region" {
  description = "The AWS region for the resources"
  type        = string

  validation {
    condition     = contains(["eu-west-1"], var.aws_region)
    error_message = "The aws_region variable must be one of: eu-west-1."
  }
}

variable "user_service_queue_tags" {
  description = "Tags to be applied to the user service SQS queue"
  type        = map(string)
  default     = {}
}

variable "user_service_dead_letter_queue_tags" {
  description = "Tags to be applied to the user service dead-letter SQS queue"
  type        = map(string)
  default     = {}
}
