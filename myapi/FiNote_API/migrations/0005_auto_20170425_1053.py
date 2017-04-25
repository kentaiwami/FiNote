# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-04-25 01:53
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('FiNote_API', '0004_backup'),
    ]

    operations = [
        migrations.AddField(
            model_name='backup',
            name='add_day',
            field=models.IntegerField(default=25),
        ),
        migrations.AddField(
            model_name='backup',
            name='add_month',
            field=models.IntegerField(default=4),
        ),
        migrations.AddField(
            model_name='backup',
            name='add_year',
            field=models.IntegerField(default=2017),
        ),
    ]
