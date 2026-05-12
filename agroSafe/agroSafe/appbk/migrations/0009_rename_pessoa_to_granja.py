# Renomeia tabela appbk_pessoa → appbk_granja e alinha colunas ao modelo Granja.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('appbk', '0008_registroacessoportaria_motivo_observacao'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Pessoa',
            new_name='Granja',
        ),
        migrations.RenameField(
            model_name='granja',
            old_name='cpf',
            new_name='CNPJ',
        ),
        migrations.AddField(
            model_name='granja',
            name='regiao',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='granja',
            name='telefone',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='granja',
            name='email_corporativo',
            field=models.EmailField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterModelTable(
            name='granja',
            table='appbk_granja',
        ),
    ]
