# Generated manually

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('branches', '0001_initial'),
        ('sellers', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='seller',
            name='branch',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='sellers',
                to='branches.branch',
                verbose_name='Sucursal'
            ),
        ),
    ]
