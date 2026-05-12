from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('appbk', '0009_rename_pessoa_to_granja'),
    ]

    operations = [
        migrations.AddField(
            model_name='cadastrovisitanteportaria',
            name='foto_base64',
            field=models.TextField(blank=True, null=True),
        ),
    ]
