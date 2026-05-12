# Generated manually: colunas empresa (string) e nivel (choices / enum no app)

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('appbk', '0006_replace_foto_with_foto_hash'),
    ]

    operations = [
        migrations.AddField(
            model_name='cadastrovisitanteportaria',
            name='empresa',
            field=models.CharField(default='', max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='cadastrovisitanteportaria',
            name='nivel',
            field=models.CharField(
                choices=[
                    ('trabalhador', 'Trabalhador'),
                    ('prestador_servico', 'Prestador de Serviço'),
                    ('visitante', 'Visitante'),
                ],
                default='visitante',
                max_length=20,
            ),
            preserve_default=False,
        ),
    ]
