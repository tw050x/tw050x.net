
resource "aws_ssm_parameter" "user_service_event_queue_url" {
  name        = "user.service.event-queue-url"
  type        = "String"
  value       = aws_sqs_queue.user_service_queue.url
  description = "The URL of the SQS queue for User service events"
}
