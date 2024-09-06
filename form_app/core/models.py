# core/models.py

from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.postgres.fields import JSONField  # Pour les versions plus anciennes de Django

class User(AbstractUser):
    is_admin = models.BooleanField(default=False)

class Form(models.Model):
    title = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    form_structure = models.JSONField()
    identifier = models.CharField(max_length=255, blank=True, null=True)  # Add this line

    def __str__(self):
        return self.title
    
class Formulaire(models.Model):
    nom = models.CharField(max_length=255)
    fields = JSONField()  # or use other suitable field types

    def __str__(self):
        return self.nom
    
class FormsResponse(models.Model):
    form = models.ForeignKey('Formulaire', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    response_data = models.JSONField()

    def __str__(self):
        return f'Response to {self.form.nom}'

class Field(models.Model):
    FIELD_TYPE_CHOICES = [
        ('string', 'String'),
        ('number', 'Number'),
        ('object', 'Object')
    ]

    name = models.CharField(max_length=255)
    field_type = models.CharField(max_length=10, choices=FIELD_TYPE_CHOICES)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subfields')

    def __str__(self):
        return f"{self.name} ({self.field_type})"
    

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
