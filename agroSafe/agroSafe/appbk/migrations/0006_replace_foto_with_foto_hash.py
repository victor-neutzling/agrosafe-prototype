from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('appbk', '0005_cadastrovisitanteportaria_foto'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='cadastrovisitanteportaria',
            name='foto',
        ),
        migrations.AddField(
            model_name='cadastrovisitanteportaria',
            name='foto_hash',
            field=models.CharField(blank=True, max_length=64, null=True),
        ),
    ]
