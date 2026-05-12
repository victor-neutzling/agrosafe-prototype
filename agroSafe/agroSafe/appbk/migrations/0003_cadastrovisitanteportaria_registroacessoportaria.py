# Generated manually for fluxo porteiro + OpenCV

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

	dependencies = [
		('appbk', '0002_visitante_pessoa_senha_alter_pessoa_id'),
	]

	operations = [
		migrations.CreateModel(
			name='CadastroVisitantePortaria',
			fields=[
				('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
				('nome', models.CharField(max_length=100)),
				('documento', models.CharField(max_length=64)),
				('foto', models.ImageField(upload_to='portaria/visitantes/%Y/%m/')),
				('criado_em', models.DateTimeField(auto_now_add=True)),
			],
		),
		migrations.CreateModel(
			name='RegistroAcessoPortaria',
			fields=[
				('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
				('nome_informado', models.CharField(max_length=100)),
				('documento_informado', models.CharField(max_length=64)),
				('fluxo', models.CharField(help_text='Ex.: novo_cadastro, reconhecimento_ok, reconhecimento_falha_review_ok', max_length=40)),
				('reconhecimento_correlacao', models.FloatField(blank=True, null=True)),
				('reconhecimento_automatico_ok', models.BooleanField(blank=True, null=True)),
				('review_manual_aprovado', models.BooleanField(blank=True, null=True)),
				('entrada_permitida', models.BooleanField()),
				('criado_em', models.DateTimeField(auto_now_add=True)),
				('cadastro', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='registros_acesso', to='appbk.cadastrovisitanteportaria')),
			],
		),
		migrations.AddConstraint(
			model_name='cadastrovisitanteportaria',
			constraint=models.UniqueConstraint(fields=('nome', 'documento'), name='uniq_portaria_nome_documento'),
		),
	]
