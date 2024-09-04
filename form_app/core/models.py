# core/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    is_admin = models.BooleanField(default=False)

class Form(models.Model):
    title = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    form_structure = models.JSONField()
    identifier = models.CharField(max_length=255, blank=True, null=True)  # Add this line

    def __str__(self):
        return self.title

class Preset(models.Model):
    name = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    form = models.ForeignKey(Form, on_delete=models.CASCADE)
    preset_data = models.JSONField()

class FormResponse(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    response_data = models.JSONField()

class FormField(models.Model):
    form = models.ForeignKey(Form, related_name='fields', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    item_type = models.CharField(max_length=50, blank=True, null=True)
    fields = models.JSONField(blank=True, null=True)  # For nested fields
    comment = models.TextField(blank=True, null=True)  # Comment field

    def __str__(self):
        return f"{self.form.title} - {self.name}"
