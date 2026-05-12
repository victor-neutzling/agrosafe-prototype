from django.db import models


class NivelVisitante(models.TextChoices):
    TRABALHADOR = 'trabalhador', 'Trabalhador'
    PRESTADOR_SERVICO = 'prestador_servico', 'Prestador de Serviço'
    VISITANTE = 'visitante', 'Visitante'


class Granja(models.Model):
    nome = models.CharField(max_length=100)
    CNPJ = models.CharField(max_length=14, unique=True)
    regiao = models.CharField(max_length=100, null=True, blank=True)
    telefone = models.CharField(max_length=20, null=True, blank=True)
    email_corporativo = models.EmailField(max_length=100, null=True, blank=True)
    senha = models.CharField(max_length=128)

    class Meta:
        db_table = 'appbk_granja'

    def __str__(self):
        return f"{self.nome} ({self.CNPJ})"


# Modelo para armazenar dados de visitantes
class CadastroVisitantePortaria(models.Model):
    nome = models.CharField(max_length=100)
    documento = models.CharField(max_length=64)
    empresa = models.CharField(max_length=100)
    nivel = models.CharField(max_length=20, choices=NivelVisitante.choices)
    foto_hash = models.CharField(max_length=64, null=True, blank=True)
    foto_base64 = models.TextField(null=True, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['nome', 'documento'], name='uniq_portaria_nome_documento'),
        ]

    def __str__(self):
        return f"{self.nome} ({self.documento})"


class RegistroAcessoPortaria(models.Model):
    cadastro = models.ForeignKey(
        CadastroVisitantePortaria,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='registros_acesso',
    )
    nome_informado = models.CharField(max_length=100)
    documento_informado = models.CharField(max_length=64)
    motivo_informado = models.CharField(max_length=255, blank=True, default='')
    observacao_informada = models.CharField(max_length=255, blank=True, default='')
    fluxo = models.CharField(max_length=40)
    reconhecimento_correlacao = models.FloatField(null=True, blank=True)
    reconhecimento_automatico_ok = models.BooleanField(null=True, blank=True)
    review_manual_aprovado = models.BooleanField(null=True, blank=True)
    entrada_permitida = models.BooleanField()
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.fluxo} permitida={self.entrada_permitida}"