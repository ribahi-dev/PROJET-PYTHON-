import uuid
from django.conf import settings
from django.db import models


class Notification(models.Model):
    TYPE_CHOICES = (
        ('new_feedback', 'New feedback'),
        ('new_comment', 'New comment'),
        ('new_reply', 'New reply'),
        ('idea_promoted', 'Promising idea'),
        ('feedback_voted', 'Feedback voted'),
        ('status_changed', 'Status changed'),
        ('admin_new_idea', 'New idea for moderation'),
        ('admin_status', 'Moderation action'),
        ('feedback', 'Feedback'),
        ('comment', 'Comment'),
        ('status', 'Status'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    notif_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='new_feedback')
    message = models.TextField()
    related_id = models.CharField(max_length=100, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.notif_type}] -> {self.user.username}'
