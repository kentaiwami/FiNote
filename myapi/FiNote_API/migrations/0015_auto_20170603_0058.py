# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-06-02 15:58
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('FiNote_API', '0014_auto_20170603_0052'),
    ]

    operations = [
        migrations.AlterField(
            model_name='movie',
            name='poster_path',
            field=models.TextField(default='', max_length=1000),
        ),
    ]