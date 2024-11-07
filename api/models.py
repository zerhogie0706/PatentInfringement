from django.db import models


# Create your models here.
class Result(models.Model):
    name = models.CharField(max_length=64)
    content = models.JSONField()

    def __str__(self):
        return self.name

    def display(self):
        return {
            'id': self.id,
            'name': self.name,
        }
