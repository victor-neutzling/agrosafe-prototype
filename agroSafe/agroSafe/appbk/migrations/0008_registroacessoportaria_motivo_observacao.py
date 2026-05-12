from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('appbk', '0007_cadastrovisitanteportaria_empresa_nivel'),
    ]

    operations = [
        migrations.AddField(
            model_name='registroacessoportaria',
            name='motivo_informado',
            field=models.CharField(blank=True, default='', max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='registroacessoportaria',
            name='observacao_informada',
            field=models.CharField(blank=True, default='', max_length=255),
            preserve_default=False,
        ),
    ]
