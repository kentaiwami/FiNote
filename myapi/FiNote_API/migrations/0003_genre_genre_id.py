# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-04-20 17:39
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('FiNote_API', '0002_auto_20170420_1648'),
    ]

    operations = [
        migrations.AddField(
            model_name='genre',
            name='genre_id',
            field=models.IntegerField(default=0, unique=True),
        ),
    ]
