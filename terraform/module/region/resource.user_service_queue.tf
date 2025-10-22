
resource "aws_sqs_queue" "user_service_queue" {
  name = "user-service-queue-${var.aws_region}"
  tags = var.user_service_queue_tags

  delay_seconds = 0
  fifo_queue = false
  max_message_size = 262144 # 256 KB
  message_retention_seconds = 86400 # 1 day
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.user_service_dead_letter_queue.arn
    maxReceiveCount     = 3
  })
  sqs_managed_sse_enabled = true
}

resource "aws_sqs_queue" "user_service_dead_letter_queue" {
  name = "user-service-dead-letter-queue-${var.aws_region}"
  tags = var.user_service_dead_letter_queue_tags

  delay_seconds = 0
  fifo_queue = false
  max_message_size = 262144 # 256 KB
  message_retention_seconds = 1209600 # 14 days
  sqs_managed_sse_enabled = true
}

resource "aws_sqs_queue_redrive_allow_policy" "user_service_dead_letter_queue_redrive_allow_policy" {
  queue_url = aws_sqs_queue.user_service_dead_letter_queue.id

  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue"
    sourceQueueArns   = [
      aws_sqs_queue.user_service_queue.arn
    ]
  })
}
